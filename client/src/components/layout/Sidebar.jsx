'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home, Compass, MessageSquare, Users, Bell,
  Sparkles, GraduationCap, Brain, Newspaper,
  FlaskConical, Map,
  Gamepad2, Play,
  Beaker, Mic, Swords, Code, Trophy,
  Settings, X, LogOut,
  Building2, Heart, Network, BookOpen, Star, Award,
  Shield, Rss, BarChart2, Clock, FileText, ClipboardList, PlusCircle,
  Zap, Briefcase, ScanSearch, Target, TrendingUp,
  Bot, BadgeCheck, CalendarDays, UserCircle2, Plus, Search
} from 'lucide-react';
import { getStudentNavRestrictions } from '@/utils/ageGroup';
import { getPlatformMode, PLATFORM_MODES } from '@/utils/platformMode';
import { parentAPI } from '@/lib/api/parent.api';

// ─── Shared primitives ────────────────────────────────────────────────────────

const NavItem = ({
  href, icon: Icon, label, badge, onClick,
  activeClass = 'bg-blue-50 text-blue-600',
  activeIconClass = 'text-blue-600',
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Calculate active state including query params
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
  const active = currentUrl === href || (href === '/home' && currentUrl === '/home') || (href !== '/home' && pathname.startsWith(href) && !href.includes('?'));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-[7px] mx-1 rounded-lg text-[13px] font-medium transition-colors group relative ${
        active ? activeClass : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
      }`}
    >
      <Icon
        size={16}
        strokeWidth={active ? 2.2 : 1.7}
        className={active ? activeIconClass : 'text-gray-400 group-hover:text-gray-600 transition-colors'}
      />
      <span className="flex-1 truncate leading-none">{label}</span>
      {badge > 0 && (
        <span className="min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 flex-shrink-0">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
};

const Section = ({ label }) => (
  <p className="text-[10px] uppercase tracking-wider text-gray-400 px-4 mt-4 mb-1 select-none font-semibold">
    {label}
  </p>
);

// ─── Student sidebar — mode-driven ────────────────────────────────────────────

function StudentSidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');
  const mode = getPlatformMode(user);
  const modeConfig = PLATFORM_MODES[mode] || PLATFORM_MODES.default;
  const p = {
    onClick: onClose,
    activeClass: modeConfig.sidebarActive,
    activeIconClass: modeConfig.sidebarActiveIcon,
  };

  const MobileLogo = () => (
    <div className="md:hidden h-14 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
      <Link href="/home" onClick={onClose} className="flex items-center gap-2">
        <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={110} height={30} className="h-7 w-auto object-contain" priority />
      </Link>
      <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
        <X size={20} className="text-gray-500" />
      </button>
    </div>
  );

  const UserCard = () => user ? (
    <div className="flex-shrink-0 border-t border-gray-100 bg-white px-2 py-2">
      <Link href="/profile" onClick={onClose} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: modeConfig.gradient }}>
          {hasPhoto
            ? <Image src={user.profile_photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
            : <span className="text-white font-bold text-xs">{user.username?.charAt(0)?.toUpperCase()}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-gray-800 truncate">{user.profile?.full_name || user.username}</p>
          <p className="text-[10px] font-medium truncate" style={{ color: modeConfig.primaryColor }}>
            {modeConfig.emoji} {modeConfig.label}
          </p>
        </div>
      </Link>
      <button
        onClick={async () => { await logout(); window.location.href = '/sign-in'; }}
        className="flex items-center gap-2.5 px-3 py-1.5 w-full rounded-lg text-[12px] text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <LogOut size={13} /> Logout
      </button>
    </div>
  ) : null;

  // ── Young Explorer (LKG–Class 5) ──
  if (mode === 'young_explorer') {
    return (
      <div className="flex flex-col h-full bg-white">
        <MobileLogo />
        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
          <Section label="Home" />
          <NavItem href="/home"         icon={Home}        label="My Dashboard"  {...p} />

          <Section label="Learn & Play" />
          <NavItem href="/learn-play"   icon={Gamepad2}    label="Learn & Play"  {...p} />
          <NavItem href="/stories"      icon={BookOpen}    label="Story Library" {...p} />
          <NavItem href="/ai-buddy"     icon={Sparkles}    label="AI Buddy"      {...p} />
          <NavItem href="/mindmap"      icon={Brain}       label="Mind Maps"     {...p} />

          <Section label="Fun Zone" />
          <NavItem href="/arcade"       icon={Gamepad2}    label="Arcade"        {...p} />
          <NavItem href="/leaderboard"  icon={Trophy}      label="Leaderboard"   {...p} />

          <div className="mt-4 border-t border-gray-100 pt-2">
            <NavItem href="/settings"   icon={Settings}    label="Settings"      {...p} />
          </div>
        </div>
        <UserCard />
      </div>
    );
  }

  // ── Curious Mind (Class 6–8) ──
  if (mode === 'curious_mind') {
    return (
      <div className="flex flex-col h-full bg-white">
        <MobileLogo />
        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
          <Section label="Home" />
          <NavItem href="/home"            icon={Home}         label="Dashboard"      {...p} />
          <NavItem href="/groups"          icon={Users}        label="Connections"    {...p} />

          <Section label="Learn" />
          <NavItem href="/ai-buddy"        icon={Sparkles}     label="AI Buddy"       {...p} />
          <NavItem href="/prep"            icon={GraduationCap} label="PrepSmart"     {...p} />
          <NavItem href="/mindmap"         icon={Brain}        label="Mind Maps"      {...p} />
          <NavItem href="/newsroom"        icon={Newspaper}    label="Newsroom"       {...p} />

          <Section label="Discover" />
          <NavItem href="/career-explorer" icon={Map}          label="Career Explorer" {...p} />
          <NavItem href="/experience-lab"  icon={FlaskConical} label="Experience Lab"  {...p} />

          <Section label="Play" />
          <NavItem href="/arcade"          icon={Gamepad2}     label="Arcade"         {...p} />
          <NavItem href="/leaderboard"     icon={Trophy}       label="Leaderboard"    {...p} />

          <div className="mt-4 border-t border-gray-100 pt-2">
            <NavItem href="/settings"      icon={Settings}     label="Settings"       {...p} />
          </div>
        </div>
        <UserCard />
      </div>
    );
  }

  // ── Board Warrior (Class 9–10) ──
  if (mode === 'board_warrior') {
    return (
      <div className="flex flex-col h-full bg-white">
        <MobileLogo />
        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
          <Section label="Home" />
          <NavItem href="/home"            icon={Home}          label="Dashboard"      {...p} />

          <Section label="Prepare" />
          <NavItem href="/prep"            icon={GraduationCap} label="PrepSmart"      {...p} />
          <NavItem href="/jee-command"     icon={Zap}           label="Exam Hub"       {...p} />
          <NavItem href="/mindmap"         icon={Brain}         label="Mind Maps"      {...p} />
          <NavItem href="/prep/my-stats"   icon={BarChart2}     label="My Stats"       {...p} />

          <Section label="Study" />
          <NavItem href="/ai-buddy"        icon={Sparkles}      label="AI Buddy"       {...p} />
          <NavItem href="/newsroom"        icon={Newspaper}     label="Newsroom"       {...p} />
          <NavItem href="/virtual-lab"     icon={Beaker}        label="Virtual Lab"    {...p} />

          <Section label="Connect" />
          <NavItem href="/groups"          icon={Users}         label="Connections"    {...p} />
          <NavItem href="/leaderboard"     icon={Trophy}        label="Leaderboard"    {...p} />

          <div className="mt-4 border-t border-gray-100 pt-2">
            <NavItem href="/settings"      icon={Settings}      label="Settings"       {...p} />
          </div>
        </div>
        <UserCard />
      </div>
    );
  }

  // ── Exam Command (Class 11–12 / JEE / NEET) ──
  if (mode === 'exam_command') {
    return (
      <div className="flex flex-col h-full bg-white">
        <MobileLogo />
        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
          <Section label="Home" />
          <NavItem href="/home"            icon={Home}          label="Dashboard"      {...p} />

          <Section label="Prepare" />
          <NavItem href="/jee-command"     icon={Zap}           label="Exam Command"   {...p} />
          <NavItem href="/prep"            icon={GraduationCap} label="PrepSmart"      {...p} />
          <NavItem href="/mindmap"         icon={Brain}         label="Mind Maps"      {...p} />
          <NavItem href="/prep/my-stats"   icon={BarChart2}     label="My Stats"       {...p} />

          <Section label="Study" />
          <NavItem href="/ai-buddy"        icon={Sparkles}      label="AI Buddy"       {...p} />
          <NavItem href="/newsroom"        icon={Newspaper}     label="Newsroom"       {...p} />
          <NavItem href="/mock-interview"  icon={Mic}           label="Mock Interview" {...p} />
          <NavItem href="/code-lab"        icon={Code}          label="Code Lab"       {...p} />

          <Section label="Connect" />
          <NavItem href="/groups"          icon={Users}         label="Connections"    {...p} />
          <NavItem href="/mentorship"      icon={Star}          label="Mentorship"     {...p} />
          <NavItem href="/leaderboard"     icon={Trophy}        label="Leaderboard"    {...p} />

          <div className="mt-4 border-t border-gray-100 pt-2">
            <NavItem href="/settings"      icon={Settings}      label="Settings"       {...p} />
          </div>
        </div>
        <UserCard />
      </div>
    );
  }

  // ── UPSC Aspirant ──
  if (mode === 'upsc_aspirant') {
    return (
      <div className="flex flex-col h-full bg-white">
        <MobileLogo />
        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
          <Section label="Daily" />
          <NavItem href="/home"              icon={Home}          label="Daily Briefing" {...p} />
          <NavItem href="/prep/current-affairs" icon={Newspaper}  label="Current Affairs" {...p} />

          <Section label="Prepare" />
          <NavItem href="/prep"              icon={GraduationCap} label="PrepSmart"       {...p} />
          <NavItem href="/prep/daily-quiz"   icon={Brain}         label="Quiz Bank"       {...p} />
          <NavItem href="/mindmap"           icon={Brain}         label="Mind Maps"       {...p} />
          <NavItem href="/prep/my-stats"     icon={BarChart2}     label="My Stats"        {...p} />

          <Section label="AI Tools" />
          <NavItem href="/ai-buddy"          icon={Sparkles}      label="AI Mentor"       {...p} />

          <Section label="Connect" />
          <NavItem href="/groups"            icon={Users}         label="Aspirant Community" {...p} />
          <NavItem href="/newsroom"          icon={Newspaper}     label="Newsroom"        {...p} />
          <NavItem href="/leaderboard"       icon={Trophy}        label="Leaderboard"     {...p} />

          <div className="mt-4 border-t border-gray-100 pt-2">
            <NavItem href="/settings"        icon={Settings}      label="Settings"        {...p} />
          </div>
        </div>
        <UserCard />
      </div>
    );
  }

  // ── Skill Builder / Default (18+ general learner) ──
  return (
    <div className="flex flex-col h-full bg-white">
      <MobileLogo />
      <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
        <Section label="Home" />
        <NavItem href="/home"            icon={Home}          label="Dashboard"      {...p} />
        <NavItem href="/groups"          icon={Users}         label="Connections"    {...p} />

        <Section label="Learn" />
        <NavItem href="/ai-buddy"        icon={Sparkles}      label="AI Buddy"       {...p} />
        <NavItem href="/prep"            icon={GraduationCap} label="PrepSmart"      {...p} />
        <NavItem href="/jee-command"     icon={Zap}           label="Exam Command"   {...p} />
        <NavItem href="/mindmap"         icon={Brain}         label="Mind Maps"      {...p} />
        <NavItem href="/newsroom"        icon={Newspaper}     label="Newsroom"       {...p} />

        <Section label="Explore" />
        <NavItem href="/experience-lab"  icon={FlaskConical}  label="Experience Lab" {...p} />
        <NavItem href="/career-explorer" icon={Map}           label="Career Explorer" {...p} />
        <NavItem href="/mentorship"      icon={Star}          label="Mentorship"     {...p} />

        <Section label="Play" />
        <NavItem href="/arcade"          icon={Gamepad2}      label="Arcade"         {...p} />
        <NavItem href="/virtual-lab"     icon={Beaker}        label="Virtual Lab"    {...p} />
        <NavItem href="/code-lab"        icon={Code}          label="Code Lab"       {...p} />
        <NavItem href="/leaderboard"     icon={Trophy}        label="Leaderboard"    {...p} />

        <div className="mt-4 border-t border-gray-100 pt-2">
          <NavItem href="/settings"      icon={Settings}      label="Settings"       {...p} />
        </div>
      </div>
      <UserCard />
    </div>
  );
}

// ─── Parent sidebar ───────────────────────────────────────────────────────────

function ParentSidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState([]);
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');
  const pProps = {
    onClick: onClose,
    activeClass: 'bg-emerald-50 text-emerald-700',
    activeIconClass: 'text-emerald-600',
  };

  useEffect(() => {
    parentAPI.getChildren()
      .then(r => setChildren(r.data?.data || r.data || []))
      .catch(() => {});
  }, []);

  const colors = ['from-blue-400 to-blue-600', 'from-pink-400 to-rose-500', 'from-amber-400 to-orange-500', 'from-violet-400 to-purple-500'];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo — mobile drawer only */}
      <div className="md:hidden h-14 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
        <Link href="/home" onClick={onClose} className="flex items-center gap-2">
          <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={110} height={30} className="h-7 w-auto object-contain" priority />
        </Link>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>

        {/* MAIN */}
        <Section label="Main" />
        <NavItem href="/home"          icon={Home}         label="Home"          {...pProps} />
        <NavItem href="/career/feed" icon={Rss}          label="My feed"       {...pProps} />
        <NavItem href="/explore"       icon={Compass}      label="Explore"       {...pProps} />
        <NavItem href="/messages"      icon={MessageSquare} label="Messages"     {...pProps} />
        <NavItem href="/groups"        icon={Users}        label="Connections"   {...pProps} />
        <NavItem href="/notifications" icon={Bell}         label="Notifications" {...pProps} />

        {/* MY CHILDREN */}
        <Section label="My Children" />
        {children.map((child, i) => {
          const initials = child.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
          const grad = colors[i % colors.length];
          const firstName = child.full_name?.split(' ')[0] || child.full_name;
          return (
            <Link
              key={child.id}
              href={`/parent-dashboard/children/${child.id}`}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-[7px] mx-1 rounded-lg text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold" style={{ fontSize: 7 }}>{initials}</span>
              </div>
              <span className="truncate">{firstName}{child.class_name ? ` (${child.class_name})` : ''}</span>
            </Link>
          );
        })}
        <Link
          href="/parent-dashboard/link-child"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-[7px] mx-1 rounded-lg text-[12px] font-medium text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <PlusCircle size={14} className="text-blue-400 flex-shrink-0" />
          Link a child
        </Link>
        <NavItem href="/parent-dashboard"              icon={Shield}        label="Safety command"  {...pProps} />
        <NavItem href="/parent-dashboard/activity"     icon={BarChart2}     label="Activity monitor" {...pProps} />
        <NavItem href="/parent-dashboard/screen-time"  icon={Clock}         label="Screen time"     {...pProps} />
        <NavItem href="/parent-dashboard/reports"      icon={FileText}      label="Learning reports" {...pProps} />
        <NavItem href="/parent-dashboard/approvals"    icon={ClipboardList} label="Approvals"       {...pProps} />

        {/* LEARN */}
        <Section label="Learn" />
        <NavItem href="/ai-buddy"  icon={Sparkles}     label="AI Buddy"  {...pProps} />
        <NavItem href="/prep"      icon={GraduationCap} label="PrepSmart" {...pProps} />
        <NavItem href="/newsroom"  icon={Newspaper}    label="Newsroom"  {...pProps} />
        <NavItem href="/mindmap"   icon={Brain}        label="Mind Maps" {...pProps} />

        {/* DISCOVER */}
        <Section label="Discover" />
        <NavItem href="/experience-lab"  icon={FlaskConical} label="Experience Lab"  {...pProps} />
        <NavItem href="/career-explorer" icon={Map}          label="Career Explorer" {...pProps} />
        <NavItem href="/arcade"          icon={Gamepad2}     label="Arcade"          {...pProps} />

        {/* Settings */}
        <div className="mt-4 border-t border-gray-100 pt-2">
          <NavItem href="/settings" icon={Settings} label="Settings" {...pProps} />
        </div>
      </div>

      {/* User card */}
      {user && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-2 py-2">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {hasPhoto ? (
                <Image src={user.profile_photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">{user.username?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-gray-800 truncate">
                {user.profile?.full_name || user.username}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium truncate">Parent</p>
            </div>
          </Link>
          <button
            onClick={async () => { await logout(); window.location.href = '/sign-in'; }}
            className="flex items-center gap-2.5 px-3 py-1.5 w-full rounded-lg text-[12px] text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Professional Learner sidebar ─────────────────────────────────────────────

// ─── HR Professional sidebar ──────────────────────────────────────────────────

function HRSidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');
  const p = {
    onClick: onClose,
    activeClass: 'bg-teal-50 text-teal-700 font-bold',
    activeIconClass: 'text-teal-600',
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Mobile drawer header */}
      <div className="md:hidden h-14 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
        <Link href="/home" onClick={onClose} className="flex items-center gap-2">
          <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={110} height={30} className="h-7 w-auto object-contain" priority />
        </Link>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarWidth: 'none' }}>

        {/* RECRUITMENT */}
        <Section label="Recruitment" />
        <NavItem href="/home"           icon={Briefcase}   label="HR Dashboard"    {...p} />
        <NavItem href="/jobs/create"    icon={Plus}        label="Post a Job"      {...p} />
        <NavItem href="/jobs/my-posts"  icon={FileText}    label="My Job Posts"    {...p} />
        <NavItem href="/jobs/applicants" icon={Users}      label="Applicants"      {...p} />

        {/* TALENT */}
        <Section label="Talent" />
        <NavItem href="/explore"        icon={Search}      label="HR Explorer"     {...p} />
        <NavItem href="/groups"         icon={Users}       label="Connections"     {...p} />
        <NavItem href="/career/feed"    icon={Rss}         label="Feed"            {...p} />

        {/* TOOLS */}
        <Section label="Tools" />
        <NavItem href="/messages"       icon={MessageSquare} label="Messages"      {...p} />
        <NavItem href="/career/salary"  icon={TrendingUp}  label="Salary Insights" {...p} />
        <NavItem href="/ai-buddy"       icon={Sparkles}    label="AI Assistant"    {...p} />

        {/* Upgrade */}
        <div className="mx-3 mt-8 p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 w-12 h-12 bg-teal-200/20 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <p className="text-[10px] font-black text-teal-700 uppercase tracking-wider mb-1">Upgrade to Pro</p>
          <p className="text-[9px] text-teal-600 leading-tight mb-3">Unlock AI candidate matching & advanced ATS features.</p>
          <button className="w-full py-2 bg-teal-600 text-white text-[10px] font-black rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
            UPGRADE NOW
          </button>
        </div>

        {/* System */}
        <div className="mt-8 pt-2 border-t border-gray-50">
          <NavItem href="/settings" icon={Settings} label="Settings" {...p} />
          <NavItem href="/support"  icon={Heart}    label="Support"  {...p} />
        </div>
      </div>

      {/* User card */}
      {user && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-2 py-2">
          <Link href="/profile" onClick={onClose}
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {hasPhoto ? (
                <Image src={user.profile_photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">{user.username?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-black text-gray-900 truncate">
                {user.profile?.full_name || user.full_name || user.username}
              </p>
              <p className="text-[10px] text-gray-400 font-medium truncate">
                {user.profile?.hr_role || 'HR Professional'}
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Professional sidebar ─────────────────────────────────────────────────────

function ProfessionalSidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');
  const p = {
    onClick: onClose,
    activeClass: 'bg-blue-50 text-blue-600 font-bold',
    activeIconClass: 'text-blue-600',
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Mobile drawer header */}
      <div className="md:hidden h-14 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
        <Link href="/home" onClick={onClose} className="flex items-center gap-2">
          <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={110} height={30} className="h-7 w-auto object-contain" priority />
        </Link>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarWidth: 'none' }}>
        
        {/* CAREER */}
        <Section label="Career" />
        <NavItem href="/home" icon={Briefcase} label="Dashboard" {...p} />
        <NavItem href="/career/jobs" icon={ScanSearch} label="Job radar" {...p} />
        <NavItem href="/career/resume" icon={FileText} label="Resume builder" {...p} />
        <NavItem href="/career/salary" icon={TrendingUp} label="Salary insights" {...p} />

        {/* SKILLS */}
        <Section label="Skills" />
        <NavItem href="/career/skills" icon={Target} label="Skill scanner" {...p} />
        <NavItem href="/career/learning" icon={Award} label="Learning paths" {...p} />
        <NavItem href="/ai-buddy" icon={Sparkles} label="AI Mentor" {...p} />
        <NavItem href="/career/certifications" icon={BadgeCheck} label="Certifications" {...p} />

        {/* NETWORK */}
        <Section label="Network" />
        <NavItem href="/career/feed" icon={Rss}         label="My feed"           {...p} />
        <NavItem href="/explore"     icon={Search}      label="Find HR Pros"      {...p} />
        <NavItem href="/groups"      icon={Users}       label="Connections"       {...p} />
        <NavItem href="/mentorship"  icon={UserCircle2} label="Mentors"           {...p} />
        <NavItem href="/jobs"        icon={Briefcase}   label="Browse Jobs"       {...p} />

        {/* Premium Promo */}
        <div className="mx-3 mt-8 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 relative overflow-hidden group">
          <div className="absolute -right-2 -top-2 w-12 h-12 bg-blue-200/20 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-1">Upgrade to Premium</p>
          <p className="text-[9px] text-blue-600 leading-tight mb-3">Unlock deep market insights and AI-driven pathing.</p>
          <button className="w-full py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            UPGRADE NOW
          </button>
        </div>

        {/* System */}
        <div className="mt-8 pt-2 border-t border-gray-50">
          <NavItem href="/settings" icon={Settings} label="Settings" {...p} />
          <NavItem href="/support" icon={Heart} label="Support" {...p} />
        </div>
      </div>

      {/* User card */}
      {user && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-2 py-2">
          <Link href="/profile" onClick={onClose}
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {hasPhoto ? (
                <Image src={user.profile_photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">{user.username?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-black text-gray-900 truncate">
                {user.profile?.full_name || user.username}
              </p>
              <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-widest">Professional</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Generic sidebar for all other user types ─────────────────────────────────

function GenericSidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const hasPhoto = user?.profile_photo_url && !user.profile_photo_url.includes('PASTE_');
  const props = { onClick: onClose };
  const type = user?.user_type;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Mobile-only header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <Link href="/home" onClick={onClose}>
          <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={110} height={30} className="h-7 w-auto object-contain" priority />
        </Link>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
        <NavItem href="/home" icon={Home} label="Dashboard" {...props} />

        {/* Professional Learner / Organization */}
        {(type === 'professional_learner' || type === 'organization') && (
          <>
            <Section label="Professional Intelligence" />
            <NavItem href="/experience-lab"  icon={FlaskConical} label="Experience Lab"  {...props} />
            <NavItem href="/career-explorer" icon={Map}          label="Career Roadmap"  {...props} />
            <NavItem href="/corporate"       icon={Building2}    label="Corporate L&D"   {...props} />
            <NavItem href="/code-lab"        icon={Code}         label="Code Intelligence" {...props} />
          </>
        )}

        {/* Educator types */}
        {(type === 'teacher' || type === 'institute' || type === 'mentor') && (
          <>
            <Section label="Educator Studio" />
            <NavItem href="/teacher-studio" icon={Sparkles} label="Studio"         {...props} />
            <NavItem href="/mentorship"     icon={Users}    label="Mentorship"     {...props} />
            <NavItem href="/ai-study-table" icon={BookOpen} label="Study Copilots" {...props} />
          </>
        )}

        {/* Parent */}
        {type === 'parent' && (
          <>
            <Section label="Safety & Oversight" />
            <NavItem href="/parent-dashboard" icon={Users}  label="Parent Analytics"  {...props} />
            <NavItem href="/safety"           icon={Heart}  label="Safety Monitor"    {...props} />
          </>
        )}

        {/* Shared */}
        <Section label="Connect" />
        <NavItem href="/social"   icon={Network}      label="Social Feed"  {...props} />
        <NavItem href="/explore"  icon={Compass}      label="Discover"     {...props} />
        <NavItem href="/learn"    icon={GraduationCap} label="Learn Center" {...props} />

        <Section label="Ecosystem" />
        <NavItem href="/messages"      icon={MessageSquare} label="Messages"     {...props} />
        <NavItem href="/newsroom"      icon={Newspaper}     label="Newsroom"     {...props} />
        <NavItem href="/badges"        icon={Award}         label="Badges"       {...props} />
        <NavItem href="/certificates"  icon={Star}          label="Certificates" {...props} />
        <NavItem href="/leaderboard"   icon={Trophy}        label="Leaderboard"  {...props} />
        <NavItem href="/settings"      icon={Settings}      label="Settings"     {...props} />
      </div>

      {user && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-2 py-2">
          <Link href="/profile" onClick={onClose} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0">
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
}

// ─── Root Sidebar component ───────────────────────────────────────────────────

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const isStudent = user?.user_type === 'student';
  const isParent = user?.user_type === 'parent';
  const isHR = user?.user_type === 'hr_professional';
  const isProfessional = user?.user_type === 'professional_learner' || user?.user_type === 'organization';
  const Content = isStudent ? StudentSidebarContent
    : isParent ? ParentSidebarContent
    : isHR ? HRSidebarContent
    : isProfessional ? ProfessionalSidebarContent
    : GenericSidebarContent;
  const sidebarContent = <Content onClose={onClose} />;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Desktop fixed sidebar */}
      <aside className="hidden md:flex fixed left-0 top-[56px] bottom-0 w-[200px] bg-white border-r border-gray-200/80 z-40 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <motion.div
        className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 flex-col shadow-2xl md:hidden flex"
        animate={{ x: isOpen ? 0 : '-100%' }}
        initial={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Mobile close button for student/parent sidebar (they have their own logo row) */}
        {(isStudent || isParent) && (
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0 absolute top-0 right-0 z-10">
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        )}
        {sidebarContent}
      </motion.div>
    </>
  );
}
