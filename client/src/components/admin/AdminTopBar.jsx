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
  critical: { dot: 'bg-red-500 animate-pulse', badge: 'text-red-600 bg-red-50 border-red-200', icon: AlertTriangle },
  warning:  { dot: 'bg-orange-500 animate-pulse', badge: 'text-orange-600 bg-orange-50 border-orange-200', icon: AlertTriangle },
  info:     { dot: 'bg-blue-500', badge: 'text-blue-600 bg-blue-50 border-blue-200', icon: Ticket },
  success:  { dot: 'bg-emerald-500', badge: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: UserPlus },
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
      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group"
    >
      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.badge} border`}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 text-[11px] font-bold leading-tight">{alert.label}</p>
        <p className="text-gray-400 text-[10px] mt-0.5 leading-snug">{alert.description}</p>
      </div>
      <ExternalLink size={11} className="text-gray-300 group-hover:text-indigo-500 transition-colors mt-1 shrink-0" />
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

  useAdminAlerts({ onNewReport: () => fetchAlerts(true) });

  useEffect(() => {
    fetchAlerts();
    pollRef.current = setInterval(() => fetchAlerts(true), 60_000);
    return () => clearInterval(pollRef.current);
  }, [fetchAlerts]);

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
    if (!isNotifOpen) fetchAlerts(true);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const adminRole = user?.admin_role?.replace('_', ' ') || 'Super Admin';

  const badgeCount = totalUrgent > 0 ? (totalUrgent > 99 ? '99+' : String(totalUrgent)) : null;

  return (
    <header className="h-14 md:h-16 border-b border-gray-200 bg-white/95 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-gray-900 font-bold text-base md:text-lg leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className="hidden sm:block text-gray-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* DateTime */}
        <div className="text-right hidden md:block mr-2 px-3 border-r border-gray-200">
          <p className="text-gray-700 text-[11px] font-bold tracking-tight">{timeStr}</p>
          <p className="text-gray-400 text-[9px] font-black uppercase tracking-tighter">{dateStr}</p>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border ${
              isNotifOpen
                ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            <Bell size={16} />
            {badgeCount && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-white">
                {badgeCount}
              </span>
            )}
            {!badgeCount && !loading && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="All clear" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                  System Alerts
                </span>
                <div className="flex items-center gap-2">
                  {lastFetched && (
                    <span className="text-gray-400 text-[9px]">
                      {lastFetched.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  )}
                  <button
                    onClick={() => fetchAlerts()}
                    disabled={loading}
                    className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-40"
                    title="Refresh alerts"
                  >
                    {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                  </button>
                </div>
              </div>

              {/* Alert list */}
              <div className="max-h-[360px] overflow-y-auto">
                {loading && alerts.length === 0 ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-gray-400 text-xs">
                    <Loader2 size={14} className="animate-spin" />
                    Loading alerts…
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <CheckCircle size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-gray-700 text-xs font-bold">All Clear</p>
                    <p className="text-gray-400 text-[10px]">No pending reports, tickets, or urgent items.</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <AlertItem key={alert.type} alert={alert} onClose={() => setIsNotifOpen(false)} />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <Link
                  href="/admin/moderation"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-widest transition-colors"
                >
                  Open Moderation Queue →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative pl-2 md:pl-4 border-l border-gray-200" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-300 border ${
              isProfileOpen
                ? 'bg-indigo-50 border-indigo-200'
                : 'hover:bg-gray-50 border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-200">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-gray-800 text-xs font-bold leading-none">{user?.full_name || 'Admin'}</p>
                {user?.admin_role === 'super_admin' && (
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 border border-indigo-200 text-[8px] font-black text-indigo-600 uppercase tracking-tighter">
                    SA
                  </span>
                )}
              </div>
              <p className="text-indigo-500 text-[9px] font-black uppercase tracking-widest leading-none capitalize">{adminRole}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-100">
                <p className="text-gray-800 font-bold text-[11px] truncate">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle size={10} className="text-emerald-500" />
                  <p className="text-emerald-600 text-[9px] font-black uppercase tracking-widest">Account Verified</p>
                </div>
              </div>

              <div className="p-1.5">
                <Link href="/admin/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all group">
                  <SettingsIcon size={14} />
                  <span className="text-xs font-bold">Admin Settings</span>
                </Link>
                <Link href="/admin/audit" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all group">
                  <Shield size={14} />
                  <span className="text-xs font-bold">System Security</span>
                </Link>

                <div className="h-px bg-gray-100 my-1.5 mx-2" />

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-all"
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
