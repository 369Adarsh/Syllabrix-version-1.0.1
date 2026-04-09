'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (typeof window === 'undefined') { setLoading(false); return; }
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

  const login = async (email, password, isAdminPortal = false) => {
    const res = await authAPI.login({ email, password, isAdminPortal });
    const { token, user: userData, requiresProfileCompletion, requires_2fa, pre_2fa_token } = res.data.data;

    // 2FA challenge — don't store a session yet, hand control back to the caller
    if (requires_2fa) {
      return { requires_2fa: true, pre_2fa_token, user: userData };
    }

    localStorage.setItem('syllabrix_token', token);
    localStorage.setItem('syllabrix_user', JSON.stringify(userData));
    setUser(userData);
    return { ...userData, requiresProfileCompletion };
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { requiresEmailVerification } = res.data.data;
    // Email verification required — don't store token or set user
    return { requiresEmailVerification };
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
