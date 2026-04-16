'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Briefcase, FileText, Mail, Linkedin, Globe,
  Pencil, X, CheckCircle, Loader2, UploadCloud, Download,
  ExternalLink, Building2, ChevronRight, Shield, Check,
  TrendingUp, Award, Zap, History, Target, User,
  Plus, Trash2, BadgeCheck, CalendarDays, Link as LinkIcon,
  GraduationCap
} from 'lucide-react';
import Image from 'next/image';
import { uploadAPI } from '@/lib/api/upload.api';
import { careerAPI } from '@/lib/api/career.api';
import { toast } from 'react-hot-toast';

// ── Skill bar ─────────────────────────────────────────────────────────────────
const SkillBar = ({ label, score, color = '#2563EB' }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">{label}</span>
      <span className="text-[11px] font-bold text-gray-900">{score}%</span>
    </div>
    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ backgroundColor: color }}
        className="h-full rounded-full"
      />
    </div>
  </div>
);

// ── Stat column ───────────────────────────────────────────────────────────────
const StatCol = ({ label, value, sub, icon: Icon, accent = 'text-blue-600' }) => (
  <div className="flex items-start gap-2 sm:gap-3 py-3 sm:py-5 px-3 sm:px-6">
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={13} className={accent} />
    </div>
    <div className="min-w-0">
      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-0.5">{label}</p>
      <p className="text-[12px] sm:text-[15px] font-black text-gray-900 leading-tight truncate">{value}</p>
      <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 font-medium hidden sm:block">{sub}</p>
    </div>
  </div>
);

