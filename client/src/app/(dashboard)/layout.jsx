'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';

const FULL_BLEED_PAGES = ['/live-classes/room'];

function DashboardLayoutInner({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isFullBleed = FULL_BLEED_PAGES.some(p => pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <TopBar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-[200px] pt-[56px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className={isFullBleed ? '' : 'px-4 lg:px-6 py-4 pb-24 md:pb-6 max-w-[1100px] mx-auto'}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
      <BottomNav onMenuClick={() => setSidebarOpen(true)} />
    </div>
  );
}

// Client-side keep-alive: backup for the server's own self-ping.
// Runs only in production while a user has the app open.
// Skips hidden tabs so it doesn't fire on background/inactive sessions.
const SERVER_ORIGIN = process.env.NEXT_PUBLIC_SOCKET_URL;
const IS_PROD = process.env.NEXT_PUBLIC_ENV === 'production';
const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 min — tighter than server's 13 min

function useServerKeepAlive() {
  useEffect(() => {
    if (!IS_PROD || !SERVER_ORIGIN) return;

    const ping = () => {
      if (document.hidden) return;
      fetch(`${SERVER_ORIGIN}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(8000),
      }).catch(() => {});
    };

    const id = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}

function DashboardLayoutWithNotifications({ children }) {
  const [token, setToken] = useState(null);
  useEffect(() => {
    setToken(localStorage.getItem('syllabrix_token'));
  }, []);

  useServerKeepAlive();

  return (
    <AccessibilityProvider>
      <NotificationProvider token={token}>
        <ThemeProvider>
          <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </ThemeProvider>
      </NotificationProvider>
    </AccessibilityProvider>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayoutWithNotifications>{children}</DashboardLayoutWithNotifications>
    </ProtectedRoute>
  );
}
