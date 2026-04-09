'use client';
import React from 'react';
import { 
  Users, Globe, TrendingUp, Sparkles, 
  ChevronRight, ArrowRight, Zap, Target,
  Star, Briefcase, Award
} from 'lucide-react';

const CommunityCard = ({ name, members, icon: Icon, color }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group shadow-sm cursor-pointer shadow-transparent hover:shadow-gray-100/50">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <Icon size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-black text-gray-900 truncate tracking-tight">{name}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{members} active members</p>
    </div>
    <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90">
      <Plus size={14} />
    </button>
  </div>
);

const Plus = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrendCard = ({ category, title, stat, color, bg }) => (
  <div className={`p-4 rounded-2xl ${bg} ${color} flex flex-col justify-between h-24 border border-transparent hover:shadow-sm transition-all cursor-pointer`}>
    <p className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none">{category}</p>
    <p className="text-[12px] font-black leading-tight tracking-tight mt-1 truncate">{title}</p>
    <p className="text-[10px] font-bold opacity-80 mt-2">{stat}</p>
  </div>
);

const FeedWidgets = ({ data }) => {
  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Connectivity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Connectivity</h3>
          <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">See All</button>
        </div>
        <div className="space-y-3">
          <CommunityCard name="UX Architects Lab" members="1,240" icon={Globe} color="bg-blue-50 text-blue-600" />
          <CommunityCard name="AI & Product Guild" members="856" icon={Sparkles} color="bg-purple-50 text-purple-600" />
        </div>
      </section>

      {/* Trending Insights */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-2">Trending Insights</h3>
        <div className="space-y-4">
          <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100 flex flex-col justify-between h-32 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-100 opacity-60">Skill Gap Report</p>
            <h4 className="text-[16px] font-black leading-tight">Remote-first Leadership</h4>
            <p className="text-[10px] font-bold text-blue-100">+12% rise this week</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TrendCard category="TECH" title="Rust for Web" stat="5.2k discussing" color="text-orange-700" bg="bg-orange-50/50" />
            <TrendCard category="FINANCE" title="Equity Comp" stat="1.8k discussing" color="text-emerald-700" bg="bg-emerald-50/50" />
          </div>
        </div>
      </section>

      {/* Mentor Match */}
      <section className="p-6 bg-white rounded-3xl border border-gray-100 md:rounded-[32px] shadow-sm space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[14px] font-black text-gray-900 tracking-tight">Mentor Match</h4>
          <Star size={16} className="text-amber-500 fill-amber-500" />
        </div>
        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Based on your learning paths, we recommend connecting with:</p>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
          <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden shrink-0 border border-white">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="" />
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-[12px] font-black text-gray-900 truncate">Sarah Jenkins</p>
             <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Principal Architect</p>
          </div>
        </div>
        <button className="w-full py-2 bg-white text-gray-900 text-[11px] font-black rounded-xl border border-gray-100 hover:bg-gray-50 transition-all shadow-sm shadow-transparent hover:shadow-gray-100">
          View Profile
        </button>
      </section>
    </div>
  );
};

export default FeedWidgets;
