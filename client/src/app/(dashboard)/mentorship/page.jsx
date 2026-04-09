'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mentorshipAPI } from '@/lib/api/mentorship.api';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  UserCheck, Star, MessageCircle, Calendar, Target, TrendingUp,
  Loader2, Sparkles, ChevronRight, Award, Users, Clock, Heart,
  BookOpen, Video, Search, Filter, Zap, Layout, Shield, ArrowUpRight,
  Briefcase, Globe, Crown, Info, Lightbulb, Map
} from 'lucide-react';
import toast from 'react-hot-toast';

// Professional design ModuleCard
function ModuleCard({ title, icon: Icon, children, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-900 text-slate-100 border-slate-800'
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-gray-200/30 transition-all flex flex-col h-full group">
       <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform`}>
             <Icon size={20} strokeWidth={2.5} />
          </div>
          <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">{title}</h4>
       </div>
       <div className="flex-1">
          {children}
       </div>
    </div>
  );
}

const STAGES = [
  { name: 'Ph 01: Explorer', emoji: '🔍', icon: Search, desc: 'Analyze domains and strategic alignment', color: 'from-blue-500 to-indigo-600' },
  { name: 'Ph 02: Candidate', emoji: '⭐', icon: Target, desc: 'Secure mentorship and calibrate roadmap', color: 'from-purple-500 to-violet-600' },
  { name: 'Ph 03: Specialist', emoji: '🔥', icon: Shield, desc: 'Execution-focused sessions and validation', color: 'from-slate-700 to-slate-900' },
  { name: 'Ph 04: Mentee', emoji: '🎯', icon: Award, desc: 'Deep vertical expertise and network access', color: 'from-emerald-500 to-teal-600' },
  { name: 'Ph 05: Champion', emoji: '🏆', icon: Crown, desc: 'Elite mastery — Mentor the next generation', color: 'from-amber-400 to-orange-500' },
];

const WORKSHOPS = [
  { title: 'Executive Strategy & Governance', mentor: 'Sh. Aditya Verma, IAS', date: 'Sat 10:00 AM', attendees: 234, category: 'STRATEGY', icon: Shield },
  { title: 'Cloud Architecture at Scale', mentor: 'Sneha Rao, Senior Architect', date: 'Wed 07:00 PM', attendees: 156, category: 'ENGINEERING', icon: Globe },
  { title: 'Advanced Diagnostic Protocols', mentor: 'Dr. Priya, AIIMS Faculty', date: 'Sun 09:00 AM', attendees: 312, category: 'MEDICAL', icon: Heart },
  { title: 'Venture Capital & Deal Flow', mentor: 'Rajesh Kumar, GP Portfolio', date: 'Thu 08:00 PM', attendees: 67, category: 'BUSINESS', icon: Briefcase },
];

const FEATURED_MENTORS = [
  { name: 'Aditya Verma', role: 'Strategic Advisor', expertise: 'Public Policy, Governance', rating: 4.9, mentees: 42, color: 'blue' },
  { name: 'Sneha Rao', role: 'Senior Software Architect', expertise: 'Distributed Systems, DSA', rating: 4.8, mentees: 31, color: 'purple' },
  { name: 'Dr. Priya Sharma', role: 'Chief of Cardiology', expertise: 'Clinical Residency, NEET', rating: 5.0, mentees: 58, color: 'emerald' },
  { name: 'Vikram Singh', role: 'Principal Space Scientist', expertise: 'Aerospace Engineering, Research', rating: 4.7, mentees: 24, color: 'slate' },
  { name: 'Meera Joshi', role: 'Senior Finance Partner', expertise: 'Auditing, Corporate Law', rating: 4.9, mentees: 36, color: 'amber' },
  { name: 'Arjun Nair', role: 'Executive Creative Director', expertise: 'Brand Identity, UI/UX', rating: 4.6, mentees: 18, color: 'blue' },
];

export default function MentorshipPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('workshops'); 
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    mentorshipAPI.getMentors({ limit: 20 }).then(r => setMentors(r.data?.data || [])).catch(() => {});
  }, []);

  const filteredMentors = searchQuery
    ? FEATURED_MENTORS.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.expertise.toLowerCase().includes(searchQuery.toLowerCase()))
    : FEATURED_MENTORS;

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 px-4 md:px-0">
      {/* Professional Institute Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-100">
                 <UserCheck size={16} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Mentorship Institute</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
             Strategic Mentorship
           </h1>
           <p className="text-sm md:text-lg text-gray-400 font-medium max-w-2xl leading-relaxed">
             Access elite career intelligence. Guidance from senior specialists across Engineering, Public Policy, Medicine, and Finance.
           </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden xl:flex flex-col items-end">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Mentees Enrolled</p>
              <div className="flex -space-x-2">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <div className={`w-full h-full bg-gradient-to-br ${STAGES[i-1]?.color}`} />
                   </div>
                 ))}
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center">
                    <span className="text-[8px] font-black text-white">+2k</span>
                 </div>
              </div>
           </div>
           <Link href="/mentor-apply" className="px-8 py-4 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-xl shadow-gray-200">
             Apply as Mentor
           </Link>
        </div>
      </div>

      {/* 5-Phase Pipeline: Professional Standard */}
      <div className="bg-white rounded-[48px] border border-gray-100 p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
           <Map size={120} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-2">
           <Zap size={14} className="text-amber-500" /> Career Advancement Pipeline — Phase Analysis
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative z-10">
          {STAGES.map((s, i) => (
            <div key={i} className="group cursor-default">
              <div className={`p-6 rounded-[32px] border transition-all h-full ${i === 0 ? 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-gray-300' : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-2 rounded-xl ${i === 0 ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-400 group-hover:text-purple-600 group-hover:bg-purple-50'} transition-colors`}>
                      <s.icon size={16} strokeWidth={3} />
                   </div>
                   {i === 0 && <Sparkles size={14} className="text-amber-400 animate-pulse" />}
                </div>
                <h4 className={`text-[11px] font-black uppercase tracking-widest mb-1 ${i === 0 ? 'text-white' : 'text-gray-900'}`}>{s.name}</h4>
                <p className={`text-[9px] font-semibold leading-relaxed ${i === 0 ? 'text-slate-400' : 'text-gray-400'}`}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Tabs Switching */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="flex gap-1.5 p-1.5 bg-gray-50 rounded-[28px] border border-gray-100 italic w-full md:w-auto">
          {[
            { k: 'workshops', l: 'Strategic Workshops', icon: Video },
            { k: 'mentors', l: 'Master Network', icon: Users },
            { k: 'my-journey', l: 'My Advancement', icon: TrendingUp },
          ].map(t => (
            <button 
              key={t.k} 
              onClick={() => setTab(t.k)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${
                tab === t.k 
                ? 'bg-white text-purple-600 shadow-xl shadow-purple-100/30' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <t.icon size={14} strokeWidth={3} /> {t.l}
            </button>
          ))}
        </div>

        {tab === 'mentors' && (
          <div className="relative w-full md:w-[400px]">
             <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" strokeWidth={2.5} />
             <input 
               value={searchQuery} 
               onChange={e => setSearchQuery(e.target.value)} 
               placeholder="IDENTIFY EXPERTISE OR NAME..."
               className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[24px] text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-purple-500/5 focus:border-purple-200 transition-all placeholder:text-gray-200" 
             />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ STRATEGIC WORKSHOPS ═══ */}
        {tab === 'workshops' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
              {WORKSHOPS.map((w, i) => (
                <ModuleCard key={i} title={w.category} icon={w.icon} color={i % 2 === 0 ? 'purple' : 'blue'}>
                  <div className="space-y-6">
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-[0.9] mb-3 group-hover:text-purple-600 transition-colors">{w.title}</h3>
                       <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{w.mentor}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Strategic Timing</p>
                          <p className="text-[11px] font-black text-gray-700">{w.date}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Enrolled</p>
                          <p className="text-[11px] font-black text-gray-700">{w.attendees} Professionals</p>
                       </div>
                    </div>

                    <button className="w-full py-4 bg-gray-50 text-gray-900 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all shadow-sm flex items-center justify-center gap-2">
                      <Zap size={14} /> Join Strategic Live
                    </button>
                  </div>
                </ModuleCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ MASTER NETWORK (FIND MENTORS) ═══ */}
        {tab === 'mentors' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
              {filteredMentors.map((m, i) => (
                <ModuleCard key={i} title="Premium Specialist" icon={Shield} color={m.color}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                       <div className={`w-16 h-16 rounded-[24px] bg-gradient-to-br transition-all group-hover:scale-110 flex items-center justify-center shadow-xl shadow-gray-200 ${STAGES[i % 5].color}`}>
                          <span className="text-white font-black text-xl italic">{m.name.charAt(0)}</span>
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-1.5">{m.name}</h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.role}</p>
                       </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1.5">Domain Expertise</p>
                       <p className="text-xs font-bold text-gray-700 leading-relaxed">{m.expertise}</p>
                    </div>

                    <div className="flex items-center justify-between px-2">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Rating</span>
                          <span className="text-sm font-black text-gray-900 flex items-center gap-1">
                             <Star size={12} className="text-amber-400 fill-amber-400" /> {m.rating}
                          </span>
                       </div>
                       <div className="flex flex-col text-right">
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Strategic Capacity</span>
                          <span className="text-sm font-black text-gray-900">{m.mentees} Mentees</span>
                       </div>
                    </div>

                    <button className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-purple-600 active:scale-95 transition-all flex items-center justify-center gap-3">
                      <Briefcase size={16} /> Request Mentorship
                    </button>
                  </div>
                </ModuleCard>
              ))}
            </div>
            
            {/* Backend-synced Mentors Section */}
            {mentors.length > 0 && (
              <div className="mt-16 space-y-6">
                 <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                   <div className="h-px bg-gray-100 flex-1" /> Verified Platform Mentors <div className="h-px bg-gray-100 flex-1" />
                 </h4>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {mentors.slice(0, 10).map((m, i) => (
                     <div key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-3xl hover:shadow-lg transition-all group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black italic shadow-lg shadow-purple-100 group-hover:scale-110">
                          {(m.username || m.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                           <p className="text-[10px] font-black text-gray-900 uppercase truncate leading-none mb-1">{m.full_name || m.username}</p>
                           <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest italic">VERIFIED</p>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ MY ADVANCEMENT (JOURNEY) ═══ */}
        {tab === 'my-journey' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               {/* Phase Card */}
               <div className="lg:col-span-2">
                  <div className="relative overflow-hidden bg-slate-900 rounded-[64px] p-12 text-white border border-white/5 shadow-2xl">
                     <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] -mr-64 -mt-64" />
                     
                     <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 rounded-[28px] bg-white flex items-center justify-center text-slate-900 shadow-2xl">
                              <Search size={32} strokeWidth={3} />
                           </div>
                           <div>
                              <h2 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">Phase 01: Exploration</h2>
                              <p className="text-[11px] font-black text-purple-400 uppercase tracking-[0.3em]">Current Advancement Status</p>
                           </div>
                        </div>

                        <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
                           Strategic Goal: Analyze domain landscapes, identify career-aligned experts, and calibrate your mentorship roadmap for Q2/Q3.
                        </p>

                        <div className="space-y-4 max-w-lg">
                           <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                              <span className="text-slate-500">Milestone Progress</span>
                              <span className="text-purple-400 italic">20% Mastered</span>
                           </div>
                           <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                              <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {[
                             { task: 'Attend 1 Executive Workshop', done: false, icon: Video },
                             { task: 'Analyze 5 Specialist Profiles', done: true, icon: Users },
                             { task: 'Deploy Mentorship Request', done: false, icon: Zap },
                             { task: 'Calibrate Industry Interests', done: true, icon: Target },
                           ].map((t, i) => (
                             <div key={i} className={`flex items-center gap-4 p-5 rounded-[28px] border transition-all ${t.done ? 'bg-white/5 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-900/10' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.done ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-300'}`}>
                                   <t.icon size={16} strokeWidth={3} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest leading-tight">{t.task}</span>
                                {t.done && <ArrowUpRight size={14} className="ml-auto opacity-40" />}
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Strategic Summary Sidecard */}
               <div className="space-y-8">
                  <ModuleCard title="Active Guidance" icon={Bot} color="purple">
                     <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group border border-slate-800">
                           <p className="text-[13px] font-bold leading-relaxed text-blue-100 italic relative z-10">
                              &quot;The exploration phase is foundational. Focus on identifying mentors who have bridged the specific gap between architecture and executive governance.&quot;
                           </p>
                        </div>
                        <div className="space-y-3">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Strategic Agent</p>
                           <p className="text-[12px] font-black text-gray-900 uppercase">Syllabrix AI Calibration Node</p>
                        </div>
                     </div>
                  </ModuleCard>

                  <ModuleCard title="Final Milestone" icon={Target} color="slate">
                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Phase 05: Champion</p>
                        <p className="text-[11px] font-medium text-gray-500 leading-relaxed italic">
                           Transition from Mentee to Architect of Knowledge. Calibrate your domain authority to guide the next wave of strategic professionals.
                        </p>
                     </div>
                  </ModuleCard>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Institute Footer Banner */}
      <div className="p-16 bg-slate-900 rounded-[64px] text-white relative overflow-hidden border border-white/5 mt-12">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600 opacity-20 blur-[150px] -mr-64 -mt-64" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                  <Award size={24} className="text-purple-400" />
                  <span className="text-[11px] font-black text-purple-400 uppercase tracking-[0.3em]">The Mentorship Excellence Standard</span>
               </div>
               <h2 className="text-4xl font-black tracking-tight uppercase mb-6 leading-tight">Mastery is a Shared Journey.<br />Elite Guidance is Strategic.</h2>
               <p className="text-slate-400 font-medium max-w-xl leading-relaxed text-lg">
                  Every specialist in our institute is verified for both technical mastery and strategic vision. Bridging the gap between knowledge and execution.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
               <div className="w-40 h-40 bg-white/5 rounded-[40px] border border-white/10 flex flex-col items-center justify-center gap-2 backdrop-blur-md">
                  <Lightbulb size={32} className="text-amber-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center">Domain<br />Intelligence</p>
               </div>
               <div className="w-40 h-40 bg-white/5 rounded-[40px] border border-white/10 flex flex-col items-center justify-center gap-2 backdrop-blur-md">
                  <Target size={32} className="text-blue-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center">Elite<br />Validation</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
