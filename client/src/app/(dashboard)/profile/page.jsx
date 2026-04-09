'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api/auth.api';
import { uploadAPI } from '@/lib/api/upload.api';
import {
  Lock, Camera, Pencil, X, Plus, ChevronDown, ChevronUp,
  Loader2, CheckCircle, ExternalLink, Copy, Check,
  User, Briefcase, BookOpen, Target, Award, Building2,
  MapPin, FileText, Upload, Shield, AtSign, Link as LinkIcon,
  GraduationCap, Users, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { careerAPI } from '@/lib/api/career.api';
import ProfessionalProfile from '@/components/profile/ProfessionalProfile';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════════════
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Other'];
const BOARDS       = ['CBSE','ICSE','State Board','IB','IGCSE','Other'];
const CLASSES      = ['1','2','3','4','5','6','7','8','9','10','11','12','UG Year 1','UG Year 2','UG Year 3','UG Year 4','PG','Other'];
const STREAMS      = ['Engineering','Medical / Healthcare','Commerce','Arts / Humanities','Science','Law','Media / Journalism','Design','Agriculture','Other'];
const INDUSTRIES   = ['IT / Software','Finance / Banking','Healthcare','Education','Manufacturing','Retail / E-commerce','Media / Entertainment','Government / PSU','Consulting','Real Estate','Agriculture','Other'];
const GENDERS      = ['Male','Female','Other','Prefer not to say'];
const TEACHER_TYPES = ['freelancer','institute_affiliated','both'];
const INST_TYPES   = ['school','college','university','coaching','online_academy','other'];
const ORG_INDUSTRIES = ['Technology / Software','Manufacturing / Industrial','Banking / Financial Services','Healthcare / Pharma','Retail / E-commerce','Logistics / Supply Chain','Education','Consulting / Professional Services','Government / Public Sector','Other'];
const ORG_SIZES    = ['1-50 (Startup)','51-200 (Small)','201-500 (Mid-market)','501-2000 (Enterprise)','2001-10000 (Large Enterprise)','10000+ (Global Enterprise)'];
const EDU_LEVELS   = ['High School','Graduation','Post Graduation','Doctorate','Other'];

const TYPE_CONFIG = {
  student:             { cover: 'from-blue-500 to-indigo-600',   chip: 'bg-blue-50 text-blue-700 border-blue-200',   label: 'Student',      icon: GraduationCap },
  teacher:             { cover: 'from-teal-500 to-cyan-600',     chip: 'bg-teal-50 text-teal-700 border-teal-200',   label: 'Teacher',      icon: BookOpen },
  professional_learner:{ cover: 'from-purple-500 to-violet-600', chip: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Professional', icon: Briefcase },
  institute:           { cover: 'from-orange-400 to-amber-500',  chip: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Institute',    icon: Building2 },
  organization:        { cover: 'from-rose-500 to-pink-600',     chip: 'bg-rose-50 text-rose-700 border-rose-200',   label: 'Organization', icon: Users },
  parent:              { cover: 'from-green-500 to-emerald-600', chip: 'bg-green-50 text-green-700 border-green-200', label: 'Parent',       icon: User },
};
const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.student;

// ═══════════════════════════════════════════════════════════════════
// PRIMITIVE FORM COMPONENTS
// ═══════════════════════════════════════════════════════════════════
const INP = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';
const LBL = 'block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1';

const Fld = ({ label, children }) => <div><label className={LBL}>{label}</label>{children}</div>;

const TI = ({ label, value, onChange, placeholder, type = 'text', locked }) => (
  <Fld label={label}>
    <div className="relative">
      <input type={type} value={value || ''} readOnly={locked}
        onChange={locked ? undefined : e => onChange(e.target.value)}
        placeholder={placeholder}
        className={INP + (locked ? ' bg-gray-50 text-gray-500 cursor-not-allowed pr-8' : '')} />
      {locked && <Lock size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
    </div>
  </Fld>
);
const SI = ({ label, value, onChange, options, placeholder }) => (
  <Fld label={label}>
    <select value={value || ''} onChange={e => onChange(e.target.value)} className={INP}>
      <option value="">{placeholder || 'Select…'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </Fld>
);
const TA = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <Fld label={label}>
    <textarea value={value || ''} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows} className={INP + ' resize-none'} />
  </Fld>
);

// Tags editor (used in EDIT mode)
const TagsEdit = ({ label, tags, onChange, placeholder }) => {
  const [val, setVal] = useState('');
  const add = () => { const v = val.trim(); if (v && !tags.includes(v)) onChange([...tags, v]); setVal(''); };
  return (
    <Fld label={label}>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-[12px] text-blue-700 font-medium">
            {t}<button type="button" onClick={() => onChange(tags.filter(x => x !== t))}><X size={9} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder} className={INP + ' flex-1'} />
        <button type="button" onClick={add} className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all"><Plus size={13} /></button>
      </div>
    </Fld>
  );
};

// ─── VIEW mode primitives ────────────────────────────────────────
const VF = ({ label, value, placeholder = 'Not set', locked }) => (
  <div>
    <p className={LBL}>{label}</p>
    <div className="flex items-center gap-1.5">
      {locked && <Lock size={10} className="text-gray-400 shrink-0" />}
      <p className="text-[14px] text-gray-800">{value || <span className="text-gray-400 italic text-[13px]">{placeholder}</span>}</p>
    </div>
  </div>
);
const TagsView = ({ tags }) => (
  <div className="flex flex-wrap gap-1.5">
    {!tags?.length ? <span className="text-[13px] text-gray-400 italic">None added</span>
      : tags.map(t => <span key={t} className="px-2.5 py-0.5 bg-gray-100 rounded-full text-[12px] text-gray-600 font-medium">{t}</span>)}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// SECTION CARD — collapsible, with pencil for edit toggle
// ═══════════════════════════════════════════════════════════════════
const SectionCard = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={15} className="text-[#2563EB]" />}
          <span className="font-bold text-[15px] text-gray-900">{title}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 pt-3 border-t border-gray-100">{children}</div>}
    </div>
  );
};

// Edit toggle button row
const EditRow = ({ editing, onEdit, onCancel, onSave, saving }) => (
  <div className={`flex justify-end mb-4 ${editing ? 'gap-2' : ''}`}>
    {!editing
      ? <button type="button" onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all font-medium">
          <Pencil size={11} /> Edit
        </button>
      : <>
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-[12px] text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium">Cancel</button>
          <button type="button" onClick={onSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2563EB] text-white text-[12px] font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : <><CheckCircle size={12} /> Save</>}
          </button>
        </>}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// SIDEBAR CARDS
// ═══════════════════════════════════════════════════════════════════
const SyllabrixIdCard = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(user.syllabrix_id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={14} className="text-[#2563EB]" />
        <span className="font-bold text-[14px] text-gray-900">Syllabrix ID</span>
      </div>
      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Lock size={11} className="text-blue-400 shrink-0" />
          <span className="font-bold text-[13px] text-blue-700 tracking-wider">{user.syllabrix_id || '—'}</span>
        </div>
        <button type="button" onClick={copy} className="text-blue-500 hover:text-blue-700 transition-colors ml-2">
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-2 text-center">Your permanent unique identifier</p>
    </div>
  );
};

