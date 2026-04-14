import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { careerAPI } from '@/lib/api/career.api';
import {
  Briefcase, ScanSearch, Bot, FileText,
  TrendingUp, Target, Sparkles, RefreshCw,
  CheckCircle2, AlertCircle, ChevronRight,
  Users, Loader2, Award, Zap, Globe, 
  MapPin, Share2, Crown, ZapIcon, Download,
  PlayCircle, MoreHorizontal, X, ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { postsAPI } from '@/lib/api/posts.api';
import CreatePostBox from '@/components/feed/CreatePostBox';
import PostCard from '@/components/feed/PostCard';
import ProfileHeaderWidget from '@/components/widgets/ProfileHeaderWidget';

// ── UI Primitives ────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 ${className}`} />
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-100 ${className}`}>
    {children}
  </div>
);

// ── Intelligence Components ──────────────────────────────────────────────────

function IntelligenceHeader({ user, data, onStrategyOpen, onDownloadReport }) {
  const name = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Learner';
  const industry = data?.profile?.industry || 'General Tech';
  const isOrg = user?.user_type === 'organization';

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 print:hidden">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{industry} Intelligence Overview</p>
          {isOrg && (
            <Link href="/corporate/dashboard" className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-orange-500/20 flex items-center gap-1.5 hover:from-amber-400 hover:to-orange-500 transition-all">
              <Briefcase size={12} /> Org Command Center <ChevronRight size={12} />
            </Link>
          )}
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          Welcome back, <span className="text-blue-600">{name}</span>
        </h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">
          Your professional trajectory is currently performing <span className="text-blue-600 font-bold">{data?.marketPercentile || '12%'} above</span> your peer benchmark. Here&apos;s your shift analysis for today.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onDownloadReport}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2" id="download-report-btn">
          <Download size={14} /> Download Report
        </button>
        <button 
          onClick={onStrategyOpen}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2" id="strategy-mode-btn">
          <Zap size={14} className="animate-pulse" /> Strategy Mode
        </button>
      </div>
    </div>
  );
}

function PlaybookView({ task, data, onBack }) {
  const [loading, setLoading] = useState(true);
  const [playbook, setPlaybook] = useState(null);

  useEffect(() => {
    async function fetchPlaybook() {
      try {
        const skillName = task.label.replace('Bridge ', '').replace(' Gap', '');
        const res = await careerAPI.generateLearningPath({ 
          skill_name: skillName,
          total_days: 7,
          difficulty: 'intermediate'
        });
        setPlaybook(res.data?.data || res.data);
      } catch { /* fallback to static */ }
      finally { setLoading(false); }
    }
    fetchPlaybook();
  }, [task]);

  const curriculum = playbook?.daily_plan || [
    { day: 1, title: 'Foundational Theory', desc: 'Understanding the core architecture and first principles.', resources: ['Official Docs', 'Intro Video'] },
    { day: 2, title: 'Practical Implementation', desc: 'Setting up the environment and local testing.', resources: ['Setup Guide', 'GitHub Repo'] },
    { day: 3, title: 'Advanced Optimization', desc: 'Performance tuning and industry best practices.', resources: ['Deep Dive YT', 'Medium Blog'] }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100">
            <ArrowUpRight size={18} className="rotate-[225deg]" />
          </button>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{task.label}</h3>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mastery Progression</p>
               <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />)}
               </div>
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Intermediate Path</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <Loader2 size={32} className="text-blue-600 animate-spin" />
             <p className="text-sm font-bold text-gray-400 animate-pulse">AI is mapping your path to expertize...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Study Approach & Notes */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                <h4 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" /> Strategic Study Notes
                </h4>
                <div className="space-y-6">
                  <div>
                    <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3">Goal-Based Approach</h5>
                    <ul className="space-y-3">
                      <li className="flex gap-2 text-[12px] font-medium text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                        <b>Note Strategy</b>: Use Cornell Method to separate cues from summaries for {task.label}.
                      </li>
                      <li className="flex gap-2 text-[12px] font-medium text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                        <b>Practical Knowledge</b>: Focus on Day 4 & 5 project milestones to build your portfolio.
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Target Proficiency</p>
                    <p className="text-xs font-black text-gray-900">Expert-Level Calibration</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed italic">Achieving this level yields an estimated 25% salary bump in {data?.profile?.industry}.</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[40px] text-white shadow-xl shadow-indigo-100">
                <h4 className="text-sm font-black mb-6 flex items-center gap-2">
                  <PlayCircle size={16} /> Reference Vault
                </h4>
                <div className="space-y-4">
                  <a href={`https://www.youtube.com/results?search_query=${task.label}+expert+tutorial+2026`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[11px] font-bold transition-all border border-white/10 backdrop-blur-sm">
                    Mastery Playlist <ArrowUpRight size={14} />
                  </a>
                  <a href={`https://www.google.com/search?q=${task.label}+documentation+best+practices+2026`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[11px] font-bold transition-all border border-white/10 backdrop-blur-sm">
                    Official Playbook <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Curriculum Stepper */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Target size={16} className="text-blue-600" /> Improvement Roadmap
                </h4>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">
                  Skill Gain Optimization: High
                </div>
              </div>
              <div className="space-y-4">
                {curriculum.map((day, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">{day.day}</div>
                      {idx !== curriculum.length - 1 && <div className="w-0.5 h-full bg-gray-100 my-1" />}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="p-6 bg-white border border-gray-100 rounded-[32px] group-hover:border-blue-100 group-hover:shadow-2xl group-hover:shadow-gray-200/50 transition-all">
                        <div className="flex justify-between items-start mb-2">
                           <h5 className="text-[15px] font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{day.title}</h5>
                           <span className="text-[9px] font-bold text-gray-400">{day.estimated_minutes || 60} min</span>
                        </div>
                        <p className="text-[12px] text-gray-500 font-medium leading-relaxed mb-4">{day.description || day.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {(day.topics || []).map((topic, ti) => (
                            <span key={ti} className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-xl border border-gray-100 uppercase tracking-tight">{topic}</span>
                          ))}
                        </div>
                        {day.exercise && (
                          <div className="mt-5 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 border-dashed">
                             <div className="flex items-center gap-2 mb-1">
                                <Zap size={12} className="text-emerald-600" />
                                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Achieving Practical Mastery</p>
                             </div>
                             <p className="text-[11px] text-emerald-600 leading-relaxed font-medium italic">{day.exercise}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StrategyOverlay({ isOpen, onClose, data, onRecalibrate, isRecalibrating }) {
  if (!isOpen) return null;
  const [view, setView] = useState('roadmap');
  const [selectedTask, setSelectedTask] = useState(null);
  
  const skillGap = data?.skillGaps?.[0]?.skill_name || 'Market Governance';
  const target = data?.profile?.target_role || 'Senior Lead Roles';

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setView('playbook');
  };

  const phases = [
    {
      label: 'Phase 1: Foundation (Day 1-30)',
      title: 'Alignment & Validation',
      tasks: [
        { label: 'Market Calibration', desc: 'Sync your professional identity with current 2026 market benchmarks.' },
        { label: 'Core Skill Audit', desc: 'Verify top 5 core skills against elite-tier product startup requirements.' },
        { label: 'Resume Hardening', desc: 'Optimize your primary narrative for high-trust ATS filters.' }
      ],
      icon: <CheckCircle2 size={18} />,
      color: 'blue'
    },
    {
      label: 'Phase 2: Growth (Day 31-60)',
      title: 'Gap Bridging & Yield',
      tasks: [
        { label: `Bridge ${skillGap} Gap`, desc: 'Complete specialized training to unlock a potential 25% salary premium.' },
        { label: 'Strategic Networking', desc: 'Connect with 2 mentors in your target sector (Elite Tier).' },
        { label: 'Cross-Domain Leverage', desc: 'Apply your current field expertise to 3 emerging tech segments.' }
      ],
      icon: <Zap size={18} />,
      color: 'purple'
    },
    {
      label: 'Phase 3: Elite (Day 61-90)',
      title: 'Market Penetration',
      tasks: [
        { label: 'Stretch Role Outreach', desc: `Initiate applications for 5 high-yield ${target}.` },
        { label: 'Competitive Analysis', desc: 'Benchmark your interview performance against the top 2% of candidates.' },
        { label: 'Identity Finalization', desc: 'Lock in your 2026 trajectory as a domain authority.' }
      ],
      icon: <Crown size={18} />,
      color: 'amber'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[48px] max-w-5xl w-full h-[85vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-10 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-3">
               <div className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-2">
                 <Bot size={12} /> AI Strategy Engine Active
               </div>
               <Sparkles size={16} className="text-blue-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">30-60-90 Day <span className="text-blue-600">Execution Roadmap</span></h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">A realistic, task-driven approach to achieving your professional ceiling.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100/50"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {view === 'roadmap' ? (
              <motion.div 
                key="roadmap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Phase Columns (3/4 width) */}
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {phases.map((phase, i) => (
                      <div key={i} className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100`}>
                            {phase.icon}
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{phase.label}</h4>
                            <p className="text-base font-black text-gray-900 tracking-tight">{phase.title}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {phase.tasks.map((task, ti) => (
                            <div 
                              key={ti} 
                              onClick={() => handleTaskClick(task)}
                              className="group p-5 bg-gray-50/50 rounded-3xl border border-gray-100/50 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                  <h5 className="text-[12px] font-black text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{task.label}</h5>
                                </div>
                                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                              </div>
                              <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic line-clamp-2">{task.desc}</p>
                              <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                 <div className="flex items-center gap-1">
                                    <Sparkles size={10} className="text-blue-600" />
                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Mastery Plan</span>
                                 </div>
                                 <span className="text-[8px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-lg">+₹2 LPA Yield</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Real-time Pulse (1/4 width) */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-8 bg-blue-600 rounded-[40px] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                       <h4 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-80">Market Benchmarking</h4>
                       <div className="space-y-8">
                          <div>
                             <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Live Fitness Score</p>
                             <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black">{data?.marketFitScore || 0}</span>
                                <span className="text-xs font-bold opacity-70">/ 100</span>
                             </div>
                             <div className="w-full h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${data?.marketFitScore || 0}%` }} className="h-full bg-white rounded-full" />
                             </div>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Global Percentile</p>
                             <p className="text-2xl font-black">Top {data?.marketPercentile || '15'}%</p>
                             <p className="text-[10px] opacity-60 mt-1 font-medium leading-none">Calibrated against 2026 Peer Group</p>
                          </div>
                          <button 
                            disabled={isRecalibrating}
                            onClick={onRecalibrate}
                            className="w-full py-4 bg-white text-blue-600 text-xs font-black rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-700/20"
                          >
                             {isRecalibrating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />}
                             Recalibrate Strategy
                          </button>
                       </div>
                    </div>

                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] space-y-4">
                       <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Growth Velocity</h4>
                       {(data?.skillsInDemand || []).slice(0, 2).map((s, idx) => (
                         <div key={idx} className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm shadow-gray-100/50">
                            <p className="text-[12px] font-black text-gray-900 mb-1">{s.name}</p>
                            <div className="flex items-center justify-between">
                               <span className="text-[9px] font-bold text-blue-600 uppercase">{s.demand_growth || '+120% Demand'}</span>
                               <span className="text-[10px] font-black text-emerald-600">{s.avg_salary_impact || '+₹3 LPA'}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                {/* Achieving Summary */}
                <div className="mt-12 p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-200 relative overflow-hidden group mb-10">
                   <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -ml-40 -mt-40 pointer-events-none" />
                   <div className="relative z-10 max-w-xl">
                      <h3 className="text-2xl font-black tracking-tight mb-2">Calculated Outcome</h3>
                      <p className="text-blue-100 text-sm font-medium leading-relaxed">
                         Completing this execution plan will transition your profile from &quot;Aligned&quot; to &quot;Elite&quot;, unlocking access to the top 2% of global tech opportunities with an estimated <span className="text-white font-black underline underline-offset-4 decoration-blue-300">₹15-25 LPA growth delta.</span>
                      </p>
                   </div>
                   <button className="relative z-10 px-10 py-4 bg-white text-blue-700 font-black rounded-2xl shadow-xl hover:bg-blue-50 transition-all active:scale-95">
                      Commit to Strategy
                   </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="playbook"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <PlaybookView 
                  task={selectedTask} 
                  data={data} 
                  onBack={() => setView('roadmap')} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TrajectoryCard({ data, loading }) {
  const score = data?.marketFitScore || 0;
  const careerGoalMap = {
    find_job: 'Job Optimization',
    upskill: 'Skill Mastery',
    switch_career: 'Career Transition',
    freelance: 'Venture Launch',
    promotion: 'Leadership Track'
  };
  const goalLabel = careerGoalMap[data?.profile?.career_goal] || 'Professional Growth';

  return (
    <Card className="rounded-[32px] p-8 border-gray-50 shadow-sm relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 opacity-20 blur-3xl -mr-20 -mt-20" />
      
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
          <TrendingUp size={16} />
        </div>
        <h3 className="text-sm font-bold text-gray-800">Trajectory Progress</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Left Stats */}
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Phase</p>
            <p className="text-lg font-black text-gray-900 leading-tight">{goalLabel}</p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                className="h-full bg-blue-600 rounded-full" 
              />
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Strength</p>
              <p className="text-sm font-black text-blue-600">+{data?.profileStrength || 0}%</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Visibility</p>
              <p className="text-sm font-black text-blue-600">{data?.profileStrength > 70 ? 'High' : 'Medium'}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Risk</p>
              <p className="text-sm font-black text-emerald-500">Minimal</p>
            </div>
          </div>
        </div>

        {/* Center Gauge */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray={440} strokeDashoffset={440 - (440 * score) / 100}
                strokeLinecap="round" className="text-blue-600 transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-gray-900 leading-none">{score}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Market Fit</span>
            </div>
          </div>
          <p className="text-[11px] font-bold text-purple-600 mt-4 flex items-center gap-1.5">
             <Bot size={12} /> AI Optimization Active
          </p>
          <p className="text-[9px] text-gray-400">Path: {data?.profile?.industry || 'Global Careers'}</p>
        </div>

        {/* Right Pivot */}
        <div className="text-center lg:text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Next Pivot</p>
          <p className="text-xl font-black text-purple-600 leading-tight">{data?.profile?.target_role || 'Target Achievement'}</p>
          <p className="text-[10px] text-gray-400 mt-4 leading-relaxed italic">
            Trajectory calibrated based on your {data?.profile?.experience_years || 5} years of expertise.
          </p>
        </div>
      </div>
    </Card>
  );
}

function SkillMatchCard({ data, loading }) {
  const inDemand = data?.skillsInDemand || [];
  const displaySkills = inDemand.length > 0 ? inDemand : [
    { name: 'Leadership', match: 94 },
    { name: 'AI Integration', match: 81 },
    { name: 'Strategic Planning', match: 76 }
  ];

  return (
    <Card className="rounded-[32px] p-6 border-gray-50 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-gray-800">Skill Match</h3>
        <Award size={18} className="text-purple-600" />
      </div>

      <div className="space-y-5 flex-1">
        {displaySkills.slice(0, 3).map(s => (
          <div key={s.name || s.skill_name}>
            <div className="flex justify-between text-[11px] font-bold mb-1.5">
              <span className="text-gray-600 uppercase tracking-wider">{s.name || s.skill_name}</span>
              <span className="text-blue-600">{s.match || 85}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${s.match || 85}%` }}
                className="h-full bg-blue-600 rounded-full" 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-3 bg-purple-50 border border-purple-100 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
          <Zap size={14} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-purple-900">Gap Detected</p>
          <p className="text-[10px] text-purple-600 leading-relaxed mt-0.5">
            {data?.skillGaps?.[0]?.skill_name ? `Consider bridging the ${data.skillGaps[0].skill_name} gap to accelerate growth.` : 'Your skills are highly aligned with market demand.'}
          </p>
        </div>
      </div>
    </Card>
  );
}

function MarketPulseGrid({ data, loading }) {
  const pulse = data?.market_pulse || [];
  const iconMap = {
    trends: Globe,
    salary: ZapIcon,
    network: Share2,
    default: Globe
  };

  const cards = pulse.length > 0 ? pulse.map(p => ({
    title: p.title,
    desc: p.desc,
    stat: p.stat,
    icon: iconMap[p.icon] || iconMap.default,
    color: p.icon === 'salary' ? 'text-purple-600' : p.icon === 'network' ? 'text-pink-600' : 'text-blue-600',
    bg: p.icon === 'salary' ? 'bg-purple-50' : p.icon === 'network' ? 'bg-pink-50' : 'bg-blue-50'
  })) : [
    { title: `${data?.profile?.industry || 'Industry'} Trends`, desc: 'Significant surge in specific roles. Strategic hires focused on technical implementation.', stat: '+15% YoY', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Salary Benchmark', desc: `Median total rewards for ${data?.profile?.target_role || 'Senior'} roles increased this quarter.`, stat: 'Apex Salary', icon: ZapIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Network Liquidity', desc: 'Recent connections in your primary domain are moving to Tier-1 firms.', stat: 'Networking', icon: Share2, color: 'text-pink-600', bg: 'bg-pink-50' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Market Pulse</h2>
          <p className="text-[11px] text-gray-500 font-medium">Real-time shifts in your professional ecosystem.</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-gray-100 text-[9px] font-black text-gray-500 rounded-full uppercase tracking-widest">High Demand</span>
          <span className="px-3 py-1 bg-gray-100 text-[9px] font-black text-gray-500 rounded-full uppercase tracking-widest">Global Tech</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <Card key={c.title} className="rounded-3xl p-5 border-gray-50 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-2xl ${c.bg} flex items-center justify-center ${c.color} group-hover:scale-110 transition-transform`}>
                <c.icon size={20} />
              </div>
              <span className={`text-[9px] font-bold px-2 py-1 ${c.bg} ${c.color} rounded-lg uppercase tracking-wider`}>
                {c.stat}
              </span>
            </div>
            <h4 className="text-[13px] font-black text-gray-900 mb-2">{c.title}</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">{c.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StrategicSuite({ data, loading }) {
  const currentPath = data?.learningPaths?.[0];
  const progress = currentPath ? Math.round((currentPath.daily_plan?.length > 0 ? (currentPath.completed_days?.length / currentPath.daily_plan.length) : (currentPath.current_day / currentPath.duration_days)) * 100) : 0;
  
  // Certification Suggestion Logic
  const industry = (data?.profile?.industry || 'General Tech').toLowerCase();
  let suggestedCerts = [
    { name: 'AWS Solutions Architect', provider: 'Amazon', impact: '+₹6 LPA' },
    { name: 'PMP Certification', provider: 'PMI', impact: '+₹4 LPA' }
  ];

  if (industry.includes('sap') || industry.includes('erp')) {
    suggestedCerts = [
      { name: 'SAP BTP Associate', provider: 'SAP', impact: '+₹5 LPA' },
      { name: 'Integration Suite', provider: 'SAP', impact: '+₹4 LPA' }
    ];
  } else if (industry.includes('ai') || industry.includes('data')) {
    suggestedCerts = [
      { name: 'Professional ML Engineer', provider: 'Google', impact: '+₹8 LPA' },
      { name: 'Databricks Developer', provider: 'Databricks', impact: '+₹5 LPA' }
    ];
  } else if (industry.includes('management') || industry.includes('product')) {
    suggestedCerts = [
      { name: 'Certified ScrumMaster', provider: 'Scrum Alliance', impact: '+₹3 LPA' },
      { name: 'SAFe Agilist', provider: 'Scaled Agile', impact: '+₹3 LPA' }
    ];
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Skill Scanner (ATS Core) */}
      <Card className="rounded-[40px] p-8 border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full bg-white">
        <div className="flex items-center justify-between mb-8">
           <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ScanSearch size={22} strokeWidth={2.5} />
           </div>
           <div className="text-right">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">Live Scan</span>
           </div>
        </div>
        <h3 className="text-lg font-black text-gray-900 leading-tight mb-2">Skill Scanner</h3>
        <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-6">ATS Alignment and semantic integrity analysis.</p>
        
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-4">
             <span className="text-3xl font-black text-gray-900">{data?.profileStrength || 72}</span>
             <span className="text-xs font-bold text-gray-400">ATS Score</span>
          </div>
          <Link href="/professional/calibration" className="w-full py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-colors">
             Recalibrate Scan <ChevronRight size={14} />
          </Link>
        </div>
      </Card>

      {/* 2. AI Mentor (Trajectory) */}
      <Card className="rounded-[40px] p-8 border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full bg-slate-900 text-white">
        <div className="flex items-center justify-between mb-8">
           <div className="w-12 h-12 rounded-2xl bg-white/10 text-blue-400 flex items-center justify-center">
              <Bot size={22} strokeWidth={2.5} />
           </div>
           <Sparkles size={16} className="text-blue-400 animate-pulse" />
        </div>
        <h3 className="text-lg font-black leading-tight mb-2">AI Mentor</h3>
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6">Proprietary trajectory and market fit intelligence.</p>
        
        <div className="mt-auto space-y-4">
           <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-xs font-black">{data?.marketPercentile > 80 ? 'Elite Performance' : 'Growth Potential'}</p>
           </div>
           <Link href="/ai-buddy" className="w-full py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              Chat with Mentor <ArrowUpRight size={14} />
           </Link>
        </div>
      </Card>

      {/* 3. Learning Path (Momentum) */}
      <Card className="rounded-[40px] p-8 border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full bg-white">
        <div className="flex items-center justify-between mb-8">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target size={22} strokeWidth={2.5} />
           </div>
           <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
           </div>
        </div>
        <h3 className="text-lg font-black text-gray-900 leading-tight mb-2">Learning Path</h3>
        <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-6">Executing your AI-calibrated skill sprint.</p>
        
        <div className="mt-auto">
          <div className="flex items-end justify-between mb-2">
             <span className="text-xl font-black text-gray-900">{progress}%</span>
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{currentPath ? `Day ${currentPath.current_day}` : 'Set Plan'}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-50 rounded-full mb-6 overflow-hidden">
             <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-indigo-600" />
          </div>
          <Link href="/career/learning" className="w-full py-3 border border-gray-100 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
             Resume Sprint <PlayCircle size={14} />
          </Link>
        </div>
      </Card>

      {/* 4. Certification (Yield) */}
      <Card className="rounded-[40px] p-8 border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full bg-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
        <div className="flex items-center justify-between mb-8 relative z-10">
           <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={22} strokeWidth={2.5} />
           </div>
        </div>
        <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 relative z-10">Certification</h3>
        <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-6 relative z-10">High-yield professional validation suggestions.</p>
        
        <div className="mt-auto space-y-3 relative z-10">
           {suggestedCerts.map((cert, idx) => (
             <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                <span className="text-[10px] font-black text-gray-800 truncate pr-2">{cert.name}</span>
                <span className="text-[8px] font-black text-emerald-600 uppercase whitespace-nowrap">{cert.impact}</span>
             </div>
           ))}
           <Link href="/career/certifications" className="w-full py-3 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors mt-2">
              Explore Roadmap <Globe size={14} />
           </Link>
        </div>
      </Card>
    </div>
  );
}

function OnboardingPrompt() {
  return (
    <Card className="rounded-[32px] p-8 border-dashed border-blue-200 bg-blue-50/50 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
        <Sparkles size={32} />
      </div>
      <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Complete your Intelligence Profile</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-8 font-medium">
        We need a few more details to calibrate your market trajectory and skills benchmark accurately.
      </p>
      <Link href="/professional/calibration" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-100 transition-all">
        Start Calibration
      </Link>
    </Card>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [error, setError] = useState(null);

  // Feed state
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedPage, setFeedPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFeed = useCallback(async (p = 1, profileOverride = null) => {
    if (p === 1) setFeedLoading(true); else setLoadingMore(true);
    try {
      const res = await postsAPI.getFeed({ page: p, limit: 10 });
      const d = res.data?.data || res.data || [];
      const pagination = res.data?.pagination;

      // ── Intelligence Engine: 2-Hour Pulse ──────────────────────────────────
      if (p === 1) {
        // Use the override (from fresh loading) or fallback to current state
        const profile = profileOverride || data?.profile;
        const ind = (profile?.industry || 'General Tech').toLowerCase();
        
        // Primary News (Profile Specific)
        const profileNews = [
          {
            id: 'intel-primary-1',
            type: 'news',
            source: 'Bloomberg Terminal',
            title: ind.includes('sap') ? 'SAP BTP Evolution: Lead Roles Gaining 25% Premium' : ind.includes('ai') ? 'GenAI Architecture: 2026 Demand Outpacing Talent' : 'Global Industry Shift: Leading with Strategic Implementation',
            content: `Recent shifts in ${ind} frameworks indicate a pivot toward autonomous governance. Professionals with calibrated skillsets are seeing unprecedented yield in Tier-1 firms.`,
            sentiment: 'Bullish',
            impact_score: 94,
            category: 'Strategic Priority',
            skill_link: ind.includes('sap') ? 'BTP Architecture' : ind.includes('ai') ? 'System Design' : 'Lead Engineering',
            timestamp: new Date().toISOString()
          }
        ];

        // Secondary News (Global Technology)
        const techNews = [
          {
            id: 'intel-secondary-1',
            type: 'news',
            source: 'TechCrunch',
            title: 'NVIDIA and Microsoft Expand Enterprise AI Partnership',
            content: 'The 2026 collaboration aims to accelerate infrastructure deployment for specialized startups, driving high-trust demand.',
            sentiment: 'High Growth',
            impact_score: 82,
            category: 'Market Trend',
            skill_link: 'Cloud Infrastructure',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          }
        ];

        setPosts([...profileNews, ...techNews, ...d]);
        setLastSyncTime(new Date());
      } else {
        setPosts(prev => [...prev, ...d]);
      }

      setHasMore(pagination?.hasNext ?? d.length === 10);
      setFeedPage(p);
    } catch { /* silent */ }
    finally { setFeedLoading(false); setLoadingMore(false); }
  }, []); // Stable identity: Data is passed as override or read from closure lazily

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const res = await careerAPI.getDashboard();
      const dashboardInfo = res.data?.data || null;
      setData(dashboardInfo);
      return dashboardInfo; // Return for sequential chaining
    } catch (err) {
      if (err.response?.status !== 404) setError('Could not load dashboard data');
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    let mounted = true;
    const initialize = async () => {
      // ── High Performance Parallel Execution ──
      // Run both dashboard and feed requests immediately in parallel.
      // We provide the auth-context profile (user?.profile) as a baseline for the intelligence feed
      // while wait for the high-fidelity DB sync in freshData.
      const fetchJobsAndFeed = async () => {
        try {
          const [freshData] = await Promise.all([
            loadDashboard(),
            loadFeed(1, user?.profile)
          ]);
          // If the profile industry differed in DB, loadFeed closure (which is stable)
          // will naturally have the baseline industry. If needed, the next refresh will sync perfectly.
        } catch (err) {
          console.error('[Dashboard Performance] Parallel Fetch Error:', err);
        }
      };

      fetchJobsAndFeed();
    };
    initialize();
    return () => { mounted = false; };
  }, [loadDashboard, loadFeed, user?.profile]);

  const handlePostCreated = (p) => setPosts(prev => [p, ...prev]);
  const handleDeletePost = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  const handleRefreshJobs = async () => {
    setRefreshing(true);
    try {
      await careerAPI.refreshJobMatches();
      await loadDashboard();
    } catch { /* empty state shows */ }
    finally { setRefreshing(false); }
  };

  const handleDownloadReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      window.print();
      setIsGeneratingReport(false);
    }, 500);
  };

  const handleRecalibrate = async () => {
    setIsRecalibrating(true);
    try {
      await careerAPI.analyzeSkills({ profile_data: data?.profile });
      await loadDashboard();
    } catch (err) {
      setError('Recalibration failed. Please try again.');
    } finally {
      setIsRecalibrating(false);
    }
  };

function MarketNewsCard({ item }) {
  return (
    <Card className="rounded-[40px] p-8 border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group bg-white">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100 group-hover:scale-150 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">{item.source}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
           </div>
           <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${item.sentiment === 'Bullish' || item.sentiment === 'High Growth' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
              {item.sentiment}
           </div>
        </div>

        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-4 group-hover:text-blue-600 transition-colors">{item.title}</h3>
        <p className="text-[13px] text-gray-500 font-medium leading-relaxed mb-8">{item.content}</p>

        <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                 <Target size={18} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Skill Impact</p>
                 <p className="text-xs font-black text-gray-900">{item.skill_link || 'Professional Growth'}</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Yield %</p>
              <p className="text-lg font-black text-blue-600">+{item.impact_score}%</p>
           </div>
        </div>
      </div>
    </Card>
  );
}

function EmployerPulseWidget({ industry }) {
  const employers = [
    { name: 'Microsoft', velocity: '+82%', sentiment: 'Elite', color: 'bg-blue-600' },
    { name: 'SAP Global', velocity: '+45%', sentiment: 'Stable', color: 'bg-slate-900' },
    { name: 'NVIDIA', velocity: '+120%', sentiment: 'Parabolic', color: 'bg-emerald-600' },
    { name: 'Deloitte', velocity: '+24%', sentiment: 'Steady', color: 'bg-blue-400' }
  ];

  return (
    <Card className="rounded-[40px] p-8 border-gray-100 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-8">
         <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Employer Pulse</h4>
         <TrendingUp size={16} className="text-blue-600" />
      </div>
      <div className="space-y-6">
         {employers.map((emp, i) => (
           <div key={i} className="group">
              <div className="flex justify-between items-end mb-2">
                 <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{emp.name}</span>
                 <span className="text-[9px] font-bold text-gray-400 uppercase">{emp.sentiment}</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex-1 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: emp.velocity.replace('+', '') }} className={`h-full ${emp.color}`} />
                 </div>
                 <span className="text-[11px] font-black text-blue-600 min-w-[40px] text-right">{emp.velocity}</span>
              </div>
           </div>
         ))}
      </div>
    </Card>
  );
}

function NewsRoomWidget() {
  const headlines = [
    { title: 'Market Shift: Remote roles seeing 15% salary bump in Tier 1 firms.', source: 'TC' },
    { title: 'AI Integration becomes mandatory core skill for Product Lead roles.', source: 'BB' },
    { title: 'Global Tech spending projected to hit record high in Q3 2026.', source: 'RT' }
  ];

  return (
    <Card className="rounded-[40px] p-8 border-slate-900 bg-slate-900 text-white shadow-2xl shadow-blue-100">
       <div className="flex items-center justify-between mb-8">
          <h4 className="text-sm font-black uppercase tracking-widest">Strategic News Room</h4>
          <Globe size={16} className="text-blue-400 animate-pulse" />
       </div>
       <div className="space-y-6">
          {headlines.map((h, i) => (
            <div key={i} className="pb-6 border-b border-white/10 last:border-0 last:pb-0">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-[9px] font-black text-blue-400 tracking-widest uppercase">{h.source} FLASH</span>
               </div>
               <p className="text-xs font-black leading-relaxed hover:text-blue-300 transition-colors cursor-pointer">{h.title}</p>
            </div>
          ))}
       </div>
    </Card>
  );
}

function FeedView({ posts, feedLoading, onRefresh, loadingMore, hasMore, onLoadMore, data, handlePostCreated, handleDeletePost }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
       {/* Primary Intelligence Feed */}
       <div className="lg:col-span-8 space-y-8 pb-20">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                   <Zap size={22} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">Intel Hub</h2>
                   <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Next Intelligence Sync in 1h 54m</p>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   </div>
                </div>
             </div>
             <button onClick={onRefresh} disabled={feedLoading} className="p-3 hover:bg-gray-100 rounded-2xl transition-all border border-gray-100 group">
                <RefreshCw size={18} className={feedLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
             </button>
          </div>

          <CreatePostBox onPostCreated={handlePostCreated} />

          {feedLoading ? (
            <div className="space-y-8">
               {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-[40px]" />)}
            </div>
          ) : (
            <div className="space-y-8">
               {posts.map(post => (
                 post.type === 'news' ? (
                   <MarketNewsCard key={post.id} item={post} />
                 ) : (
                   <PostCard key={post.id} post={post} onDelete={handleDeletePost} onUpdate={() => onRefresh(1)} />
                 )
               ))}
               
               {hasMore && (
                 <button onClick={onLoadMore} disabled={loadingMore} className="w-full py-4 bg-white border border-gray-100 rounded-3xl text-sm font-black text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all flex items-center justify-center gap-2">
                    {loadingMore ? <Loader2 size={16} className="animate-spin" /> : 'Load More Intel'}
                 </button>
               )}
            </div>
          )}
       </div>

       {/* Strategic Dock (Sidebar) */}
       <div className="lg:col-span-4 space-y-8 sticky top-8 h-fit hidden lg:block">
          <EmployerPulseWidget industry={data?.profile?.industry} />
          <NewsRoomWidget />
          
          <Card className="rounded-[40px] p-8 border-gray-100 bg-white relative overflow-hidden group shadow-sm">
             <div className="relative z-10">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Strategic Peer Ranking</h4>
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-3xl font-black text-gray-900 tracking-tighter">Elite</p>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">Top 2% Globally</p>
                   </div>
                   <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent flex items-center justify-center">
                       <Crown size={24} className="text-blue-500" />
                   </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-6 leading-relaxed font-medium">Your activity in the Intelligence Hub is accelerating your visibility among Tier-1 hiring filters.</p>
             </div>
          </Card>
       </div>
    </div>
  );
}

const showOnboarding = !loading && !data?.onboardingCompleted;

  return (
    <div className="max-w-7xl mx-auto">
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-[120px] rounded-[32px]" />
          <Skeleton className="h-[300px] rounded-[32px]" />
          <Skeleton className="h-[150px] rounded-[32px]" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-10 pb-20"
            >
              <IntelligenceHeader 
                user={user} 
                data={data} 
                onStrategyOpen={() => setIsStrategyOpen(true)}
                onDownloadReport={handleDownloadReport}
              />
              
              <AnimatePresence>
                {isStrategyOpen && (
                  <StrategyOverlay 
                    isOpen={isStrategyOpen} 
                    onClose={() => setIsStrategyOpen(false)} 
                    data={data}
                    onRecalibrate={handleRecalibrate}
                    isRecalibrating={isRecalibrating}
                  />
                )}
              </AnimatePresence>

              {/* Printable Header - hidden on screen */}
              <div className="hidden print:block mb-8 border-b pb-4">
                <h1 className="text-2xl font-black">Syllabrix Professional Identity Report</h1>
                <p className="text-sm text-gray-500">Calibrated: {new Date().toLocaleDateString()}</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="font-bold">Summary: {user?.username}&apos;s profile is trending in the {data?.marketPercentile || '90th'} percentile.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <TrajectoryCard data={data} loading={loading} />
                </div>
                <div>
                  <SkillMatchCard data={data} loading={loading} />
                </div>
              </div>

              <MarketPulseGrid data={data} loading={loading} />

              <StrategicSuite data={data} loading={loading} />
              
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 rounded-3xl text-sm text-red-600 border border-red-100 italic">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="feed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <FeedView 
                posts={posts} 
                feedLoading={feedLoading} 
                onRefresh={() => loadFeed(1)}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={() => loadFeed(feedPage + 1)}
                data={data}
                handlePostCreated={handlePostCreated}
                handleDeletePost={handleDeletePost}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
