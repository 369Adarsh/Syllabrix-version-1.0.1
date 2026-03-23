'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  HiOutlineHome, HiOutlineChat, HiOutlineBriefcase,
  HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineCog,
  HiOutlineUserGroup, HiOutlineUsers, HiOutlineLogout,
  HiOutlineVideoCamera, HiOutlineDocumentText, HiOutlineBookmark,
} from 'react-icons/hi';
import { FaBrain, FaRobot, FaFlask, FaCompass, FaLightbulb, FaChartLine } from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path) => pathname === path || pathname?.startsWith(path + '/');

  // ─── AI POWERED section (includes Experience Lab & PrepSmart now) ───
  const aiPoweredLinks = [
    { href: '/ai-buddy', label: 'AI Buddy', icon: <FaRobot className="w-5 h-5" />, badge: 'AI' },
    { href: '/career-explorer', label: 'Career Explorer', icon: <FaCompass className="w-5 h-5" />, badge: 'AI' },
    { href: '/mind-map', label: 'Mind Map', icon: <FaBrain className="w-5 h-5" />, badge: 'AI' },
    { href: '/experience-lab', label: 'Experience Lab', icon: <FaFlask className="w-5 h-5" />, badge: 'AI' },
    { href: '/prepsmart', label: 'PrepSmart', icon: <FaChartLine className="w-5 h-5" />, badge: 'AI' },
  ];

  // ─── LEARN section (remaining educational features) ───
  const learnLinks = [
    { href: '/live-classes', label: 'Live Classes', icon: <HiOutlineVideoCamera className="w-5 h-5" /> },
    { href: '/materials', label: 'Materials', icon: <HiOutlineDocumentText className="w-5 h-5" /> },
  ];

  // ─── CONNECT section ───
  const connectLinks = [
    { href: '/jobs', label: 'Jobs', icon: <HiOutlineBriefcase className="w-5 h-5" /> },
    { href: '/tuition', label: 'Tuition', icon: <HiOutlineAcademicCap className="w-5 h-5" /> },
    { href: '/mentorship', label: 'Mentorship', icon: <HiOutlineUsers className="w-5 h-5" /> },
  ];

  const renderLink = (link) => {
    const active = isActive(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          active
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <span className={active ? 'text-white' : 'text-gray-400'}>{link.icon}</span>
        <span className="flex-1">{link.label}</span>
        {link.badge && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            active ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
          }`}>
            {link.badge}
          </span>
        )}
      </Link>
    );
  };

  const renderSection = (title, links) => (
    <div className="mb-3">
      <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
        {title}
      </div>
      <div className="space-y-0.5">
        {links.map(renderLink)}
      </div>
    </div>
  );

  return (
    <aside className="w-[220px] h-screen fixed left-0 top-0 bg-white border-r border-gray-100 flex flex-col z-30">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-50">
        <Link href="/home" className="flex items-center gap-2">
          <div className="text-xl font-extrabold">
            <span className="text-gray-900">Syllabri</span>
            <span className="text-indigo-600">X</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {/* Home */}
        {renderLink({ href: '/home', label: 'Home', icon: <HiOutlineHome className="w-5 h-5" /> })}

        {/* AI POWERED — includes Experience Lab & PrepSmart */}
        {renderSection('AI POWERED', aiPoweredLinks)}

        {/* LEARN */}
        {renderSection('LEARN', learnLinks)}

        {/* CONNECT */}
        {renderSection('CONNECT', connectLinks)}

        {/* Settings */}
        <div className="pt-2 border-t border-gray-50">
          {renderLink({ href: '/settings', label: 'Settings', icon: <HiOutlineCog className="w-5 h-5" /> })}
        </div>
      </nav>

      {/* User card at bottom */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.profile_photo_url ? (
              <img src={user.profile_photo_url} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              user?.username?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">{user?.username || 'User'}</div>
            <div className="text-[11px] text-gray-400 capitalize">{user?.user_type || 'Student'}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            title="Sign Out"
          >
            <HiOutlineLogout className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