const AccountInfoCard = ({ user }) => {
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
  const cfg = getConfig(user.user_type);
  const TypeIcon = cfg.icon;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <AtSign size={14} className="text-[#2563EB]" />
        <span className="font-bold text-[14px] text-gray-900">Account</span>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Account Type</span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.chip}`}>
            <TypeIcon size={9} />{cfg.label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Email</span>
          <div className="flex items-center gap-1">
            {user.email_verified_at && <CheckCircle size={11} className="text-green-500" />}
            <span className="text-[12px] text-gray-700 truncate max-w-[140px]">{user.email}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Member Since</span>
          <span className="text-[12px] font-semibold text-gray-700">{memberSince}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Status</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />Active
          </span>
        </div>
      </div>
    </div>
  );
};

const ResumeCard = ({ resumeUrl, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const handleFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('PDF must be under 5MB'); return; }
    if (file.type !== 'application/pdf') { toast.error('Only PDF files'); return; }
    setUploading(true);
    try {
      const res = await uploadAPI.resume(file);
      onUploaded(res.data?.data?.url);
      toast.success('Resume uploaded!');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText size={14} className="text-[#2563EB]" />
        <span className="font-bold text-[14px] text-gray-900">Resume</span>
      </div>
      {resumeUrl ? (
        <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl mb-3">
          <CheckCircle size={13} className="text-green-600 shrink-0" />
          <span className="text-[12px] text-green-700 flex-1 font-medium">Resume on file</span>
          <a href={resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-semibold">
            View <ExternalLink size={10} />
          </a>
        </div>
      ) : (
        <p className="text-[12px] text-gray-400 italic mb-3">No resume uploaded yet.</p>
      )}
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
        className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-blue-200 rounded-xl text-[12px] text-blue-600 font-semibold hover:bg-blue-50 transition-all disabled:opacity-50">
        {uploading ? <><Loader2 size={13} className="animate-spin" />Uploading…</> : <><Upload size={13} />{resumeUrl ? 'Replace PDF' : 'Upload PDF (max 5MB)'}</>}
      </button>
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
    </div>
  );
};

const SkillsCard = ({ tags, label = 'Skills' }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
    <div className="flex items-center gap-2 mb-3">
      <Star size={14} className="text-[#2563EB]" />
      <span className="font-bold text-[14px] text-gray-900">{label}</span>
    </div>
    <TagsView tags={tags} />
  </div>
);

const LinkCard = ({ href, label, icon: Icon = LinkIcon }) => {
  if (!href) return null;
  const display = href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  return (
    <a href={href.startsWith('http') ? href : `https://${href}`} target="_blank" rel="noreferrer"
      className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 hover:bg-gray-50 transition-colors group">
      <Icon size={15} className="text-[#2563EB] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">{label}</p>
        <p className="text-[13px] text-gray-700 font-semibold truncate group-hover:text-blue-600 transition-colors">{display}</p>
      </div>
      <ExternalLink size={12} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
    </a>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PERSONA INTELLIGENCE HEADER
