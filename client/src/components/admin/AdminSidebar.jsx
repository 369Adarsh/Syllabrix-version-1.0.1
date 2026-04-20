'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ShieldAlert, DollarSign,
  FileText, Settings, LogOut, Bell, ChevronRight,
  Terminal, BarChart, Library, Bug, Database,
  Lock, Building2, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SOCIAL_NAV = [
  { href: '/admin',            label: 'Overview',          icon: LayoutDashboard, exact: true },
  { href: '/admin/users',      label: 'User Command',      icon: Users },
  { href: '/admin/moderation', label: 'Content Sentinel',  icon: ShieldAlert, badge: 'LIVE' },
  { href: '/admin/finance',    label: 'Financial Pulse',   icon: DollarSign },
  { href: '/admin/reports',    label: 'Reports Central',   icon: BarChart },
  { href: '/admin/tickets',    label: 'SyllaDesk',         icon: Bell, badge: 'SUPPORT' },
];

const ENTERPRISE_NAV = [
  { href: '/admin/enterprise', label: 'Enterprise Command', icon: Building2, badge: 'NEW' },
];

const LIBRARY_NAV = [
  { href: '/admin/library', label: 'Academic Library', icon: Library, badge: 'NEW' },
];

const PLATFORM_NAV = [
  { href: '/admin/audit',    label: 'Audit Logs', icon: FileText },
  { href: '/admin/settings', label: 'Settings',   icon: Settings },
];

const RESTRICTED_NAV = [
  { href: '/admin/console',   label: 'Query Console',  icon: Terminal },
  { href: '/admin/workbench', label: 'Data Workbench', icon: Database },
  { href: '/admin/debug',     label: 'SyllaTrace',     icon: Bug, badge: 'IT' },
];

const ROLE_PERMISSIONS = {
  super_admin:     ['/admin', '/admin/users', '/admin/moderation', '/admin/finance', '/admin/audit', '/admin/console', '/admin/settings', '/admin/reports', '/admin/tickets', '/admin/library', '/admin/debug', '/admin/enterprise', '/admin/workbench'],
  moderator:       ['/admin', '/admin/users', '/admin/moderation', '/admin/reports', '/admin/tickets', '/admin/library', '/admin/settings'],
  finance_manager: ['/admin', '/admin/finance', '/admin/reports', '/admin/settings'],
  analyst:         ['/admin', '/admin/users', '/admin/moderation', '/admin/finance', '/admin/audit', '/admin/reports', '/admin/tickets', '/admin/library', '/admin/settings'],
};

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname  = usePathname();
  const { user, logout } = useAuth();

  const userRole     = user?.admin_role || 'analyst';
  const allowed      = ROLE_PERMISSIONS[userRole] || ['/admin'];
  const isSuperAdmin = userRole === 'super_admin';
  const allow        = (href) => allowed.includes(href);

  const sidebarContent = (
    <aside className="flex flex-col h-full w-[240px] bg-gradient-to-b from-indigo-950 via-[#1e0e5e] to-violet-950 border-r border-white/[0.08]">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
        <Link href="/admin" className="flex flex-col items-start gap-1">
          <Image
            src="/images/logo/syllabrix-logo-white.png"
            alt="Syllabrix"
            width={180}
            height={50}
            className="h-11 w-auto object-contain"
            priority
          />
          <p className="text-violet-300 text-[10px] font-semibold tracking-widest uppercase leading-none">
            Control Center
          </p>
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.1] transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <NavGroup label="Social Operations">
          {SOCIAL_NAV.filter(i => allow(i.href)).map(item => (
            <NavItem key={item.href} item={item} pathname={pathname} onClose={onClose} />
          ))}
        </NavGroup>

        {(isSuperAdmin || ENTERPRISE_NAV.some(i => allow(i.href))) && (
          <NavGroup label="Enterprise">
            {ENTERPRISE_NAV.map(item => (
              <NavItem key={item.href} item={item} pathname={pathname} onClose={onClose} />
            ))}
          </NavGroup>
        )}

        {LIBRARY_NAV.some(i => allow(i.href)) && (
          <NavGroup label="Knowledge Base">
            {LIBRARY_NAV.filter(i => allow(i.href)).map(item => (
              <NavItem key={item.href} item={item} pathname={pathname} onClose={onClose} />
            ))}
          </NavGroup>
        )}

        <NavGroup label="Platform">
          {PLATFORM_NAV.filter(i => allow(i.href)).map(item => (
            <NavItem key={item.href} item={item} pathname={pathname} onClose={onClose} />
          ))}
        </NavGroup>

        {isSuperAdmin && (
          <div className="space-y-1 pt-2">
            <div className="flex items-center gap-2 px-3 mb-2">
              <Lock size={9} className="text-red-400/60" />
              <p className="text-[10px] font-black text-red-400/50 uppercase tracking-[0.2em]">Restricted Access</p>
            </div>
            <div className="rounded-xl border border-red-500/15 bg-red-500/[0.05] p-1.5 space-y-0.5">
              {RESTRICTED_NAV.map(item => (
                <NavItem key={item.href} item={item} pathname={pathname} restricted onClose={onClose} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.07] border border-white/[0.06] mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-violet-500/30">
            {user?.full_name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white/90 text-xs font-semibold truncate">{user?.full_name || 'Admin'}</p>
            <p className="text-violet-300/70 text-[10px] capitalize">{user?.admin_role?.replace(/_/g, ' ') || 'Super Admin'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-300/50 hover:text-red-300 hover:bg-red-500/[0.12] rounded-lg text-xs font-medium transition-all"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: always visible ── */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 z-50">
        {sidebarContent}
      </div>

      {/* ── Mobile: drawer with backdrop ── */}
      <div
        className={`md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`md:hidden fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}

function NavGroup({ label, children }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-[10px] font-black text-indigo-300/40 uppercase tracking-[0.2em] mb-2">{label}</p>
      {children}
    </div>
  );
}

function NavItem({ item, pathname, restricted = false, onClose }) {
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? restricted
            ? 'bg-red-500/20 text-red-200 border border-red-400/25 shadow-sm'
            : 'bg-white/[0.15] text-white border border-white/20 shadow-sm shadow-violet-500/10'
          : restricted
            ? 'text-white/30 hover:text-red-300/70 hover:bg-red-500/[0.08] border border-transparent'
            : 'text-white/45 hover:text-white/90 hover:bg-white/[0.07] border border-transparent'
      }`}
    >
      <item.icon size={15} className={
        isActive
          ? restricted ? 'text-red-300' : 'text-violet-200'
          : restricted ? 'text-red-400/30 group-hover:text-red-300/60' : 'text-white/25 group-hover:text-white/60'
      } />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-wider border ${
          item.badge === 'LIVE'    ? 'bg-red-500/25 text-red-300 border-red-400/30 animate-pulse' :
          item.badge === 'IT'     ? 'bg-orange-500/25 text-orange-300 border-orange-400/30' :
          item.badge === 'SUPPORT'? 'bg-sky-500/25 text-sky-300 border-sky-400/30' :
                                    'bg-emerald-500/25 text-emerald-300 border-emerald-400/30'
        }`}>
          {item.badge}
        </span>
      )}
      {isActive && <ChevronRight size={12} className={restricted ? 'text-red-300/60' : 'text-white/50'} />}
    </Link>
  );
}
