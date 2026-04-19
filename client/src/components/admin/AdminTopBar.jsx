'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, User, LogOut, Settings as SettingsIcon, Shield, ChevronDown, CheckCircle,
  AlertTriangle, Ticket, UserPlus, MailWarning, RefreshCw, Loader2, ExternalLink,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api/admin.api';
import { useAdminAlerts } from '@/hooks/useAdminAlerts';
import Link from 'next/link';

const SEVERITY_CONFIG = {
  critical: { dot: 'bg-red-500 animate-pulse', badge: 'text-red-400 bg-red-500/10 border-red-500/20', icon: AlertTriangle },
  warning:  { dot: 'bg-orange-500 animate-pulse', badge: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: AlertTriangle },
  info:     { dot: 'bg-blue-400', badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Ticket },
  success:  { dot: 'bg-emerald-400', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: UserPlus },
};

const TYPE_ICON = {
  pending_reports: AlertTriangle,
  open_tickets: Ticket,
  new_users_today: UserPlus,
  unverified_users: MailWarning,
};

function AlertItem({ alert, onClose }) {
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
  const Icon = TYPE_ICON[alert.type] || AlertTriangle;

  return (
    <Link
      href={alert.href}
      onClick={onClose}
      className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0 group"
    >
      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.badge} border`}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/85 text-[11px] font-bold leading-tight">{alert.label}</p>
        <p className="text-white/35 text-[10px] mt-0.5 leading-snug">{alert.description}</p>
      </div>
      <ExternalLink size={11} className="text-white/20 group-hover:text-white/50 transition-colors mt-1 shrink-0" />
    </Link>
  );
}

export default function AdminTopBar({ title = 'Dashboard', subtitle, onMenuClick }) {
  const { user, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [totalUrgent, setTotalUrgent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const pollRef = useRef(null);

  const fetchAlerts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminAPI.getAlerts();
      setAlerts(res.data.alerts || []);
      setTotalUrgent(res.data.total_urgent || 0);
      setLastFetched(new Date());
    } catch {
      // silently fail — don't break the header
    } finally {
      setLoading(false);
    }
  }, []);

  // Wire socket: re-fetch counts when a new urgent report arrives
  useAdminAlerts({ onNewReport: () => fetchAlerts(true) });

  // Initial fetch + poll every 60s
  useEffect(() => {
    fetchAlerts();
    pollRef.current = setInterval(() => fetchAlerts(true), 60_000);
    return () => clearInterval(pollRef.current);
  }, [fetchAlerts]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsNotifOpen(v => !v);
    // Refresh counts when opening
    if (!isNotifOpen) fetchAlerts(true);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const adminRole = user?.admin_role?.replace('_', ' ') || 'Super Admin';

  // Badge: show count if >0, cap at 99
  const badgeCount = totalUrgent > 0 ? (totalUrgent > 99 ? '99+' : String(totalUrgent)) : null;

  return (
    <header className="h-14 md:h-16 border-b border-white/[0.07] bg-[#0D0D14]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-white font-bold text-base md:text-lg leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className="hidden sm:block text-white/40 text-[10px] uppercase font-bold tracking-widest mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* DateTime */}
        <div className="text-right hidden md:block mr-2 px-3 border-r border-white/[0.05]">
          <p className="text-white/70 text-[11px] font-bold tracking-tight">{timeStr}</p>
          <p className="text-white/20 text-[9px] font-black uppercase tracking-tighter">{dateStr}</p>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border ${
              isNotifOpen
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <Bell size={16} />
            {badgeCount && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-[#0D0D14]">
                {badgeCount}
              </span>
            )}
            {!badgeCount && !loading && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0D0D14]" title="All clear" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#12121A] border border-white/[0.08] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
                <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">
                  System Alerts
                </span>
                <div className="flex items-center gap-2">
                  {lastFetched && (
                    <span className="text-white/20 text-[9px]">
                      {lastFetched.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  )}
                  <button
                    onClick={() => fetchAlerts()}
                    disabled={loading}
                    className="p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all disabled:opacity-40"
                    title="Refresh alerts"
                  >
                    {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                  </button>
                </div>
              </div>

              {/* Alert list */}
              <div className="max-h-[360px] overflow-y-auto">
                {loading && alerts.length === 0 ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-white/20 text-xs">
                    <Loader2 size={14} className="animate-spin" />
                    Loading alerts…
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle size={18} className="text-emerald-400" />
                    </div>
                    <p className="text-white/60 text-xs font-bold">All Clear</p>
                    <p className="text-white/25 text-[10px]">No pending reports, tickets, or urgent items.</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <AlertItem key={alert.type} alert={alert} onClose={() => setIsNotifOpen(false)} />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-white/[0.06] bg-white/[0.01]">
                <Link
                  href="/admin/moderation"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[10px] text-violet-400 hover:text-violet-300 font-bold uppercase tracking-widest transition-colors"
                >
                  Open Moderation Queue →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative pl-2 md:pl-4 border-l border-white/[0.1]" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-300 border ${
              isProfileOpen
                ? 'bg-white/[0.08] border-white/20'
                : 'hover:bg-white/[0.04] border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-violet-500/20">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white/90 text-xs font-bold leading-none">{user?.full_name || 'Admin'}</p>
                {user?.admin_role === 'super_admin' && (
                  <span className="px-1 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[8px] font-black text-violet-400 uppercase tracking-tighter">
                    Unified
                  </span>
                )}
              </div>
              <p className="text-violet-400 text-[9px] font-black uppercase tracking-widest leading-none capitalize">{adminRole}</p>
            </div>
            <ChevronDown size={14} className={`text-white/30 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#12121A] border border-white/[0.08] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 bg-white/[0.03] border-b border-white/[0.05]">
                <p className="text-white font-bold text-[11px] truncate">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle size={10} className="text-green-500" />
                  <p className="text-green-500/80 text-[9px] font-black uppercase tracking-widest">Account Verified</p>
                </div>
              </div>

              <div className="p-1.5">
                <Link href="/admin/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05] transition-all group">
                  <SettingsIcon size={14} className="group-hover:text-violet-400" />
                  <span className="text-xs font-bold">Admin Settings</span>
                </Link>
                <Link href="/admin/audit" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05] transition-all group">
                  <Shield size={14} className="group-hover:text-violet-400" />
                  <span className="text-xs font-bold">System Security</span>
                </Link>

                <div className="h-px bg-white/[0.05] my-1.5 mx-2" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-all group"
                >
                  <LogOut size={14} />
                  <span className="text-xs font-bold">Terminate Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
