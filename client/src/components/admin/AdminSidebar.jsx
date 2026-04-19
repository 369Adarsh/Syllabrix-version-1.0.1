'use client';
import Link from 'next/link';
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
    <aside className="flex flex-col h-full w-[240px] bg-[#0D0D14] border-r border-white/[0.07]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/30">
            S
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Syllabrix</p>
            <p className="text-violet-400 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Control Center</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.08] transition-all"
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
              <Lock size={9} className="text-red-500/50" />
              <p className="text-[10px] font-black text-red-500/40 uppercase tracking-[0.2em]">Restricted Access</p>
            </div>
            <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-1.5 space-y-0.5">
              {RESTRICTED_NAV.map(item => (
                <NavItem key={item.href} item={item} pathname={pathname} restricted onClose={onClose} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.07]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.04] mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.full_name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white/90 text-xs font-semibold truncate">{user?.full_name || 'Admin'}</p>
            <p className="text-violet-400 text-[10px] capitalize">{user?.admin_role?.replace(/_/g, ' ') || 'Super Admin'}</p>
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

  return (
    <>
      {/* ── Desktop: always visible ── */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 z-50">
        {sidebarContent}
      </div>

      {/* ── Mobile: drawer with backdrop ── */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Drawer */}
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
      <p className="px-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">{label}</p>
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
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? restricted
            ? 'bg-red-500/15 text-red-300 border border-red-500/20'
            : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
          : restricted
            ? 'text-white/35 hover:text-red-300/70 hover:bg-red-500/[0.06] border border-transparent'
            : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05] border border-transparent'
      }`}
    >
      <item.icon size={15} className={
        isActive
          ? restricted ? 'text-red-400' : 'text-violet-400'
          : restricted ? 'text-red-500/30 group-hover:text-red-400/60' : 'text-white/20 group-hover:text-white/50'
      } />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-wider border ${
          item.badge === 'LIVE'    ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' :
          item.badge === 'IT'     ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
          item.badge === 'SUPPORT'? 'bg-blue-500/20 text-blue-400 border-blue-500/25' :
                                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        }`}>
          {item.badge}
        </span>
      )}
      {isActive && <ChevronRight size={12} className={restricted ? 'text-red-400/60' : 'text-violet-400 opacity-60'} />}
    </Link>
  );
}
