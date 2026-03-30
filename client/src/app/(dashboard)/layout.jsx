'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

// Pages that manage their own full-width/height layout
const FULL_BLEED_PAGES = ['/ai-library'];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isFullBleed = FULL_BLEED_PAGES.some(p => pathname.startsWith(p));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F0F2F5]">
        {/* TopBar — fixed full-width */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Sidebar — fixed left on desktop, drawer on mobile */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main area — shifted right on desktop */}
        <div className="md:ml-[220px] pt-[56px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className={
                isFullBleed
                  ? ''   // full-bleed pages handle their own padding
                  : 'px-4 lg:px-6 py-4 pb-24 md:pb-6 max-w-[1100px] mx-auto'
              }
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav onMenuClick={() => setSidebarOpen(true)} />
      </div>
    </ProtectedRoute>
  );
}
