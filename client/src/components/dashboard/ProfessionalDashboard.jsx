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
  ExternalLink, UploadCloud, File, Trash2, UserCog, UserPlus, UserCheck, Building2
} from 'lucide-react';
import { uploadAPI } from '@/lib/api/upload.api';
import { postsAPI } from '@/lib/api/posts.api';
import { searchAPI } from '@/lib/api/search.api';
import { followAPI } from '@/lib/api/follow.api';
import CreatePostBox from '@/components/feed/CreatePostBox';
import PostCard from '@/components/feed/PostCard';
import ProfileHeaderWidget from '@/components/widgets/ProfileHeaderWidget';

// ── UI Primitives ─────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 ${className}`} />
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-100 ${className}`}>
    {children}
  </div>
);

// ── Intelligence Components ───────────────────────────────────────────────────

function IntelligenceHeader({ user, data, onStrategyOpen, onDownloadReport }) {
  const name = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Learner';
  const industry = data?.profile?.industry || 'General Tech';
  const isOrg = user?.user_type === 'organization';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1 print:hidden">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{industry} Intelligence Overview</p>
          {isOrg && (
            <Link href="/corporate/dashboard" className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1 hover:from-amber-400 hover:to-orange-500 transition-all">
              <Briefcase size={10} /> Org Center <ChevronRight size={10} />
            </Link>
          )}
        </div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">
          Welcome back, <span className="text-blue-600">{name}</span>
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
          Trajectory <span className="text-blue-600 font-bold">{data?.marketPercentile || '12%'} above</span> peer benchmark.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onDownloadReport}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5" id="download-report-btn">
          <Download size={12} /> Report
        </button>
        <button onClick={onStrategyOpen}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg shadow-md shadow-blue-200 transition-all flex items-center gap-1.5" id="strategy-mode-btn">
          <Zap size={12} className="animate-pulse" /> Strategy
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
        const res = await careerAPI.generateLearningPath({ skill_name: skillName, total_days: 7, difficulty: 'intermediate' });
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
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0 bg-white">
        <button onClick={onBack} className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100">
          <ArrowUpRight size={13} className="rotate-[225deg]" />
        </button>
        <div>
          <h3 className="text-sm font-black text-gray-900">{task.label}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Mastery Progression</p>
            <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <div key={i} className={`w-2.5 h-0.5 rounded-full ${i <= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />)}</div>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Intermediate</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-2">
            <Loader2 size={22} className="text-blue-600 animate-spin" />
            <p className="text-xs font-bold text-gray-400 animate-pulse">Mapping your path...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-[11px] font-black text-gray-900 mb-3 flex items-center gap-1.5">
                  <FileText size={12} className="text-blue-600" /> Study Notes
                </h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5">Goal-Based Approach</h5>
                    <ul className="space-y-1.5">
                      <li className="flex gap-1.5 text-[10px] font-medium text-gray-600">
                        <div className="w-1 h-1 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                        <span><b>Cornell Method</b> for {task.label}.</span>
                      </li>
                      <li className="flex gap-1.5 text-[10px] font-medium text-gray-600">
                        <div className="w-1 h-1 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                        <span>Focus on <b>Day 4 & 5</b> milestones.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Target Proficiency</p>
                    <p className="text-[10px] font-black text-gray-900">Expert-Level Calibration</p>
                    <p className="text-[9px] text-gray-500 mt-0.5 italic">+25% salary in {data?.profile?.industry}.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl text-white shadow-md shadow-indigo-100">
                <h4 className="text-[11px] font-black mb-2.5 flex items-center gap-1.5"><PlayCircle size={12} /> Reference Vault</h4>
                <div className="space-y-2">
                  <a href={`https://www.youtube.com/results?search_query=${task.label}+expert+tutorial+2026`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold transition-all border border-white/10">
                    Mastery Playlist <ArrowUpRight size={11} />
                  </a>
                  <a href={`https://www.google.com/search?q=${task.label}+documentation+best+practices+2026`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold transition-all border border-white/10">
                    Official Playbook <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black text-gray-900 flex items-center gap-1.5">
                  <Target size={12} className="text-blue-600" /> Roadmap
                </h4>
                <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">High Optimization</div>
              </div>
              <div className="space-y-2.5">
                {curriculum.map((day, idx) => (
                  <div key={idx} className="flex gap-2.5 group">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[8px] font-black flex items-center justify-center shrink-0">{day.day}</div>
                      {idx !== curriculum.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="p-3 bg-white border border-gray-100 rounded-xl group-hover:border-blue-100 group-hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="text-[12px] font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{day.title}</h5>
                          <span className="text-[9px] font-bold text-gray-400">{day.estimated_minutes || 60}m</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed mb-2">{day.description || day.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {(day.topics || []).map((topic, ti) => (
                            <span key={ti} className="px-1.5 py-0.5 bg-gray-50 text-[9px] font-bold text-gray-500 rounded-md border border-gray-100 uppercase">{topic}</span>
                          ))}
                        </div>
                        {day.exercise && (
                          <div className="mt-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 border-dashed">
                            <div className="flex items-center gap-1 mb-0.5"><Zap size={9} className="text-emerald-600" /><p className="text-[9px] font-black text-emerald-800 uppercase">Practical</p></div>
                            <p className="text-[10px] text-emerald-600 leading-relaxed font-medium italic">{day.exercise}</p>
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
  const [view, setView] = useState('roadmap');
  const [selectedTask, setSelectedTask] = useState(null);
  if (!isOpen) return null;

  const skillGap = data?.skillGaps?.[0]?.skill_name || 'Market Governance';
  const target = data?.profile?.target_role || 'Senior Lead Roles';

  const handleTaskClick = (task) => { setSelectedTask(task); setView('playbook'); };

  const phases = [
    {
      label: 'Phase 1: Foundation (Day 1-30)', title: 'Alignment & Validation',
      tasks: [
        { label: 'Market Calibration', desc: 'Sync your professional identity with current 2026 market benchmarks.' },
        { label: 'Core Skill Audit', desc: 'Verify top 5 core skills against elite-tier product startup requirements.' },
        { label: 'Resume Hardening', desc: 'Optimize your primary narrative for high-trust ATS filters.' }
      ], icon: <CheckCircle2 size={14} />, color: 'blue'
    },
    {
      label: 'Phase 2: Growth (Day 31-60)', title: 'Gap Bridging & Yield',
      tasks: [
        { label: `Bridge ${skillGap} Gap`, desc: 'Complete specialized training to unlock a potential 25% salary premium.' },
        { label: 'Strategic Networking', desc: 'Connect with 2 mentors in your target sector (Elite Tier).' },
        { label: 'Cross-Domain Leverage', desc: 'Apply your current field expertise to 3 emerging tech segments.' }
      ], icon: <Zap size={14} />, color: 'purple'
    },
    {
      label: 'Phase 3: Elite (Day 61-90)', title: 'Market Penetration',
      tasks: [
        { label: 'Stretch Role Outreach', desc: `Initiate applications for 5 high-yield ${target}.` },
        { label: 'Competitive Analysis', desc: 'Benchmark your interview performance against the top 2% of candidates.' },
        { label: 'Identity Finalization', desc: 'Lock in your 2026 trajectory as a domain authority.' }
      ], icon: <Crown size={14} />, color: 'amber'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-xl">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl max-w-5xl w-full h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-1">
                <Bot size={9} /> AI Strategy Active
              </div>
              <Sparkles size={12} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900 tracking-tighter leading-none">30-60-90 Day <span className="text-blue-600">Execution Roadmap</span></h2>
            <p className="text-gray-500 mt-0.5 text-[11px] font-medium">A task-driven approach to achieving your professional ceiling.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100">
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {view === 'roadmap' ? (
              <motion.div key="roadmap" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {phases.map((phase, i) => (
                      <div key={i} className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">{phase.icon}</div>
                          <div>
                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">{phase.label}</h4>
                            <p className="text-[13px] font-black text-gray-900">{phase.title}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {phase.tasks.map((task, ti) => (
                            <div key={ti} onClick={() => handleTaskClick(task)}
                              className="group p-3 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-blue-400" />
                                  <h5 className="text-[11px] font-black text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{task.label}</h5>
                                </div>
                                <ArrowUpRight size={11} className="text-gray-300 group-hover:text-blue-600 transition-all" />
                              </div>
                              <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic line-clamp-2">{task.desc}</p>
                              <div className="mt-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-1"><Sparkles size={9} className="text-blue-600" /><span className="text-[9px] font-black text-blue-600 uppercase">Mastery Plan</span></div>
                                <span className="text-[8px] font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded-md">+₹2 LPA</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-1 space-y-3">
                    <div className="p-4 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-80">Market Benchmarking</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest mb-0.5">Fitness Score</p>
                          <div className="flex items-baseline gap-1"><span className="text-2xl font-black">{data?.marketFitScore || 0}</span><span className="text-[10px] font-bold opacity-70">/ 100</span></div>
                          <div className="w-full h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${data?.marketFitScore || 0}%` }} className="h-full bg-white rounded-full" />
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest mb-0.5">Global Percentile</p>
                          <p className="text-xl font-black">Top {data?.marketPercentile || '15'}%</p>
                          <p className="text-[9px] opacity-60 mt-0.5 font-medium">vs 2026 Peer Group</p>
                        </div>
                        <button disabled={isRecalibrating} onClick={onRecalibrate}
                          className="w-full py-2 bg-white text-blue-600 text-[10px] font-black rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5 group shadow-md shadow-blue-700/20">
                          {isRecalibrating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />}
                          Recalibrate
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Growth Velocity</h4>
                      {(data?.skillsInDemand || []).slice(0, 2).map((s, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-gray-100">
                          <p className="text-[11px] font-black text-gray-900 mb-0.5">{s.name}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-blue-600 uppercase">{s.demand_growth || '+120% Demand'}</span>
                            <span className="text-[9px] font-black text-emerald-600">{s.avg_salary_impact || '+₹3 LPA'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-200 relative overflow-hidden mb-2">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-[80px] -ml-24 -mt-24 pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-base font-black tracking-tight mb-1">Calculated Outcome</h3>
                    <p className="text-blue-100 text-[11px] font-medium leading-relaxed">
                      Completing this plan transitions your profile to &quot;Elite&quot;, unlocking the top 2% of global opportunities with <span className="text-white font-black underline underline-offset-2 decoration-blue-300">₹15-25 LPA growth delta.</span>
                    </p>
                  </div>
                  <button className="relative z-10 px-5 py-2 bg-white text-blue-700 font-black rounded-xl shadow-md hover:bg-blue-50 transition-all active:scale-95 text-[12px] whitespace-nowrap">
                    Commit to Strategy
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="playbook" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <PlaybookView task={selectedTask} data={data} onBack={() => setView('roadmap')} />
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
  const careerGoalMap = { find_job: 'Job Optimization', upskill: 'Skill Mastery', switch_career: 'Career Transition', freelance: 'Venture Launch', promotion: 'Leadership Track' };
  const goalLabel = careerGoalMap[data?.profile?.career_goal] || 'Professional Growth';

  return (
    <Card className="rounded-xl p-4 border-gray-50 shadow-sm relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 opacity-20 blur-3xl -mr-12 -mt-12" />
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><TrendingUp size={13} /></div>
        <h3 className="text-[13px] font-bold text-gray-800">Trajectory Progress</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        <div className="space-y-3">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Current Phase</p>
            <p className="text-[15px] font-black text-gray-900 leading-tight">{goalLabel}</p>
            <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className="h-full bg-blue-600 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div><p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Strength</p><p className="text-sm font-black text-blue-600">+{data?.profileStrength || 0}%</p></div>
            <div><p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Visibility</p><p className="text-sm font-black text-blue-600">{data?.profileStrength > 70 ? 'High' : 'Medium'}</p></div>
            <div><p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Risk</p><p className="text-sm font-black text-emerald-500">Minimal</p></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="transparent"
                strokeDasharray={301} strokeDashoffset={301 - (301 * score) / 100}
                strokeLinecap="round" className="text-blue-600 transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-900 leading-none">{score}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Market Fit</span>
            </div>
          </div>
          <p className="text-[9px] font-bold text-purple-600 mt-1.5 flex items-center gap-1"><Bot size={9} /> AI Active</p>
          <p className="text-[9px] text-gray-400">{data?.profile?.industry || 'Global Careers'}</p>
        </div>

        <div className="text-center lg:text-right">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Next Pivot</p>
          <p className="text-[15px] font-black text-purple-600 leading-tight">{data?.profile?.target_role || 'Target Achievement'}</p>
          <p className="text-[9px] text-gray-400 mt-2 leading-relaxed italic">Calibrated on {data?.profile?.experience_years || 5}yr expertise.</p>
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
    <Card className="rounded-xl p-4 border-gray-50 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-gray-800">Skill Match</h3>
        <Award size={14} className="text-purple-600" />
      </div>
      <div className="space-y-2.5 flex-1">
        {displaySkills.slice(0, 3).map(s => (
          <div key={s.name || s.skill_name}>
            <div className="flex justify-between text-[10px] font-bold mb-1">
              <span className="text-gray-600 uppercase tracking-wider">{s.name || s.skill_name}</span>
              <span className="text-blue-600">{s.match || 85}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${s.match || 85}%` }} className="h-full bg-blue-600 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2.5 bg-purple-50 border border-purple-100 rounded-xl flex items-start gap-2">
        <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-purple-600 shrink-0 shadow-sm"><Zap size={11} /></div>
        <div>
          <p className="text-[10px] font-bold text-purple-900">Gap Detected</p>
          <p className="text-[10px] text-purple-600 leading-relaxed mt-0.5">
            {data?.skillGaps?.[0]?.skill_name ? `Bridge the ${data.skillGaps[0].skill_name} gap to accelerate growth.` : 'Skills are highly aligned.'}
          </p>
        </div>
      </div>
    </Card>
  );
}

function MarketPulseGrid({ data, loading }) {
  const pulse = data?.market_pulse || [];
  const iconMap = { trends: Globe, salary: ZapIcon, network: Share2, default: Globe };
  const cards = pulse.length > 0 ? pulse.map(p => ({
    title: p.title, desc: p.desc, stat: p.stat, icon: iconMap[p.icon] || iconMap.default,
    color: p.icon === 'salary' ? 'text-purple-600' : p.icon === 'network' ? 'text-pink-600' : 'text-blue-600',
    bg: p.icon === 'salary' ? 'bg-purple-50' : p.icon === 'network' ? 'bg-pink-50' : 'bg-blue-50'
  })) : [
    { title: `${data?.profile?.industry || 'Industry'} Trends`, desc: 'Significant surge in specific roles focused on technical implementation.', stat: '+15% YoY', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Salary Benchmark', desc: `Median total rewards for ${data?.profile?.target_role || 'Senior'} roles increased this quarter.`, stat: 'Apex Salary', icon: ZapIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Network Liquidity', desc: 'Recent connections in your domain are moving to Tier-1 firms.', stat: 'Networking', icon: Share2, color: 'text-pink-600', bg: 'bg-pink-50' }
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-black text-gray-900 tracking-tight">Market Pulse</h2>
          <p className="text-[10px] text-gray-500 font-medium">Real-time shifts in your ecosystem.</p>
        </div>
        <div className="flex gap-1.5">
          <span className="px-2 py-0.5 bg-gray-100 text-[9px] font-black text-gray-500 rounded-full uppercase tracking-widest">High Demand</span>
          <span className="px-2 py-0.5 bg-gray-100 text-[9px] font-black text-gray-500 rounded-full uppercase tracking-widest">Global Tech</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map(c => (
          <Card key={c.title} className="rounded-xl p-3.5 border-gray-50 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-2.5">
              <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center ${c.color} group-hover:scale-105 transition-transform`}>
                <c.icon size={15} />
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 ${c.bg} ${c.color} rounded-lg uppercase tracking-wider`}>{c.stat}</span>
            </div>
            <h4 className="text-[12px] font-black text-gray-900 mb-1">{c.title}</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">{c.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StrategicSuite({ data, loading }) {
  const currentPath = data?.learningPaths?.[0];
  const progress = currentPath
    ? Math.round((currentPath.daily_plan?.length > 0 ? (currentPath.completed_days?.length / currentPath.daily_plan.length) : (currentPath.current_day / currentPath.duration_days)) * 100)
    : 0;

  const industry = (data?.profile?.industry || 'General Tech').toLowerCase();
  let suggestedCerts = [
    { name: 'AWS Solutions Architect', provider: 'Amazon', impact: '+₹6 LPA' },
    { name: 'PMP Certification', provider: 'PMI', impact: '+₹4 LPA' }
  ];
  if (industry.includes('sap') || industry.includes('erp')) {
    suggestedCerts = [{ name: 'SAP BTP Associate', provider: 'SAP', impact: '+₹5 LPA' }, { name: 'Integration Suite', provider: 'SAP', impact: '+₹4 LPA' }];
  } else if (industry.includes('ai') || industry.includes('data')) {
    suggestedCerts = [{ name: 'Professional ML Engineer', provider: 'Google', impact: '+₹8 LPA' }, { name: 'Databricks Developer', provider: 'Databricks', impact: '+₹5 LPA' }];
  } else if (industry.includes('management') || industry.includes('product')) {
    suggestedCerts = [{ name: 'Certified ScrumMaster', provider: 'Scrum Alliance', impact: '+₹3 LPA' }, { name: 'SAFe Agilist', provider: 'Scaled Agile', impact: '+₹3 LPA' }];
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 1. Skill Scanner */}
      <Card className="rounded-xl p-4 border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><ScanSearch size={15} strokeWidth={2.5} /></div>
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded-lg">Live</span>
        </div>
        <h3 className="text-[13px] font-black text-gray-900 leading-tight mb-1">Skill Scanner</h3>
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-3">ATS alignment analysis.</p>
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-2.5">
            <span className="text-2xl font-black text-gray-900">{data?.profileStrength || 72}</span>
            <span className="text-[10px] font-bold text-gray-400">ATS Score</span>
          </div>
          <Link href="/professional/calibration" className="w-full py-2 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 group-hover:bg-blue-600 transition-colors">
            Recalibrate <ChevronRight size={10} />
          </Link>
        </div>
      </Card>

      {/* 2. AI Mentor */}
      <Card className="rounded-xl p-4 border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full bg-slate-900 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 text-blue-400 flex items-center justify-center"><Bot size={15} strokeWidth={2.5} /></div>
          <Sparkles size={12} className="text-blue-400 animate-pulse" />
        </div>
        <h3 className="text-[13px] font-black leading-tight mb-1">AI Mentor</h3>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-3">Trajectory & market intelligence.</p>
        <div className="mt-auto space-y-2">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Status</p>
            <p className="text-[11px] font-black">{data?.marketPercentile > 80 ? 'Elite Performance' : 'Growth Potential'}</p>
          </div>
          <Link href="/ai-buddy" className="w-full py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors">
            Chat Mentor <ArrowUpRight size={10} />
          </Link>
        </div>
      </Card>

      {/* 3. Learning Path */}
      <Card className="rounded-xl p-4 border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Target size={15} strokeWidth={2.5} /></div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
          </div>
        </div>
        <h3 className="text-[13px] font-black text-gray-900 leading-tight mb-1">Learning Path</h3>
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-3">AI-calibrated skill sprint.</p>
        <div className="mt-auto">
          <div className="flex items-end justify-between mb-1">
            <span className="text-xl font-black text-gray-900">{progress}%</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{currentPath ? `Day ${currentPath.current_day}` : 'Set Plan'}</span>
          </div>
          <div className="w-full h-1 bg-gray-50 rounded-full mb-2.5 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-indigo-600" />
          </div>
          <Link href="/career/learning" className="w-full py-2 border border-gray-100 text-gray-900 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors">
            Resume Sprint <PlayCircle size={10} />
          </Link>
        </div>
      </Card>

      {/* 4. Certification */}
      <Card className="rounded-xl p-4 border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full bg-white relative overflow-hidden">
        <div className="absolute -right-3 -top-3 w-14 h-14 bg-blue-50/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Award size={15} strokeWidth={2.5} /></div>
        </div>
        <h3 className="text-[13px] font-black text-gray-900 leading-tight mb-1 relative z-10">Certification</h3>
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-3 relative z-10">High-yield validation.</p>
        <div className="mt-auto space-y-1.5 relative z-10">
          {suggestedCerts.map((cert, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100/50">
              <span className="text-[10px] font-black text-gray-800 truncate pr-2">{cert.name}</span>
              <span className="text-[8px] font-black text-emerald-600 uppercase whitespace-nowrap">{cert.impact}</span>
            </div>
          ))}
          <Link href="/career/certifications" className="w-full py-2 bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 hover:bg-amber-700 transition-colors mt-1">
            Explore <Globe size={10} />
          </Link>
        </div>
      </Card>
    </div>
  );
}

function ResumeCard({ data, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const resumeUrl = data?.resume_url || null;
  const atsScore  = data?.atsScore  || 0;
  const missing   = data?.missingKeywords || [];

  const ACCEPTED = '.pdf,.doc,.docx,.odt,.rtf,.txt';

  const handleFile = async (file) => {
    if (!file) return;
    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) {
      const { default: toast } = await import('react-hot-toast');
      toast.error(`File too large. Max ${maxMB}MB.`);
      return;
    }
    setUploading(true);
    try {
      const { default: toast } = await import('react-hot-toast');
      // Step 1: upload to Cloudinary
      const uploadRes = await uploadAPI.resume(file);
      const url = uploadRes.data?.data?.url || uploadRes.data?.url;
      if (!url) throw new Error('Upload failed — no URL returned.');

      // Step 2: save URL to career_resumes table
      await careerAPI.uploadResume({
        resume_url: url,
        version_name: file.name.replace(/\.[^.]+$/, '') || 'Resume',
      });

      toast.success('Resume uploaded & dashboard synced!');
      onUploaded(); // re-fetch dashboard data
    } catch (err) {
      const { default: toast } = await import('react-hot-toast');
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e) => handleFile(e.target.files?.[0]);
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); };

  const ext = resumeUrl ? resumeUrl.split('.').pop().split('?')[0].toUpperCase() : null;
  const fileName = resumeUrl ? decodeURIComponent(resumeUrl.split('/').pop().split('?')[0]) : null;

  return (
    <Card className="rounded-xl p-4 border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <FileText size={13} />
          </div>
          <h3 className="text-[13px] font-bold text-gray-800">Resume</h3>
        </div>
        {resumeUrl && (
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            ATS {atsScore}/100
          </span>
        )}
      </div>

      {/* Current resume */}
      {resumeUrl ? (
        <div className="mb-3 flex items-center gap-2.5 p-2.5 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <File size={13} />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[11px] font-black text-gray-900 truncate leading-tight">{fileName}</p>
            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">{ext} · Primary Resume</p>
          </div>
          <a
            href={`https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=false`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-[9px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg transition-all">
            View PDF
          </a>
        </div>
      ) : (
        <p className="text-[10px] text-gray-400 font-medium mb-3">No resume uploaded yet. Upload one to boost your ATS score.</p>
      )}

      {/* Missing keywords */}
      {missing.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {missing.slice(0, 4).map(k => (
            <span key={k} className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
              +{k}
            </span>
          ))}
          {missing.length > 4 && <span className="text-[9px] text-gray-400 font-medium">+{missing.length - 4} more</span>}
        </div>
      )}

      {/* Drop zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-1.5 w-full py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
        } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input type="file" accept={ACCEPTED} onChange={onInputChange} className="hidden" disabled={uploading} />
        {uploading ? (
          <Loader2 size={18} className="text-blue-600 animate-spin" />
        ) : (
          <UploadCloud size={18} className="text-gray-400" />
        )}
        <p className="text-[10px] font-bold text-gray-500 text-center">
          {uploading ? 'Uploading…' : dragOver ? 'Drop to upload' : resumeUrl ? 'Drop new resume to replace' : 'Drop resume here or click'}
        </p>
        <p className="text-[9px] text-gray-400">PDF, Word, ODT, RTF, TXT · max 10 MB</p>
      </label>
    </Card>
  );
}

function OnboardingPrompt() {
  return (
    <Card className="rounded-xl p-5 border-dashed border-blue-200 bg-blue-50/50 flex flex-col items-center text-center">
      <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-3"><Sparkles size={20} /></div>
      <h3 className="text-[15px] font-black text-gray-900 tracking-tight mb-1">Complete your Intelligence Profile</h3>
      <p className="text-[11px] text-gray-500 max-w-sm mb-4 font-medium">We need a few more details to calibrate your market trajectory and skills benchmark.</p>
      <Link href="/professional/calibration" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md shadow-blue-100 transition-all text-[12px]">
        Start Calibration
      </Link>
    </Card>
  );
}

// ── HR Professionals discovery widget for professional learners ───────────────

function HRConnectWidget() {
  const { user } = useAuth();
  const [hrPros, setHrPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState({});

  useEffect(() => {
    searchAPI.search({ q: '', type: 'people', user_type: 'hr_professional', limit: 5 })
      .then(r => {
        const people = r.data?.data?.users || r.data?.data || r.data || [];
        setHrPros(Array.isArray(people) ? people.filter(p => p.id !== user?.id) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleConnect = async (id) => {
    setConnected(prev => ({ ...prev, [id]: 'loading' }));
    try {
      await followAPI.toggle(id);
      setConnected(prev => ({ ...prev, [id]: 'connected' }));
    } catch {
      setConnected(prev => ({ ...prev, [id]: 'idle' }));
    }
  };

  if (!loading && hrPros.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <UserCog size={14} className="text-teal-600" />
          <h3 className="text-sm font-bold text-gray-900">HR Professionals Near You</h3>
        </div>
        <Link href="/explore" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
          Find more <ChevronRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-gray-50">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-2 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="w-20 h-7 bg-gray-100 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {hrPros.slice(0, 4).map(p => {
            const avatar = p.profile_photo_url
              || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.username || 'U')}`;
            const status = connected[p.id] || (p.is_following ? 'connected' : 'idle');
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <Link href={`/profile/${p.id}`} className="shrink-0">
                  <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-100"
                    onError={e => { e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=U'; }} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${p.id}`} className="text-xs font-semibold text-gray-800 hover:text-blue-600 transition-colors truncate block">
                    {p.full_name || p.username}
                  </Link>
                  <p className="text-[11px] text-gray-400 truncate">
                    {p.profile?.hr_role || p.headline || 'HR Professional'}
                    {(p.profile?.company_name || p.company) && (
                      <span className="text-teal-600"> · {p.profile?.company_name || p.company}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => status === 'idle' && handleConnect(p.id)}
                  disabled={status !== 'idle'}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                    status === 'connected'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100'
                  } disabled:opacity-60`}>
                  {status === 'loading' ? <Loader2 size={11} className="animate-spin" /> :
                   status === 'connected' ? <><UserCheck size={11} /> Connected</> :
                   <><UserPlus size={11} /> Connect</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-4 py-2.5 border-t border-gray-50 bg-gradient-to-r from-teal-50/50 to-emerald-50/50">
        <p className="text-[11px] text-gray-500">
          Connect with HR pros to get noticed for job opportunities.{' '}
          <Link href="/jobs" className="text-teal-600 font-semibold hover:underline">Browse open jobs →</Link>
        </p>
      </div>
    </div>
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

      if (p === 1) {
        const profile = profileOverride || data?.profile;
        const ind = (profile?.industry || 'General Tech').toLowerCase();
        const profileNews = [{
          id: 'intel-primary-1', type: 'news', source: 'Bloomberg Terminal',
          title: ind.includes('sap') ? 'SAP BTP Evolution: Lead Roles Gaining 25% Premium' : ind.includes('ai') ? 'GenAI Architecture: 2026 Demand Outpacing Talent' : 'Global Industry Shift: Leading with Strategic Implementation',
          content: `Recent shifts in ${ind} frameworks indicate a pivot toward autonomous governance. Professionals with calibrated skillsets are seeing unprecedented yield in Tier-1 firms.`,
          sentiment: 'Bullish', impact_score: 94, category: 'Strategic Priority',
          skill_link: ind.includes('sap') ? 'BTP Architecture' : ind.includes('ai') ? 'System Design' : 'Lead Engineering',
          timestamp: new Date().toISOString()
        }];
        const techNews = [{
          id: 'intel-secondary-1', type: 'news', source: 'TechCrunch',
          title: 'NVIDIA and Microsoft Expand Enterprise AI Partnership',
          content: 'The 2026 collaboration aims to accelerate infrastructure deployment for specialized startups, driving high-trust demand.',
          sentiment: 'High Growth', impact_score: 82, category: 'Market Trend', skill_link: 'Cloud Infrastructure',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }];
        setPosts([...profileNews, ...techNews, ...d]);
        setLastSyncTime(new Date());
      } else {
        setPosts(prev => [...prev, ...d]);
      }
      setHasMore(pagination?.hasNext ?? d.length === 10);
      setFeedPage(p);
    } catch { /* silent */ }
    finally { setFeedLoading(false); setLoadingMore(false); }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const res = await careerAPI.getDashboard();
      const dashboardInfo = res.data?.data || null;
      setData(dashboardInfo);
      return dashboardInfo;
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
      try {
        await Promise.all([loadDashboard(), loadFeed(1, user?.profile)]);
      } catch (err) {
        console.error('[Dashboard] Parallel Fetch Error:', err);
      }
    };
    initialize();
    return () => { mounted = false; };
  }, [loadDashboard, loadFeed, user?.profile]);

  const handlePostCreated = (p) => setPosts(prev => [p, ...prev]);
  const handleDeletePost = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  const handleRefreshJobs = async () => {
    setRefreshing(true);
    try { await careerAPI.refreshJobMatches(); await loadDashboard(); }
    catch { /* empty state shows */ }
    finally { setRefreshing(false); }
  };

  const handleDownloadReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => { window.print(); setIsGeneratingReport(false); }, 500);
  };

  const handleRecalibrate = async () => {
    setIsRecalibrating(true);
    try { await careerAPI.analyzeSkills({ profile_data: data?.profile }); await loadDashboard(); }
    catch { setError('Recalibration failed. Please try again.'); }
    finally { setIsRecalibrating(false); }
  };

  function MarketNewsCard({ item }) {
    return (
      <Card className="rounded-xl p-4 border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group bg-white">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-100 group-hover:scale-150 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">{item.source}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            </div>
            <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.sentiment === 'Bullish' || item.sentiment === 'High Growth' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
              {item.sentiment}
            </div>
          </div>
          <h3 className="text-[14px] font-black text-gray-900 tracking-tight leading-tight mb-1.5 group-hover:text-blue-600 transition-colors">{item.title}</h3>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-3">{item.content}</p>
          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center"><Target size={13} /></div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Skill Impact</p>
                <p className="text-[11px] font-black text-gray-900">{item.skill_link || 'Professional Growth'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Yield</p>
              <p className="text-[15px] font-black text-blue-600">+{item.impact_score}%</p>
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
      <Card className="rounded-xl p-4 border-gray-100 shadow-sm bg-white">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Employer Pulse</h4>
          <TrendingUp size={13} className="text-blue-600" />
        </div>
        <div className="space-y-2.5">
          {employers.map((emp, i) => (
            <div key={i}>
              <div className="flex justify-between items-end mb-0.5">
                <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{emp.name}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">{emp.sentiment}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-50 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: emp.velocity.replace('+', '') }} className={`h-full ${emp.color}`} />
                </div>
                <span className="text-[10px] font-black text-blue-600 min-w-[34px] text-right">{emp.velocity}</span>
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
      <Card className="rounded-xl p-4 border-slate-900 bg-slate-900 text-white shadow-lg shadow-blue-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[12px] font-black uppercase tracking-widest">Strategic News Room</h4>
          <Globe size={12} className="text-blue-400 animate-pulse" />
        </div>
        <div className="space-y-2.5">
          {headlines.map((h, i) => (
            <div key={i} className="pb-2.5 border-b border-white/10 last:border-0 last:pb-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-1 h-1 rounded-full bg-blue-400" />
                <span className="text-[9px] font-black text-blue-400 tracking-widest uppercase">{h.source} FLASH</span>
              </div>
              <p className="text-[11px] font-black leading-relaxed hover:text-blue-300 transition-colors cursor-pointer">{h.title}</p>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function FeedView({ posts, feedLoading, onRefresh, loadingMore, hasMore, onLoadMore, data, handlePostCreated, handleDeletePost }) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-4 pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-100"><Zap size={15} /></div>
              <div>
                <h2 className="text-[15px] font-black text-gray-900 tracking-tight leading-none uppercase">Intel Hub</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Next Sync in 1h 54m</p>
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>
            <button onClick={onRefresh} disabled={feedLoading} className="p-2 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 group">
              <RefreshCw size={14} className={feedLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
            </button>
          </div>

          <CreatePostBox onPostCreated={handlePostCreated} />

          {feedLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                post.type === 'news'
                  ? <MarketNewsCard key={post.id} item={post} />
                  : <PostCard key={post.id} post={post} onDelete={handleDeletePost} onUpdate={() => onRefresh(1)} />
              ))}
              {hasMore && (
                <button onClick={onLoadMore} disabled={loadingMore}
                  className="w-full py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-black text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all flex items-center justify-center gap-2">
                  {loadingMore ? <Loader2 size={13} className="animate-spin" /> : 'Load More Intel'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-3 sticky top-8 h-fit hidden lg:block">
          <EmployerPulseWidget industry={data?.profile?.industry} />
          <NewsRoomWidget />
          <Card className="rounded-xl p-4 border-gray-100 bg-white shadow-sm">
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Strategic Peer Ranking</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-black text-gray-900 tracking-tighter">Elite</p>
                <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-0.5">Top 2% Globally</p>
              </div>
              <div className="w-11 h-11 rounded-full border-2 border-blue-500 border-t-transparent flex items-center justify-center">
                <Crown size={16} className="text-blue-500" />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2.5 leading-relaxed font-medium">Activity is accelerating visibility among Tier-1 hiring filters.</p>
          </Card>
        </div>
      </div>
    );
  }

  const showOnboarding = !loading && !data?.onboardingCompleted;

  return (
    <div className="max-w-7xl mx-auto">
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-[72px] rounded-xl" />
          <Skeleton className="h-[180px] rounded-xl" />
          <Skeleton className="h-[100px] rounded-xl" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
              className="space-y-4 pb-12">
              <IntelligenceHeader user={user} data={data} onStrategyOpen={() => setIsStrategyOpen(true)} onDownloadReport={handleDownloadReport} />

              <AnimatePresence>
                {isStrategyOpen && (
                  <StrategyOverlay isOpen={isStrategyOpen} onClose={() => setIsStrategyOpen(false)} data={data} onRecalibrate={handleRecalibrate} isRecalibrating={isRecalibrating} />
                )}
              </AnimatePresence>

              <div className="hidden print:block mb-4 border-b pb-3">
                <h1 className="text-xl font-black">Syllabrix Professional Identity Report</h1>
                <p className="text-xs text-gray-500">Calibrated: {new Date().toLocaleDateString()}</p>
                <div className="mt-2 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-bold">Summary: {user?.username}&apos;s profile is trending in the {data?.marketPercentile || '90th'} percentile.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2"><TrajectoryCard data={data} loading={loading} /></div>
                <div><SkillMatchCard data={data} loading={loading} /></div>
              </div>

              <MarketPulseGrid data={data} loading={loading} />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                  <StrategicSuite data={data} loading={loading} />
                </div>
                <div className="space-y-4">
                  <ResumeCard data={data} onUploaded={loadDashboard} />
                  <HRConnectWidget />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-[11px] text-red-600 border border-red-100 italic">
                  <AlertCircle size={13} /> {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="feed" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.3 }}>
              <FeedView posts={posts} feedLoading={feedLoading} onRefresh={() => loadFeed(1)} loadingMore={loadingMore} hasMore={hasMore}
                onLoadMore={() => loadFeed(feedPage + 1)} data={data} handlePostCreated={handlePostCreated} handleDeletePost={handleDeletePost} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
