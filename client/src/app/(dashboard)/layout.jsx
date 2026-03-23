'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileNav from '@/components/layout/MobileNav';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F0F2F5]">
        {/* TopBar — fixed full-width, spans entire screen width */}
        <TopBar />

        {/* Sidebar — fixed left, below topbar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main area — offset right of sidebar, below topbar */}
        <div className="md:ml-[220px] pt-[56px]">
          <main className="px-4 lg:px-6 py-4 pb-24 md:pb-6 max-w-[1100px] mx-auto">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
