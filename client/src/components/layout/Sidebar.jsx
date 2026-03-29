'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Briefcase, BookOpen, Sparkles,
  FlaskConical, Trophy, Bookmark, Award, Settings,
  LogOut, FileText, Gamepad2, Play,
  Mic, MessageSquare, Beaker, Building2, Store, Code, Heart, Star,
  UserCheck, Home
} from 'lucide-react';

const NavLink = ({ href, icon: Icon, label, badge }) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/') && href.length > 1);

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-[6px] rounded-lg text-[13px] transition-all duration-100 group relative ${
        active
          ? 'bg-blue-50 text-blue-700 font-semibold'
          : 'text-gray-600 hover:bg-[#F0F2F5] hover:text-gray-800 font-medium'
      }`}
    >
      {active && <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-blue-600 rounded-r-full" />}
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
  );
};

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 px-3 pt-4 pb-1 select-none">
    {children}
  </p>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');

  return (
    <aside className="fixed left-0 top-[56px] bottom-0 w-[220px] bg-white border-r border-gray-200/80 z-40 flex flex-col">

      {/* ── Scrollable nav ── */}
      <div
        className="flex-1 overflow-y-auto py-2 px-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
      >
        {/* Main */}
        <div className="space-y-[1px] mb-1">
          <NavLink href="/home"     icon={Home}     label="Home" />
          <NavLink href="/ai-world" icon={Sparkles} label="AI World" />
        </div>

        <SectionLabel>Social</SectionLabel>
        <div className="space-y-[1px]">
          <NavLink href="/groups"  icon={Users}    label="Groups" />
          <NavLink href="/jobs"    icon={Briefcase} label="Jobs" />
          <NavLink href="/tuition" icon={BookOpen}  label="Tuition" />
        </div>

        <SectionLabel>Learn</SectionLabel>
        <div className="space-y-[1px]">
          <NavLink href="/virtual-lab"    icon={Beaker}        label="Virtual Lab" />
          <NavLink href="/mock-interview" icon={Mic}           label="Mock Interview" />
          <NavLink href="/debate-arena"   icon={MessageSquare} label="Debate Arena" />
          <NavLink href="/code-lab"       icon={Code}          label="Code Lab" />
        </div>

        <SectionLabel>Play</SectionLabel>
        <div className="space-y-[1px]">
          <NavLink href="/arcade" icon={Gamepad2} label="Arcade" />
          <NavLink href="/clips"  icon={Play}     label="Clips" />
        </div>

        <SectionLabel>Explore</SectionLabel>
        <div className="space-y-[1px]">
          <NavLink href="/business-explorer" icon={Store}     label="Business" />
          <NavLink href="/company-explorer"  icon={Building2} label="Companies" />
        </div>

        <SectionLabel>More</SectionLabel>
        <div className="space-y-[1px] pb-2">
          <NavLink href="/saved"        icon={Bookmark} label="Saved" />
          <NavLink href="/badges"       icon={Award}    label="Badges" />
          <NavLink href="/certificates" icon={Star}     label="Certificates" />
          <NavLink href="/leaderboard"  icon={Trophy}   label="Leaderboard" />
          <NavLink href="/pricing"      icon={Heart}    label="Premium" />
          <NavLink href="/settings"     icon={Settings} label="Settings" />
        </div>
      </div>

      {/* ── User card — pinned at bottom ── */}
      {user && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-2 py-2">
          <Link
            href="/profile"
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
    </aside>
  );
}
