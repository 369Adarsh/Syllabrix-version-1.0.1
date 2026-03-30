'use client';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F0F2F5]">
        {/* TopBar — fixed full-width */}
        <TopBar />

        {/* Sidebar — fixed left, below topbar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main area — page transitions keyed on pathname */}
        <div className="md:ml-[220px] pt-[56px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="px-4 lg:px-6 py-4 pb-24 md:pb-6 max-w-[1100px] mx-auto"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
