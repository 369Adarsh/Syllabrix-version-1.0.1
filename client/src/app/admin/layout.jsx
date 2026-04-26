'use client';
import { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';

const PAGE_TITLES = {
  '/admin':           { title: 'Control Center',    subtitle: 'Real-time Syllabrix Social intelligence' },
  '/admin/users':     { title: 'User Command',       subtitle: 'Monitor, manage and control all user accounts' },
  '/admin/moderation':{ title: 'Content Sentinel',   subtitle: 'Live moderation queue and flagged reports' },
  '/admin/finance':   { title: 'Financial Pulse',    subtitle: 'Revenue analytics and payment monitoring' },
  '/admin/enterprise':{ title: 'Enterprise Command', subtitle: 'Global oversight of Corporate L&D tenants' },
  '/admin/audit':     { title: 'Audit Logs',         subtitle: 'Complete record of all administrative actions' },
  '/admin/console':   { title: 'Query Console',      subtitle: 'Advanced SQL workbench and direct data export' },
  '/admin/reports':   { title: 'Reports Central',    subtitle: 'On-demand business intelligence and data extraction' },
  '/admin/settings':  { title: 'Admin Settings',     subtitle: 'Profile, two-factor authentication, and notification preferences' },
  '/admin/workbench': { title: 'Data Workbench',     subtitle: 'Direct live database table access — restricted to super admins' },
  '/admin/tickets':   { title: 'SyllaDesk',          subtitle: 'Unified ticketing system for issues and solutions' },
  '/admin/library':   { title: 'Academic Library',   subtitle: 'Upload and organize books, notes, and AI-indexed course materials' },
  '/admin/debug':     { title: 'SyllaTrace',         subtitle: 'Live request trace, error log, slow queries, and system diagnostics' },
  '/admin/analytics': { title: 'Platform Analytics', subtitle: 'Mode distribution and student engagement across the platform' },
};

function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const titleInfo = PAGE_TITLES[pathname] || { title: 'Admin', subtitle: '' };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — offset by sidebar width on md+ */}
      <div className="md:ml-[240px] flex flex-col min-h-screen">
        <AdminTopBar
          title={titleInfo.title}
          subtitle={titleInfo.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #e5e7eb',
            color: '#111827',
          },
        }}
      />
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminGuard>
  );
}
