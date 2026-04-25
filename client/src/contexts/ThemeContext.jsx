'use client';
import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getModeTheme } from '@/utils/platformMode';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const theme = useMemo(() => getModeTheme(user), [user]);
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
