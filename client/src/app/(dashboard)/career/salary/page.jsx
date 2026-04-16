'use client';
import React, { useState, useEffect } from 'react';
import { careerAPI } from '@/lib/api/career.api';
import { 
  IndianRupee, TrendingUp, MapPin, Briefcase, 
  Search, ShieldCheck, Zap, ArrowUpRight,
  Globe, Info, Filter, PieChart, Sparkles,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SALARY_DATA = [
  { role: 'SAP BTP Consultant', exp: '0-2 yrs', min: 4, max: 7, median: 5.5, growth: '+18%' },
  { role: 'SAP BTP Consultant', exp: '3-5 yrs', min: 8, max: 14, median: 11, growth: '+22%' },
  { role: 'SAP BTP Consultant', exp: '6+ yrs', min: 15, max: 28, median: 21, growth: '+15%' },
  { role: 'SAP ABAP Developer', exp: '0-2 yrs', min: 3, max: 6, median: 4.5, growth: '+10%' },
  { role: 'SAP ABAP Developer', exp: '3-5 yrs', min: 7, max: 12, median: 9.5, growth: '+12%' },
  { role: 'Full Stack Developer', exp: '0-2 yrs', min: 4, max: 8, median: 6, growth: '+25%' },
  { role: 'Full Stack Developer', exp: '3-5 yrs', min: 10, max: 18, median: 14, growth: '+28%' },
  { role: 'Data Scientist', exp: '0-2 yrs', min: 5, max: 9, median: 7, growth: '+35%' },
  { role: 'Data Scientist', exp: '3-5 yrs', min: 12, max: 22, median: 17, growth: '+38%' },
  { role: 'DevOps Engineer', exp: '0-2 yrs', min: 5, max: 9, median: 7, growth: '+30%' },
  { role: 'Cloud Architect', exp: '5+ yrs', min: 20, max: 40, median: 30, growth: '+32%' },
];

const LOCATIONS = [
  { city: 'Bangalore', mult: '1.0x', note: 'Highest demand', icon: '🏙️' },
  { city: 'Hyderabad', mult: '0.95x', note: 'Growing hub', icon: '🕌' },
  { city: 'Pune', mult: '0.92x', note: 'MNC-heavy', icon: '🏭' },
  { city: 'Mumbai', mult: '1.05x', note: 'Fintech premium', icon: '🚢' },
  { city: 'Delhi NCR', mult: '0.97x', note: 'Consulting-heavy', icon: '🗼' },
  { city: 'Remote', mult: '0.85–1.1x', note: 'Global reach', icon: '🌍' },
];

const SalaryCard = ({ data }) => {
  const rangeWidth = ((data.max - data.min) / 40) * 100;
  const rangeLeft = (data.min / 40) * 100;
  const medianPos = (data.median / 40) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/30 transition-all group"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-[15px] font-black text-gray-900 tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors uppercase">{data.role}</h4>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.exp} Experience</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1 shadow-sm shadow-emerald-50">
            <TrendingUp size={12} /> {data.growth}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Range</span>
              <span className="text-lg font-black text-gray-900 tracking-tighter">₹{data.min} – {data.max} <span className="text-[10px] text-gray-400">LPA</span></span>
           </div>
           <div className="text-right">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 italic">Median</span>
              <p className="text-[13px] font-black text-blue-600">₹{data.median} LPA</p>
           </div>
        </div>

        {/* Range Visualizer */}
        <div className="relative h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
           <div 
             className="absolute h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full shadow-lg shadow-blue-100"
             style={{ width: `${rangeWidth}%`, left: `${rangeLeft}%` }}
           />
           <div 
             className="absolute h-4 w-1 bg-white border border-blue-600 top-1/2 -translate-y-1/2 shadow-md z-10"
             style={{ left: `${medianPos}%` }}
           />
        </div>
        <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest pt-1 px-1">
           <span>₹0</span>
           <span>₹20</span>
           <span>₹40L</span>
        </div>
      </div>
    </motion.div>
  );
};

