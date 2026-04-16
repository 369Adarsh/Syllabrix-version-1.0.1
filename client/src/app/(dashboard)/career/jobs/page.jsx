'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { careerAPI } from '@/lib/api/career.api';
import {
  RefreshCw, ExternalLink, ChevronDown, ChevronUp,
  MapPin, IndianRupee, Clock, Sparkles, CheckCircle2, AlertCircle,
  Bookmark, X, Building2, Zap, Target, Bot, Search,
  BarChart3, Globe, ArrowRight
} from 'lucide-react';

// ── Fallback apply URL when AI didn't generate one ───────────────────────────
function buildApplyUrl(job) {
  if (job.apply_url) return job.apply_url;
  // Google Jobs deep link as last resort — pulls from company career pages directly
  const q   = encodeURIComponent(`${job.role_title} ${job.company_name}`);
  const loc = encodeURIComponent(job.location || 'India');
  return `https://www.google.com/search?q=${q}+careers+${loc}&ibp=htl;jobs`;
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-[24px] ${className}`} />;
}

const FIT_COLORS = {
  high:    { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    border: 'border-emerald-100', 
    icon: <Sparkles size={14} className="text-emerald-500" />,
    gradient: 'from-emerald-500 to-teal-600'
  },
  medium:  { 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    border: 'border-blue-100', 
    icon: <Zap size={14} className="text-blue-500" />,
    gradient: 'from-blue-500 to-indigo-600'
  },
  stretch: { 
    bg: 'bg-purple-50', 
    text: 'text-purple-700', 
    border: 'border-purple-100', 
    icon: <Target size={14} className="text-purple-500" />,
    gradient: 'from-purple-500 to-pink-600'
  },
};

const ACTION_LABELS = { saved: 'Saved', applied: 'Applied', dismissed: 'Dismissed', interviewing: 'Interviewing' };

function JobCard({ job, onAction, index }) {
  const [open, setOpen] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fit = FIT_COLORS[job.fit_category] || FIT_COLORS.medium;
  
  const matchReasons = useMemo(() => {
    try { return typeof job.match_reasons === 'string' ? JSON.parse(job.match_reasons) : job.match_reasons || []; }
    catch { return []; }
  }, [job.match_reasons]);

  const missingSkills = useMemo(() => {
    try { return typeof job.missing_skills === 'string' ? JSON.parse(job.missing_skills) : job.missing_skills || []; }
    catch { return []; }
  }, [job.missing_skills]);

  const handleAction = async (e, action) => {
    e.stopPropagation();
    setActioning(true);
    try { await onAction(job.id, action); } finally { setActioning(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group bg-white rounded-[32px] border transition-all duration-300 ${
        job.user_action === 'dismissed' 
          ? 'opacity-60 grayscale' 
          : 'border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5'
      }`}
    >
      <div
        className="p-6 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-start gap-5">
          {/* Company Logo / Initial */}
          <div className={`w-14 h-14 rounded-2xl ${fit.bg} flex items-center justify-center flex-shrink-0 overflow-hidden font-black text-lg ${fit.text} transition-all group-hover:scale-110 duration-300 border border-gray-50`}>
            {job.company_logo && !imgError ? (
              <img 
                src={job.company_logo} 
                alt={job.company_name} 
                className="w-full h-full object-contain p-2"
                onError={() => setImgError(true)}
              />
            ) : (
              job.company_name?.charAt(0) || '?'
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                  {job.role_title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <p className="text-[13px] font-bold text-gray-500 flex items-center gap-1.5">
                    <Building2 size={14} className="text-gray-400" /> {job.company_name}
                  </p>
                  {job.location && (
                    <p className="text-[13px] font-medium text-gray-400 flex items-center gap-1.5">
                      <MapPin size={13} /> {job.location}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className={`px-3 py-1 rounded-full ${fit.bg} ${fit.text} text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                  {fit.icon}
                  {job.fit_score}% Match
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  {job.job_type?.replace('_', ' ') || 'Full Time'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              {job.salary_range && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
                  <IndianRupee size={12} className="text-emerald-500" />
                  <span className="text-[11px] font-bold text-gray-600">{job.salary_range}</span>
                </div>
              )}
              {job.experience_required && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
                  <Clock size={12} className="text-blue-500" />
                  <span className="text-[11px] font-bold text-gray-600">{job.experience_required}</span>
                </div>
              )}
              {job.user_action && job.user_action !== 'dismissed' && (
                <div className="ml-auto px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded uppercase tracking-widest">
                  {ACTION_LABELS[job.user_action]}
                </div>
              )}
              {!job.user_action && (
                 <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    {open ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Insights */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Intelligence Insights</h4>
                    <div className="space-y-2.5">
                      {matchReasons.length > 0 ? matchReasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-emerald-50/50 p-2.5 rounded-2xl border border-emerald-100/50">
                          <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs font-bold text-emerald-900 leading-snug">{r}</p>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-400 italic">No specific match reasons identified.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gap Analysis */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Skill Gap Analysis</h4>
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.length > 0 ? missingSkills.map((s, i) => (
                        <span key={i} className="text-[11px] font-black px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 uppercase tracking-tight">
                        {s}
                        </span>
                      )) : (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                           <Sparkles size={14} /> Full skill alignment detected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 space-y-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <a
                  href={buildApplyUrl(job)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  <ExternalLink size={13} />
                  Apply at {job.company_name}
                </a>
                <button
                  onClick={(e) => handleAction(e, 'saved')}
                  disabled={actioning || job.user_action === 'saved'}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 bg-white border border-gray-100 text-gray-700 text-xs font-bold rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
                >
                  <Bookmark size={13} className={job.user_action === 'saved' ? 'fill-blue-600 text-blue-600' : ''} />
                  <span className="hidden sm:inline">{job.user_action === 'saved' ? 'SAVED' : 'SAVE'}</span>
                  <span className="sm:hidden">{job.user_action === 'saved' ? '✓' : 'Save'}</span>
                </button>
                <button
                  onClick={(e) => handleAction(e, 'applied')}
                  disabled={actioning || job.user_action === 'applied'}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 bg-white border border-gray-100 text-gray-700 text-xs font-bold rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
                >
                  <CheckCircle2 size={13} className={job.user_action === 'applied' ? 'text-emerald-500' : ''} />
                  <span className="hidden sm:inline">{job.user_action === 'applied' ? 'APPLIED' : 'MARK APPLIED'}</span>
                  <span className="sm:hidden">{job.user_action === 'applied' ? 'Applied' : 'Applied?'}</span>
                </button>

                {job.user_action !== 'dismissed' && (
                  <button
                    onClick={(e) => handleAction(e, 'dismissed')}
                    disabled={actioning}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-gray-400 text-xs font-bold rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50 ml-auto"
                  >
                    <X size={13} /> <span className="hidden sm:inline">DISMISS</span>
                  </button>
                )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('');
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [showDismissed, setShowDismissed] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await careerAPI.getProfile();
      setProfile(res.data?.data);
    } catch {}
  };

  const loadJobs = useCallback(async (cat) => {
    setLoading(true);
    try {
      const params = {};
      if (cat) params.category = cat;
      params.limit = 50;
      const res = await careerAPI.listJobs(params);
      const data = res.data?.data;
      setJobs(data?.jobs || []);
      setTotal(data?.total || 0);
    } catch (e) {
      setError('Could not access career intelligence feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadProfile();
    loadJobs(category); 
  }, [loadJobs, category]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await careerAPI.refreshJobMatches();
      await loadJobs(category);
    } catch (e) {
      const msg = e.response?.data?.message || 'Recalibration failed — ensure your profile is fully synchronized.';
      setError(msg);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAction = async (jobId, action) => {
    await careerAPI.updateJobAction(jobId, action);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, user_action: action } : j));
  };

  const tabs = [
    { label: 'ALL OPPORTUNITIES', value: '' },
    { label: 'ELITE MATCHES',     value: 'high',   icon: <Sparkles size={12} /> },
    { label: 'CORE ALIGNMENT',    value: 'medium', icon: <Zap size={12} /> },
    { label: 'STRETCH ROLES',      value: 'stretch',icon: <Target size={12} /> },
  ];

  const visible = showDismissed ? jobs : jobs.filter(j => j.user_action !== 'dismissed');
  const dismissedCount = jobs.filter(j => j.user_action === 'dismissed').length;
  
  const lastUpdated = useMemo(() => {
     if (jobs.length === 0) return null;
     const newest = [...jobs].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
     return newest ? new Date(newest.created_at).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
     }) : null;
  }, [jobs]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <span className="px-3 py-1 bg-blue-50 text-[10px] font-black text-blue-600 rounded-lg uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Bot size={12} /> Career Intelligence active
             </span>
             {lastUpdated && (
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Last Sync: {lastUpdated}
               </span>
             )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             Job <span className="text-blue-600">Radar</span>
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-lg hidden sm:block">
            AI-powered market calibration identifying optimal high-trajectory roles based on your unique skill profile and career momentum.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
           <button
             onClick={handleRefresh}
             disabled={refreshing}
             className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center gap-2 group disabled:opacity-50"
           >
             <RefreshCw size={14} className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
             {refreshing ? 'Syncing...' : 'Sync Feed'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10">
        {/* Left side: List */}
        <div className="lg:col-span-3 space-y-5 sm:space-y-8">
           {/* Filters */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-full sm:w-fit overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setCategory(tab.value)}
                className={`flex items-center gap-1.5 py-2 px-3 sm:px-5 text-[9px] sm:text-[10px] font-black rounded-xl transition-all uppercase tracking-widest whitespace-nowrap ${
                  category === tab.value
                    ? 'bg-white shadow-md text-blue-600 scale-105'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-4 bg-red-50 rounded-[24px] text-xs font-bold text-red-600 border border-red-100"
            >
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}

          {/* Job list */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
              </div>
            ) : visible.length === 0 ? (
              <div className="bg-white rounded-[40px] border border-dashed border-gray-200 py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-blue-300" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">No Matches Calibrated</h2>
                <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                  Adjust your filters or sync with the market feed to discover high-fit opportunities.
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-8 py-3 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-black transition-all"
                >
                  START SYNC
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {visible.map((job, idx) => (
                    <JobCard key={job.id} job={job} onAction={handleAction} index={idx} />
                  ))}
                </div>
                
                {dismissedCount > 0 && !showDismissed && (
                  <button
                    onClick={() => setShowDismissed(true)}
                    className="w-full py-4 text-[10px] font-black text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-[32px] transition-all uppercase tracking-[0.2em] hover:bg-gray-50"
                  >
                    View {dismissedCount} archived results
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right side: Insights Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-8 text-white shadow-2xl shadow-blue-200/50 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
             <div className="relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                   <Target size={20} />
                </div>
                <h3 className="text-xl font-black leading-tight mb-3">
                  Target: {profile?.target_role || jobs[0]?.role_title || 'N/A'}
                </h3>
                <p className="text-blue-100 text-[11px] font-bold leading-relaxed mb-8">
                  {total > 0 
                    ? `Your current skill trajectory is converging with ${total} premium positions in your target sector.`
                    : 'Analyze your profile to discover premium positions in your target sector.'}
                </p>
                
                {/* Dynamic Readiness Score */}
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-100/70">
                      <span>Market Readiness</span>
                      <span>{profile ? (total > 0 ? 'High' : 'Medium') : 'Low'}</span>
                   </div>
                   <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: profile ? (total > 0 ? '85%' : '45%') : '15%' }}
                        className="h-full bg-white rounded-full" 
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Quick Pulse</h3>
                <BarChart3 size={18} className="text-blue-600" />
             </div>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <Sparkles size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Fit</p>
                      <p className="text-lg font-black text-gray-900">{jobs.filter(j => j.fit_category === 'high').length}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Globe size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Locations</p>
                      <p className="text-lg font-black text-gray-900">{new Set(jobs.map(j => j.location)).size}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
             <Sparkles className="absolute -right-2 -bottom-2 text-white/5 w-24 h-24 rotate-12" />
             <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Pro Tip</h3>
             <p className="text-[11px] font-bold text-gray-400 leading-relaxed">
                Applying to &quot;Elite Matches&quot; within 24 hours of sync increases response rates by 42%.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

