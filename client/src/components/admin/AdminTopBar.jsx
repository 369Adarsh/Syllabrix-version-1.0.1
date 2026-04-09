'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, User, LogOut, Settings as SettingsIcon, Shield, ChevronDown, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminTopBar({ title = 'Dashboard', subtitle }) {
  const { user, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const adminRole = user?.admin_role?.replace('_', ' ') || 'Super Admin';

  return (
    <header className="h-16 border-b border-white/[0.07] bg-[#0D0D14]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-white font-bold text-lg leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* DateTime Display */}
        <div className="text-right hidden md:block mr-2 px-3 border-r border-white/[0.05]">
          <p className="text-white/70 text-[11px] font-bold tracking-tight">{timeStr}</p>
          <p className="text-white/20 text-[9px] font-black uppercase tracking-tighter">{dateStr}</p>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border ${
              isNotifOpen 
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' 
                : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-lg shadow-red-500/20 border-2 border-[#0D0D14]">!</span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#12121A] border border-white/[0.08] shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.02]">
                <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">Global Intelligence Alerts</span>
                <span className="text-violet-400 text-[9px] font-bold bg-violet-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">LIVE Feed</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="px-4 py-3 hover:bg-white/[0.02] transition-colors border-b border-white/[0.03]">
                   <p className="text-white/70 text-[11px] font-medium leading-tight">System check completed. All service nodes are operational.</p>
                   <p className="text-white/20 text-[9px] mt-1 font-bold uppercase tracking-tight">Active Pulse • Just now</p>
                </div>
                <Link href="/admin/moderation" onClick={() => setIsNotifOpen(false)} className="px-4 py-3 hover:bg-white/[0.02] block transition-colors border-b border-white/[0.03]">
                   <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <p className="text-white font-bold text-[11px]">Urgent Moderation Required</p>
                   </div>
                   <p className="text-white/40 text-[10px] leading-snug">New flagged reports are waiting in the Content Sentinel queue.</p>
                </Link>
                <div className="px-4 py-3 opacity-40">
                   <p className="text-white/50 text-[10px] italic text-center font-medium">No further critical alerts detected.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative pl-4 border-l border-white/[0.1]" ref={profileRef}>
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
