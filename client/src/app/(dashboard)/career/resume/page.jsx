'use client';
import { useState, useEffect, useCallback } from 'react';
import { careerAPI } from '@/lib/api/career.api';
import {
  FileText, Upload, RefreshCw, AlertCircle, CheckCircle2,
  Sparkles, ChevronDown, ChevronUp, Copy, Clock,
  Zap, Star, Target, Plus, X, Briefcase, Layout,
  ShieldCheck, BarChart3, ScanFace, ArrowUpRight,
  TrendingUp, Award, Settings, BrainCircuit, Shield
} from 'lucide-react';
import ResumePreview from '@/components/career/ResumePreview';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

function ATSGauge({ score }) {
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500';
  const bar   = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
  const label = score >= 80 ? 'ELITE ALIGNMENT' : score >= 60 ? 'CALIBRATION REQUIRED' : 'SIGNIFICANT GAPS';
  
  return (
    <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm shadow-gray-100/50 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Calibration Index</p>
        <div className={`p-2 rounded-xl bg-opacity-10 ${bar.replace('bg-', 'bg-opacity-10 text-')}`}>
           <ShieldCheck size={18} />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center">
         <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
               <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-50" />
               <circle 
                 cx="80" cy="80" r="70" 
                 stroke="currentColor" strokeWidth="12" fill="transparent" 
                 strokeDasharray="440"
                 strokeDashoffset={440 - (440 * score) / 100}
                 strokeLinecap="round"
                 className={`${color} transition-all duration-1000 ease-out`}
               />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-5xl font-black text-slate-900 tracking-tighter">{score}</span>
               <span className="text-[10px] font-bold text-gray-400 uppercase">Percentile</span>
            </div>
         </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-50 text-center">
         <p className={`text-[11px] font-black uppercase tracking-widest ${color} mb-1`}>{label}</p>
         <p className="text-[10px] text-gray-400 font-medium">Verified by Syllabrix AI Pulse Engine</p>
      </div>
    </div>
  );
}

// ── Upload panel ────────────────────────────────────────────────────────────

