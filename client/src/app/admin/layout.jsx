'use client';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Toaster } from 'sonner';
import { useAdminAlerts } from '@/hooks/useAdminAlerts';
import { usePathname } from 'next/navigation';

const PAGE_TITLES = {
  '/admin': { title: 'Control Center', subtitle: 'Real-time Syllabrix Social intelligence' },
  '/admin/users': { title: 'User Command', subtitle: 'Monitor, manage and control all user accounts' },
  '/admin/moderation': { title: 'Content Sentinel', subtitle: 'Live moderation queue and flagged reports' },
  '/admin/finance': { title: 'Financial Pulse', subtitle: 'Revenue analytics and payment monitoring' },
  '/admin/enterprise': { title: 'Enterprise Command', subtitle: 'Global oversight of Corporate L&D tenants' },
  '/admin/audit': { title: 'Audit Logs', subtitle: 'Complete record of all administrative actions' },
  '/admin/console': { title: 'Query Console', subtitle: 'Advanced SQL workbench and direct data export' },
  '/admin/reports': { title: 'Reports Central', subtitle: 'On-demand business intelligence and data extraction' },
  '/admin/settings': { title: 'Settings', subtitle: 'Configure admin roles, 2FA and system settings' },
  '/admin/tickets': { title: 'SyllaDesk', subtitle: 'Unified ticketing system for issues and solutions' },
};

function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  useAdminAlerts(); // Activate live urgent alert system

  const titleInfo = PAGE_TITLES[pathname] || { title: 'Admin', subtitle: '' };

  return (
    <div className="min-h-screen bg-[#0A0A0F] font-sans">
      <AdminSidebar />
      <div className="ml-[240px] flex flex-col min-h-screen">
        <AdminTopBar title={titleInfo.title} subtitle={titleInfo.subtitle} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
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