const EliteEmployerCard = ({ employer }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-50/50 transition-all flex flex-col h-full group relative overflow-hidden"
  >
    {/* Velocity Badge */}
    <div className="absolute top-6 right-6">
      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
        employer.hiring_velocity === 'High' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
      }`}>
        <Zap size={10} fill="currentColor" /> {employer.hiring_velocity} Velocity
      </div>
    </div>

    <div className="flex items-center gap-5 mb-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-white flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform duration-500">
        <img 
          src={`https://logo.clearbit.com/${employer.name.toLowerCase().split(' ')[0]}.com`} 
          onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${employer.name}`; }}
          alt={employer.name}
          className="w-10 h-10 object-contain"
        />
      </div>
      <div>
        <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1.5">{employer.name}</h4>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider line-clamp-1">{employer.about}</p>
      </div>
    </div>

    <div className="bg-gray-50/80 rounded-[1.5rem] p-5 mb-6 border border-gray-100/50">
      <div className="flex justify-between items-end mb-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Offering Tier</p>
        <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
           <Award size={10} /> ELITE
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 tracking-tighter">{employer.salary_range} <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-1">PA</span></p>
    </div>

    <div className="space-y-5">
      {/* Tech Stack */}
      {employer.tech_stack && (
        <div className="space-y-2">
           <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.15em]">Primarily Targeting</p>
           <div className="flex flex-wrap gap-1.5 font-bold text-[10px]">
              {employer.tech_stack.slice(0, 3).map((tech, i) => (
                <span key={i} className="px-2 py-1 bg-white border border-gray-100 text-gray-600 rounded-lg">{tech}</span>
              ))}
           </div>
        </div>
      )}

      {/* Benefits */}
      {employer.top_benefits && (
        <div className="space-y-2">
           <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.15em]">Key Incentives</p>
           <div className="grid grid-cols-1 gap-1.5">
              {employer.top_benefits.slice(0, 2).map((ben, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-gray-500 font-bold">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                   {ben}
                </div>
              ))}
           </div>
        </div>
      )}

      {/* AI Insight */}
      <div className="pt-4 border-t border-gray-50">
        <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-50">
          <Sparkles size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-[10.5px] text-blue-900/70 font-bold leading-relaxed italic">
            &quot;{employer.insight}&quot;
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function SalaryPage() {
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Fetch profile and dashboard summary to get elite_employers
    const loadData = async () => {
      try {
        const [profRes, dashRes] = await Promise.all([
          careerAPI.getProfile(),
          careerAPI.getDashboard()
        ]);
        setProfile(profRes.data?.data || null);
        setDashboardData(dashRes.data?.data || null);
      } catch (err) {
        console.error('Failed to load salary data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const eliteEmployers = dashboardData?.elite_employers || [];
  const filtered = search
    ? SALARY_DATA.filter(r => r.role.toLowerCase().includes(search.toLowerCase()))
    : SALARY_DATA;

  return (
    <div className="max-w-[1280px] mx-auto pb-20 space-y-8 sm:space-y-12 px-3 sm:px-4">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 md:p-16 text-white shadow-2xl shadow-blue-200">
        <div className="absolute top-0 right-0 w-48 sm:w-[500px] h-48 sm:h-[500px] bg-white opacity-5 blur-[100px] -mr-20 sm:-mr-40 -mt-20 sm:-mt-40 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-5 sm:mb-8">
             <Sparkles size={12} className="text-blue-200" />
             <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">AI Intelligence Active</span>
           </div>
           <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-4 sm:mb-6 leading-tight sm:leading-[0.9]">
             Salary <span className="text-blue-200">Intelligence</span> Lab
           </h1>
           <p className="text-sm md:text-lg text-blue-100/80 font-medium leading-relaxed max-w-lg">
             Global benchmarking, regional nuances, and AI-calibrated trajectories for the 2026 professional landscape.
           </p>
        </div>
      </section>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search roles, skills, or domains..."
              className="w-full sm:w-80 md:w-96 bg-white border border-gray-100 rounded-[24px] py-3 sm:py-4 pl-12 pr-6 text-sm font-bold shadow-xl shadow-gray-100/50 outline-none focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-gray-300"
            />
         </div>
         <div className="flex gap-2">
            <button className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 bg-white border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
               <Filter size={14} /> Filter
            </button>
            <button className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 bg-white border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
               <PieChart size={14} /> Export
            </button>
         </div>
      </div>

      {/* Salary Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
           <Briefcase size={20} className="text-blue-600" />
           <h2 className="text-2xl font-black text-gray-900 tracking-tight">Market Benchmarks</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((data, i) => (
            <SalaryCard key={i} data={data} />
          ))}
        </div>
      </section>

      {/* Elite Hiring Landscape */}
      <AnimatePresence>
        {eliteEmployers.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 mb-2">
                    <Award size={12} className="text-amber-600" />
                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Elite Tier Targets</span>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Elite Hiring Landscape</h2>
                  <p className="text-[13px] text-gray-400 font-bold uppercase tracking-widest mt-1">Calibrated for your professional trajectory</p>
               </div>
               <button className="px-6 py-3 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all flex items-center gap-2">
                  View Competition Analysis <ArrowUpRight size={14} />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {eliteEmployers.map((emp, i) => (
                 <EliteEmployerCard key={i} employer={emp} />
               ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Geographic Intelligence */}
      <section className="bg-white rounded-[32px] sm:rounded-[40px] border border-gray-100 p-5 sm:p-8 md:p-12 shadow-sm shadow-gray-100/50">
         <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">Geographic Nuances</h2>
               <p className="text-[13px] text-gray-400 font-bold uppercase tracking-widest mt-1">Multiplier Matrix — Q1 2026</p>
            </div>
            <div className="hidden md:flex gap-2">
               <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">Macro Data</span>
               <span className="px-4 py-1.5 bg-purple-50 text-purple-600 text-[10px] font-black rounded-full uppercase tracking-widest">Verified</span>
            </div>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
            {LOCATIONS.map((l, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-6 bg-gray-50 rounded-3xl border border-gray-100/50 flex flex-col items-center text-center group transition-all"
              >
                <span className="text-3xl mb-4 group-hover:scale-125 transition-transform duration-500">{l.icon}</span>
                <h5 className="text-[13px] font-black text-gray-900 mb-1">{l.city}</h5>
                <p className="text-lg font-black text-blue-600 tracking-tighter mb-1 mt-auto">{l.mult}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter px-2 leading-tight">{l.note}</p>
              </motion.div>
            ))}
         </div>
         
         <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3">
               <Info size={16} className="text-blue-400" />
               <p className="text-[11px] text-gray-400 font-medium">Data sourced from Real-time Transactional Data & External Benchmarks.</p>
            </div>
            <div className="flex gap-8">
               <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-900 pb-1 cursor-pointer">AmbitionBox</span>
               <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-900 pb-1 cursor-pointer">Levels.fyi</span>
               <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-900 pb-1 cursor-pointer">Glassdoor</span>
            </div>
         </div>
      </section>

      {/* Specialized AI Insight Footer Card */}
      <section className="bg-blue-600 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white/10 rounded-full blur-[100px] -mr-20 sm:-mr-40 -mt-20 sm:-mt-40 transition-transform duration-1000 group-hover:scale-125" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full animate-pulse">
                  <Zap size={14} className="text-blue-200" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Next Career Jump</span>
               </div>
               <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">Increase your Market Fit to 95%</h3>
               <p className="text-blue-100/70 text-sm font-medium max-w-md">
                 Based on your current trajectory, adding <span className="text-white font-black underline underline-offset-4">Cloud Governance</span> could unlock a 35% premium in North American markets.
               </p>
            </div>
            <button className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-white text-blue-700 text-[13px] sm:text-[14px] font-black rounded-[24px] shadow-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-3 active:scale-95">
               Get Personalized Report <ArrowUpRight size={18} />
            </button>
         </div>
      </section>
    </div>
  );
}