// ── Resume calibration upload card ────────────────────────────────────────────
const ResumeSection = ({ resumeUrl, skills, atsScore, onCalibrated }) => {
  const [uploading, setUploading] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const inputRef = useRef(null);

  const skillBars = skills.length > 0
    ? skills.slice(0, 4).map((s, i) => ({
        label: s.name,
        score: s.level === 'expert' ? 92 : s.level === 'intermediate' ? 76 : 55,
        color: ['#2563EB', '#7C3AED', '#059669', '#D97706'][i] || '#2563EB',
      }))
    : [
        { label: 'Skill Intelligence', score: atsScore || 0, color: '#2563EB' },
      ];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    setUploading(true);
    try {
      const res = await uploadAPI.resume(file);
      const url = res.data?.data?.url;
      setCalibrating(true);
      toast.loading('Calibrating profile...', { id: 'cal' });
      await careerAPI.calibrateResume({ resume_url: url });
      toast.success('Profile calibrated!', { id: 'cal' });
      if (onCalibrated) await onCalibrated();
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.code === 'ECONNABORTED' ? 'Request timed out. Try a smaller PDF.' : null)
        || err.message || 'Calibration failed';
      toast.error(msg, { id: 'cal' });
    } finally {
      setUploading(false);
      setCalibrating(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Resume Calibration</p>
        {resumeUrl && (
          <a href={resumeUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700">
            <Download size={11} /> Download Full Calibration
          </a>
        )}
      </div>

      <div className="space-y-3">
        {skillBars.map((s, i) => (
          <SkillBar key={i} label={s.label} score={s.score} color={s.color} />
        ))}
      </div>

      <label className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed cursor-pointer transition-all text-[11px] font-semibold
        ${uploading || calibrating
          ? 'border-blue-200 bg-blue-50 text-blue-500 pointer-events-none'
          : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'}`}>
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading || calibrating} />
        {uploading || calibrating
          ? <><Loader2 size={13} className="animate-spin shrink-0" /> {uploading ? 'Uploading…' : 'Calibrating AI…'}</>
          : <><UploadCloud size={13} className="shrink-0" /> {resumeUrl ? 'Update Resume PDF' : 'Upload Resume PDF'}</>
        }
      </label>

      {resumeUrl && (
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
          <Check size={11} /> Verified Sync · Auto-sync active
        </div>
      )}
    </div>
  );
};

// ── Connectivity link ─────────────────────────────────────────────────────────
const ConnectLink = ({ icon: Icon, label, value, href }) => (
  <a href={href || '#'} target={href ? '_blank' : undefined} rel="noreferrer"
    className="flex items-center gap-3 py-2.5 group">
    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:border-blue-100 group-hover:bg-blue-50 transition-all">
      <Icon size={13} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-gray-400 font-medium">{label}</p>
      <p className="text-[11px] font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{value}</p>
    </div>
    {href && <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-400 ml-auto transition-colors shrink-0" />}
  </a>
);

// ── Issuer color map ──────────────────────────────────────────────────────────
const ISSUER_COLORS = {
  aws:       { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' },
  google:    { bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  microsoft: { bg: 'bg-sky-50',    border: 'border-sky-100',    text: 'text-sky-700',    dot: 'bg-sky-400' },
  azure:     { bg: 'bg-sky-50',    border: 'border-sky-100',    text: 'text-sky-700',    dot: 'bg-sky-400' },
  pmi:       { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', dot: 'bg-violet-400' },
  pmp:       { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', dot: 'bg-violet-400' },
  cisco:     { bg: 'bg-teal-50',   border: 'border-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-400' },
  oracle:    { bg: 'bg-red-50',    border: 'border-red-100',    text: 'text-red-700',    dot: 'bg-red-400' },
  default:   { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-400' },
};

const getIssuerStyle = (issuer = '') => {
  const key = issuer.toLowerCase();
  for (const k of Object.keys(ISSUER_COLORS)) {
    if (k !== 'default' && key.includes(k)) return ISSUER_COLORS[k];
  }
  return ISSUER_COLORS.default;
};

const EMPTY_FORM = { title: '', issuer: '', issue_date: '', expiry_date: '', credential_id: '', verification_url: '', is_featured: false };

// ── Certifications Section ────────────────────────────────────────────────────
function CertificationsSection() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    careerAPI.listCertifications()
      .then(r => setCerts(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (c) => {
    setForm({
      title: c.title, issuer: c.issuer,
      issue_date: c.issue_date?.split('T')[0] || '',
      expiry_date: c.expiry_date?.split('T')[0] || '',
      credential_id: c.credential_id || '',
      verification_url: c.verification_url || '',
      is_featured: !!c.is_featured,
    });
    setEditingId(c.id);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.issuer.trim()) {
      toast.error('Title and issuer are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const r = await careerAPI.updateCertification(editingId, form);
        setCerts(prev => prev.map(c => c.id === editingId ? r.data.data : c));
        toast.success('Certification updated!');
      } else {
        const r = await careerAPI.addCertification(form);
        setCerts(prev => [r.data.data, ...prev]);
        toast.success('Certification added!');
      }
      closeForm();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await careerAPI.deleteCertification(id);
      setCerts(prev => prev.filter(c => c.id !== id));
      toast.success('Removed.');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const fldCls = 'w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';
  const lblCls = 'block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1';

  const isExpired = (date) => date && new Date(date) < new Date();
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <GraduationCap size={14} className="text-indigo-600" />
          </div>
          <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.08em]">Certifications</h2>
          {certs.length > 0 && (
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100">
              {certs.length}
            </span>
          )}
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm shadow-indigo-200">
          <Plus size={12} /> Add
        </button>
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-b border-gray-100"
          >
            <div className="px-6 py-5 bg-gray-50/70">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-4">
                {editingId ? 'Edit Certification' : 'New Certification'}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={lblCls}>Certification Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. AWS Solutions Architect" className={fldCls} />
                </div>
                <div>
                  <label className={lblCls}>Issuing Organisation *</label>
                  <input value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))}
                    placeholder="e.g. Amazon Web Services" className={fldCls} />
                </div>
                <div>
                  <label className={lblCls}>Issue Date</label>
                  <input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} className={fldCls} />
                </div>
                <div>
                  <label className={lblCls}>Expiry Date</label>
                  <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className={fldCls} />
                </div>
                <div>
                  <label className={lblCls}>Credential ID</label>
                  <input value={form.credential_id} onChange={e => setForm(f => ({ ...f, credential_id: e.target.value }))}
                    placeholder="Optional ID / Code" className={fldCls} />
                </div>
                <div>
                  <label className={lblCls}>Verification URL</label>
                  <input value={form.verification_url} onChange={e => setForm(f => ({ ...f, verification_url: e.target.value }))}
                    placeholder="https://..." className={fldCls} />
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_featured}
                    onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded accent-indigo-600" />
                  <span className="text-[11px] font-semibold text-gray-600">Feature on profile</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black rounded-lg transition-all">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Add Certification'}
                </button>
                <button onClick={closeForm}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold rounded-lg hover:bg-gray-50 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : certs.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <GraduationCap size={22} className="text-indigo-300" />
            </div>
            <p className="text-[12px] font-bold text-gray-400">No certifications added yet</p>
            <p className="text-[11px] text-gray-400 mt-1">Add AWS, Google, PMP or any professional credential</p>
            <button onClick={openAdd}
              className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-black rounded-xl border border-indigo-100 transition-all">
              + Add your first certification
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certs.map(cert => {
              const style = getIssuerStyle(cert.issuer);
              const expired = isExpired(cert.expiry_date);
              return (
                <motion.div
                  key={cert.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative group rounded-xl border p-4 transition-all hover:shadow-sm ${style.bg} ${style.border}`}
                >
                  {/* Featured star */}
                  {cert.is_featured && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
                      <span className="text-[9px]">⭐</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3 pr-6">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white border ${style.border} shadow-sm`}>
                      <BadgeCheck size={15} className={style.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-black truncate ${style.text}`}>{cert.title}</p>
                      <p className="text-[11px] text-gray-500 font-semibold truncate">{cert.issuer}</p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5">
                        {cert.issue_date && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            <CalendarDays size={10} />
                            {formatDate(cert.issue_date)}
                            {cert.expiry_date && <> – {formatDate(cert.expiry_date)}</>}
                          </span>
                        )}
                        {expired && (
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Expired</span>
                        )}
                      </div>

                      {cert.credential_id && (
                        <p className="text-[10px] text-gray-400 mt-1 font-mono truncate">ID: {cert.credential_id}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-white/60">
                    {cert.verification_url && (
                      <a href={cert.verification_url} target="_blank" rel="noreferrer"
                        className={`flex items-center gap-1 text-[10px] font-bold ${style.text} hover:underline`}>
                        <LinkIcon size={10} /> Verify
                      </a>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => openEdit(cert)}
                        className="w-6 h-6 rounded-md bg-white/70 hover:bg-white border border-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                        <Pencil size={10} />
                      </button>
                      <button onClick={() => handleDelete(cert.id)} disabled={deletingId === cert.id}
                        className="w-6 h-6 rounded-md bg-white/70 hover:bg-red-50 border border-white/80 hover:border-red-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                        {deletingId === cert.id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ProfessionalProfile({ user, dashboardData, onEdit, onRefresh, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [certCount, setCertCount] = useState(null);

  useEffect(() => {
    careerAPI.listCertifications()
      .then(r => setCertCount((r.data?.data || []).length))
      .catch(() => {});
  }, []);

  const p  = user?.profile || {};
  const cp = dashboardData?.profile || {};
  const skills = dashboardData?.skillProfile?.skills_detected || [];
  const workHistory = dashboardData?.work_history || cp.work_history || [];
  const resumeUrl = dashboardData?.resume_url || null;
  const atsScore = dashboardData?.atsScore || 0;
  const marketFit = dashboardData?.marketFitScore || 0;

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    current_role: cp.current_role || p.designation || '',
    current_company: cp.current_company || p.current_company || '',
    industry: cp.industry || p.industry || '',
    experience_years: cp.experience_years || p.experience_years || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) await onSave(formData);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      bio: user?.bio || '',
      current_role: cp.current_role || p.designation || '',
      current_company: cp.current_company || p.current_company || '',
      industry: cp.industry || p.industry || '',
      experience_years: cp.experience_years || p.experience_years || 0,
    });
    setIsEditing(false);
  };

  const name = user?.full_name || user?.username || 'Professional';
  const role = cp.current_role || p.designation || 'Senior Professional';
  const company = cp.current_company || p.current_company || '';
  const industry = cp.industry || p.industry || 'Technology';
  const location = [user?.city, user?.state].filter(Boolean).join(', ') || 'India';
  const bio = user?.bio || 'Results-oriented professional with expertise in driving strategic initiatives and leveraging technology to deliver enterprise-scale impact.';
  const professionalId = dashboardData?.professional_id || user?.professional_id;
  const skillTags = skills.slice(0, 5).map(s => s.name).filter(Boolean);

  const skillLevel = marketFit > 80 ? 'Expert' : marketFit > 60 ? 'Advanced' : marketFit > 40 ? 'Intermediate' : 'Developing';
  const percentile = marketFit > 80 ? 'Top 8 Percentile' : marketFit > 60 ? 'Top 25 Percentile' : 'Top 50 Percentile';

  const fallbackHistory = [
    { company: company || 'Syllabrix Platforms', role: role, period: 'Jan 2022 — Present', current: true, bullets: [] },
    { company: 'Professional History', role: 'Verified Industry Experience', period: `${cp.experience_years || p.experience_years || 0} Years`, current: false, bullets: [] },
  ];
  const timeline = workHistory.length > 0 ? workHistory : fallbackHistory;

  const inpCls = 'w-full bg-white/10 border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white py-1 text-sm font-semibold';
  const fldCls = 'w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400';

  return (
    <div className="min-h-screen bg-[#F1F4F8]">

      {/* ── Dark Header Banner ────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#1E40AF] overflow-hidden">
        {/* subtle texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-blue-400/10 rounded-full -mr-24 sm:-mr-48 -mt-24 sm:-mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-32 sm:w-64 h-32 sm:h-64 bg-indigo-400/10 rounded-full -mb-16 sm:-mb-32 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden shadow-2xl">
                {user?.profile_photo_url
                  ? <Image src={user.profile_photo_url} alt={name} width={112} height={112} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-black text-white/60">{name[0]?.toUpperCase()}</span>
                    </div>
                }
              </div>
              {resumeUrl && (
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-400 border-2 border-[#0F172A] flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input name="full_name" value={formData.full_name} onChange={handleChange}
                  placeholder="Full Name" className={`${inpCls} text-2xl font-black mb-1`} />
              ) : (
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-1">{name}</h1>
              )}

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
                {isEditing ? (
                  <div className="flex gap-2 flex-wrap">
                    <input name="current_role" value={formData.current_role} onChange={handleChange}
                      placeholder="Role" className={`${inpCls} w-full sm:w-40`} />
                    <span className="text-white/40 self-end pb-1">in</span>
                    <input name="industry" value={formData.industry} onChange={handleChange}
                      placeholder="Industry" className={`${inpCls} w-full sm:w-36`} />
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-white/80">
                    {role}
                    {industry && <> <span className="text-blue-300">in</span> <span className="text-emerald-300">{industry}</span></>}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] text-white/60 font-medium">
                  <MapPin size={11} /> {location}
                </span>
                {company && (
                  <span className="flex items-center gap-1 text-[11px] text-white/60 font-medium">
                    <Building2 size={11} /> {company}
                  </span>
                )}
                {professionalId && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-white/10 border border-white/20 text-[9px] font-black text-white/80 uppercase tracking-widest rounded-full">
                    <Shield size={9} /> {professionalId}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 self-start md:self-end">
              {isEditing ? (
                <>
                  <button onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-bold rounded-xl transition-all">
                    <X size={13} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-900 text-[11px] font-black rounded-xl hover:bg-blue-50 transition-all shadow-lg">
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                    {saving ? 'Saving…' : 'Save Profile'}
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-900 text-[11px] font-black rounded-xl hover:bg-blue-50 transition-all shadow-lg">
                  <Pencil size={13} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border-x border-b border-gray-100 rounded-b-2xl shadow-sm overflow-x-auto">
          <div className="grid grid-cols-3 divide-x divide-gray-100 min-w-[280px]">
            <StatCol label="Skill Level" value={skillLevel} sub={percentile} icon={Zap} accent="text-indigo-600" />
            <StatCol label="Market Fit" value={`${marketFit}% Match`} sub="Alignment with target roles" icon={TrendingUp} accent="text-blue-600" />
            <StatCol label="Credentials"
              value={certCount === null ? '—' : certCount === 0 ? 'None yet' : `${certCount} Certificate${certCount !== 1 ? 's' : ''}`}
              sub={certCount > 0 ? 'Verified Professional Certifications' : 'Add certifications below'}
              icon={Award} accent="text-emerald-600" />
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">

          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-0">

            {/* Professional Identity */}
            <div className="bg-white rounded-t-2xl border border-gray-100 border-b-0 px-7 pt-7 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.1em]">Professional Identity</h2>
                <Target size={16} className="text-gray-200" />
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Current Role</label>
                      <input name="current_role" value={formData.current_role} onChange={handleChange} className={fldCls} placeholder="e.g. Senior IT Consultant" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Company</label>
                      <input name="current_company" value={formData.current_company} onChange={handleChange} className={fldCls} placeholder="e.g. HCL Tech" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Industry</label>
                      <input name="industry" value={formData.industry} onChange={handleChange} className={fldCls} placeholder="e.g. IT / Software" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Experience (years)</label>
                      <input name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} className={fldCls} placeholder="e.g. 8" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Bio / Summary</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4}
                      className={`${fldCls} resize-none`} placeholder="Professional summary…" />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[13px] text-gray-600 leading-relaxed mb-5 font-medium">{bio}</p>

                  {skillTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skillTags.map(tag => (
                        <span key={tag}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Divider line */}
            <div className="bg-white border-x border-gray-100 border-b-0">
              <div className="mx-7 border-t border-gray-100" />
            </div>

            {/* Experience */}
            <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0 px-7 pt-6 pb-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.1em]">Experience</h2>
                <Briefcase size={16} className="text-gray-200" />
              </div>

              <div className="space-y-6">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                        ${item.current ? 'bg-blue-600' : 'bg-gray-50 border border-gray-100'}`}>
                        <Building2 size={15} className={item.current ? 'text-white' : 'text-gray-400'} />
                      </div>
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-3" />}
                    </div>
                    <div className={`flex-1 min-w-0 ${i < timeline.length - 1 ? 'pb-6' : ''}`}>
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-black text-gray-900 truncate">{item.company || item.title}</h4>
                          <p className="text-[12px] text-gray-500 font-medium">{item.role} · {item.period}</p>
                        </div>
                        {item.current && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100 shrink-0">
                            Present
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed">{item.description}</p>
                      )}
                      {Array.isArray(item.bullets) && item.bullets.length > 0 && (
                        <ul className="mt-2 space-y-1.5">
                          {item.bullets.map((b, bi) => (
                            <li key={bi} className="flex items-start gap-2 text-[12px] text-gray-600">
                              <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}

                {timeline.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <History size={20} className="text-gray-300" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No experience calibrated</p>
                    <p className="text-[10px] text-gray-400 mt-1">Upload your resume to auto-populate</p>
                  </div>
                )}
              </div>
            </div>


            {/* Certifications */}
            <div className="mt-6">
              <CertificationsSection />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Resume Calibration */}
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 shadow-sm">
              <ResumeSection
                resumeUrl={resumeUrl}
                skills={skills}
                atsScore={atsScore}
                onCalibrated={onRefresh}
              />
            </div>

            {/* Connectivity */}
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">Connectivity</p>
              <div className="divide-y divide-gray-50">
                <ConnectLink icon={Mail} label="Email" value={user?.email || '—'} href={`mailto:${user?.email}`} />
                {p.linkedin_url && (
                  <ConnectLink icon={Linkedin} label="LinkedIn" value="View Profile" href={p.linkedin_url} />
                )}
                {p.portfolio_url && (
                  <ConnectLink icon={Globe} label="Portfolio" value={p.portfolio_url} href={p.portfolio_url} />
                )}
                {!p.linkedin_url && !p.portfolio_url && (
                  <div className="py-3 text-[11px] text-gray-400 font-medium">No social links added yet.</div>
                )}
              </div>
            </div>

            {/* AI Intelligence Insight */}
            {(dashboardData?.marketPulse?.length > 0 || marketFit > 0) && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl px-5 py-5 text-white shadow-lg shadow-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={13} className="text-blue-200" />
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-200">AI Intelligence Insight</p>
                </div>
                <p className="text-[12px] font-medium text-white/90 leading-relaxed">
                  {name.split(' ')[0]}&apos;s profile matches high-growth patterns for{' '}
                  <span className="font-bold text-white">{role}</span> roles
                  {industry && <> in <span className="font-bold text-white">{industry}</span></>}.
                  {marketFit > 60
                    ? ' Strategic upskilling in emerging tech domains will unlock Tier-1 opportunities.'
                    : ' Build calibration by uploading your resume to unlock deeper insights.'}
                </p>
                {marketFit > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white/70 rounded-full" style={{ width: `${marketFit}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-white">{marketFit}% fit</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
