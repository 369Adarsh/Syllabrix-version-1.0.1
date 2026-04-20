'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Rss, Users, Settings,
  HelpCircle, Zap, Search
} from 'lucide-react';

const NAV = [
  { href: '/home',         icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/career/feed',  icon: Rss,             label: 'Feed'      },
  { href: '/groups',       icon: Users,           label: 'Connections' },
];

export default function FeedSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const avatar = user?.profile_photo_url
    || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'U')}`;

  return (
    <div className="flex flex-col gap-3">

      {/* Brand + Search */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-base font-black text-gray-900 tracking-tight">Career Intel</p>
            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest">Market Insights</p>
          </div>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search insights..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-blue-200 focus:bg-white transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="px-4 pb-4 -mt-5">
          <img
            src={avatar}
            alt=""
            className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
            onError={e => { e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=U'; }}
          />
          <p className="text-sm font-bold text-gray-900 mt-1 truncate">{user?.full_name || user?.username || 'Learner'}</p>
          <p className="text-[11px] text-gray-400 capitalize truncate">{user?.user_type?.replace('_', ' ') || 'Professional'}</p>
        </div>
      </div>

      {/* Navigator */}
      <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1.5">Navigator</p>
        <nav className="space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 font-medium'
                }`}
              >
                <Icon size={15} className={active ? 'text-blue-600' : 'text-gray-400'} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pro Access card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={12} className="text-yellow-300" />
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Pro Access</p>
        </div>
        <p className="text-sm font-black leading-tight mb-3">Unlock AI Salary Predictions</p>
        <button className="w-full py-2 bg-white text-blue-700 text-xs font-black rounded-xl hover:bg-blue-50 transition-all shadow-sm">
          Upgrade to Pro
        </button>
      </div>

      {/* Footer links */}
      <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all font-medium">
          <Settings size={15} className="text-gray-400" /> Settings
        </Link>
        <Link href="/support" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all font-medium">
          <HelpCircle size={15} className="text-gray-400" /> Help
        </Link>
      </div>

    </div>
  );
}
