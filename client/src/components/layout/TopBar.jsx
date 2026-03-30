'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, Home, Compass, MessageCircle, Bell, X, Settings, LogOut,
  User, ChevronDown, Plus, Menu,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/home',          label: 'Home',     icon: Home },
  { href: '/explore',       label: 'Explore',  icon: Compass },
  { href: '/messages',      label: 'Messages', icon: MessageCircle },
  { href: '/notifications', label: 'Alerts',   icon: Bell },
];

export default function TopBar({ onMenuClick = () => {} }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    if (showProfile) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfile]);

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

        {/* ── LOGO ZONE — exactly matches sidebar width ── */}
        <div className="hidden md:flex items-center w-[220px] flex-shrink-0 px-4 border-r border-gray-200/60">
          <Link href="/home" className="flex items-center">
            <Image
              src="/images/logo/syllabrix-logo.png"
              alt="Syllabrix"
              width={130} height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* ── CONTENT ZONE — search + nav + profile ── */}
        <div className="flex-1 flex items-center h-full px-3 md:px-4 gap-2 min-w-0">

          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#F0F2F5] active:bg-[#E4E6EB] transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-gray-600" />
          </button>

          {/* Mobile logo */}
          <Link href="/home" className="md:hidden flex items-center flex-shrink-0">
            <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={100} height={28} className="h-7 w-auto object-contain" priority />
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[280px]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                placeholder="Search Syllabrix..."
                className={`w-full pl-8 pr-7 py-[7px] rounded-full text-[13px] outline-none transition-all duration-200 ${
                  searchFocused
                    ? 'bg-white border border-blue-400 ring-2 ring-blue-100'
                    : 'bg-[#F0F2F5] border border-transparent hover:bg-[#E4E6EB]'
                }`}
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X size={12} className="text-gray-400" />
                </button>
              )}
            </div>
          </form>

          {/* Center nav — icon tabs, true center of content zone */}
          <nav className="hidden sm:flex items-center gap-0.5 mx-auto">
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href || (item.href === '/home' && pathname === '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`relative flex flex-col items-center justify-center w-[76px] h-[56px] transition-all duration-150 group ${
                    active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-[#F0F2F5]'
                  }`}
                >
                  <item.icon size={22} strokeWidth={active ? 2.2 : 1.6} />
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-blue-600 rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 ml-auto flex-shrink-0" ref={profileRef}>
            {/* Create post shortcut */}
            <Link
              href="/home"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[12px] font-semibold text-gray-600 transition-colors"
            >
              <Plus size={14} />
              Create
            </Link>

            {/* Profile button */}
            <button
              onClick={() => setShowProfile(v => !v)}
              className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-full hover:bg-[#F0F2F5] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden ring-2 ring-white flex-shrink-0">
                {hasPhoto ? (
                  <Image src={user.profile_photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-xs">{user?.username?.charAt(0)?.toUpperCase() || '?'}</span>
                )}
              </div>
              <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile dropdown */}
            <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute right-0 top-[60px] w-[272px] max-w-[calc(100vw-16px)] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/80 py-2 z-50"
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
                      <span className="text-white font-bold text-sm">{user?.username?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-[13px] truncate">{user?.profile?.full_name || user?.username}</p>
                    <p className="text-[11px] text-gray-400 truncate">@{user?.username} · <span className="capitalize">{user?.user_type}</span></p>
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
    </motion.header>
  );
}
