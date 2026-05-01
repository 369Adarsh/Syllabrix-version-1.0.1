'use client';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Pre-warm the Render server so it's awake before the user tries to login.
    // Render free tier sleeps after 15 min of inactivity and ignores self-pings.
    // This fires on every page load — harmless when server is already awake.
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
    fetch(`${base}/api/health`).catch(() => {});
  }, []);

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
