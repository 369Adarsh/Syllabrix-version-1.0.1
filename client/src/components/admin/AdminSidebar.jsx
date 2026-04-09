'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ShieldAlert, DollarSign,
  FileText, Settings, LogOut, Bell, ChevronRight, Terminal, BarChart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SOCIAL_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'User Command', icon: Users },
  { href: '/admin/moderation', label: 'Content Sentinel', icon: ShieldAlert, badge: 'LIVE' },
  { href: '/admin/finance', label: 'Financial Pulse', icon: DollarSign },
  { href: '/admin/reports', label: 'Reports Central', icon: BarChart },
  { href: '/admin/tickets', label: 'SyllaDesk', icon: Bell, badge: 'SUPPORT' },
];

const ENTERPRISE_NAV = [
  { href: '/admin/enterprise', label: 'Enterprise Command', icon: Terminal, badge: 'NEW' },
];

const SYSTEM_NAV = [
  { href: '/admin/audit', label: 'Audit Logs', icon: FileText },
  { href: '/admin/console', label: 'Query Console', icon: Terminal },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const ROLE_PERMISSIONS = {
  super_admin:     ['/admin', '/admin/users', '/admin/moderation', '/admin/finance', '/admin/audit', '/admin/console', '/admin/settings', '/admin/reports', '/admin/tickets'],
  moderator:       ['/admin', '/admin/users', '/admin/moderation', '/admin/reports', '/admin/tickets'],
  finance_manager: ['/admin', '/admin/finance', '/admin/reports'],
  analyst:         ['/admin', '/admin/users', '/admin/moderation', '/admin/finance', '/admin/audit', '/admin/reports', '/admin/tickets'],
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const userRole = user?.admin_role || 'analyst';
  const allowedRoutes = ROLE_PERMISSIONS[userRole] || ['/admin'];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#0D0D14] border-r border-white/[0.07] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/30">
            S
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Syllabrix</p>
            <p className="text-violet-400 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Control Center</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        
        {/* Social Operations */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Social Operations</p>
          {SOCIAL_NAV.filter(item => allowedRoutes.includes(item.href)).map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        {/* Enterprise Operations */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Enterprise Operations</p>
          {ENTERPRISE_NAV.filter(item => allowedRoutes.includes(item.href) || userRole === 'super_admin').map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        {/* System Intelligence */}
        <div className="space-y-1 pt-2 border-t border-white/[0.05]">
          <p className="px-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Platform Engine</p>
          {SYSTEM_NAV.filter(item => allowedRoutes.includes(item.href)).map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

      </nav>

      {/* Admin identity */}
      <div className="px-3 py-4 border-t border-white/[0.07]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.04] mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.full_name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white/90 text-xs font-semibold truncate">{user?.full_name || 'Admin'}</p>
            <p className="text-violet-400 text-[10px] capitalize">{user?.admin_role?.replace('_', ' ') || 'Super Admin'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-all"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function NavItem({ item, pathname }) {
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
          : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'
      }`}
    >
      <item.icon size={15} className={isActive ? 'text-violet-400' : 'text-white/20 group-hover:text-white/50'} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-wider ${
          item.badge === 'LIVE' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          {item.badge}
        </span>
      )}
      {isActive && <ChevronRight size={12} className="text-violet-400 opacity-60" />}
    </Link>
  );
}
