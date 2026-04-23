'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications, TYPE_META } from '@/contexts/NotificationContext';
import { getNotificationUrl } from '@/lib/notification-utils';
import { timeAgo } from '@/lib/utils';
import {
  Search, Home, Compass, MessageCircle, Bell, X, Settings, LogOut,
  User, ChevronDown, Plus, Menu, ShieldCheck, Briefcase, Loader2,
} from 'lucide-react';
import { parentAPI } from '@/lib/api/parent.api';
import { careerAPI } from '@/lib/api/career.api';

const NAV_ITEMS = [
  { href: '/home',          label: 'Home',     icon: Home },
  { href: '/explore',       label: 'Explore',  icon: Compass },
  { href: '/messages',      label: 'Messages', icon: MessageCircle },
  { href: '/notifications', label: 'Alerts',   icon: Bell },
];

export default function TopBar({ onMenuClick = () => {} }) {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, loading: notifLoading, markRead, markAllRead } = useNotifications();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [parentChildren, setParentChildren] = useState([]);
  const [showChildPicker, setShowChildPicker] = useState(false);
  const profileRef = useRef(null);
  const childPickerRef = useRef(null);
  const notifRef = useRef(null);

  const isParent = user?.user_type === 'parent';
  const isProfessional = user?.user_type === 'professional_learner' || user?.user_type === 'organization';
  const [careerProfile, setCareerProfile] = useState(null);


  useEffect(() => {
    if (!isProfessional) return;
    careerAPI.getProfile()
      .then(r => setCareerProfile(r.data?.data || null))
      .catch(() => {});
  }, [isProfessional]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isParent) return;
    parentAPI.getChildren()
      .then(r => setParentChildren(r.data?.data || r.data || []))
      .catch(() => {});
  }, [isParent]);

  useEffect(() => {
    const handler = (e) => {
      if (childPickerRef.current && !childPickerRef.current.contains(e.target)) setShowChildPicker(false);
    };
    if (showChildPicker) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showChildPicker]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    if (showProfile) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfile]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false);
    };
    if (showNotifPanel) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifPanel]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { router.push('/explore?q=' + encodeURIComponent(query.trim())); setSearchFocused(false); }
  };

  const handleLogout = async () => { await logout(); window.location.href = '/sign-in'; };
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center h-[56px]">

        {/* ── LOGO ZONE ── */}
        <div className="hidden md:flex flex-col justify-center w-[200px] flex-shrink-0 px-5 border-r border-gray-100">
          <Link href="/home" className="flex flex-col">
            <Image
              src="/images/logo/syllabrix-logo.png"
              alt="Syllabrix"
              width={150} height={40}
              className="h-9 w-auto object-contain"
              priority
            />
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5 ml-1">Career Intelligence</span>
          </Link>
        </div>

        {/* ── CONTENT ZONE ── */}
        <div className="flex-1 flex items-center h-full px-4 gap-6 min-w-0">
          
          {/* Mobile hamburger & logo */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={onMenuClick} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
              <Menu size={20} className="text-gray-600" />
            </button>
            <Link href="/home">
              <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={100} height={28} className="h-7 w-auto object-contain" />
            </Link>
          </div>

          {/* Pill Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:block w-full max-w-[240px]">
            <div className="relative group">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full bg-gray-100/80 border-transparent focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-blue-50 pl-11 pr-4 py-2.5 rounded-full text-[13px] font-medium transition-all outline-none"
              />
            </div>
          </form>

          {/* Centralized Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 ml-4">
            {[
              { label: 'Mentors', href: '/mentorship' },
              { label: 'HR Explorer', href: '/explore' }
            ].map((link) => {
              const active = pathname === link.href || (link.href === '/home' && pathname === '/');
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`text-[13px] font-black tracking-tight transition-colors ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>


          {/* Child switcher — parent only */}
          {isParent && parentChildren.length > 0 && (
            <div className="relative hidden sm:block flex-shrink-0" ref={childPickerRef}>
              <button
                onClick={() => setShowChildPicker(v => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors"
              >
                <ShieldCheck size={13} className="text-emerald-600 flex-shrink-0" />
                <div className="flex items-center gap-1">
                  {parentChildren.slice(0, 3).map((c, i) => {
                    const initials = c.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
                    return (
                      <span key={c.id} className="flex items-center gap-1">
                        {i > 0 && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
                        <span className="text-[11px] font-semibold text-emerald-700">{c.full_name?.split(' ')[0] || initials}</span>
                      </span>
                    );
                  })}
                  {parentChildren.length > 3 && <span className="text-[11px] text-emerald-500">+{parentChildren.length - 3}</span>}
                </div>
                <ChevronDown size={11} className={`text-emerald-500 transition-transform duration-200 ${showChildPicker ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showChildPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-[40px] w-[200px] bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50"
                  >
                    <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Switch to child</p>
                    {parentChildren.map(c => (
                      <Link
                        key={c.id}
                        href={`/parent-dashboard/children/${c.id}`}
                        onClick={() => setShowChildPicker(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-700 hover:bg-emerald-50 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-[9px]">{c.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
                        </div>
                        <span className="truncate">{c.full_name?.split(' ')[0]}</span>
                        {c.class_name && <span className="text-gray-400 text-[11px] ml-auto">Cl. {c.class_name}</span>}
                      </Link>
                    ))}
                    <div className="mx-2 my-1 h-px bg-gray-100" />
                    <Link
                      href="/parent-dashboard"
                      onClick={() => setShowChildPicker(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-emerald-600 font-medium hover:bg-emerald-50 transition-colors"
                    >
                      <ShieldCheck size={13} /> Safety command →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Industry badge — professional learner only */}
          {isProfessional && (careerProfile?.industry || careerProfile?.primary_domain) && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-full flex-shrink-0">
              <Briefcase size={12} className="text-purple-600 flex-shrink-0" />
              <span className="text-[11px] font-semibold text-purple-700 truncate max-w-[120px]">
                {careerProfile.primary_domain || careerProfile.industry}
              </span>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-4 ml-auto flex-shrink-0">
            
            {/* User ID - High Priority Requirement */}
            {user?.syllabrix_id && (
              <div className="hidden xl:flex flex-col items-end mr-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Unique ID</span>
                <span className="text-[11px] font-black text-blue-600 tracking-tighter mt-1">{user.syllabrix_id}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifPanel(v => !v)}
                  className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors group"
                >
                  <Bell size={20} className={showNotifPanel ? 'text-blue-600' : 'group-hover:text-blue-600'} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[44px] w-[380px] max-w-[calc(100vw-16px)] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-gray-200/80 z-50 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-[15px]">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllRead()}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="max-h-[420px] overflow-y-auto">
                        {notifLoading ? (
                          <div className="flex justify-center py-10">
                            <Loader2 size={20} className="animate-spin text-gray-400" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="text-center py-12">
                            <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 8).map(n => {
                            const meta = TYPE_META[n.type] || TYPE_META.system;
                            const actorName = n.actor_full_name || n.actor_username;
                            const avatar = n.actor_photo
                              || (actorName ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(actorName)}` : null);
                            return (
                              <button
                                key={n.id}
                                onClick={() => {
                                  if (!n.is_read) markRead(n.id);
                                  const url = getNotificationUrl(n);
                                  if (url) router.push(url);
                                  setShowNotifPanel(false);
                                }}
                                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                              >
                                <div className="relative flex-shrink-0">
                                  {avatar ? (
                                    <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=U`; }} />
                                  ) : (
                                    <div className={`w-10 h-10 rounded-full ${meta.color} flex items-center justify-center text-lg`}>{meta.icon}</div>
                                  )}
                                  {avatar && (
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 w-[18px] h-[18px] rounded-full ${meta.color} flex items-center justify-center text-[9px] ring-2 ring-white`}>
                                      {meta.icon}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] text-gray-800 leading-snug line-clamp-2">{n.message}</p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                                </div>
                                {!n.is_read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-center">
                        <Link
                          href="/notifications"
                          onClick={() => setShowNotifPanel(false)}
                          className="text-[13px] font-semibold text-blue-600 hover:underline"
                        >
                          See all notifications →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Settings gear */}
              <Link href="/settings" className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors group">
                <Settings size={20} className="group-hover:text-blue-600" />
              </Link>
            </div>

            {/* Profile trigger */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(v => !v)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                  {hasPhoto ? (
                    <Image src={user.profile_photo_url} alt="" width={36} height={36} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-black text-[13px]">{user?.username?.charAt(0)?.toUpperCase() || '?'}</span>
                  )}
                </div>
              </button>

              {/* Profile dropdown */}
              <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute right-0 top-[48px] w-[272px] max-w-[calc(100vw-16px)] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/80 py-2 z-50"
                >
                  {/* User info */}
                  <Link
                    href="/profile"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#F0F2F5] transition-colors mx-2 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {hasPhoto ? (
                        <Image src={user.profile_photo_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-sm">{user?.username?.charAt(0)?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-[13px] truncate">{user?.profile?.full_name || user?.username}</p>
                      {user?.user_type === 'student' && (user?.profile?.class_name || user?.profile?.board) ? (
                        <p className="text-[11px] text-gray-400 truncate">
                          {user?.profile?.class_name ? `Class ${user.profile.class_name}` : ''}
                          {user?.profile?.class_name && user?.profile?.board ? ' · ' : ''}
                          {user?.profile?.board || ''}
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-400 truncate">@{user?.username} · <span className="capitalize">{user?.user_type}</span></p>
                      )}
                    </div>
                  </Link>

                  <div className="mx-3 my-1.5 h-px bg-gray-100" />

                  <Link href="/profile" onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-[#F0F2F5] transition-colors mx-2 rounded-lg">
                    <User size={15} className="text-gray-500" /> View Profile
                  </Link>
                  <Link href="/settings" onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-[#F0F2F5] transition-colors mx-2 rounded-lg">
                    <Settings size={15} className="text-gray-500" /> Settings
                  </Link>

                  <div className="mx-3 my-1.5 h-px bg-gray-100" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors mx-2 rounded-lg w-[calc(100%-16px)]"
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