function UploadPanel({ onUploaded, hasVersions }) {
  const [resumeText, setResumeText] = useState('');
  const [versionName, setVersionName] = useState('Premium Standard');
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setUploading(true);
    setError(null);
    try {
      setStep('Uploading...');
      await careerAPI.uploadResume({ resume_text: resumeText, version_name: versionName });
      setStep('AI Scoring...');
      await careerAPI.analyzeResume({});
      setStep('Skill Extraction...');
      await careerAPI.scanResume({ resume_text: resumeText });
      setStep('Job Matching...');
      await careerAPI.refreshJobMatches();
      setResumeText('');
      onUploaded('Calibration complete. Portfolio synchronized.');
    } catch (err) {
      setError(err.response?.data?.message || 'Calibration sync failed.');
    } finally {
      setUploading(false);
      setStep('');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-indigo-100/20 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
           <BrainCircuit size={24} />
        </div>
        <div>
           <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Calibration Input</h3>
           <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Feed the engine your latest trajectory</p>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-rose-50 rounded-2xl text-[11px] font-bold text-rose-600 mb-6 border border-rose-100"
        >
          <AlertCircle size={14} /> {error}
        </motion.div>
      )}

      <form onSubmit={handleUpload} className="space-y-6 flex-1 flex flex-col">
        <div className="group">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Portfolio Tag</label>
          <input
            type="text"
            value={versionName}
            onChange={e => setVersionName(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-[13px] font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-gray-300"
          />
        </div>

        <div className="flex-1 flex flex-col group">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Raw Intelligence (Resume Text)</label>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your professional history here..."
            className="w-full flex-1 bg-gray-50/50 border border-gray-100 rounded-2xl p-6 text-[13px] font-medium text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none min-h-[300px]"
          />
        </div>

        <div className="pt-4 mt-auto">
          <button
            type="submit"
            disabled={uploading || !resumeText.trim()}
            className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.1em] hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 transition-all disabled:opacity-40 group"
          >
            {uploading ? (
              <><RefreshCw size={18} className="animate-spin" /> {step}</>
            ) : (
              <><Target size={18} className="group-hover:rotate-45 transition-transform" /> Calibrate Trajectory</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Analysis panel ──────────────────────────────────────────────────────────

function AnalysisPanel({ analysis, primary, onReanalyze, reanalyzing, onAddKeyword, skills }) {
  const [showKeywords, setShowKeywords] = useState(true);
  const suggestions = analysis?.keyword_suggestions || [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Strengths */}
         <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><TrendingUp size={18} /></div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Alignment Strengths</h3>
            </div>
            <div className="space-y-4">
               {analysis.strengths?.length > 0 ? analysis.strengths.slice(0, 5).map((s, i) => (
                 <div key={i} className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-50 group hover:bg-emerald-50 transition-colors">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] font-semibold text-slate-600 group-hover:text-emerald-900 leading-tight">{s}</p>
                 </div>
               )) : (
                 <p className="text-xs text-gray-400 italic px-4">Recalibrating for latest market benchmarks...</p>
               )}
            </div>
         </div>

         {/* Improvements */}
         <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Zap size={18} /></div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Growth Vector Analysis</h3>
            </div>
            <div className="space-y-4">
               {analysis.improvements?.length > 0 ? analysis.improvements.slice(0, 5).map((s, i) => (
                 <div key={i} className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-50 group hover:bg-indigo-50 transition-colors">
                    <Target size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] font-semibold text-slate-600 group-hover:text-indigo-900 leading-tight">{s}</p>
                 </div>
               )) : (
                 <p className="text-xs text-gray-400 italic px-4">Calibrating growth vectors...</p>
               )}
            </div>
         </div>
      </div>

      {/* Keywords Tag Cloud */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-black tracking-tight leading-none mb-1 uppercase tracking-widest">Market Gap Identifiers</h3>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em]">Add missing keywords to your skill profile with one click</p>
               </div>
               <button onClick={onReanalyze} disabled={reanalyzing} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                  <RefreshCw size={18} className={reanalyzing ? 'animate-spin' : ''} />
               </button>
            </div>
            <div className="flex flex-wrap gap-2">
               {analysis.missing_keywords?.length > 0 ? analysis.missing_keywords.map((k, i) => (
                 <motion.button 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.05 }}
                   whileHover={{ y: -2 }}
                   whileTap={{ scale: 0.95 }}
                   key={i} 
                   onClick={() => {
                     const next = [...skills, { name: k, level: 'expert' }];
                     onAddKeyword(next);
                   }}
                   className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-500/40 transition-all flex items-center gap-2 group"
                 >
                   <Plus size={12} className="text-indigo-300 group-hover:text-white transition-colors" /> {k}
                 </motion.button>
               )) : (
                 <p className="text-xs text-slate-500 font-bold italic">Perfect market alignment detected.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

// ── Precision Optimization ──────────────────────────────────────────────────

// ── Optimize panel ──────────────────────────────────────────────────────────

function OptimizePanel({ jobs, versions }) {
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showBullets, setShowBullets] = useState(false);

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setOptimizing(true);
    setError(null);
    setResult(null);
    try {
      const payload = { job_id: parseInt(selectedJob) };
      if (selectedVersion) payload.resume_id = parseInt(selectedVersion);
      const res = await careerAPI.optimizeResume(payload);
      setResult(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-indigo-100/10">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
           <Zap size={24} />
        </div>
        <div>
           <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Precision Optimization</h3>
           <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Rewriting history for the future.</p>
        </div>
      </div>

      <form onSubmit={handleOptimize} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
           <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Target Opportunity</label>
              <select
                value={selectedJob}
                onChange={e => setSelectedJob(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-[13px] font-black outline-none appearance-none focus:ring-4 focus:ring-amber-50"
                required
              >
                <option value="">Select Opportunity...</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.role_title} @ {j.company_name}</option>)}
              </select>
           </div>
           <button
             type="submit"
             disabled={optimizing || !selectedJob}
             className="w-full py-5 bg-amber-500 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-amber-600 shadow-xl shadow-amber-100 disabled:opacity-40 transition-all flex items-center justify-center gap-3"
           >
             {optimizing ? <RefreshCw size={18} className="animate-spin" /> : <ScanFace size={18} />}
             {optimizing ? 'Synchronizing...' : 'Run Precision Swap'}
           </button>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative flex items-center justify-center">
           {result ? (
              <div className="w-full space-y-4">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Calibration Result</span>
                    <span className="text-2xl font-black text-white">{result.ats_score}% Fit</span>
                 </div>
                 <p className="text-[12px] text-slate-400 font-medium leading-relaxed italic">"{result.ai_summary?.slice(0, 100)}..."</p>
                 <button onClick={() => setShowBullets(!showBullets)} className="w-full py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                    View Enhanced Bullets
                 </button>
              </div>
           ) : (
              <div className="text-center opacity-40">
                 <BrainCircuit size={40} className="mx-auto mb-4 text-indigo-400" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Input</p>
              </div>
           )}
        </div>
      </form>
    </div>
  );
}

// ── Cover letter panel ──────────────────────────────────────────────────────

function CoverLetterPanel({ jobs }) {
  const [selectedJob, setSelectedJob] = useState('');
  const [generatingCL, setGeneratingCL] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setGeneratingCL(true);
    setError(null);
    try {
      const res = await careerAPI.generateCoverLetter({ job_id: parseInt(selectedJob) });
      setCoverLetter(res.data?.data?.cover_letter || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate cover letter');
    } finally {
      setGeneratingCL(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50">
       <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="md:w-1/3">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 rounded-xl text-violet-600 mb-6 border border-violet-100">
                <Layout size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Asset Generator</span>
             </div>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-4">Tailored Portfolio Narrative</h3>
             <p className="text-[13px] text-gray-400 font-semibold leading-relaxed mb-8">
               AI constructs a pinpoint narrative bridge between your experience and your target role.
             </p>
             
             <form onSubmit={handleGenerate} className="space-y-4">
                <select
                  value={selectedJob}
                  onChange={e => setSelectedJob(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-[13px] font-black outline-none appearance-none focus:ring-4 focus:ring-violet-50 transition-all cursor-pointer"
                  required
                >
                  <option value="">Target Role Match...</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.role_title} @ {j.company_name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={generatingCL || !selectedJob}
                  className="w-full py-5 bg-violet-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-violet-700 shadow-lg shadow-violet-100 disabled:opacity-40 transition-all flex items-center justify-center gap-3"
                >
                  {generatingCL ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {generatingCL ? 'Synthesizing...' : 'Generate Narrative'}
                </button>
             </form>
          </div>

          <div className="flex-1 w-full flex flex-col min-h-[400px]">
             {coverLetter ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 bg-gray-900 rounded-[2rem] p-8 text-slate-300 relative group"
                >
                   <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={copyToClipboard} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 text-white font-black text-[10px] flex items-center gap-2 uppercase tracking-widest">
                         {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                      </button>
                   </div>
                   <div className="text-[13px] leading-[1.8] font-medium whitespace-pre-wrap font-mono opacity-80 h-[350px] overflow-y-auto pr-4 scrollbar-hide">
                      {coverLetter}
                   </div>
                </motion.div>
             ) : (
                <div className="flex-1 border-4 border-dashed border-gray-50 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center opacity-40">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                      <FileText size={32} />
                   </div>
                   <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Narrative Generated</p>
                   <p className="text-xs text-gray-300 font-medium max-w-[200px] mt-2 italic">Select a target role and click generate to synthesize your cover letter.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────

export default function ResumePage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' or 'optimize'
  
  // Missing states
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [versions, setVersions] = useState([]);
  const [primary, setPrimary] = useState(null);
  const [analysis, setAnalysis] = useState({ 
    ats_score: 0, 
    missing_keywords: [], 
    strengths: [], 
    improvements: [] 
  });
  const [jobs, setJobs] = useState([]);
  const [success, setSuccess] = useState(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, atsRes, jobsRes, summaryRes] = await Promise.all([
        careerAPI.listResumeVersions(),
        careerAPI.getATSScore().catch(() => ({ data: { data: null } })),
        careerAPI.listJobs({ limit: 20 }).catch(() => ({ data: { data: { jobs: [] } } })),
        careerAPI.getDashboardSummary().catch(() => ({ data: { data: null } })),
      ]);
      const vList = vRes.data?.data || [];
      setVersions(vList);
      const prim = vList.find(v => v.is_primary) || vList[0] || null;
      setPrimary(prim);
      
      setJobs(jobsRes.data?.data?.jobs || []);
      const summary = summaryRes?.data?.data || null;
      setDashboardData(summary);

      if (summary) {
        setAnalysis({ 
          ats_score: summary.atsScore || 0, 
          missing_keywords: summary.missingKeywords || [],
          strengths: summary.strengths || [], 
          improvements: summary.improvements || []
        });
      }

      const ats = atsRes.data?.data;
      if (ats?.score > 0) {
        setAnalysis(prev => ({ 
          ...prev, 
          ats_score: ats.score, 
          missing_keywords: ats.missing_keywords || prev.missing_keywords 
        }));
      }

      if (vList.length === 0) setShowUpload(true);
    } catch {
      setShowUpload(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUploaded = (msg) => {
    setSuccess(msg);
    setShowUpload(false);
    load().then(() => {
      // Automatic Calibration Trigger
      handleReanalyze();
    });
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      await careerAPI.analyzeResume({});
      await careerAPI.refreshJobMatches().catch(() => {});
      await load();
    } finally {
      setReanalyzing(false);
    }
  };

  const handleSyncUpdate = async (type, data) => {
    setSyncing(true);
    try {
      if (type === 'skills') {
        await careerAPI.updateSkills(data);
      } else {
        await careerAPI.saveProfile(data);
      }
      
      // Auto-reanalyze and Refresh Jobs for accuracy
      await careerAPI.analyzeResume({}).catch(() => {});
      await careerAPI.refreshJobMatches().catch(() => {});
      await load();
      
      setSuccess('Portfolio Synchronized & Calibrated.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSetPrimary = async (versionId) => {
    setSettingPrimary(versionId);
    try {
      await careerAPI.setResumePrimary(versionId);
      await load();
    } catch {
      // ignore
    } finally {
      setSettingPrimary(null);
    }
  };

  const currentTabStyles = (tab) => 
    `flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 border-2 ${
      activeTab === tab 
      ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-indigo-100 translate-y-[-4px]' 
      : 'bg-white border-transparent text-slate-400 hover:text-slate-600'
    }`;

  const hasResume = versions.length > 0;

  return (
    <div className="max-w-[1100px] mx-auto pb-20 space-y-8">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="relative z-10 max-w-2xl text-center md:text-left">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
             <BarChart3 size={14} className="text-indigo-300" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">Market Calibration Lab</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-[0.9]">
             Portfolio <span className="text-indigo-300">Architecture</span>
           </h1>
           <p className="text-sm md:text-base text-indigo-100/70 font-medium leading-relaxed max-w-md">
             Calibrate your professional narrative against 2026 market benchmarks and elite corporate expectations.
           </p>

           {syncing && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-xl border border-white/10"
             >
               <RefreshCw size={14} className="animate-spin text-indigo-300" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">AI Syncing Trajectory...</span>
             </motion.div>
           )}
        </div>

        <div className="relative z-10 flex gap-4">
           {hasResume && !showUpload && (
              <button 
                onClick={() => setShowUpload(true)}
                className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-xl"
              >
                <Plus size={16} /> New Calibration
              </button>
           )}
           <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-all">
              <Settings size={20} />
           </button>
        </div>
      </section>

      {success && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 p-5 bg-emerald-50 rounded-[2rem] text-xs font-black text-emerald-700 border border-emerald-100 shadow-lg shadow-emerald-50/50"
        >
          <CheckCircle2 size={18} /> {success}
        </motion.div>
      )}

      {/* Control Tabs */}
      <div className="flex bg-gray-50/50 p-2 rounded-[2rem] border border-gray-100 transition-all">
        <button onClick={() => setActiveTab('optimize')} className={currentTabStyles('optimize')}>
          <Zap size={16} /> Optimize & Score
        </button>
        <button onClick={() => setActiveTab('builder')} className={currentTabStyles('builder')}>
          <Layout size={16} /> Professional Lab
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <Skeleton className="h-[350px] lg:col-span-1" />
            <Skeleton className="h-[350px] lg:col-span-2" />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {activeTab === 'optimize' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   {/* Left Col: Analysis */}
                   <div className="lg:col-span-4 flex flex-col gap-8">
                      <ATSGauge score={analysis.ats_score} />
                      
                      {/* Versions Sidebar */}
                      <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Version History</h4>
                         <div className="space-y-3">
                            {versions.map(v => (
                              <div key={v.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-indigo-100 group">
                                 <div>
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">{v.version_name}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(v.created_at).toLocaleDateString()}</p>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    {v.is_primary && (
                                       <div className="p-1 px-2 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded-lg">Master</div>
                                    )}
                                    <ArrowUpRight size={14} className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Right Col: Primary Panels */}
                   <div className="lg:col-span-8 flex flex-col gap-8">
                      {(showUpload || !hasResume) ? (
                        <div className="relative">
                           {showUpload && hasResume && (
                              <button onClick={() => setShowUpload(false)} className="absolute top-6 right-6 z-20 p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-all">
                                 <X size={16} />
                              </button>
                           )}
                           <UploadPanel onUploaded={handleUploaded} hasVersions={hasResume} />
                        </div>
                      ) : (
                        <AnalysisPanel 
                          analysis={analysis} 
                          primary={primary} 
                          onReanalyze={handleReanalyze} 
                          reanalyzing={reanalyzing}
                          onAddKeyword={(next) => handleSyncUpdate('skills', next)}
                          skills={dashboardData?.skills || []}
                        />
                      )}
                   </div>
                </div>

                <OptimizePanel jobs={jobs} versions={versions} />
                <CoverLetterPanel jobs={jobs} />
              </div>
            ) : (
              <section className="space-y-8 animate-in fade-in duration-700">
                <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-center md:text-left">
                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4">
                            <BrainCircuit size={12} className="text-indigo-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-100">Calibration Active</span>
                         </div>
                         <h2 className="text-3xl font-black tracking-tighter leading-none mb-3">Live Document Calibration</h2>
                         <p className="text-[13px] text-indigo-200/60 font-medium max-w-sm uppercase tracking-wide">Refine your professional narrative before deployment.</p>
                      </div>
                      <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl">
                         <ShieldCheck size={48} className="text-indigo-300 opacity-20" />
                      </div>
                   </div>
                </div>

                <ResumePreview 
                  user={user} 
                  profile={dashboardData?.profile} 
                  workHistory={dashboardData?.work_history}
                  skills={dashboardData?.skills || []}
                  onUpdate={handleSyncUpdate}
                  syncing={syncing}
                />
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