// ═══════════════════════════════════════════════════════════════════
const PersonaIntelligenceHeader = ({ user }) => {
  const p = user?.profile || {};
  const isStudent = user.user_type === 'student';
  const isPro = user.user_type === 'professional_learner';

  if (!isStudent && !isPro) return null;

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {isStudent ? (
        <>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-blue-200" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Total XP</span>
            </div>
            <p className="text-xl font-black">2,450</p>
            <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-white w-3/4" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={14} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Streak</span>
            </div>
            <p className="text-xl font-black text-gray-800">12 Days</p>
            <p className="text-[9px] text-orange-500 font-bold mt-1">Personal Best: 15</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Award size={14} className="text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Badges</span>
            </div>
            <p className="text-xl font-black text-gray-800">8 Earned</p>
            <p className="text-[9px] text-indigo-500 font-bold mt-1">3 Rare Unlocked</p>
          </div>
        </>
      ) : (
        <>
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skill Level</span>
            </div>
            <p className="text-xl font-black">Expert</p>
            <p className="text-[9px] text-emerald-400 font-bold mt-1">92nd Percentile</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Star size={14} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Certificates</span>
            </div>
            <p className="text-xl font-black text-gray-800">4 Verified</p>
            <p className="text-[9px] text-indigo-500 font-bold mt-1">Top Endorsed: Python</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Roadmap</span>
            </div>
            <p className="text-xl font-black text-gray-800">65% Done</p>
            <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
               <div className="h-full bg-rose-500 w-[65%]" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// QUICK STATS BAR
// ═══════════════════════════════════════════════════════════════════
const QuickStatsBar = ({ user }) => {
  const p = user?.profile || {};
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';

  const statsMap = {
    student: [
      { label: 'Class', value: p.class_name || '—' },
      { label: 'Board', value: p.board || '—' },
      { label: 'School', value: p.school_name || p.college_name || '—' },
      { label: 'Member Since', value: memberSince },
    ],
    teacher: [
      { label: 'Experience', value: p.experience_years ? `${p.experience_years} yrs` : '—' },
      { label: 'Specialization', value: p.subject_primary || '—' },
      { label: 'Institution', value: p.institute_name || '—' },
      { label: 'Member Since', value: memberSince },
    ],
    professional_learner: [
      { label: 'Company', value: p.current_company || '—' },
      { label: 'Designation', value: p.designation || '—' },
      { label: 'Experience', value: p.experience_years ? `${p.experience_years} yrs` : '—' },
      { label: 'Industry', value: p.industry || '—' },
    ],
    institute: [
      { label: 'Type', value: p.institute_type ? p.institute_type.charAt(0).toUpperCase() + p.institute_type.slice(1) : '—' },
      { label: 'Board', value: (parseJson(p.boards_offered, []))[0] || '—' },
      { label: 'Est. Year', value: p.established_year || '—' },
      { label: 'Students', value: p.student_count ? p.student_count.toLocaleString() : '—' },
    ],
    organization: [
      { label: 'Industry', value: p.industry || '—' },
      { label: 'Size', value: p.company_size || '—' },
      { label: 'Founded', value: p.founded_year || '—' },
      { label: 'Member Since', value: memberSince },
    ],
    parent: [
      { label: 'Relationship', value: p.relationship || '—' },
      { label: 'Occupation', value: p.occupation || '—' },
      { label: 'Member Since', value: memberSince },
    ],
  };
  const stats = statsMap[user?.user_type] || statsMap.student;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-6 py-3 mb-5">
      {/* Mobile: 2-col grid. sm+: single horizontal row */}
      <div className="grid grid-cols-2 sm:flex sm:items-stretch sm:divide-x sm:divide-gray-200 gap-y-3 gap-x-0">
        {stats.map((s, i) => (
          <div key={i} className="sm:px-5 sm:first:pl-0 sm:last:pr-0 px-3 first:pl-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{s.label}</p>
            <p className="text-[13px] sm:text-[14px] font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION BUILDER — reusable hook-like function
// ═══════════════════════════════════════════════════════════════════
function useSection(init) {
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEditing = edit !== null;
  const start = () => setEdit(typeof init === 'function' ? init() : { ...init });
  const cancel = () => setEdit(null);
  return { edit, setEdit, saving, setSaving, isEditing, start, cancel };
}

// ═══════════════════════════════════════════════════════════════════
// IDENTITY SECTION — username + display name, 60-day lock
// ═══════════════════════════════════════════════════════════════════
const canChange = (changedAt) => {
  if (!changedAt) return { allowed: true, nextDate: null };
  const next = new Date(changedAt);
  next.setDate(next.getDate() + 60);
  const allowed = new Date() >= next;
  return { allowed, nextDate: next.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) };
};

function IdentitySection({ user, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [usernameError, setUsernameError] = useState('');
  const debounceRef = useRef(null);

  const nameInfo = canChange(user?.full_name_changed_at);
  const userInfo = canChange(user?.username_changed_at);

  const startEdit = () => {
    setDisplayName(user?.full_name || '');
    setUsername(user?.username || '');
    setUsernameStatus(null);
    setUsernameError('');
    setEditing(true);
  };
  const cancelEdit = () => { setEditing(false); setUsernameStatus(null); setUsernameError(''); };

  // Debounced username availability check
  useEffect(() => {
    if (!editing) return;
    const val = username.trim();
    if (val === user?.username) { setUsernameStatus(null); setUsernameError(''); return; }
    if (!val || !/^[a-z0-9_.]{3,30}$/.test(val)) {
      setUsernameStatus(val ? 'invalid' : null);
      setUsernameError(val ? '3–30 chars: lowercase, numbers, _ and . only' : '');
      return;
    }
    setUsernameStatus('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // No dedicated check endpoint — optimistic "available" indicator;
      // actual uniqueness is enforced on save with a clear error message.
      setUsernameStatus('available');
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [username, user?.username, editing]);

  const handleSave = async () => {
    const updates = {};
    const nameVal = displayName.trim();
    const userVal = username.trim();
    if (nameInfo.allowed && nameVal && nameVal !== user?.full_name) updates.full_name = nameVal;
    if (userInfo.allowed && userVal && userVal !== user?.username) updates.username = userVal;
    if (Object.keys(updates).length === 0) { cancelEdit(); return; }

    setSaving(true);
    try {
      await authAPI.updateIdentity(updates);
      await onSaved();
      setEditing(false);
      toast.success('Identity updated!');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Update failed.';
      if (msg.toLowerCase().includes('taken')) {
        setUsernameStatus('taken');
        setUsernameError('Username already taken');
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const LOCK_BADGE = (nextDate) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-semibold text-amber-700">
      <Lock size={9} /> Locked until {nextDate}
    </span>
  );
  const OK_BADGE = (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-[10px] font-semibold text-green-700">
      <CheckCircle size={9} /> Editable
    </span>
  );

  return (
    <SectionCard title="Identity" icon={AtSign} defaultOpen>
      <EditRow editing={editing} onEdit={startEdit} onCancel={cancelEdit} onSave={handleSave} saving={saving} />

      {!editing ? (
        <div className="space-y-4">
          <div>
            <p className={LBL}>Display Name</p>
            <p className="text-[14px] font-semibold text-gray-800 mb-1">{user?.full_name}</p>
            {nameInfo.allowed ? OK_BADGE : LOCK_BADGE(nameInfo.nextDate)}
          </div>
          <div>
            <p className={LBL}>Username</p>
            <p className="text-[14px] font-mono text-gray-800 mb-1">@{user?.username}</p>
            {userInfo.allowed ? OK_BADGE : LOCK_BADGE(userInfo.nextDate)}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className={LBL}>Display Name</label>
            {nameInfo.allowed ? (
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                maxLength={100}
                className={INP}
                placeholder="Your full name"
              />
            ) : (
              <div className="relative">
                <input type="text" value={user?.full_name} readOnly
                  className={INP + ' bg-gray-50 text-gray-500 cursor-not-allowed pr-8'} />
                <Lock size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <div className="mt-1">{LOCK_BADGE(nameInfo.nextDate)}</div>
              </div>
            )}
          </div>

          {/* Username */}
          <div>
            <label className={LBL}>Username</label>
            {userInfo.allowed ? (
              <>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[13px] text-gray-400 font-mono select-none">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    maxLength={30}
                    className={INP + ' pl-7 pr-8 font-mono'}
                    placeholder="your_username"
                  />
                  {usernameStatus === 'checking' && <Loader2 size={13} className="absolute right-3 text-gray-400 animate-spin" />}
                  {usernameStatus === 'available' && <CheckCircle size={13} className="absolute right-3 text-green-500" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X size={13} className="absolute right-3 text-red-400" />}
                </div>
                {usernameError ? (
                  <p className="text-[11px] text-red-500 mt-1">{usernameError}</p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">3–30 chars, lowercase, numbers, _ and . only</p>
                )}
              </>
            ) : (
              <div>
                <div className="relative">
                  <input type="text" value={`@${user?.username}`} readOnly
                    className={INP + ' bg-gray-50 text-gray-500 cursor-not-allowed font-mono pr-8'} />
                  <Lock size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="mt-1">{LOCK_BADGE(userInfo.nextDate)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STUDENT SECTIONS
// ═══════════════════════════════════════════════════════════════════
function StudentSections({ user, saveSection }) {
  const p = user?.profile || {};

  // Basic Info
  const bi = useSection(() => ({ phone: user?.phone||'', gender: user?.gender||'', city: user?.city||'', state: user?.state||'' }));
  // Academic
  const ac = useSection(() => ({ school_name: p.school_name||'', class_name: p.class_name||'', board: p.board||'', college_name: p.college_name||'', subject_stream: p.subject_stream||'' }));
  // Career & Goals
  const cg = useSection(() => ({ ambition: p.ambition||p.career_interest||'', future_vision: p.future_vision||'' }));
  // About
  const ab = useSection(() => ({ bio: user?.bio||'' }));

  const save = async (section, data) => {
    section.setSaving(true);
    try { await saveSection(data); section.cancel(); }
    catch (e) { /* error already toasted in saveSection */ }
    finally { section.setSaving(false); }
  };

  return (<>
    <SectionCard title="Basic Info" icon={User} defaultOpen>
      <EditRow editing={bi.isEditing} onEdit={bi.start} onCancel={bi.cancel} onSave={() => save(bi, bi.edit)} saving={bi.saving} />
      {!bi.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Date of Birth" value={user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('en-IN') : ''} locked />
          <VF label="Phone" value={user?.phone} placeholder="Not provided" />
          <VF label="Gender" value={user?.gender} />
          <VF label="City" value={user?.city} />
          <VF label="State" value={user?.state} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TI label="Date of Birth" value={user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('en-IN') : ''} locked />
          <TI label="Phone" value={bi.edit.phone} onChange={v => bi.setEdit(e => ({...e, phone: v}))} placeholder="+91 XXXXX XXXXX" />
          <SI label="Gender" value={bi.edit.gender} onChange={v => bi.setEdit(e => ({...e, gender: v}))} options={GENDERS} />
          <TI label="City" value={bi.edit.city} onChange={v => bi.setEdit(e => ({...e, city: v}))} placeholder="Your city" />
          <SI label="State" value={bi.edit.state} onChange={v => bi.setEdit(e => ({...e, state: v}))} options={STATES} />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Academic Info" icon={GraduationCap}>
      <EditRow editing={ac.isEditing} onEdit={ac.start} onCancel={ac.cancel} onSave={() => save(ac, ac.edit)} saving={ac.saving} />
      {!ac.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="School / College" value={p.school_name || p.college_name} />
          <VF label="Class / Year" value={p.class_name} />
          <VF label="Board" value={p.board} />
          <VF label="Stream" value={p.subject_stream} />
          {p.education_level && <VF label="Education Type" value={p.education_level} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TI label="School Name" value={ac.edit.school_name} onChange={v => ac.setEdit(e => ({...e, school_name: v}))} placeholder="Your school" />
          <TI label="College / Institute" value={ac.edit.college_name} onChange={v => ac.setEdit(e => ({...e, college_name: v}))} placeholder="Your college" />
          <SI label="Class / Grade" value={ac.edit.class_name} onChange={v => ac.setEdit(e => ({...e, class_name: v}))} options={CLASSES} />
          <SI label="Board" value={ac.edit.board} onChange={v => ac.setEdit(e => ({...e, board: v}))} options={BOARDS} />
          <div className="col-span-2">
            <SI label="Subject Stream" value={ac.edit.subject_stream} onChange={v => ac.setEdit(e => ({...e, subject_stream: v}))} options={STREAMS} />
          </div>
        </div>
      )}
    </SectionCard>

    <SectionCard title="Career & Goals" icon={Target}>
      <EditRow editing={cg.isEditing} onEdit={cg.start} onCancel={cg.cancel} onSave={() => save(cg, cg.edit)} saving={cg.saving} />
      {!cg.isEditing ? (
        <div className="space-y-4">
          <VF label="Ambition / Career Interest" value={p.ambition || p.career_interest} placeholder="Not set" />
          <VF label="I See My Future As…" value={p.future_vision} placeholder="Not set" />
        </div>
      ) : (
        <div className="space-y-3">
          <TA label="Ambition / Career Interest" value={cg.edit.ambition} onChange={v => cg.setEdit(e => ({...e, ambition: v}))} placeholder="What career are you aiming for?" rows={2} />
          <TA label="I See My Future As…" value={cg.edit.future_vision} onChange={v => cg.setEdit(e => ({...e, future_vision: v}))} placeholder="Describe your dream" rows={2} />
        </div>
      )}
    </SectionCard>

    <SectionCard title="About Me" icon={BookOpen}>
      <EditRow editing={ab.isEditing} onEdit={ab.start} onCancel={ab.cancel} onSave={() => save(ab, ab.edit)} saving={ab.saving} />
      {!ab.isEditing
        ? <p className="text-[14px] text-gray-700 leading-relaxed">{user?.bio || <span className="text-gray-400 italic">Add a bio to introduce yourself</span>}</p>
        : <TA label="Bio" value={ab.edit.bio} onChange={v => ab.setEdit(e => ({...e, bio: v}))} placeholder="Tell others about yourself…" rows={4} />}
    </SectionCard>
  </>);
}

// ═══════════════════════════════════════════════════════════════════
// TEACHER SECTIONS
// ═══════════════════════════════════════════════════════════════════
function TeacherSections({ user, saveSection }) {
  const p = user?.profile || {};

  const bi = useSection(() => ({ phone: user?.phone||'', gender: user?.gender||'', city: user?.city||'', state: user?.state||'' }));
  const pr = useSection(() => ({
    subject_primary: p.subject_primary||'', experience_years: p.experience_years||'',
    institute_name: p.institute_name||'',
    qualifications: parseJson(p.qualifications, []), teacher_type: p.teacher_type||'freelancer'
  }));
  const td = useSection(() => ({
    has_own_business: p.has_own_business||false, business_name: p.business_name||''
  }));
  const ab = useSection(() => ({ bio: user?.bio||'' }));

  const save = async (section, data) => {
    section.setSaving(true);
    try { await saveSection(data); section.cancel(); }
    catch (e) { /* error already toasted in saveSection */ }
    finally { section.setSaving(false); }
  };

  return (<>
    <SectionCard title="Basic Info" icon={User} defaultOpen>
      <EditRow editing={bi.isEditing} onEdit={bi.start} onCancel={bi.cancel} onSave={() => save(bi, bi.edit)} saving={bi.saving} />
      {!bi.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Phone" value={user?.phone} />
          <VF label="Gender" value={user?.gender} />
          <VF label="City" value={user?.city} />
          <VF label="State" value={user?.state} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TI label="Phone" value={bi.edit.phone} onChange={v => bi.setEdit(e => ({...e, phone: v}))} placeholder="+91 XXXXX XXXXX" />
          <SI label="Gender" value={bi.edit.gender} onChange={v => bi.setEdit(e => ({...e, gender: v}))} options={GENDERS} />
          <TI label="City" value={bi.edit.city} onChange={v => bi.setEdit(e => ({...e, city: v}))} placeholder="City" />
          <SI label="State" value={bi.edit.state} onChange={v => bi.setEdit(e => ({...e, state: v}))} options={STATES} />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Professional Info" icon={Briefcase}>
      <EditRow editing={pr.isEditing} onEdit={pr.start} onCancel={pr.cancel} onSave={() => save(pr, pr.edit)} saving={pr.saving} />
      {!pr.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Subject Specialization" value={p.subject_primary} />
          <VF label="Experience" value={p.experience_years ? `${p.experience_years} years` : ''} />
          <VF label="Current Institution" value={p.institute_name} />
          <VF label="Type" value={p.teacher_type?.replace('_', ' ')} />
          <div className="col-span-2"><p className={LBL}>Qualifications</p><TagsView tags={parseJson(p.qualifications, [])} /></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TI label="Subject Specialization" value={pr.edit.subject_primary} onChange={v => pr.setEdit(e => ({...e, subject_primary: v}))} placeholder="e.g. Mathematics" />
            <TI label="Years of Experience" value={String(pr.edit.experience_years||'')} onChange={v => pr.setEdit(e => ({...e, experience_years: v}))} type="number" placeholder="e.g. 8" />
            <div className="col-span-2"><TI label="Current Institution" value={pr.edit.institute_name} onChange={v => pr.setEdit(e => ({...e, institute_name: v}))} placeholder="School / College / Academy" /></div>
          </div>
          <Fld label="Teacher Type">
            <div className="flex gap-2">
              {TEACHER_TYPES.map(t => (
                <button key={t} type="button" onClick={() => pr.setEdit(e => ({...e, teacher_type: t}))}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border-2 transition-all capitalize ${pr.edit.teacher_type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </Fld>
          <TagsEdit label="Qualifications" tags={pr.edit.qualifications} onChange={v => pr.setEdit(e => ({...e, qualifications: v}))} placeholder="e.g. M.Sc, B.Ed…" />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Teaching Details" icon={Award}>
      <EditRow editing={td.isEditing} onEdit={td.start} onCancel={td.cancel} onSave={() => save(td, td.edit)} saving={td.saving} />
      {!td.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Runs Own Business" value={p.has_own_business ? 'Yes' : (p.has_own_business === false ? 'No' : undefined)} />
          <VF label="Business Name" value={p.business_name} />
        </div>
      ) : (
        <div className="space-y-3">
          <Fld label="Runs Own Teaching Business">
            <div className="flex gap-3">
              {['Yes','No'].map(v => (
                <button key={v} type="button" onClick={() => td.setEdit(e => ({...e, has_own_business: v === 'Yes'}))}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border-2 transition-all ${(td.edit.has_own_business ? 'Yes' : 'No') === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
                  {v}
                </button>
              ))}
            </div>
          </Fld>
          <TI label="Business Name (if any)" value={td.edit.business_name} onChange={v => td.setEdit(e => ({...e, business_name: v}))} placeholder="Your academy / tuition center" />
        </div>
      )}
    </SectionCard>

    <SectionCard title="About" icon={BookOpen}>
      <EditRow editing={ab.isEditing} onEdit={ab.start} onCancel={ab.cancel} onSave={() => save(ab, ab.edit)} saving={ab.saving} />
      {!ab.isEditing
        ? <p className="text-[14px] text-gray-700 leading-relaxed">{user?.bio || <span className="text-gray-400 italic">Add a bio about your teaching experience and approach</span>}</p>
        : <TA label="Bio" value={ab.edit.bio} onChange={v => ab.setEdit(e => ({...e, bio: v}))} placeholder="Tell students about your teaching style…" rows={4} />}
    </SectionCard>
  </>);
}

// ═══════════════════════════════════════════════════════════════════
// PROFESSIONAL LEARNER SECTIONS
// ═══════════════════════════════════════════════════════════════════
function ProfessionalSections({ user, saveSection }) {
  const p = user?.profile || {};

  const bi = useSection(() => ({ phone: user?.phone||'', gender: user?.gender||'', city: user?.city||'', state: user?.state||'' }));
  const wi = useSection(() => ({
    current_company: p.current_company||'', designation: p.designation||'',
    experience_years: p.experience_years||'', industry: p.industry||'',
    education_level: p.education_level||''
  }));
  const sk = useSection(() => ({ skills: parseJson(p.skills, []) }));
  const le = useSection(() => ({
    learning_goals: parseJson(p.learning_goals, []),
    linkedin_url: p.linkedin_url||'', how_use_platform: p.how_use_platform||''
  }));
  const ab = useSection(() => ({ bio: user?.bio||'' }));

  const save = async (section, data) => {
    section.setSaving(true);
    try { await saveSection(data); section.cancel(); }
    catch (e) { /* error already toasted in saveSection */ }
    finally { section.setSaving(false); }
  };

  return (<>
    <SectionCard title="Basic Info" icon={User} defaultOpen>
      <EditRow editing={bi.isEditing} onEdit={bi.start} onCancel={bi.cancel} onSave={() => save(bi, bi.edit)} saving={bi.saving} />
      {!bi.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Phone" value={user?.phone} />
          <VF label="Gender" value={user?.gender} />
          <VF label="City" value={user?.city} />
          <VF label="State" value={user?.state} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TI label="Phone" value={bi.edit.phone} onChange={v => bi.setEdit(e => ({...e, phone: v}))} placeholder="+91 XXXXX XXXXX" />
          <SI label="Gender" value={bi.edit.gender} onChange={v => bi.setEdit(e => ({...e, gender: v}))} options={GENDERS} />
          <TI label="City" value={bi.edit.city} onChange={v => bi.setEdit(e => ({...e, city: v}))} placeholder="Your city" />
          <SI label="State" value={bi.edit.state} onChange={v => bi.setEdit(e => ({...e, state: v}))} options={STATES} />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Work Info" icon={Briefcase}>
      <EditRow editing={wi.isEditing} onEdit={wi.start} onCancel={wi.cancel} onSave={() => save(wi, wi.edit)} saving={wi.saving} />
      {!wi.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Current Company" value={p.current_company} />
          <VF label="Designation" value={p.designation} />
          <VF label="Experience" value={p.experience_years ? `${p.experience_years} yrs` : ''} />
          <VF label="Industry" value={p.industry} />
          <VF label="Education Level" value={p.education_level} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TI label="Current Company" value={wi.edit.current_company} onChange={v => wi.setEdit(e => ({...e, current_company: v}))} placeholder="Where do you work?" />
          <TI label="Designation / Role" value={wi.edit.designation} onChange={v => wi.setEdit(e => ({...e, designation: v}))} placeholder="e.g. Product Manager" />
          <TI label="Years of Experience" value={String(wi.edit.experience_years||'')} onChange={v => wi.setEdit(e => ({...e, experience_years: v}))} type="number" />
          <SI label="Industry" value={wi.edit.industry} onChange={v => wi.setEdit(e => ({...e, industry: v}))} options={INDUSTRIES} />
          <SI label="Highest Education" value={wi.edit.education_level} onChange={v => wi.setEdit(e => ({...e, education_level: v}))} options={EDU_LEVELS} />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Skills" icon={Star}>
      <EditRow editing={sk.isEditing} onEdit={sk.start} onCancel={sk.cancel} onSave={() => save(sk, sk.edit)} saving={sk.saving} />
      {!sk.isEditing
        ? <TagsView tags={parseJson(p.skills, [])} />
        : <TagsEdit label="Skills" tags={sk.edit.skills} onChange={v => sk.setEdit(e => ({...e, skills: v}))} placeholder="Add a skill (press Enter)…" />}
    </SectionCard>

    <SectionCard title="Learning & Links" icon={Target}>
      <EditRow editing={le.isEditing} onEdit={le.start} onCancel={le.cancel} onSave={() => save(le, le.edit)} saving={le.saving} />
      {!le.isEditing ? (
        <div className="space-y-4">
          <div><p className={LBL}>Learning Goals</p><TagsView tags={parseJson(p.learning_goals, [])} /></div>
          <VF label="LinkedIn URL" value={p.linkedin_url} placeholder="Not provided" />
          <VF label="How I Use This Platform" value={p.how_use_platform} />
        </div>
      ) : (
        <div className="space-y-3">
          <TagsEdit label="Learning Goals" tags={le.edit.learning_goals} onChange={v => le.setEdit(e => ({...e, learning_goals: v}))} placeholder="Add a goal…" />
          <TI label="LinkedIn URL" value={le.edit.linkedin_url} onChange={v => le.setEdit(e => ({...e, linkedin_url: v}))} placeholder="https://linkedin.com/in/…" />
          <TA label="How I Use This Platform" value={le.edit.how_use_platform} onChange={v => le.setEdit(e => ({...e, how_use_platform: v}))} placeholder="What are you here to learn or achieve?" rows={2} />
        </div>
      )}
    </SectionCard>

    <SectionCard title="About" icon={BookOpen}>
      <EditRow editing={ab.isEditing} onEdit={ab.start} onCancel={ab.cancel} onSave={() => save(ab, ab.edit)} saving={ab.saving} />
      {!ab.isEditing
        ? <p className="text-[14px] text-gray-700 leading-relaxed">{user?.bio || <span className="text-gray-400 italic">Add a professional summary</span>}</p>
        : <TA label="Bio / Professional Summary" value={ab.edit.bio} onChange={v => ab.setEdit(e => ({...e, bio: v}))} placeholder="Summarize your career and what you're working toward…" rows={4} />}
    </SectionCard>
  </>);
}

// ═══════════════════════════════════════════════════════════════════
// INSTITUTE SECTIONS
// ═══════════════════════════════════════════════════════════════════
function InstituteSections({ user, saveSection }) {
  const p = user?.profile || {};

  const bi = useSection(() => ({
    name: p.name||'', phone: user?.phone||'',
    city: p.city||user?.city||'', state: p.state||user?.state||'', website: p.website||''
  }));
  const de = useSection(() => ({
    institute_type: p.institute_type||'',
    boards_offered: parseJson(p.boards_offered, []),
    established_year: p.established_year||'',
    student_count: p.student_count||'', teacher_count: p.teacher_count||'',
    udise_code: p.udise_code||'', registration_number: p.registration_number||''
  }));
  const ph = useSection(() => ({
    platform_handler_name: p.platform_handler_name||'',
    platform_handler_email: p.platform_handler_email||''
  }));
  const ab = useSection(() => ({ about: p.about||'' }));

  const save = async (section, data) => {
    section.setSaving(true);
    try { await saveSection(data); section.cancel(); }
    catch (e) { /* error already toasted in saveSection */ }
    finally { section.setSaving(false); }
  };

  return (<>
    <SectionCard title="Basic Info" icon={Building2} defaultOpen>
      <EditRow editing={bi.isEditing} onEdit={bi.start} onCancel={bi.cancel} onSave={() => save(bi, { phone: bi.edit.phone, name: bi.edit.name, city: bi.edit.city, state: bi.edit.state, website: bi.edit.website })} saving={bi.saving} />
      {!bi.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Institute Name" value={p.name} />
          <VF label="Contact Phone" value={user?.phone} />
          <VF label="City" value={p.city || user?.city} />
          <VF label="State" value={p.state || user?.state} />
          <VF label="Website" value={p.website} placeholder="Not provided" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="col-span-2"><TI label="Institute Name" value={bi.edit.name} onChange={v => bi.setEdit(e => ({...e, name: v}))} placeholder="Official name" /></div>
          <TI label="Contact Phone" value={bi.edit.phone} onChange={v => bi.setEdit(e => ({...e, phone: v}))} placeholder="+91 XXXXX XXXXX" />
          <TI label="Website" value={bi.edit.website} onChange={v => bi.setEdit(e => ({...e, website: v}))} placeholder="https://…" />
          <TI label="City" value={bi.edit.city} onChange={v => bi.setEdit(e => ({...e, city: v}))} placeholder="City" />
          <SI label="State" value={bi.edit.state} onChange={v => bi.setEdit(e => ({...e, state: v}))} options={STATES} />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Institute Details" icon={Award}>
      <EditRow editing={de.isEditing} onEdit={de.start} onCancel={de.cancel} onSave={() => save(de, de.edit)} saving={de.saving} />
      {!de.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Institute Type" value={p.institute_type} />
          <VF label="Est. Year" value={p.established_year} />
          <VF label="Total Students" value={p.student_count} />
          <VF label="Total Teachers" value={p.teacher_count} />
          <VF label="UDISE Code" value={p.udise_code} />
          <VF label="Registration No." value={p.registration_number} />
          <div className="col-span-2"><p className={LBL}>Boards / Syllabi</p><TagsView tags={parseJson(p.boards_offered, [])} /></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SI label="Institute Type" value={de.edit.institute_type} onChange={v => de.setEdit(e => ({...e, institute_type: v}))} options={INST_TYPES} />
            <TI label="Est. Year" value={String(de.edit.established_year||'')} onChange={v => de.setEdit(e => ({...e, established_year: v}))} type="number" placeholder="e.g. 1995" />
            <TI label="Total Students" value={String(de.edit.student_count||'')} onChange={v => de.setEdit(e => ({...e, student_count: v}))} type="number" />
            <TI label="Total Teachers" value={String(de.edit.teacher_count||'')} onChange={v => de.setEdit(e => ({...e, teacher_count: v}))} type="number" />
            <TI label="UDISE Code" value={de.edit.udise_code} onChange={v => de.setEdit(e => ({...e, udise_code: v}))} placeholder="Optional" />
            <TI label="Registration No." value={de.edit.registration_number} onChange={v => de.setEdit(e => ({...e, registration_number: v}))} placeholder="Optional" />
          </div>
          <TagsEdit label="Boards / Syllabi Offered" tags={de.edit.boards_offered} onChange={v => de.setEdit(e => ({...e, boards_offered: v}))} placeholder="Add board (e.g. CBSE)…" />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Platform Handler" icon={User}>
      <EditRow editing={ph.isEditing} onEdit={ph.start} onCancel={ph.cancel} onSave={() => save(ph, ph.edit)} saving={ph.saving} />
      {!ph.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Handler Name" value={p.platform_handler_name} />
          <VF label="Handler Email" value={p.platform_handler_email} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TI label="Handler Name" value={ph.edit.platform_handler_name} onChange={v => ph.setEdit(e => ({...e, platform_handler_name: v}))} placeholder="Who manages this account?" />
          <TI label="Handler Email" value={ph.edit.platform_handler_email} onChange={v => ph.setEdit(e => ({...e, platform_handler_email: v}))} placeholder="handler@institute.edu" type="email" />
        </div>
      )}
    </SectionCard>

    <SectionCard title="About" icon={BookOpen}>
      <EditRow editing={ab.isEditing} onEdit={ab.start} onCancel={ab.cancel} onSave={() => save(ab, ab.edit)} saving={ab.saving} />
      {!ab.isEditing
        ? <p className="text-[14px] text-gray-700 leading-relaxed">{p.about || <span className="text-gray-400 italic">Add a description of your institute, its mission and achievements</span>}</p>
        : <TA label="About the Institute" value={ab.edit.about} onChange={v => ab.setEdit(e => ({...e, about: v}))} placeholder="Your institute's mission, achievements, culture…" rows={4} />}
    </SectionCard>
  </>);
}

// ═══════════════════════════════════════════════════════════════════
// ORGANIZATION SECTIONS
// ═══════════════════════════════════════════════════════════════════
function OrganizationSections({ user, saveSection }) {
  const p = user?.profile || {};

  const bi = useSection(() => ({ phone: user?.phone||'', city: user?.city||'', state: user?.state||'' }));
  const ci = useSection(() => ({
    official_company_name: p.official_company_name||'', brand_display_name: p.brand_display_name||'',
    industry: p.industry||'', company_size: p.company_size||'',
    founded_year: p.founded_year||'', website: p.website||'', linkedin_url: p.linkedin_url||''
  }));
  const ab = useSection(() => ({ about: p.about||'', how_use_platform: p.how_use_platform||'' }));

  const save = async (section, data) => {
    section.setSaving(true);
    try { await saveSection(data); section.cancel(); }
    catch (e) { /* error already toasted in saveSection */ }
    finally { section.setSaving(false); }
  };

  return (<>
    <SectionCard title="Admin Contact" icon={User} defaultOpen>
      <EditRow editing={bi.isEditing} onEdit={bi.start} onCancel={bi.cancel} onSave={() => save(bi, bi.edit)} saving={bi.saving} />
      {!bi.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Phone" value={user?.phone} />
          <VF label="City" value={user?.city} />
          <VF label="State" value={user?.state} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TI label="Phone" value={bi.edit.phone} onChange={v => bi.setEdit(e => ({...e, phone: v}))} placeholder="+91 XXXXX XXXXX" />
          <div className="hidden sm:block" />
          <TI label="City" value={bi.edit.city} onChange={v => bi.setEdit(e => ({...e, city: v}))} placeholder="HQ city" />
          <SI label="State" value={bi.edit.state} onChange={v => bi.setEdit(e => ({...e, state: v}))} options={STATES} />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Company Identity" icon={Building2}>
      <EditRow editing={ci.isEditing} onEdit={ci.start} onCancel={ci.cancel} onSave={() => save(ci, ci.edit)} saving={ci.saving} />
      {!ci.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Legal Name" value={p.official_company_name} />
          <VF label="Brand Name" value={p.brand_display_name} />
          <VF label="Industry" value={p.industry} />
          <VF label="Company Size" value={p.company_size} />
          <VF label="Founded" value={p.founded_year} />
          <VF label="Website" value={p.website} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TI label="Legal Company Name" value={ci.edit.official_company_name} onChange={v => ci.setEdit(e => ({...e, official_company_name: v}))} placeholder="Registered name" />
            <TI label="Brand / Display Name" value={ci.edit.brand_display_name} onChange={v => ci.setEdit(e => ({...e, brand_display_name: v}))} placeholder="Public name" />
            <SI label="Industry" value={ci.edit.industry} onChange={v => ci.setEdit(e => ({...e, industry: v}))} options={ORG_INDUSTRIES} />
            <SI label="Company Size" value={ci.edit.company_size} onChange={v => ci.setEdit(e => ({...e, company_size: v}))} options={ORG_SIZES} />
            <TI label="Founded Year" value={String(ci.edit.founded_year||'')} onChange={v => ci.setEdit(e => ({...e, founded_year: v}))} type="number" placeholder="e.g. 2010" />
            <TI label="Website" value={ci.edit.website} onChange={v => ci.setEdit(e => ({...e, website: v}))} placeholder="https://…" />
          </div>
          <TI label="LinkedIn URL" value={ci.edit.linkedin_url} onChange={v => ci.setEdit(e => ({...e, linkedin_url: v}))} placeholder="https://linkedin.com/company/…" />
        </div>
      )}
    </SectionCard>

    <SectionCard title="About" icon={BookOpen}>
      <EditRow editing={ab.isEditing} onEdit={ab.start} onCancel={ab.cancel} onSave={() => save(ab, ab.edit)} saving={ab.saving} />
      {!ab.isEditing ? (
        <div className="space-y-4">
          <p className="text-[14px] text-gray-700 leading-relaxed">{p.about || <span className="text-gray-400 italic">Add a company description</span>}</p>
          {p.how_use_platform && <VF label="How We Use This Platform" value={p.how_use_platform} />}
        </div>
      ) : (
        <div className="space-y-3">
          <TA label="About the Company" value={ab.edit.about} onChange={v => ab.setEdit(e => ({...e, about: v}))} placeholder="What you do, your mission…" rows={4} />
          <TA label="How We Use This Platform" value={ab.edit.how_use_platform} onChange={v => ab.setEdit(e => ({...e, how_use_platform: v}))} placeholder="e.g. Talent hiring, L&D programs…" rows={2} />
        </div>
      )}
    </SectionCard>
  </>);
}

// ═══════════════════════════════════════════════════════════════════
// PARENT SECTIONS
// ═══════════════════════════════════════════════════════════════════
function ParentSections({ user, saveSection }) {
  const p = user?.profile || {};

  const bi = useSection(() => ({ phone: user?.phone||'', gender: user?.gender||'', city: user?.city||'', state: user?.state||'' }));
  const fd = useSection(() => ({ relationship: p.relationship||'', occupation: p.occupation||'', notification_email: p.notification_email||'' }));
  const iv = useSection(() => ({ hobby_involvement: p.hobby_involvement||'', sports_involvement: p.sports_involvement||'' }));
  const ab = useSection(() => ({ bio: user?.bio||'' }));

  const save = async (section, data) => {
    section.setSaving(true);
    try { await saveSection(data); section.cancel(); }
    catch (e) { /* error already toasted in saveSection */ }
    finally { section.setSaving(false); }
  };

  return (<>
    <SectionCard title="Basic Info" icon={User} defaultOpen>
      <EditRow editing={bi.isEditing} onEdit={bi.start} onCancel={bi.cancel} onSave={() => save(bi, bi.edit)} saving={bi.saving} />
      {!bi.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Phone" value={user?.phone} />
          <VF label="Gender" value={user?.gender} />
          <VF label="City" value={user?.city} />
          <VF label="State" value={user?.state} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TI label="Phone" value={bi.edit.phone} onChange={v => bi.setEdit(e => ({...e, phone: v}))} placeholder="+91 XXXXX XXXXX" />
          <SI label="Gender" value={bi.edit.gender} onChange={v => bi.setEdit(e => ({...e, gender: v}))} options={GENDERS} />
          <TI label="City" value={bi.edit.city} onChange={v => bi.setEdit(e => ({...e, city: v}))} placeholder="City" />
          <SI label="State" value={bi.edit.state} onChange={v => bi.setEdit(e => ({...e, state: v}))} options={STATES} />
        </div>
      )}
    </SectionCard>

    <SectionCard title="Family Details" icon={Users}>
      <EditRow editing={fd.isEditing} onEdit={fd.start} onCancel={fd.cancel} onSave={() => save(fd, fd.edit)} saving={fd.saving} />
      {!fd.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <VF label="Relationship" value={p.relationship} />
          <VF label="Occupation" value={p.occupation} />
          <VF label="Notification Email" value={p.notification_email} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SI label="Relationship to Child" value={fd.edit.relationship} onChange={v => fd.setEdit(e => ({...e, relationship: v}))}
            options={['Father','Mother','Guardian','Grandparent','Uncle/Aunt','Other']} />
          <TI label="Occupation" value={fd.edit.occupation} onChange={v => fd.setEdit(e => ({...e, occupation: v}))} placeholder="e.g. Teacher, Engineer" />
          <div className="col-span-2">
            <TI label="Notification Email" value={fd.edit.notification_email} onChange={v => fd.setEdit(e => ({...e, notification_email: v}))} placeholder="For child activity reports" type="email" />
          </div>
        </div>
      )}
    </SectionCard>

    <SectionCard title="Involvement" icon={Target}>
      <EditRow editing={iv.isEditing} onEdit={iv.start} onCancel={iv.cancel} onSave={() => save(iv, iv.edit)} saving={iv.saving} />
      {!iv.isEditing ? (
        <div className="space-y-4">
          <VF label="How I Support Hobbies" value={p.hobby_involvement} />
          <VF label="How I Support Sports" value={p.sports_involvement} />
        </div>
      ) : (
        <div className="space-y-3">
          <TA label="How You Support Child's Hobbies" value={iv.edit.hobby_involvement} onChange={v => iv.setEdit(e => ({...e, hobby_involvement: v}))} placeholder="e.g. Enrolled in art classes, attend recitals…" />
          <TA label="How You Support Child's Sports" value={iv.edit.sports_involvement} onChange={v => iv.setEdit(e => ({...e, sports_involvement: v}))} placeholder="e.g. Attend matches, hired a coach…" />
        </div>
      )}
    </SectionCard>

    <SectionCard title="About" icon={BookOpen}>
      <EditRow editing={ab.isEditing} onEdit={ab.start} onCancel={ab.cancel} onSave={() => save(ab, ab.edit)} saving={ab.saving} />
      {!ab.isEditing
        ? <p className="text-[14px] text-gray-700 leading-relaxed">{user?.bio || <span className="text-gray-400 italic">Tell us a bit about yourself</span>}</p>
        : <TA label="About You" value={ab.edit.bio} onChange={v => ab.setEdit(e => ({...e, bio: v}))} placeholder="A brief introduction…" rows={4} />}
    </SectionCard>
  </>);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
export default function MyProfilePage() {
  const { user, refreshUser } = useAuth();
  const coverRef  = useRef(null);
  const photoRef  = useRef(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const res = await careerAPI.getDashboard();
      setDashboardData(res.data?.data);
    } catch {}
  }, []);

  useEffect(() => {
    if (user?.user_type === 'professional_learner' || user?.user_type === 'organization') {
      loadDashboardData();
    }
  }, [user?.user_type, loadDashboardData]);

  const handleRefreshAll = async () => {
    await refreshUser();
    await loadDashboardData();
  };

  const saveSection = useCallback(async (data) => {
    try {
      await authAPI.updateProfile(data);
      await refreshUser();
      toast.success('Saved!');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Save failed. Please try again.');
      throw e; // re-throw so section save() catches it and doesn't call cancel()
    }
  }, [refreshUser]);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoLoading(true);
    try { await uploadAPI.profilePhoto(file); await refreshUser(); toast.success('Photo updated!'); }
    catch { toast.error('Photo upload failed'); }
    finally { setPhotoLoading(false); if (photoRef.current) photoRef.current.value = ''; }
  };
  const handleCover = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCoverLoading(true);
    try { await uploadAPI.coverPhoto(file); await refreshUser(); toast.success('Cover updated!'); }
    catch { toast.error('Cover upload failed'); }
    finally { setCoverLoading(false); if (coverRef.current) coverRef.current.value = ''; }
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6]"><Loader2 className="animate-spin text-blue-600" size={28} /></div>;

  const type   = user.user_type;
  useEffect(() => {
    console.log('DEBUG [Profile]:', { type, user });
  }, [type, user]);
  const p      = user?.profile || {};
  const cfg    = getConfig(type);
  const TypeIcon = cfg.icon;
  const handleSaveProfessional = useCallback(async (formData) => {
    try {
      // 1. Update Core Identity (Name, Bio)
      await authAPI.updateProfile({
        full_name: formData.full_name,
        bio: formData.bio
      });

      // 2. Update Career Profile
      await careerAPI.saveProfile({
        current_role: formData.current_role,
        current_company: formData.current_company,
        industry: formData.industry,
        experience_years: formData.experience_years
      });

      // 3. Sync State
      await refreshUser();
      await handleRefreshAll();
    } catch (err) {
      console.error('[SaveProfessional Error]:', err);
      throw err;
    }
  }, [refreshUser, handleRefreshAll]);

  const initials = (user.full_name || user.username || '?')[0].toUpperCase();
  const location = [user.city || p.city, user.state || p.state].filter(Boolean).join(', ');
  const currentResumeUrl = resumeUrl || p.resume_url || '';
  const hasResume = !['institute','organization','parent'].includes(type);

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-6">
      
      {/* New Professional/Organization View */}
      {(type === 'professional_learner' || type === 'organization') && (
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <ProfessionalProfile 
            user={user} 
            dashboardData={dashboardData}
            onEdit={() => {
              const bioSection = document.getElementById('persona-intel');
              if (bioSection) bioSection.scrollIntoView({ behavior: 'smooth' });
            }}
            onRefresh={handleRefreshAll}
            onSave={handleSaveProfessional}
          />
        </div>
      )}

      {/* Legacy/Default View for other roles */}
      {!(type === 'professional_learner' || type === 'organization') && (
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          {/* ── 1. COVER BANNER ─────────────────────────────────────────── */}
          <div className="relative h-40 md:h-56 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
          {user.cover_photo_url
            ? <img src={user.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
            : <div className={`w-full h-full bg-gradient-to-r ${cfg.cover}`} />}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <button type="button" onClick={() => !coverLoading && coverRef.current?.click()}
            className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 text-white text-[12px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 backdrop-blur-sm">
            {coverLoading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            {coverLoading ? 'Uploading…' : 'Change Cover'}
          </button>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
        </div>

        {/* ── 2. PROFILE IDENTITY CARD ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm relative pt-4 pb-6 mb-4 -mt-6 overflow-visible">

          {/* Edit Profile button — absolute top-right */}
          <div className="absolute top-4 right-4">
            <a href="#basic-info"
              className="flex items-center gap-1.5 px-4 py-2 border-2 border-[#2563EB] text-[#2563EB] text-[13px] font-bold rounded-xl hover:bg-blue-50 transition-all">
              <Pencil size={13} /> Edit Profile
            </a>
          </div>

          {/* Centered avatar — overlaps cover */}
          <div className="flex flex-col items-center pt-0">
            <div className="relative -mt-12 mb-3 group/photo">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                {user.profile_photo_url
                  ? <img src={user.profile_photo_url} alt={user.full_name} className="w-full h-full object-cover" />
                  : <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${cfg.cover} text-white text-3xl font-extrabold`}>{initials}</div>}
              </div>
              <button type="button" onClick={() => !photoLoading && photoRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/0 group-hover/photo:bg-black/30 transition-colors flex items-center justify-center">
                <Camera size={16} className="text-white opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                {photoLoading && <Loader2 size={16} className="text-white animate-spin absolute" />}
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            {/* Name */}
            <h1 className="text-[22px] font-extrabold text-gray-900 leading-tight text-center px-8 sm:px-14">
              {user.full_name || user.username}
            </h1>

            {/* Syllabrix ID + type chip row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {user.syllabrix_id && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full">
                  <Lock size={9} className="text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-700 tracking-widest">{user.syllabrix_id}</span>
                </div>
              )}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.chip}`}>
                <TypeIcon size={9} />{cfg.label}
              </span>
            </div>

            {/* Bio / tagline */}
            <p className="text-[13px] text-gray-500 italic mt-2 text-center px-8 max-w-lg">
              {user.bio || p.about || 'Add a tagline…'}
            </p>

            {/* Location */}
            {location && (
              <div className="flex items-center gap-1 mt-1.5 text-[12px] text-gray-500">
                <MapPin size={12} className="text-gray-400 shrink-0" />{location}
              </div>
            )}
          </div>
        </div>

        {/* ── 3. PERSONA INTELLIGENCE HEADER ────────────── */}
        <PersonaIntelligenceHeader user={user} />

        {/* ── 4. QUICK STATS BAR ───────────────────────────────────── */}
        <QuickStatsBar user={user} />

        {/* ── 4. TWO-COLUMN LAYOUT ─────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-5 pb-12" id="basic-info">

          {/* LEFT — section cards (65%) */}
          <div className="flex-1 space-y-4 min-w-0">
            <IdentitySection user={user} onSaved={refreshUser} />
            {type === 'student'              && <StudentSections      user={user} saveSection={saveSection} />}
            {type === 'teacher'              && <TeacherSections      user={user} saveSection={saveSection} />}
            {type === 'professional_learner' && <ProfessionalSections user={user} saveSection={saveSection} />}
            {type === 'institute'            && <InstituteSections    user={user} saveSection={saveSection} />}
            {type === 'organization'         && <OrganizationSections user={user} saveSection={saveSection} />}
            {type === 'parent'               && <ParentSections       user={user} saveSection={saveSection} />}
          </div>

          {/* RIGHT — sidebar cards (35%) */}
          <div className="lg:w-[320px] shrink-0 space-y-4">
            {hasResume && (
              <ResumeCard resumeUrl={currentResumeUrl} onUploaded={url => { setResumeUrl(url); refreshUser(); }} />
            )}

            {/* Skills / Goals sidebar tags */}
            {type === 'student' && parseJson(p.hobby, []).length > 0 && (
              <SkillsCard tags={parseJson(p.hobby, [])} label="Hobbies" />
            )}
            {type === 'teacher' && parseJson(p.qualifications, []).length > 0 && (
              <SkillsCard tags={parseJson(p.qualifications, [])} label="Qualifications" />
            )}
            {type === 'professional_learner' && parseJson(p.skills, []).length > 0 && (
              <SkillsCard tags={parseJson(p.skills, [])} label="Skills" />
            )}

            {/* LinkedIn / Website quick links */}
            {type === 'professional_learner' && p.linkedin_url && (
              <LinkCard href={p.linkedin_url} label="LinkedIn" icon={LinkIcon} />
            )}
            {type === 'organization' && p.website && (
              <LinkCard href={p.website} label="Website" icon={ExternalLink} />
            )}
            {type === 'organization' && p.linkedin_url && (
              <LinkCard href={p.linkedin_url} label="LinkedIn" icon={LinkIcon} />
            )}
            {type === 'institute' && p.website && (
              <LinkCard href={p.website} label="Website" icon={ExternalLink} />
            )}

            <SyllabrixIdCard user={user} />
            <AccountInfoCard user={user} />
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════
function parseJson(value, fallback) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') { try { return JSON.parse(value); } catch { return fallback; } }
  return fallback;
}
