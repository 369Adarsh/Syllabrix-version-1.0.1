'use client';
import React from 'react';
import { 
  Layout, TrendingUp, Users, BookOpen, 
  Settings, HelpCircle, Star, Sparkles, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavLink = ({ href, icon: Icon, label, active }) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-blue-50 text-blue-600 font-black shadow-sm' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-bold'
    }`}
  >
    <Icon size={18} className={`${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`} />
    <span className="text-[13px] tracking-tight">{label}</span>
  </Link>
);

const FeedSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-full flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Navigation */}
      <nav className="space-y-1">
        <NavLink href="/career/feed" icon={Layout} label="Feed" active={pathname === '/career/feed'} />
        <NavLink href="/career" icon={TrendingUp} label="Dashboard" active={pathname === '/career'} />
        <NavLink href="/career/skills" icon={TrendingUp} label="My Growth" active={pathname === '/career/skills'} />
        <NavLink href="/career/network" icon={Users} label="Network" active={pathname === '/career/network'} />
        <NavLink href="/learning" icon={BookOpen} label="Learning Paths" active={pathname === '/learning'} />
      </nav>

      {/* Premium Card */}
      <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <h4 className="text-[15px] font-black leading-tight mb-2">Upgrade to Premium</h4>
        <p className="text-[11px] text-blue-100 leading-relaxed mb-6 font-medium">
          Unlock AI-powered career matching tools and elite network insights.
        </p>
        <button className="w-full py-2.5 bg-white text-blue-700 text-xs font-black rounded-xl hover:bg-blue-50 transition-all shadow-sm active:scale-95">
          Get Started
        </button>
      </div>

      {/* Help Footer */}
      <div className="pt-4 border-t border-gray-100">
        <Link 
          href="/help" 
          className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HelpCircle size={16} />
          <span className="text-[12px] font-bold">Help Center</span>
        </Link>
      </div>
    </div>
  );
};

export default FeedSidebar;
