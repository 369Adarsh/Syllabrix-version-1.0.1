'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { careerAPI } from '@/lib/api/career.api';
import {
  ScanSearch, RefreshCw, TrendingUp, AlertTriangle,
  ChevronRight, Sparkles, AlertCircle, BarChart3,
  Loader2, Zap, Target, Award, ArrowRight, CheckCircle2,
  FileText, Briefcase, X, Clock, ExternalLink, Rocket
} from 'lucide-react';

// ── UI Primitives ────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />
);

const Card = ({ children, className = '' }) => (
  <div className={`border border-gray-100 rounded-[32px] overflow-hidden shadow-sm ${className || 'bg-white'}`}>
    {children}
  </div>
);

// ── Components ───────────────────────────────────────────────────────────────

const GapSolutionOverlay = ({ gap, onClose }) => {
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSolution() {
      setLoading(true);
      try {
        const res = await careerAPI.getGapSolution(gap.name);
        setSolution(res.data?.data);
      } catch (e) {
        console.error('Failed to fetch solution:', e);
      } finally {
        setLoading(false);
      }
    }
    if (gap) fetchSolution();
  }, [gap]);

  if (!gap) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-gray-900/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                 <Target size={24} />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-gray-900 leading-none">{gap.name}</h3>
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 px-2 py-0.5 bg-blue-50 rounded-full inline-block">Gap Resolution Plan</p>
              </div>
           </div>
           <button onClick={onClose} className="p-4 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-900">
              <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {loading ? (
             <div className="space-y-8 py-10">
                <div className="flex flex-col items-center text-center space-y-4">
                   <Loader2 size={48} className="text-blue-600 animate-spin" />
                   <p className="text-sm font-bold text-gray-400 animate-pulse">Consulting Intelligence Engine for Best-Fit Resolution...</p>
                </div>
                <div className="space-y-4">
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-3/4" />
                </div>
             </div>
          ) : solution ? (
            <>
              <section className="space-y-4">
                 <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-500" /> Professional Impact
                 </h4>
                 <p className="text-sm text-gray-600 font-medium leading-relaxed italic">{solution.career_impact}</p>
                 <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                       <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Salary Alpha</p>
                       <p className="text-xl font-black text-emerald-900">{solution.salary_uplift}</p>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                       <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Time to Master</p>
                       <p className="text-xl font-black text-blue-900">{solution.time_to_proficiency}</p>
                    </div>
                 </div>
              </section>

              <section className="space-y-6">
                 <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">7-Step Execution Roadmap</h4>
                 <div className="space-y-4">
                    {solution.resolution_roadmap?.map((step, i) => (
                       <div key={i} className="flex gap-4 p-5 rounded-3xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xs font-black text-gray-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             {i + 1}
                          </div>
                          <div>
                             <p className="text-[13px] font-bold text-gray-800 leading-snug">{step.action}</p>
                             <div className="flex items-center gap-2 mt-2">
                                <Clock size={10} className="text-gray-400" />
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-tight">{step.duration}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>

              <section className="space-y-6">
                 <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Curated Intel & Resources</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {solution.curated_resources?.map((res, i) => (
                       <a key={i} href={res.link} target="_blank" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 transition-all group shadow-sm">
                          <span className="text-xs font-bold text-gray-700">{res.title}</span>
                          <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                       </a>
                    ))}
                 </div>
              </section>

              <section className="p-8 bg-gray-900 rounded-[40px] text-white">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Target Employers</h4>
                    <Rocket size={16} className="text-blue-400" />
                 </div>
                 <div className="flex flex-wrap gap-3">
                    {solution.top_companies_hiring?.map((c, i) => (
                       <div key={i} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-black uppercase tracking-tight border border-white/10">
                          {c}
                       </div>
                    ))}
                 </div>
              </section>
            </>
          ) : (
            <div className="text-center py-20 text-red-500 font-bold">Failed to generate solution. Please try again.</div>
          )}
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center">
           <a href={`/career/learning?skill=${gap.name}`} className="px-10 py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-3 tracking-tight">
              GENERATE FULL LEARNING PATH <ArrowRight size={20} />
           </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const safeParse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (e) {
    console.error('Failed to parse skill data:', e);
    return [];
  }
};

const GAP_BADGE = {
  missing:     { label: 'Missing',     bg: 'bg-red-50',    text: 'text-red-600'   },
  basic:       { label: 'Basic',       bg: 'bg-amber-50',  text: 'text-amber-600' },
  needs_depth: { label: 'Needs depth', bg: 'bg-yellow-50', text: 'text-yellow-700'},
  beginner:    { label: 'Beginner',    bg: 'bg-orange-50', text: 'text-orange-600'},
};

const LEVEL_COLORS = {
  expert:       'bg-emerald-50 text-emerald-700 border-emerald-100',
  intermediate: 'bg-blue-50 text-blue-600 border-blue-100',
  beginner:     'bg-gray-50 text-gray-500 border-gray-100',
};

// ── Application ───────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedGap, setSelectedGap] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await careerAPI.getSkillProfile();
      const data = res.data?.data;
      setProfile(data || null);
      if (!data) setShowForm(true);
    } catch {
      setProfile(null);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAnalyze = async (mode = 'manual') => {
    if (mode === 'manual' && !resumeText.trim()) return;
    
    setAnalyzing(true);
    setError(null);
    try {
      if (mode === 'manual') {
        await careerAPI.analyzeSkills({ resume_text: resumeText });
      } else {
        const profileRes = await careerAPI.getProfile();
        await careerAPI.analyzeSkills({ profile_data: profileRes.data?.data });
      }
      await load();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Our AI models are busy, please try again in a moment.');
    } finally {
      setAnalyzing(false);
    }
  };

  const skills = safeParse(profile?.skillsDetected);
  const gaps = safeParse(profile?.skillGaps);
  const trends = safeParse(profile?.skillsInDemand);

  const marketFit = profile?.marketFitScore || 0;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6 sm:space-y-8 px-3 sm:px-4">
      <AnimatePresence>
        {selectedGap && <GapSolutionOverlay gap={selectedGap} onClose={() => setSelectedGap(null)} />}
      </AnimatePresence>

      {/* Header Intelligence */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100">Skill Intelligence Engine</div>
              <Sparkles size={14} className="text-blue-600 animate-pulse" />
           </div>
           <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
             Skill <span className="text-blue-600">Scanner</span>
           </h1>
           <p className="text-sm text-gray-500 mt-2 font-medium max-w-lg leading-relaxed">
             AI-driven gap analysis comparing your professional footprint against Tier-1 market requirements in <span className="text-blue-600 font-bold">{profile?.industry || 'Modern Tech'}</span>.
           </p>
        </div>
        {profile && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-blue-100 text-blue-600 text-xs font-black rounded-2xl hover:shadow-xl hover:shadow-blue-100 transition-all active:scale-95 uppercase tracking-widest"
          >
            <RefreshCw size={14} /> RE-SCAN PROFILE
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div 
            key="analysis-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 blur-[100px] pointer-events-none" />
            <Card className="p-5 sm:p-8 md:p-10 border-blue-100 bg-white/80 backdrop-blur-xl relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Supply Intelligence</h3>
                    <p className="text-sm text-gray-400 font-medium">Choose how you want to calibrate your skills.</p>
                  </div>
                  
                  <div className="space-y-4">
                     <button 
                       onClick={() => handleAnalyze('profile')}
                       disabled={analyzing}
                       className="w-full p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white flex items-center justify-between group hover:shadow-2xl hover:shadow-blue-200 transition-all disabled:opacity-50"
                     >
                       <div className="flex items-center gap-4 text-left">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                             <Briefcase size={20} />
                          </div>
                          <div>
                             <p className="text-xs font-black opacity-80 uppercase tracking-widest">Option A</p>
                             <h4 className="text-lg font-black tracking-tight uppercase">Scan Intelligence Profile</h4>
                          </div>
                       </div>
                       <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                     </button>

                     <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">or upload text</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                     </div>

                     <div className="space-y-4">
                        <textarea
                          value={resumeText}
                          onChange={e => setResumeText(e.target.value)}
                          placeholder="Paste your resume or LinkedIn experience text here..."
                          rows={6}
                          className="w-full px-6 py-5 text-sm border-2 border-gray-100 focus:border-blue-200 rounded-[28px] bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all resize-none font-medium"
                        />
                        <button
                          onClick={() => handleAnalyze('manual')}
                          disabled={analyzing || !resumeText.trim()}
                          className="w-full py-4 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                        >
                          {analyzing ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
                          START MANUAL ANALYSIS
                        </button>
                     </div>
                  </div>
                </div>

                <div className="hidden lg:flex flex-col justify-center bg-gray-50/50 rounded-[40px] p-10 border border-gray-100">
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs">01</div>
                         <p className="text-sm font-bold text-gray-600">Extracts 50+ signal points from profile data</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">02</div>
                         <p className="text-sm font-bold text-gray-600">Cross-references against 2026 Salary Benchmarks</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-purple-600 font-black text-xs">03</div>
                         <p className="text-sm font-bold text-gray-600">Generates instant 90-day improvement roadmap</p>
                      </div>
                   </div>
                   <div className="mt-12 p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm italic text-[11px] text-gray-500 leading-relaxed">
                      &quot;Our AI scanner uses domain-specific knowledge graphs to identify skills that are often overlooked in standard ATS scans.&quot;
                   </div>
                </div>
              </div>
              
              {profile && (
                <button onClick={() => setShowForm(false)} className="mt-8 text-xs font-black text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2 uppercase tracking-widest">
                  <ArrowRight size={14} className="rotate-180" /> Back to Intelligence
                </button>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="analysis-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Card className="p-8 flex flex-col items-center">
                 <div className="relative w-32 h-32 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
                       <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray={364} strokeDashoffset={364 - (364 * marketFit) / 100}
                          strokeLinecap="round" className="text-blue-600 transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-gray-900">{marketFit}%</div>
                 </div>
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Market Fit</h4>
                 <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full">
                    <TrendingUp size={10} className="text-emerald-600" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase">Top {profile?.marketPercentile || 15}% in Industry</span>
                 </div>
              </Card>

              <Card className="p-8 bg-[#0f172a] text-white border-none shadow-2xl shadow-blue-500/10">
                 <div className="space-y-8 h-full flex flex-col">
                    <div>
                       <h4 className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-4">Signal Breakdown</h4>
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-4xl font-black">{profile?.totalSkillsMatched || skills.length || 0}</p>
                             <p className="text-[10px] font-bold opacity-60 uppercase mt-1">Skills Matched</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-black opacity-40">{profile?.totalSkillsDemanded || (skills.length + gaps.length) || 0}</p>
                             <p className="text-[10px] font-bold opacity-60 uppercase mt-1">Current Demand</p>
                          </div>
                       </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                       <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${((profile?.totalSkillsMatched || skills.length) / (profile?.totalSkillsDemanded || (skills.length + gaps.length) || 1)) * 100}%` }} 
                            className="h-full bg-gradient-to-r from-blue-400 to-indigo-400" 
                          />
                       </div>
                    </div>
                 </div>
              </Card>

              <Card className="p-8 border-dashed border-2 border-blue-100 bg-blue-50/10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                       <AlertTriangle size={20} />
                    </div>
                    <h4 className="text-lg font-black text-gray-800 tracking-tight">Income Leakage</h4>
                 </div>
                 <p className="text-3xl font-black text-blue-600 leading-none">₹{gaps.length * 3 || 12} LPA</p>
                 <p className="text-[11px] text-gray-500 font-medium mt-3 leading-relaxed">
                    Estimated career growth potential by bridging the top <span className="text-blue-600 font-bold">{gaps.length} gaps</span> identified in your profile.
                 </p>
              </Card>
            </div>

            {/* In-depth Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
               <Card className="p-5 sm:p-8 md:p-10">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 uppercase">
                        <CheckCircle2 size={24} className="text-blue-600" />
                        Skills Detected
                     </h3>
                     <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{skills.length} FOUND</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {skills.length === 0 ? (
                        <p className="text-sm text-gray-400 font-medium italic">No verified skills detected. Re-scan your resume for better precision.</p>
                     ) : skills.map((s, i) => (
                        <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-sm ${LEVEL_COLORS[s.level] || LEVEL_COLORS.beginner}`}>
                           <span className="text-[12px] font-black uppercase tracking-tight">{s.name}</span>
                        </div>
                     ))}
                  </div>
               </Card>

               <Card className="p-5 sm:p-8 md:p-10 border-blue-100 bg-amber-50/5">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 uppercase">
                        <Target size={24} className="text-blue-600" />
                        Critical Gaps
                     </h3>
                     <span className="text-[11px] font-black text-blue-600 uppercase">Priority Required</span>
                  </div>
                  <div className="space-y-4">
                     {gaps.length === 0 ? (
                       <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 text-center">
                          <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                          <p className="text-sm font-black text-emerald-800 uppercase tracking-tight">Zero Critical Gaps Detected</p>
                          <p className="text-[11px] text-emerald-600 mt-1">Your current skill profile is highly optimized for {profile?.industry || 'this domain'}.</p>
                       </div>
                     ) : gaps.map((gap, i) => {
                        const badge = GAP_BADGE[gap.gap_level] || GAP_BADGE.basic;
                        return (
                          <div 
                            key={i} 
                            onClick={() => setSelectedGap(gap)}
                            className="group flex items-center justify-between bg-white p-5 rounded-[28px] border border-gray-100 hover:border-amber-200 transition-all shadow-sm cursor-pointer hover:shadow-lg active:scale-[0.98]"
                          >
                             <div>
                                <h5 className="text-[15px] font-black text-gray-900">{gap.name}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${badge.bg} ${badge.text}`}>{badge.label}</span>
                                   {gap.demand_level === 'high' && <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">🔥 Market Hot</span>}
                                </div>
                             </div>
                             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                <ChevronRight size={18} />
                             </div>
                          </div>
                        );
                     })}
                  </div>
               </Card>
            </div>

            {/* Market Opportunities */}
            {trends.length > 0 && (
              <Card className="p-10 bg-white border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 opacity-20 blur-3xl -mr-32 -mt-32 pointer-events-none" />
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                          <TrendingUp size={28} className="text-emerald-500" />
                          Industry Alpha
                       </h3>
                       <p className="text-sm text-gray-400 font-medium">Emerging skills with high capital yield in {profile.industry || 'your field'}.</p>
                    </div>
                    <div className="px-5 py-2 bg-white rounded-2xl shadow-sm border border-gray-100 text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                       2026 Forecast Active
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trends.map((t, i) => (
                       <div key={i} className="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 opacity-0 group-hover:opacity-100 rounded-full blur-2xl -mr-12 -mt-12 transition-opacity" />
                          <div className="relative z-10">
                             <div className="flex justify-between items-start mb-4">
                                <h5 className="text-[17px] font-black text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors">{t.name}</h5>
                                <Award size={18} className="text-gray-200 group-hover:text-emerald-500 transition-colors" />
                             </div>
                             <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                                <div className="space-y-0.5">
                                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Growth</p>
                                   <p className="text-sm font-black text-emerald-600">{t.demand_growth || '+12%'}</p>
                                </div>
                                <div className="text-right space-y-0.5">
                                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Avg Impact</p>
                                   <p className="text-sm font-black text-blue-600">{t.avg_salary_impact || '+₹2 LPA'}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>
            )}

            {/* CTA */}
            {gaps.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="p-12 bg-gray-900 rounded-[48px] text-white flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-purple-500/20"
               >
                  <div className="space-y-4 max-w-xl text-center lg:text-left">
                     <h3 className="text-3xl font-black tracking-tight leading-none uppercase">Bridge your intelligence gaps.</h3>
                     <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        Our AI can generate a hyper-personalized **90-day learning vault** for your critical gaps, including daily hands-on projects and verified mentorship links.
                     </p>
                  </div>
                  <a href="/career/learning" className="px-10 py-5 bg-white text-gray-900 font-black rounded-3xl shadow-xl hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2">
                     EXPLORE LEARNING PATHS <ArrowRight size={20} />
                  </a>
               </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-3 p-6 bg-red-50 rounded-[32px] text-sm text-red-600 border border-red-100 font-bold animate-shake">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {loading && !analyzing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      )}
    </div>
  );
}
