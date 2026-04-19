'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { careerAPI } from '@/lib/api/career.api';
import {
  RefreshCw, ExternalLink, ChevronDown, ChevronUp,
  MapPin, IndianRupee, Clock, Sparkles, CheckCircle2, AlertCircle,
  Bookmark, X, Building2, Zap, Target, Bot, Search,
  BarChart3, Globe, ArrowRight, Loader2, ChevronLeft
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

const POPULAR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Infosys', 'TCS', 'Wipro',
  'Accenture', 'Deloitte', 'SAP', 'IBM', 'Cognizant', 'HCL',
  'Capgemini', 'Tech Mahindra', 'Oracle', 'Salesforce',
];

function CompanySearch({ onResults }) {
  const [query, setQuery]           = useState('');
  const [role, setRole]             = useState('');
  const [searching, setSearching]   = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showRoleInput, setShowRoleInput] = useState(false);

  const handleSearch = async (companyName) => {
    const co = companyName || query.trim();
    if (!co) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await careerAPI.searchCompanyJobs(co, role);
      onResults(res.data?.data || [], co);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Could not fetch jobs. Try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Building2 size={16} className="text-blue-600" />
        <h3 className="text-sm font-bold text-gray-900">Search by Company</h3>
        <span className="text-xs text-gray-400 ml-1">— find jobs at any company</span>
      </div>

      {/* Main search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. Google, Infosys, SAP..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
          />
        </div>
        <button
          onClick={() => setShowRoleInput(v => !v)}
          className={`px-3 py-2.5 text-xs font-medium rounded-xl border transition-all ${showRoleInput ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
          title="Filter by role"
        >
          + Role
        </button>
        <button
          onClick={() => handleSearch()}
          disabled={searching || !query.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0"
        >
          {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Optional role filter */}
      <AnimatePresence>
        {showRoleInput && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Filter by role (optional) — e.g. Software Engineer, Data Analyst"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {searchError && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">
          <AlertCircle size={13} /> {searchError}
        </div>
      )}

      {/* Popular companies */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Popular companies</p>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_COMPANIES.map(co => (
            <button
              key={co}
              onClick={() => { setQuery(co); handleSearch(co); }}
              disabled={searching}
              className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-all disabled:opacity-40"
            >
              {co}
            </button>
          ))}
        </div>
      </div>
    </div>
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
  const [companyResults, setCompanyResults] = useState(null); // { jobs, company }
  const [activeView, setActiveView] = useState('radar'); // 'radar' | 'company'

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

  const handleCompanyResults = (results, company) => {
    setCompanyResults({ jobs: results, company });
    setActiveView('company');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-5 sm:py-8 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot size={20} className="text-blue-600" />
            {activeView === 'company' ? (
              <span>Jobs at <span className="text-blue-600">{companyResults?.company}</span></span>
            ) : (
              <span>Job <span className="text-blue-600">Radar</span></span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeView === 'company'
              ? `${companyResults?.jobs?.length || 0} AI-matched roles found — personalised to your profile`
              : 'AI-matched roles based on your skill profile and career momentum'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {activeView === 'company' && (
            <button
              onClick={() => setActiveView('radar')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:border-gray-300 transition-all"
            >
              <ChevronLeft size={14} /> Back to Radar
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-8">

        {/* Main column */}
        <div className="lg:col-span-3 space-y-4">

          {/* Company Search (always visible) */}
          <CompanySearch onResults={handleCompanyResults} />

          <AnimatePresence mode="wait">
            {/* ── Company results view ── */}
            {activeView === 'company' && (
              <motion.div key="company" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {(companyResults?.jobs || []).length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
                    <Search size={28} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No jobs found for this company.</p>
                  </div>
                ) : (
                  (companyResults.jobs).map((job, idx) => (
                    <JobCard key={idx} job={job} onAction={() => {}} index={idx} />
                  ))
                )}
              </motion.div>
            )}

            {/* ── AI Radar view ── */}
            {activeView === 'radar' && (
              <motion.div key="radar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Fit filters */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 rounded-xl w-full sm:w-fit">
                  {tabs.map(tab => (
                    <button
                      key={tab.value}
                      onClick={() => setCategory(tab.value)}
                      className={`flex items-center gap-1.5 py-1.5 px-3 sm:px-4 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                        category === tab.value ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 p-3 bg-red-50 rounded-xl text-xs text-red-600 border border-red-100">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
                  </div>
                ) : visible.length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
                    <Search size={28} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700 mb-1">No matches yet</p>
                    <p className="text-xs text-gray-400 mb-5">Sync with the market feed to discover personalised roles.</p>
                    <button onClick={handleRefresh} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all">
                      Sync Now
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {visible.map((job, idx) => (
                        <JobCard key={job.id} job={job} onAction={handleAction} index={idx} />
                      ))}
                    </div>
                    {dismissedCount > 0 && !showDismissed && (
                      <button onClick={() => setShowDismissed(true)}
                        className="w-full py-3 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-2xl transition-all hover:bg-gray-50">
                        Show {dismissedCount} dismissed
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl" />
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <Target size={18} />
              </div>
              <h3 className="text-sm font-bold leading-tight mb-2">
                Target: {profile?.target_role || jobs[0]?.role_title || 'Not set'}
              </h3>
              <p className="text-blue-100 text-xs leading-relaxed mb-4">
                {total > 0
                  ? `${total} positions matched to your profile.`
                  : 'Sync your profile to discover matched positions.'}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-blue-100/70">
                  <span>Market Readiness</span>
                  <span>{profile ? (total > 0 ? 'High' : 'Medium') : 'Low'}</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: profile ? (total > 0 ? '85%' : '45%') : '15%' }} className="h-full bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Quick Stats</h3>
              <BarChart3 size={15} className="text-blue-500" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'High Fit',  value: jobs.filter(j => j.fit_category === 'high').length,   color: 'text-emerald-600', icon: <Sparkles size={14} /> },
                { label: 'Locations', value: new Set(jobs.map(j => j.location)).size,               color: 'text-blue-600',    icon: <Globe size={14} />    },
                { label: 'Saved',     value: jobs.filter(j => j.user_action === 'saved').length,    color: 'text-purple-600',  icon: <Bookmark size={14} /> },
                { label: 'Applied',   value: jobs.filter(j => j.user_action === 'applied').length,  color: 'text-gray-700',    icon: <CheckCircle2 size={14} /> },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">{s.icon} {s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 text-white">
            <p className="text-xs font-semibold text-blue-400 mb-1.5">Pro Tip</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Applying to Elite Matches within 24 hours of sync increases response rates by 42%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

