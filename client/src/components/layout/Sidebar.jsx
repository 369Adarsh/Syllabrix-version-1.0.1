'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Briefcase, BookOpen, Sparkles,
  FlaskConical, Trophy, Bookmark, Award, Settings,
  LogOut, Gamepad2, Play,
  Mic, MessageSquare, Beaker, Building2, Store, Code, Heart, Star,
  Home, GraduationCap, X, Newspaper, Map, Brain, Bell, Dumbbell, Compass, Network
} from 'lucide-react';

const NavLink = ({ href, icon: Icon, label, badge, onClick }) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/') && href.length > 1);

  return (
    <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-all duration-100 group relative ${
          active
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : 'text-gray-600 hover:bg-[#F0F2F5] hover:text-gray-800 font-medium'
        }`}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-1 bottom-1 w-[3px] bg-blue-600 rounded-r-full"
          />
        )}
        <Icon
          size={17}
          strokeWidth={active ? 2.2 : 1.6}
          className={active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}
        />
        <span className="flex-1 truncate leading-none">{label}</span>
        {badge && (
          <span className="w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
            {badge}
          </span>
        )}
      </Link>
    </motion.div>
  );
};

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 px-3 pt-4 pb-1 select-none">
    {children}
  </p>
);

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');

  // Close drawer on route change
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navProps = { onClick: onClose };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Mobile-only header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <Link href="/home" onClick={onClose}>
          <Image
            src="/images/logo/syllabrix-logo.png"
            alt="Syllabrix"
            width={120} height={34}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Scrollable nav */}
      <div
        className="flex-1 overflow-y-auto py-4 px-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
      >
        <div className="space-y-[1px] mb-1">
          <NavLink href="/home"     icon={Home}          label="Home"     {...navProps} />
          <NavLink href="/ai-world" icon={Sparkles}      label="AI World" {...navProps} />
          <NavLink href="/learn"    icon={GraduationCap} label="Learn"    {...navProps} />
          <NavLink href="/social"   icon={Users}         label="Social"   {...navProps} />
          <NavLink href="/explore"  icon={Compass}       label="Explore"  {...navProps} />
          <NavLink href="/play"     icon={Gamepad2}      label="Play"     {...navProps} />
        </div>

        <SectionLabel>More</SectionLabel>
        <div className="space-y-[1px] pb-4">
          <NavLink href="/messages"      icon={MessageSquare} label="Messages"    {...navProps} />
          <NavLink href="/saved"         icon={Bookmark}      label="Saved"       {...navProps} />
          <NavLink href="/badges"        icon={Award}         label="Badges"      {...navProps} />
          <NavLink href="/certificates"  icon={Star}          label="Certificates"{...navProps} />
          <NavLink href="/leaderboard"   icon={Trophy}        label="Leaderboard" {...navProps} />
          <NavLink href="/notifications" icon={Bell}          label="Notifications"{...navProps} />
          <NavLink href="/pricing"       icon={Heart}         label="Premium"     {...navProps} />
          <NavLink href="/settings"      icon={Settings}      label="Settings"    {...navProps} />
        </div>
      </div>

      {/* User card pinned at bottom */}
      {user && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-2 py-2">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#F0F2F5] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white">
              {hasPhoto ? (
                <Image src={user.profile_photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">{user.username?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-gray-800 truncate">{user.username}</p>
              <p className="text-[10px] text-gray-400 capitalize truncate">{user.user_type}</p>
            </div>
          </Link>
          <button
            onClick={async () => { await logout(); window.location.href = '/sign-in'; }}
            className="flex items-center gap-2.5 px-3 py-1.5 w-full rounded-lg text-[12px] text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Desktop — always visible fixed sidebar */}
      <aside className="hidden md:flex fixed left-0 top-[56px] bottom-0 w-[220px] bg-white border-r border-gray-200/80 z-40 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile — slide-in drawer */}
      <motion.div
        className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 flex-col shadow-2xl md:hidden flex"
        animate={{ x: isOpen ? 0 : '-100%' }}
        initial={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {sidebarContent}
      </motion.div>
    </>
  );
}
