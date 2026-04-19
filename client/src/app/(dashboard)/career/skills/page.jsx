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

// ── Helpers ──────────────────────────────────────────────────────────────────

const safeParse = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try { return typeof data === 'string' ? JSON.parse(data) : data; }
  catch { return []; }
};

const GAP_BADGE = {
  missing:     { label: 'Missing',     bg: 'bg-red-50',    text: 'text-red-600'    },
  basic:       { label: 'Basic',       bg: 'bg-amber-50',  text: 'text-amber-600'  },
  needs_depth: { label: 'Needs depth', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  beginner:    { label: 'Beginner',    bg: 'bg-orange-50', text: 'text-orange-600' },
};

const LEVEL_COLORS = {
  expert:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-blue-50   text-blue-700   border-blue-200',
  beginner:     'bg-gray-50   text-gray-500   border-gray-200',
};

// ── Gap Solution Overlay ─────────────────────────────────────────────────────

const GapSolutionOverlay = ({ gap, onClose }) => {
  const [solution, setSolution] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!gap) return;
    setLoading(true);
    careerAPI.getGapSolution(gap.name)
      .then(res => setSolution(res.data?.data))
      .catch(() => setSolution(null))
      .finally(() => setLoading(false));
  }, [gap]);

  if (!gap) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Target size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{gap.name}</h3>
              <p className="text-xs text-blue-600 font-medium">Gap Resolution Plan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 size={32} className="text-blue-500 animate-spin mx-auto" />
              <p className="text-sm text-gray-400">Generating your resolution plan...</p>
            </div>
          ) : solution ? (
            <>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Why it matters</p>
                <p className="text-sm text-gray-600 leading-relaxed">{solution.career_impact}</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">Salary uplift</p>
                    <p className="text-lg font-bold text-emerald-800">{solution.salary_uplift}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Time to learn</p>
                    <p className="text-lg font-bold text-blue-800">{solution.time_to_proficiency}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Step-by-step plan</p>
                <div className="space-y-2">
                  {solution.resolution_roadmap?.map((step, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{step.action}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock size={10} /> {step.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {solution.curated_resources?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Resources</p>
                  <div className="space-y-2">
                    {solution.curated_resources.map((res, i) => (
                      <a key={i} href={res.link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition-all group">
                        <span className="text-sm text-gray-700 font-medium">{res.title}</span>
                        <ExternalLink size={13} className="text-gray-300 group-hover:text-blue-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {solution.top_companies_hiring?.length > 0 && (
                <div className="p-5 bg-gray-900 rounded-xl text-white">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Companies hiring for this skill</p>
                  <div className="flex flex-wrap gap-2">
                    {solution.top_companies_hiring.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-medium border border-white/10">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-red-500 text-sm">Failed to generate plan. Please try again.</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <a href={`/career/learning?skill=${gap.name}`}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Create Learning Path <ArrowRight size={15} />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [analyzing, setAnalyzing]   = useState(false);
  const [error, setError]           = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [selectedGap, setSelectedGap] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await careerAPI.getSkillProfile();
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
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const skills    = safeParse(profile?.skillsDetected);
  const gaps      = safeParse(profile?.skillGaps);
  const trends    = safeParse(profile?.skillsInDemand);
  const marketFit = profile?.marketFitScore || 0;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6 px-3 sm:px-4 md:px-0">

      <AnimatePresence>
        {selectedGap && <GapSolutionOverlay gap={selectedGap} onClose={() => setSelectedGap(null)} />}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ScanSearch size={22} className="text-blue-600" /> Skill Scanner
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI analysis of your skills vs. market demand in{' '}
            <span className="text-blue-600 font-medium">{profile?.industry || 'Modern Tech'}</span>.
          </p>
        </div>
        {profile && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            <RefreshCw size={14} /> Re-scan
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-sm text-red-600 border border-red-100">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ── Scan form ── */}
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm"
          >
            <h3 className="text-base font-bold text-gray-900 mb-1">Analyse your skills</h3>
            <p className="text-sm text-gray-500 mb-6">Choose how to scan your profile.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left: actions */}
              <div className="space-y-4">
                <button
                  onClick={() => handleAnalyze('profile')}
                  disabled={analyzing}
                  className="w-full p-5 bg-blue-600 text-white rounded-xl flex items-center gap-4 hover:bg-blue-700 transition-colors disabled:opacity-50 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold opacity-70 uppercase tracking-wide">Recommended</p>
                    <p className="text-sm font-bold">Scan my career profile</p>
                    <p className="text-xs opacity-70 mt-0.5">Uses your saved profile data</p>
                  </div>
                  {analyzing ? <Loader2 size={16} className="animate-spin ml-auto" /> : <ArrowRight size={16} className="ml-auto" />}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">or paste resume text</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <textarea
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste your resume or LinkedIn experience here..."
                  rows={5}
                  className="w-full px-4 py-3 text-sm border border-gray-200 focus:border-blue-300 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none transition-all resize-none"
                />
                <button
                  onClick={() => handleAnalyze('manual')}
                  disabled={analyzing || !resumeText.trim()}
                  className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {analyzing ? <><Loader2 size={15} className="animate-spin" /> Analysing...</> : <><BarChart3 size={15} /> Analyse resume</>}
                </button>
              </div>

              {/* Right: steps */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col justify-center space-y-5">
                {[
                  { n: '01', color: 'bg-emerald-100 text-emerald-700', text: 'Extracts 50+ signal points from your profile' },
                  { n: '02', color: 'bg-blue-100 text-blue-700',       text: 'Cross-references against 2026 salary benchmarks' },
                  { n: '03', color: 'bg-purple-100 text-purple-700',   text: 'Generates a personalised 90-day improvement plan' },
                ].map(s => (
                  <div key={s.n} className="flex items-center gap-4">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.color}`}>{s.n}</span>
                    <p className="text-sm text-gray-600 font-medium">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {profile && (
              <button onClick={() => setShowForm(false)} className="mt-6 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors">
                <ArrowRight size={12} className="rotate-180" /> Back to results
              </button>
            )}
          </motion.div>
        )}

        {/* ── Results ── */}
        {!showForm && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <>
                {/* ── Row 1: 4 stat cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Market fit */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 shadow-sm col-span-1">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" stroke="#f1f5f9" strokeWidth="7" fill="none" />
                        <circle cx="40" cy="40" r="34" stroke="#2563eb" strokeWidth="7" fill="none"
                          strokeDasharray={213.6}
                          strokeDashoffset={213.6 - (213.6 * marketFit) / 100}
                          strokeLinecap="round" className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900">{marketFit}%</div>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 text-center leading-tight">Market Fit</p>
                  </div>

                  {/* Skills matched */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Skills Matched</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{profile?.totalSkillsMatched || skills.length || 0}</p>
                    <div className="mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((profile?.totalSkillsMatched || skills.length) / ((profile?.totalSkillsDemanded || skills.length + gaps.length) || 1)) * 100}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">of {profile?.totalSkillsDemanded || skills.length + gaps.length} in demand</p>
                  </div>

                  {/* Gaps */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Skill Gaps</p>
                    <p className={`text-4xl font-bold mt-2 ${gaps.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{gaps.length}</p>
                    <p className="text-xs text-gray-400 mt-auto pt-3">
                      {gaps.length === 0 ? 'No gaps found 🎉' : `${gaps.filter(g => g.demand_level === 'high').length} high priority`}
                    </p>
                  </div>

                  {/* Income potential */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Income Potential</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">+₹{gaps.length * 3 || 0}L</p>
                    <p className="text-xs text-gray-400 mt-auto pt-3">if {gaps.length} gaps bridged</p>
                  </div>
                </div>

                {/* ── Row 2: Skills + Gaps ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                  {/* Skills detected */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-blue-600" /> Skills Detected
                      </h3>
                      <span className="text-xs text-gray-400">{skills.length} found</span>
                    </div>
                    {skills.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No skills detected. Re-scan your profile.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => (
                          <span key={i} className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${LEVEL_COLORS[s.level] || LEVEL_COLORS.beginner}`}>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Critical gaps */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Target size={16} className="text-amber-500" /> Critical Gaps
                      </h3>
                      <span className="text-xs text-blue-600 font-medium">{gaps.length > 0 ? 'Click to fix' : 'All clear'}</span>
                    </div>
                    {gaps.length === 0 ? (
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">No gaps found</p>
                          <p className="text-xs text-emerald-600 mt-0.5">Your profile is well optimised for {profile?.industry || 'this domain'}.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {gaps.map((gap, i) => {
                          const badge = GAP_BADGE[gap.gap_level] || GAP_BADGE.basic;
                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedGap(gap)}
                              className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all group text-left"
                            >
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{gap.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
                                  {gap.demand_level === 'high' && (
                                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">🔥 High demand</span>
                                  )}
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shrink-0">
                                <ChevronRight size={15} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Row 3: Market trends ── */}
                {trends.length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <TrendingUp size={16} className="text-emerald-500" /> In-demand skills for 2026
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Emerging skills with high salary impact in {profile?.industry || 'your field'}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">2026 Forecast</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {trends.map((t, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-white transition-all group">
                          <h5 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors mb-3">{t.name}</h5>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Growth</p>
                              <p className="text-sm font-bold text-emerald-600">{t.demand_growth || '+12%'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Salary impact</p>
                              <p className="text-sm font-bold text-blue-600">{t.avg_salary_impact || '+₹2 LPA'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── CTA ── */}
                {gaps.length > 0 && (
                  <div className="bg-gray-900 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div>
                      <h3 className="text-base font-bold text-white">Start fixing your gaps today</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Generate a personalised day-by-day learning path for any of your {gaps.length} skill gaps.
                      </p>
                    </div>
                    <a
                      href="/career/learning"
                      className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-all shrink-0"
                    >
                      Go to Learning Paths <ArrowRight size={15} />
                    </a>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
