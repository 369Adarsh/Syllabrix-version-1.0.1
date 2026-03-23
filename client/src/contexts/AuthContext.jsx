'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('syllabrix_token');
      if (!token) { setLoading(false); return; }
      const res = await authAPI.getMe();
      const data = res.data.data;
      // getMe returns { user: {...}, profile: {...} } — flatten it
      if (data?.user) {
        const merged = { ...data.user, profile: data.profile || null };
        setUser(merged);
      } else {
        // Already flat (fallback)
        setUser(data);
      }
    } catch (e) {
      localStorage.removeItem('syllabrix_token');
      localStorage.removeItem('syllabrix_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('syllabrix_token', token);
    localStorage.setItem('syllabrix_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, user: userData } = res.data.data;
    localStorage.setItem('syllabrix_token', token);
    localStorage.setItem('syllabrix_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (e) {}
    localStorage.removeItem('syllabrix_token');
    localStorage.removeItem('syllabrix_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      const data = res.data.data;
      if (data?.user) {
        setUser({ ...data.user, profile: data.profile || null });
      } else {
        setUser(data);
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
