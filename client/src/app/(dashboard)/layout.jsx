'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import { NotificationProvider } from '@/contexts/NotificationContext';

const FULL_BLEED_PAGES = ['/ai-library', '/live-classes/room'];

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

function DashboardLayoutWithNotifications({ children }) {
  const [token, setToken] = useState(null);
  useEffect(() => {
    setToken(localStorage.getItem('syllabrix_token'));
  }, []);
  return (
    <NotificationProvider token={token}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </NotificationProvider>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayoutWithNotifications>{children}</DashboardLayoutWithNotifications>
    </ProtectedRoute>
  );
}
