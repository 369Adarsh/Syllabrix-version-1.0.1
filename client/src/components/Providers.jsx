'use client';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
  // Toaster uses a portal — only render it after client hydration to prevent mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <AuthProvider>
      {children}
      {mounted && (
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
          }}
        />
      )}
    </AuthProvider>
  );
}
