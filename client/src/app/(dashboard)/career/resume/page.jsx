'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { careerAPI } from '@/lib/api/career.api';
import {
  FileText, RefreshCw, AlertCircle, CheckCircle2,
  Sparkles, Copy, Zap, Target, Plus, X, Briefcase,
  Layout, BarChart3, TrendingUp, ChevronRight,
  Download, Star, Clock, Loader2, Check, Upload,
  Palette, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import TemplatePicker from '@/components/career/resume-templates/TemplatePicker';
import TemplateRenderer from '@/components/career/resume-templates/TemplateRenderer';
import { TEMPLATES } from '@/components/career/resume-templates/index';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

// ── ATS Score Ring ────────────────────────────────────────────────────────────
function ATSRing({ score }) {
  const color   = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const label   = score >= 80 ? 'Strong Match' : score >= 60 ? 'Needs Work' : 'Low Match';
  const circ    = 2 * Math.PI * 54;
  const offset  = circ - (circ * score) / 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#F3F4F6" strokeWidth="10" />
          <circle cx="60" cy="60" r="54" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-900">{score}</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ATS Score</span>
        </div>
      </div>
      <span className="mt-2 text-[11px] font-black uppercase tracking-widest" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Version chip ──────────────────────────────────────────────────────────────
function VersionChip({ v, onSetPrimary, setting }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all
      ${v.is_primary ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100 hover:border-blue-100 hover:bg-blue-50/40'}`}>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold text-gray-900 truncate">{v.version_name}</p>
        <p className="text-[10px] text-gray-400">{new Date(v.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        {v.ats_score > 0 && (
          <span className="text-[10px] font-black text-gray-500">{v.ats_score}%</span>
        )}
        {v.is_primary ? (
          <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-full">Active</span>
        ) : (
          <button onClick={() => onSetPrimary(v.id)} disabled={setting}
            className="px-2 py-0.5 bg-white border border-gray-200 text-gray-500 text-[9px] font-bold rounded-full hover:border-blue-300 hover:text-blue-600 transition-all">
            {setting ? <Loader2 size={10} className="animate-spin" /> : 'Set Active'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Upload form ───────────────────────────────────────────────────────────────
function UploadForm({ onUploaded, onCancel, hasVersions }) {
  const [text, setText]     = useState('');
  const [name, setName]     = useState('');
  const [busy, setBusy]     = useState(false);
  const [step, setStep]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      setStep('Saving resume…');
      const up = await careerAPI.uploadResume({ resume_text: text, version_name: name || 'My Resume' });
      const resumeId = up.data?.data?.id;

      setStep('Scoring with AI…');
      const analysisRes = await careerAPI.analyzeResume({ resume_id: resumeId });
      const analysis = analysisRes.data?.data || null;

      setStep('Extracting skills…');
      await careerAPI.scanResume({ resume_text: text }).catch(() => {});

      setStep('Refreshing job matches…');
      await careerAPI.refreshJobMatches().catch(() => {});

      toast.success('Resume uploaded and scored!');
      onUploaded(analysis);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setBusy(false);
      setStep('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Resume Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Senior Developer Resume"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
      </div>
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Resume Text *</label>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Paste your resume content here…&#10;&#10;Include your work experience, skills, education, and achievements."
          rows={12}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={busy || !text.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-black rounded-xl transition-all disabled:opacity-40 shadow-sm shadow-blue-200">
          {busy ? <><Loader2 size={14} className="animate-spin" /> {step}</> : <><Zap size={14} /> Upload & Score</>}
        </button>
        {hasVersions && onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[12px] font-bold rounded-xl transition-all">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ── Analysis panel ────────────────────────────────────────────────────────────
function AnalysisPanel({ analysis, onReanalyze, reanalyzing, onAddKeyword }) {
  const [copied, setCopied] = useState(null);

  const copyKeyword = (k) => {
    navigator.clipboard.writeText(k).catch(() => {});
    setCopied(k);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Strengths + Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-wide">Strengths</h3>
          </div>
          {analysis.strengths?.length > 0 ? (
            <ul className="space-y-2.5">
              {analysis.strengths.slice(0, 5).map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[12px] text-gray-600 font-medium">
                  <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-gray-400 italic">Upload a resume to see strengths.</p>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Zap size={14} className="text-amber-600" />
            </div>
            <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-wide">Improvements</h3>
          </div>
          {analysis.improvements?.length > 0 ? (
            <ul className="space-y-2.5">
              {analysis.improvements.slice(0, 5).map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[12px] text-gray-600 font-medium">
                  <Target size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-gray-400 italic">Upload a resume to see suggestions.</p>
          )}
        </div>
      </div>

      {/* Missing Keywords */}
      <div className="bg-gray-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[13px] font-black uppercase tracking-wide">Missing Keywords</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Click any keyword to add it to your skill profile</p>
          </div>
          <button onClick={onReanalyze} disabled={reanalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold transition-all">
            <RefreshCw size={12} className={reanalyzing ? 'animate-spin' : ''} /> Re-analyze
          </button>
        </div>
        {analysis.missing_keywords?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {analysis.missing_keywords.map((k, i) => (
              <button key={i} onClick={() => onAddKeyword(k)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-[11px] font-bold transition-all">
                <Plus size={11} className="text-blue-300" /> {k}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-gray-400 italic">
            {analysis.ats_score > 0 ? 'No missing keywords — great alignment!' : 'Upload a resume to find missing keywords.'}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Optimize panel ────────────────────────────────────────────────────────────
function OptimizePanel({ jobs, versions }) {
  const [jobId,    setJobId]    = useState('');
  const [versionId, setVersionId] = useState('');
  const [busy,     setBusy]     = useState(false);
  const [result,   setResult]   = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!jobId) return;
    setBusy(true);
    setResult(null);
    try {
      const payload = { job_id: parseInt(jobId) };
      if (versionId) payload.resume_id = parseInt(versionId);
      const res = await careerAPI.optimizeResume(payload);
      setResult(res.data?.data || null);
      toast.success('Resume optimized for the job!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Optimization failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
            <Sparkles size={15} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-[13px] font-black text-gray-900">Optimize for a Job</h3>
            <p className="text-[11px] text-gray-400">AI rewrites your resume to match a specific job posting</p>
          </div>
        </div>

        <form onSubmit={handleOptimize} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Target Job *</label>
              <select value={jobId} onChange={e => setJobId(e.target.value)} required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none">
                <option value="">Select a job match…</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.role_title} @ {j.company_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Resume Version</label>
              <select value={versionId} onChange={e => setVersionId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none">
                <option value="">Use active resume</option>
                {versions.map(v => <option key={v.id} value={v.id}>{v.version_name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={busy || !jobId}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-black rounded-xl transition-all disabled:opacity-40 shadow-sm shadow-violet-200">
            {busy ? <><Loader2 size={14} className="animate-spin" /> Optimizing…</> : <><Sparkles size={14} /> Optimize Resume</>}
          </button>
        </form>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-black text-gray-900">Optimization Result</h4>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-black rounded-full border border-emerald-100">
              {result.ats_score}% ATS Match
            </span>
          </div>
          {result.ai_summary && (
            <p className="text-[12px] text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">{result.ai_summary}</p>
          )}
          {result.ai_bullet_points?.length > 0 && (
            <div>
              <button onClick={() => setExpanded(e => !e)}
                className="text-[11px] font-bold text-blue-600 hover:underline">
                {expanded ? 'Hide' : 'Show'} optimized bullet points ({result.ai_bullet_points.length})
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="mt-3 space-y-2 overflow-hidden">
                    {result.ai_bullet_points.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />{b}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}
          <p className="text-[10px] text-gray-400 italic">A new resume version has been saved with these optimizations.</p>
        </motion.div>
      )}

      {jobs.length === 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
          <p className="text-[12px] font-bold text-amber-700">No job matches found.</p>
          <p className="text-[11px] text-amber-600 mt-1">Go to Jobs to refresh your matches first.</p>
        </div>
      )}
    </div>
  );
}

// ── Cover letter panel ────────────────────────────────────────────────────────
function CoverLetterPanel({ jobs }) {
  const [jobId,  setJobId]  = useState('');
  const [busy,   setBusy]   = useState(false);
  const [letter, setLetter] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!jobId) return;
    setBusy(true);
    try {
      const res = await careerAPI.generateCoverLetter({ job_id: parseInt(jobId) });
      setLetter(res.data?.data?.cover_letter || '');
      toast.success('Cover letter generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letter).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <FileText size={15} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-[13px] font-black text-gray-900">Cover Letter Generator</h3>
            <p className="text-[11px] text-gray-400">AI writes a tailored cover letter for your target job</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="flex gap-4">
          <select value={jobId} onChange={e => setJobId(e.target.value)} required
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none">
            <option value="">Select a job…</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.role_title} @ {j.company_name}</option>)}
          </select>
          <button type="submit" disabled={busy || !jobId}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-black rounded-xl transition-all disabled:opacity-40">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {busy ? 'Generating…' : 'Generate'}
          </button>
        </form>
      </div>

      {letter ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <p className="text-[12px] font-black text-gray-700">Cover Letter</p>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 transition-all">
              {copied ? <><Check size={12} className="text-emerald-500" /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <div className="p-6 text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto font-medium">
            {letter}
          </div>
        </motion.div>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-10 flex flex-col items-center text-center">
          <FileText size={32} className="text-gray-200 mb-3" />
          <p className="text-[12px] font-bold text-gray-400">No cover letter yet</p>
          <p className="text-[11px] text-gray-400 mt-1">Select a job and click Generate</p>
        </div>
      )}
    </div>
  );
}

// ── Responsive A4 preview wrapper ────────────────────────────────────────────
// Measures its own container width and scales the 794px A4 div to fit.
function A4Preview({ previewRef, children }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.55);

  useEffect(() => {
    function measure() {
      if (wrapRef.current) {
        const available = wrapRef.current.clientWidth - 24; // 12px padding each side
        setScale(Math.min(0.55, available / 794));
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const A4_H = 1123;
  const scaledH = Math.round(A4_H * scale);

  return (
    <div ref={wrapRef} className="w-full bg-gray-50/50 flex justify-center overflow-hidden"
      style={{ minHeight: scaledH + 24 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center',
        width: 794, minHeight: A4_H, marginBottom: -(A4_H - scaledH) }}>
        <div ref={previewRef} style={{ width: 794, minHeight: A4_H }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Builder Tab — full template flow ─────────────────────────────────────────
function BuilderTab({ user, dashData, jobs, versions }) {
  const [selectedTpl,   setSelectedTpl]   = useState(TEMPLATES[0]);
  const [optimized,     setOptimized]     = useState(null); // AI-optimized data for selected job
  const [optimizing,    setOptimizing]    = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedVerId, setSelectedVerId] = useState('');
  const [downloading,   setDownloading]   = useState(false);
  const [showPicker,    setShowPicker]    = useState(true);
  const [certs,         setCerts]         = useState([]);
  const previewRef = useRef(null);

  const profile    = dashData?.profile     || {};
  const skills     = dashData?.skillProfile?.skills_detected || [];
  const workHistory= dashData?.work_history || [];

  // Fetch certifications for the resume
  useEffect(() => {
    careerAPI.listCertifications()
      .then(r => setCerts(r.data?.data || []))
      .catch(() => {});
  }, []);

  const handleOptimize = async () => {
    if (!selectedJobId) return;
    setOptimizing(true);
    try {
      const payload = { job_id: parseInt(selectedJobId) };
      if (selectedVerId) payload.resume_id = parseInt(selectedVerId);
      const res = await careerAPI.optimizeResume(payload);
      const data = res.data?.data;
      if (data) {
        setOptimized(data);
        toast.success('Resume optimized for this job!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF       = (await import('jspdf')).default;

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width:  794, // px at 96dpi ≈ 210mm
        height: 1123,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      const fullName = user?.full_name || user?.username || 'Resume';
      pdf.save(`${fullName}_${selectedTpl.name}.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('PDF export failed — try again');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Job optimization banner (optional) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
            <Sparkles size={15} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-[13px] font-black text-gray-900">Tailor for a Job <span className="text-gray-400 font-medium">(Optional)</span></h3>
            <p className="text-[11px] text-gray-400">Pick a job and AI will optimize your resume content before you build</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Target Job</label>
            <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[12px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 appearance-none">
              <option value="">None — use my profile</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.role_title} @ {j.company_name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Resume Version</label>
            <select value={selectedVerId} onChange={e => setSelectedVerId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[12px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 appearance-none">
              <option value="">Active resume</option>
              {versions.map(v => <option key={v.id} value={v.id}>{v.version_name}</option>)}
            </select>
          </div>
          <button onClick={handleOptimize} disabled={optimizing || !selectedJobId}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-black rounded-xl transition-all disabled:opacity-40 whitespace-nowrap">
            {optimizing ? <><Loader2 size={13} className="animate-spin" /> Optimizing…</> : <><Sparkles size={13} /> Optimize</>}
          </button>
        </div>

        {optimized && (
          <div className="mt-3 px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={14} className="text-violet-600 shrink-0" />
            <p className="text-[11px] text-violet-700 font-bold">
              Optimized for <span className="font-black">{jobs.find(j => j.id == selectedJobId)?.role_title}</span> — ATS score: {optimized.ats_score}%
            </p>
          </div>
        )}
      </div>

      {/* Template picker */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowPicker(s => !s)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Palette size={15} className="text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="text-[13px] font-black text-gray-900">Choose Template</h3>
              <p className="text-[11px] text-gray-400">
                Selected: <span className="font-bold text-gray-700">{selectedTpl.name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-gray-200" style={{ background: selectedTpl.preview }} />
            {showPicker ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </button>

        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-gray-100">
                <div className="pt-4">
                  <TemplatePicker
                    selected={selectedTpl}
                    onSelect={(tpl) => { setSelectedTpl(tpl); setShowPicker(false); }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview + download */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Eye size={15} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-[13px] font-black text-gray-900">A4 Preview</h3>
              <p className="text-[11px] text-gray-400">Exactly how your resume will look when downloaded</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-black rounded-xl transition-all disabled:opacity-40 shadow-sm shadow-emerald-200"
          >
            {downloading
              ? <><Loader2 size={13} className="animate-spin" /> Exporting…</>
              : <><Download size={13} /> Download PDF</>
            }
          </button>
        </div>

        {/* Responsive A4 preview — single ref, scale driven by container width */}
        <A4Preview previewRef={previewRef}>
          <TemplateRenderer
            template={selectedTpl}
            user={user}
            profile={profile}
            workHistory={workHistory}
            skills={skills}
            certifications={certs}
            optimizedText={optimized?.ai_summary || null}
          />
        </A4Preview>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'score',   label: 'ATS Score',     icon: BarChart3 },
  { id: 'optimize',label: 'Optimize',      icon: Sparkles  },
  { id: 'cover',   label: 'Cover Letter',  icon: FileText  },
  { id: 'builder', label: 'Resume Builder',icon: Layout    },
];

export default function ResumePage() {
  const { user } = useAuth();
  const [tab,         setTab]         = useState('score');
  const [loading,     setLoading]     = useState(true);
  const [showUpload,  setShowUpload]  = useState(false);
  const [versions,    setVersions]    = useState([]);
  const [primary,     setPrimary]     = useState(null);
  const [jobs,        setJobs]        = useState([]);
  const [dashData,    setDashData]    = useState(null);
  const [analysis,    setAnalysis]    = useState({ ats_score: 0, missing_keywords: [], strengths: [], improvements: [] });
  const [reanalyzing, setReanalyzing] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState(null);
  const [syncing,     setSyncing]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, atsRes, jobsRes, dashRes] = await Promise.all([
        careerAPI.listResumeVersions(),
        careerAPI.getATSScore().catch(() => null),
        careerAPI.listJobs({ limit: 30 }).catch(() => null),
        careerAPI.getDashboardSummary().catch(() => null),
      ]);

      const vList = vRes.data?.data || [];
      setVersions(vList);
      const prim = vList.find(v => v.is_primary) || vList[0] || null;
      setPrimary(prim);

      setJobs(jobsRes?.data?.data?.jobs || []);
      const dash = dashRes?.data?.data || null;
      setDashData(dash);

      // Seed analysis from dashboard summary (ats_score + missing_keywords)
      const ats = atsRes?.data?.data;
      setAnalysis(prev => ({
        ...prev,
        ats_score:        ats?.score            ?? dash?.atsScore            ?? prev.ats_score,
        missing_keywords: ats?.missing_keywords ?? dash?.missingKeywords     ?? prev.missing_keywords,
      }));

      if (vList.length === 0) setShowUpload(true);
    } catch {
      setShowUpload(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Run a fresh analysis and capture strengths/improvements
  const runAnalysis = useCallback(async () => {
    setReanalyzing(true);
    try {
      const res = await careerAPI.analyzeResume({});
      const data = res.data?.data;
      if (data) {
        setAnalysis({
          ats_score:        data.ats_score        || 0,
          missing_keywords: data.missing_keywords || [],
          strengths:        data.strengths        || [],
          improvements:     data.improvements     || [],
        });
      }
      // Refresh versions list to update ATS scores
      const vRes = await careerAPI.listResumeVersions();
      const vList = vRes.data?.data || [];
      setVersions(vList);
      setPrimary(vList.find(v => v.is_primary) || vList[0] || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setReanalyzing(false);
    }
  }, []);

  // Called after a successful upload — receives the analysis data directly
  const handleUploaded = useCallback(async (analysisData) => {
    setShowUpload(false);
    if (analysisData) {
      setAnalysis({
        ats_score:        analysisData.ats_score        || 0,
        missing_keywords: analysisData.missing_keywords || [],
        strengths:        analysisData.strengths        || [],
        improvements:     analysisData.improvements     || [],
      });
    }
    await load();
    toast.success('Resume uploaded and scored!');
  }, [load]);

  const handleSetPrimary = async (id) => {
    setSettingPrimary(id);
    try {
      await careerAPI.setResumePrimary(id);
      const vRes = await careerAPI.listResumeVersions();
      const vList = vRes.data?.data || [];
      setVersions(vList);
      setPrimary(vList.find(v => v.is_primary) || null);
      toast.success('Active resume updated!');
    } catch {
      toast.error('Failed to update active resume');
    } finally {
      setSettingPrimary(null);
    }
  };

  const handleAddKeyword = async (keyword) => {
    setSyncing(true);
    try {
      const current = dashData?.skillProfile?.skills_detected || [];
      const next = [...current, { name: keyword, level: 'intermediate' }];
      await careerAPI.updateSkills(next);
      toast.success(`"${keyword}" added to your skills!`);
    } catch {
      toast.error('Failed to add skill');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncUpdate = async (type, data) => {
    setSyncing(true);
    try {
      if (type === 'skills') await careerAPI.updateSkills(data);
      else await careerAPI.saveProfile(data);
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const hasResume = versions.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl px-4 sm:px-7 py-5 sm:py-6 text-white flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-1">Career Intelligence</p>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight">Resume Builder</h1>
          <p className="text-[12px] text-blue-200/70 mt-1">Upload, score, optimize and export your resume</p>
        </div>
        <div className="flex items-center gap-3">
          {hasResume && (
            <button onClick={() => setShowUpload(s => !s)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[12px] font-bold rounded-xl transition-all">
              {showUpload ? <X size={14} /> : <Plus size={14} />}
              {showUpload ? 'Cancel' : 'New Version'}
            </button>
          )}
        </div>
      </div>

      {/* Upload form (shown when no resume or user clicks New Version) */}
      <AnimatePresence>
        {(showUpload || !hasResume) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Upload size={15} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-[13px] font-black text-gray-900">{hasResume ? 'Add New Version' : 'Upload Your Resume'}</h2>
                  <p className="text-[11px] text-gray-400">Paste your resume text — we&apos;ll score it with AI immediately</p>
                </div>
              </div>
              <UploadForm
                onUploaded={handleUploaded}
                onCancel={() => setShowUpload(false)}
                hasVersions={hasResume}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      {!loading && hasResume && !showUpload && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">

          {/* Left sidebar */}
          <div className="space-y-4">
            {/* Score ring */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col items-center">
              <ATSRing score={analysis.ats_score} />
              <button onClick={runAnalysis} disabled={reanalyzing}
                className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-blue-600 transition-colors">
                <RefreshCw size={12} className={reanalyzing ? 'animate-spin' : ''} />
                {reanalyzing ? 'Analyzing…' : 'Re-analyze'}
              </button>
            </div>

            {/* Versions */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">Resume Versions</p>
              <div className="space-y-2">
                {versions.map(v => (
                  <VersionChip key={v.id} v={v}
                    onSetPrimary={handleSetPrimary}
                    setting={settingPrimary === v.id} />
                ))}
              </div>
            </div>
          </div>

          {/* Right main area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
              {TABS.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-2 rounded-lg text-[9px] sm:text-[11px] font-black transition-all whitespace-nowrap min-w-[64px]
                      ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Icon size={12} />
                    <span className="hidden xs:inline sm:inline">{t.label}</span>
                    <span className="sm:hidden">{t.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}>
                {tab === 'score' && (
                  <AnalysisPanel
                    analysis={analysis}
                    onReanalyze={runAnalysis}
                    reanalyzing={reanalyzing}
                    onAddKeyword={handleAddKeyword}
                  />
                )}
                {tab === 'optimize' && (
                  <OptimizePanel jobs={jobs} versions={versions} />
                )}
                {tab === 'cover' && (
                  <CoverLetterPanel jobs={jobs} />
                )}
                {tab === 'builder' && (
                  <BuilderTab
                    user={user}
                    dashData={dashData}
                    jobs={jobs}
                    versions={versions}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-gray-100 animate-pulse rounded-2xl h-64" />
          <div className="lg:col-span-3 bg-gray-100 animate-pulse rounded-2xl h-64" />
        </div>
      )}
    </div>
  );
}
