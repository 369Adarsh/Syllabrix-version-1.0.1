'use client';
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api/auth.api';
import { uploadAPI } from '@/lib/api/upload.api';
import {
  Lock, Camera, ChevronDown, ChevronUp, Loader2, Save,
  FileText, Upload, X, Plus, CheckCircle, ExternalLink, User,
  Building2, Briefcase, BookOpen, Target, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ─── Static data ───────────────────────────────────────────────────────────
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Other'];
const BOARDS = ['CBSE','ICSE','State Board','IB','IGCSE','Other'];
const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12','UG Year 1','UG Year 2','UG Year 3','UG Year 4','PG','Other'];
const STREAMS = ['Engineering','Medical / Healthcare','Commerce','Arts / Humanities','Science','Law','Media / Journalism','Design','Agriculture','Other'];
const INDUSTRIES = ['IT / Software','Finance / Banking','Healthcare','Education','Manufacturing','Retail / E-commerce','Media / Entertainment','Government / PSU','Consulting','Real Estate','Agriculture','Other'];
const LEARNING_GOALS = ['Get a Promotion','Switch Career','Start a Business','Learn a New Technology','Improve Communication','Build Leadership Skills','Get a Certification','Improve Work-Life Balance','Other'];
const GENDER_OPTS = ['Male','Female','Other','Prefer not to say'];
const TEACHER_TYPES = ['freelancer','institute_affiliated','both'];
const INSTITUTE_TYPES = ['school','college','university','coaching','online_academy','other'];

// ─── Shared field styles ───────────────────────────────────────────────────
const inp = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';
const lbl = 'block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1';

const Fld = ({ label, required, children }) => (
  <div><label className={lbl}>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>{children}</div>
);
const TxtInput = ({ label, value, onChange, placeholder, type = 'text', readOnly }) => (
  <Fld label={label}>
    <div className="relative">
      <input type={type} value={value || ''} onChange={readOnly ? undefined : e => onChange(e.target.value)}
        readOnly={readOnly} placeholder={placeholder}
        className={inp + (readOnly ? ' bg-gray-100 text-gray-500 cursor-not-allowed pr-8' : '')} />
      {readOnly && <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
    </div>
  </Fld>
);
const SelInput = ({ label, value, onChange, options, placeholder }) => (
  <Fld label={label}>
    <select value={value || ''} onChange={e => onChange(e.target.value)} className={inp}>
      <option value="">{placeholder || 'Select…'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </Fld>
);
const TxtArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <Fld label={label}>
    <textarea value={value || ''} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows} className={inp + ' resize-none'} />
  </Fld>
);

// Tags input
const TagsInput = ({ label, tags, onChange, placeholder }) => {
  const [val, setVal] = useState('');
  const add = () => {
    const v = val.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setVal('');
  };
  return (
    <Fld label={label}>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-[12px] text-blue-700 font-medium">
            {t}
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder} className={inp + ' flex-1'} />
        <button type="button" onClick={add} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-all">
          <Plus size={13} />
        </button>
      </div>
    </Fld>
  );
};

// Collapsible section card
const Section = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={16} className="text-blue-600" />}
          <span className="font-bold text-[14px] text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-gray-100 space-y-4">{children}</div>}
    </div>
  );
};

// Save button for each section
const SaveBtn = ({ onClick, loading }) => (
  <div className="pt-2">
    <button type="button" onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-[13px] shadow hover:opacity-90 transition-all disabled:opacity-50">
      {loading ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save Changes</>}
    </button>
  </div>
);

// ─── Resume upload card ────────────────────────────────────────────────────
const ResumeSection = ({ currentUrl, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('PDF must be under 5MB'); return; }
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are accepted'); return; }
    setUploading(true);
    try {
      const res = await uploadAPI.resume(file);
      const url = res.data?.data?.url;
      onUploaded(url);
      toast.success('Resume uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Section title="Resume" icon={FileText}>
      <div className="space-y-3">
        {currentUrl ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle size={16} className="text-green-600 shrink-0" />
            <span className="text-[12px] text-green-700 font-medium flex-1">Resume uploaded</span>
            <a href={currentUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-[12px] text-blue-600 hover:underline font-medium">
              View <ExternalLink size={11} />
            </a>
          </div>
        ) : (
          <p className="text-[12px] text-gray-500">No resume uploaded yet.</p>
        )}
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-blue-300 rounded-xl text-[13px] text-blue-600 font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 w-full justify-center">
          {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> {currentUrl ? 'Replace Resume (PDF, max 5MB)' : 'Upload Resume (PDF, max 5MB)'}</>}
        </button>
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
      </div>
    </Section>
  );
};

// ─── Main profile page ─────────────────────────────────────────────────────
export default function MyProfilePage() {
  const { user, refreshUser } = useAuth();
  const coverInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(() => user?.profile?.resume_url || '');

  const profile = user?.profile || {};

  // ─── Per-section save ────────────────────────────────────────────────────
  const [saving, setSaving] = useState({});
  const saveSection = useCallback(async (sectionKey, data) => {
    setSaving(s => ({ ...s, [sectionKey]: true }));
    try {
      await authAPI.updateProfile(data);
      await refreshUser();
      toast.success('Saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(s => ({ ...s, [sectionKey]: false }));
    }
  }, [refreshUser]);

  // ─── Photo upload ────────────────────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoUploading(true);
    try { await uploadAPI.profilePhoto(file); await refreshUser(); toast.success('Photo updated!'); }
    catch { toast.error('Photo upload failed'); }
    finally { setPhotoUploading(false); if (photoInputRef.current) photoInputRef.current.value = ''; }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCoverUploading(true);
    try { await uploadAPI.coverPhoto(file); await refreshUser(); toast.success('Cover updated!'); }
    catch { toast.error('Cover upload failed'); }
    finally { setCoverUploading(false); if (coverInputRef.current) coverInputRef.current.value = ''; }
  };

  if (!user) return null;
  const type = user.user_type;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* ─── Cover + Photo header ─────────────────────────────────────── */}
      <div className="relative mb-16">
        {/* Cover photo */}
        <div className="h-44 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
          {user.cover_photo_url && (
            <img src={user.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
          )}
          <button type="button" onClick={() => !coverUploading && coverInputRef.current?.click()}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 text-white rounded-lg text-[12px] font-medium hover:bg-black/60 transition-all backdrop-blur-sm">
            {coverUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            {coverUploading ? 'Uploading…' : 'Edit Cover'}
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        </div>

        {/* Profile photo + name bar */}
        <div className="absolute -bottom-12 left-0 right-0 px-4 md:px-8 flex items-end gap-4">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
              {user.profile_photo_url
                ? <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-bold">
                    {(user.full_name || user.username || '?')[0].toUpperCase()}
                  </div>
              }
            </div>
            <button type="button" onClick={() => !photoUploading && photoInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center hover:bg-blue-700 transition-all shadow">
              {photoUploading ? <Loader2 size={12} className="text-white animate-spin" /> : <Camera size={12} className="text-white" />}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="pb-1 flex-1 min-w-0">
            <h1 className="text-[17px] font-extrabold text-gray-900 truncate">
              {user.full_name || user.username}
            </h1>
            {user.syllabrix_id && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full mt-0.5">
                <Lock size={9} className="text-blue-400" />
                <span className="text-[10px] font-bold text-blue-700 tracking-wider">{user.syllabrix_id}</span>
              </div>
            )}
          </div>
          <Link href={`/profile/${user.id}`}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all shrink-0 mb-1">
            <User size={13} /> View Public Profile
          </Link>
        </div>
      </div>

      {/* ─── Sections ──────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-12 space-y-4">

        {/* ═══════ STUDENT ═══════ */}
        {type === 'student' && <StudentSections user={user} profile={profile} saving={saving} saveSection={saveSection} />}
        {type === 'student' && <ResumeSection currentUrl={resumeUrl || profile.resume_url} onUploaded={url => { setResumeUrl(url); refreshUser(); }} />}

        {/* ═══════ TEACHER ═══════ */}
        {type === 'teacher' && <TeacherSections user={user} profile={profile} saving={saving} saveSection={saveSection} />}
        {type === 'teacher' && <ResumeSection currentUrl={resumeUrl || profile.resume_url} onUploaded={url => { setResumeUrl(url); refreshUser(); }} />}

        {/* ═══════ PROFESSIONAL LEARNER ═══════ */}
        {type === 'professional_learner' && <ProfessionalSections user={user} profile={profile} saving={saving} saveSection={saveSection} />}
        {type === 'professional_learner' && <ResumeSection currentUrl={resumeUrl || profile.resume_url} onUploaded={url => { setResumeUrl(url); refreshUser(); }} />}

        {/* ═══════ INSTITUTE ═══════ */}
        {type === 'institute' && <InstituteSections user={user} profile={profile} saving={saving} saveSection={saveSection} />}

        {/* ═══════ PARENT ═══════ */}
        {type === 'parent' && <ParentSections user={user} profile={profile} saving={saving} saveSection={saveSection} />}

        {/* ═══════ ORGANIZATION ═══════ */}
        {type === 'organization' && <OrganizationSections user={user} profile={profile} saving={saving} saveSection={saveSection} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STUDENT SECTIONS
// ═══════════════════════════════════════════════════════
function StudentSections({ user, profile, saving, saveSection }) {
  const [basic, setBasic] = useState({
    phone: user.phone || '',
    gender: user.gender || '',
    city: user.city || '',
    state: user.state || '',
  });
  const [academic, setAcademic] = useState({
    school_name: profile.school_name || '',
    class_name: profile.class_name || '',
    board: profile.board || '',
    college_name: profile.college_name || '',
    subject_stream: profile.subject_stream || '',
  });
  const [goals, setGoals] = useState({
    ambition: profile.ambition || '',
    future_vision: profile.future_vision || '',
    hobby: parseJson(profile.hobby, []),
  });

  return (<>
    <Section title="Basic Info" icon={User} defaultOpen>
      <div className="grid grid-cols-2 gap-3">
        <TxtInput label="Full Name" value={user.full_name} readOnly />
        <TxtInput label="Date of Birth" value={user.date_of_birth ? user.date_of_birth.split('T')[0] : ''} readOnly />
      </div>
      <TxtInput label="Phone" value={basic.phone} onChange={v => setBasic(p => ({ ...p, phone: v }))} placeholder="+91 XXXXX XXXXX" />
      <SelInput label="Gender" value={basic.gender} onChange={v => setBasic(p => ({ ...p, gender: v }))} options={GENDER_OPTS} />
      <div className="grid grid-cols-2 gap-3">
        <TxtInput label="City" value={basic.city} onChange={v => setBasic(p => ({ ...p, city: v }))} placeholder="Your city" />
        <SelInput label="State" value={basic.state} onChange={v => setBasic(p => ({ ...p, state: v }))} options={STATES} />
      </div>
      <SaveBtn onClick={() => saveSection('basic', basic)} loading={saving.basic} />
    </Section>

    <Section title="Academic Info" icon={BookOpen}>
      {(profile.education_level === 'school' || !profile.education_level) && (<>
        <TxtInput label="School Name" value={academic.school_name} onChange={v => setAcademic(p => ({ ...p, school_name: v }))} placeholder="Name of your school" />
        <div className="grid grid-cols-2 gap-3">
          <SelInput label="Class / Grade" value={academic.class_name} onChange={v => setAcademic(p => ({ ...p, class_name: v }))} options={CLASSES} />
          <SelInput label="Board" value={academic.board} onChange={v => setAcademic(p => ({ ...p, board: v }))} options={BOARDS} />
        </div>
      </>)}
      {profile.education_level === 'college' && (<>
        <TxtInput label="College / Institute" value={academic.college_name} onChange={v => setAcademic(p => ({ ...p, college_name: v }))} placeholder="College name" />
        <SelInput label="Subject Stream" value={academic.subject_stream} onChange={v => setAcademic(p => ({ ...p, subject_stream: v }))} options={STREAMS} />
      </>)}
      {profile.education_level === 'coaching' && (<>
        <TxtInput label="Coaching Institute" value={academic.school_name} onChange={v => setAcademic(p => ({ ...p, school_name: v }))} placeholder="Coaching center name" />
      </>)}
      {profile.education_level && (
        <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg">
          <Lock size={12} className="text-blue-400" />
          <span className="text-[12px] text-blue-600">Education type: <strong>{profile.education_level}</strong> (set during signup)</span>
        </div>
      )}
      <SaveBtn onClick={() => saveSection('academic', academic)} loading={saving.academic} />
    </Section>

    <Section title="Goals & Interests" icon={Target}>
      <TxtArea label="My Ambition" value={goals.ambition} onChange={v => setGoals(p => ({ ...p, ambition: v }))} placeholder="What do you want to achieve in life?" />
      <TagsInput label="Hobbies" tags={goals.hobby} onChange={v => setGoals(p => ({ ...p, hobby: v }))} placeholder="Add a hobby…" />
      <TxtArea label="I See My Future As…" value={goals.future_vision} onChange={v => setGoals(p => ({ ...p, future_vision: v }))} placeholder="Describe your dream future" rows={2} />
      <SaveBtn onClick={() => saveSection('goals', goals)} loading={saving.goals} />
    </Section>
  </>);
}

// ═══════════════════════════════════════════════════════
// TEACHER SECTIONS
// ═══════════════════════════════════════════════════════
function TeacherSections({ user, profile, saving, saveSection }) {
  const [basic, setBasic] = useState({
    phone: user.phone || '',
    gender: user.gender || '',
    city: user.city || '',
    state: user.state || '',
  });
  const [pro, setPro] = useState({
    subject_primary: profile.subject_primary || '',
    experience_years: profile.experience_years || '',
    institute_name: profile.institute_name || '',
    teacher_type: profile.teacher_type || 'freelancer',
    qualifications: parseJson(profile.qualifications, []),
  });
  const [about, setAbout] = useState({ bio: user.bio || '' });

  return (<>
    <Section title="Basic Info" icon={User} defaultOpen>
      <TxtInput label="Full Name" value={user.full_name} readOnly />
      <TxtInput label="Phone" value={basic.phone} onChange={v => setBasic(p => ({ ...p, phone: v }))} placeholder="+91 XXXXX XXXXX" />
      <SelInput label="Gender" value={basic.gender} onChange={v => setBasic(p => ({ ...p, gender: v }))} options={GENDER_OPTS} />
      <div className="grid grid-cols-2 gap-3">
        <TxtInput label="City" value={basic.city} onChange={v => setBasic(p => ({ ...p, city: v }))} placeholder="Your city" />
        <SelInput label="State" value={basic.state} onChange={v => setBasic(p => ({ ...p, state: v }))} options={STATES} />
      </div>
      <SaveBtn onClick={() => saveSection('basic', basic)} loading={saving.basic} />
    </Section>

    <Section title="Professional Info" icon={Briefcase}>
      <TxtInput label="Primary Subject" value={pro.subject_primary} onChange={v => setPro(p => ({ ...p, subject_primary: v }))} placeholder="e.g. Mathematics" />
      <TxtInput label="Years of Experience" value={String(pro.experience_years || '')} onChange={v => setPro(p => ({ ...p, experience_years: v }))} placeholder="e.g. 8" type="number" />
      <TxtInput label="Current Institution" value={pro.institute_name} onChange={v => setPro(p => ({ ...p, institute_name: v }))} placeholder="School / College / Academy" />
      <Fld label="Teacher Type">
        <div className="flex gap-2">
          {TEACHER_TYPES.map(t => (
            <button key={t} type="button" onClick={() => setPro(p => ({ ...p, teacher_type: t }))}
              className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border-2 transition-all capitalize ${pro.teacher_type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Fld>
      <TagsInput label="Qualifications" tags={pro.qualifications} onChange={v => setPro(p => ({ ...p, qualifications: v }))} placeholder="e.g. M.Sc, B.Ed…" />
      <SaveBtn onClick={() => saveSection('pro', pro)} loading={saving.pro} />
    </Section>

    <Section title="About" icon={BookOpen}>
      <TxtArea label="Bio" value={about.bio} onChange={v => setAbout({ bio: v })} placeholder="Tell students about yourself, your teaching philosophy…" rows={4} />
      <SaveBtn onClick={() => saveSection('about', about)} loading={saving.about} />
    </Section>
  </>);
}

// ═══════════════════════════════════════════════════════
// PROFESSIONAL LEARNER SECTIONS
// ═══════════════════════════════════════════════════════
function ProfessionalSections({ user, profile, saving, saveSection }) {
  const [basic, setBasic] = useState({
    phone: user.phone || '',
    gender: user.gender || '',
    city: user.city || '',
    state: user.state || '',
  });
  const [work, setWork] = useState({
    current_company: profile.current_company || '',
    designation: profile.designation || '',
    experience_years: profile.experience_years || '',
    industry: profile.industry || '',
    education_level: profile.education_level || '',
    skills: parseJson(profile.skills, []),
  });
  const [learning, setLearning] = useState({
    learning_goals: parseJson(profile.learning_goals, []),
    linkedin_url: profile.linkedin_url || '',
  });

  return (<>
    <Section title="Basic Info" icon={User} defaultOpen>
      <TxtInput label="Full Name" value={user.full_name} readOnly />
      <TxtInput label="Phone" value={basic.phone} onChange={v => setBasic(p => ({ ...p, phone: v }))} placeholder="+91 XXXXX XXXXX" />
      <SelInput label="Gender" value={basic.gender} onChange={v => setBasic(p => ({ ...p, gender: v }))} options={GENDER_OPTS} />
      <div className="grid grid-cols-2 gap-3">
        <TxtInput label="City" value={basic.city} onChange={v => setBasic(p => ({ ...p, city: v }))} placeholder="Your city" />
        <SelInput label="State" value={basic.state} onChange={v => setBasic(p => ({ ...p, state: v }))} options={STATES} />
      </div>
      <SaveBtn onClick={() => saveSection('basic', basic)} loading={saving.basic} />
    </Section>

    <Section title="Work Info" icon={Briefcase}>
      <TxtInput label="Current Company" value={work.current_company} onChange={v => setWork(p => ({ ...p, current_company: v }))} placeholder="Where do you work?" />
      <TxtInput label="Designation / Role" value={work.designation} onChange={v => setWork(p => ({ ...p, designation: v }))} placeholder="e.g. Software Engineer" />
      <div className="grid grid-cols-2 gap-3">
        <TxtInput label="Years of Experience" value={String(work.experience_years || '')} onChange={v => setWork(p => ({ ...p, experience_years: v }))} type="number" placeholder="0–40" />
        <SelInput label="Industry" value={work.industry} onChange={v => setWork(p => ({ ...p, industry: v }))} options={INDUSTRIES} />
      </div>
      <SelInput label="Highest Education Level" value={work.education_level} onChange={v => setWork(p => ({ ...p, education_level: v }))}
        options={['High School','Graduation','Post Graduation','Doctorate','Other']} />
      <TagsInput label="Skills" tags={work.skills} onChange={v => setWork(p => ({ ...p, skills: v }))} placeholder="Add a skill…" />
      <SaveBtn onClick={() => saveSection('work', work)} loading={saving.work} />
    </Section>

    <Section title="Learning & Links" icon={Target}>
      <TagsInput label="Learning Goals" tags={learning.learning_goals} onChange={v => setLearning(p => ({ ...p, learning_goals: v }))} placeholder="Add a goal…" />
      <Fld label="Suggested Goals">
        <div className="flex flex-wrap gap-1.5 mt-1">
          {LEARNING_GOALS.filter(g => !learning.learning_goals.includes(g)).slice(0, 6).map(g => (
            <button key={g} type="button" onClick={() => setLearning(p => ({ ...p, learning_goals: [...p.learning_goals, g] }))}
              className="px-2.5 py-1 rounded-full text-[11px] border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all">
              + {g}
            </button>
          ))}
        </div>
      </Fld>
      <TxtInput label="LinkedIn URL" value={learning.linkedin_url} onChange={v => setLearning(p => ({ ...p, linkedin_url: v }))} placeholder="https://linkedin.com/in/…" />
      <SaveBtn onClick={() => saveSection('learning', learning)} loading={saving.learning} />
    </Section>
  </>);
}

// ═══════════════════════════════════════════════════════
// INSTITUTE SECTIONS
// ═══════════════════════════════════════════════════════
function InstituteSections({ user, profile, saving, saveSection }) {
  const [basic, setBasic] = useState({
    name: profile.name || '',
    phone: user.phone || '',
    city: profile.city || user.city || '',
    state: profile.state || user.state || '',
  });
  const [details, setDetails] = useState({
    institute_type: profile.institute_type || '',
    boards_offered: parseJson(profile.boards_offered, []),
    established_year: profile.established_year || '',
    student_count: profile.student_count || '',
    teacher_count: profile.teacher_count || '',
    website: profile.website || '',
  });
  const [about, setAbout] = useState({ about: profile.about || '' });

  return (<>
    <Section title="Basic Info" icon={Building2} defaultOpen>
      <TxtInput label="Institute Name" value={basic.name} onChange={v => setBasic(p => ({ ...p, name: v }))} placeholder="Official name of your institute" />
      <TxtInput label="Contact Phone" value={basic.phone} onChange={v => setBasic(p => ({ ...p, phone: v }))} placeholder="+91 XXXXX XXXXX" />
      <div className="grid grid-cols-2 gap-3">
        <TxtInput label="City" value={basic.city} onChange={v => setBasic(p => ({ ...p, city: v }))} placeholder="City" />
        <SelInput label="State" value={basic.state} onChange={v => setBasic(p => ({ ...p, state: v }))} options={STATES} />
      </div>
      <SaveBtn onClick={() => saveSection('basic', { phone: basic.phone, name: basic.name, city: basic.city, state: basic.state })} loading={saving.basic} />
    </Section>

    <Section title="Institute Details" icon={Award}>
      <SelInput label="Institute Type" value={details.institute_type} onChange={v => setDetails(p => ({ ...p, institute_type: v }))} options={INSTITUTE_TYPES} />
      <TagsInput label="Boards / Syllabi Offered" tags={details.boards_offered} onChange={v => setDetails(p => ({ ...p, boards_offered: v }))} placeholder="Add board…" />
      <div className="grid grid-cols-3 gap-3">
        <TxtInput label="Est. Year" value={String(details.established_year || '')} onChange={v => setDetails(p => ({ ...p, established_year: v }))} type="number" placeholder="e.g. 1995" />
        <TxtInput label="Total Students" value={String(details.student_count || '')} onChange={v => setDetails(p => ({ ...p, student_count: v }))} type="number" placeholder="e.g. 1200" />
        <TxtInput label="Total Teachers" value={String(details.teacher_count || '')} onChange={v => setDetails(p => ({ ...p, teacher_count: v }))} type="number" placeholder="e.g. 60" />
      </div>
      <TxtInput label="Website" value={details.website} onChange={v => setDetails(p => ({ ...p, website: v }))} placeholder="https://your-institute.com" />
      <SaveBtn onClick={() => saveSection('details', details)} loading={saving.details} />
    </Section>

    <Section title="About" icon={BookOpen}>
      <TxtArea label="About the Institute" value={about.about} onChange={v => setAbout({ about: v })} placeholder="Describe your institute, its mission, achievements…" rows={4} />
      <SaveBtn onClick={() => saveSection('about', about)} loading={saving.about} />
    </Section>
  </>);
}

// ═══════════════════════════════════════════════════════
// PARENT SECTIONS
// ═══════════════════════════════════════════════════════
function ParentSections({ user, profile, saving, saveSection }) {
  const [basic, setBasic] = useState({
    phone: user.phone || '',
    gender: user.gender || '',
    city: user.city || '',
    state: user.state || '',
  });
  const [family, setFamily] = useState({
    occupation: profile.occupation || '',
    notification_email: profile.notification_email || '',
  });
  const [involvement, setInvolvement] = useState({
    hobby_involvement: profile.hobby_involvement || '',
    sports_involvement: profile.sports_involvement || '',
  });

  return (<>
    <Section title="Basic Info" icon={User} defaultOpen>
      <TxtInput label="Full Name" value={user.full_name} readOnly />
      <TxtInput label="Phone" value={basic.phone} onChange={v => setBasic(p => ({ ...p, phone: v }))} placeholder="+91 XXXXX XXXXX" />
      <SelInput label="Gender" value={basic.gender} onChange={v => setBasic(p => ({ ...p, gender: v }))} options={GENDER_OPTS} />
      <div className="grid grid-cols-2 gap-3">
        <TxtInput label="City" value={basic.city} onChange={v => setBasic(p => ({ ...p, city: v }))} placeholder="Your city" />
        <SelInput label="State" value={basic.state} onChange={v => setBasic(p => ({ ...p, state: v }))} options={STATES} />
      </div>
      <SaveBtn onClick={() => saveSection('basic', basic)} loading={saving.basic} />
    </Section>

    <Section title="Family Details" icon={Briefcase}>
      <TxtInput label="Occupation" value={family.occupation} onChange={v => setFamily(p => ({ ...p, occupation: v }))} placeholder="e.g. Engineer, Teacher" />
      <TxtInput label="Notification Email" value={family.notification_email} onChange={v => setFamily(p => ({ ...p, notification_email: v }))} placeholder="For child activity reports" type="email" />
      <SaveBtn onClick={() => saveSection('family', family)} loading={saving.family} />
    </Section>

    <Section title="Child Involvement" icon={Target}>
      <TxtArea label="How You Support Hobbies" value={involvement.hobby_involvement} onChange={v => setInvolvement(p => ({ ...p, hobby_involvement: v }))} placeholder="e.g. I take them to art classes…" />
      <TxtArea label="How You Support Sports" value={involvement.sports_involvement} onChange={v => setInvolvement(p => ({ ...p, sports_involvement: v }))} placeholder="e.g. I attend matches, enrolled in coaching…" />
      <SaveBtn onClick={() => saveSection('involvement', involvement)} loading={saving.involvement} />
    </Section>
  </>);
}

// ═══════════════════════════════════════════════════════
// ORGANIZATION SECTIONS
// ═══════════════════════════════════════════════════════
function OrganizationSections({ user, profile, saving, saveSection }) {
  const [basic, setBasic] = useState({
    phone: user.phone || '',
    city: user.city || '',
    state: user.state || '',
  });
  const [company, setCompany] = useState({
    official_company_name: profile.official_company_name || '',
    brand_display_name: profile.brand_display_name || '',
    industry: profile.industry || '',
    company_size: profile.company_size || '',
    founded_year: profile.founded_year || '',
    website: profile.website || '',
    linkedin_url: profile.linkedin_url || '',
  });
  const [about, setAbout] = useState({ about: profile.about || '' });

  const ORG_INDUSTRIES = ['Technology / Software','Manufacturing / Industrial','Banking / Financial Services','Healthcare / Pharma','Retail / E-commerce','Logistics / Supply Chain','Education','Consulting / Professional Services','Government / Public Sector','Other'];
  const ORG_SIZES = ['1-50 (Startup)','51-200 (Small)','201-500 (Mid-market)','501-2000 (Enterprise)','2001-10000 (Large Enterprise)','10000+ (Global Enterprise)'];

  return (<>
    <Section title="Admin Contact" icon={User} defaultOpen>
      <TxtInput label="Admin Name" value={user.full_name} readOnly />
      <TxtInput label="Contact Phone" value={basic.phone} onChange={v => setBasic(p => ({ ...p, phone: v }))} placeholder="+91 XXXXX XXXXX" />
      <div className="grid grid-cols-2 gap-3">
        <TxtInput label="City" value={basic.city} onChange={v => setBasic(p => ({ ...p, city: v }))} placeholder="HQ city" />
        <SelInput label="State" value={basic.state} onChange={v => setBasic(p => ({ ...p, state: v }))} options={STATES} />
      </div>
      <SaveBtn onClick={() => saveSection('basic', basic)} loading={saving.basic} />
    </Section>

    <Section title="Company Identity" icon={Building2}>
      <TxtInput label="Official Company Name" value={company.official_company_name} onChange={v => setCompany(p => ({ ...p, official_company_name: v }))} placeholder="Registered legal name" />
      <TxtInput label="Brand / Display Name" value={company.brand_display_name} onChange={v => setCompany(p => ({ ...p, brand_display_name: v }))} placeholder="Public-facing name" />
      <div className="grid grid-cols-2 gap-3">
        <SelInput label="Industry" value={company.industry} onChange={v => setCompany(p => ({ ...p, industry: v }))} options={ORG_INDUSTRIES} />
        <SelInput label="Company Size" value={company.company_size} onChange={v => setCompany(p => ({ ...p, company_size: v }))} options={ORG_SIZES} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TxtInput label="Founded Year" value={String(company.founded_year || '')} onChange={v => setCompany(p => ({ ...p, founded_year: v }))} type="number" placeholder="e.g. 2010" />
        <TxtInput label="Website" value={company.website} onChange={v => setCompany(p => ({ ...p, website: v }))} placeholder="https://…" />
      </div>
      <TxtInput label="LinkedIn URL" value={company.linkedin_url} onChange={v => setCompany(p => ({ ...p, linkedin_url: v }))} placeholder="https://linkedin.com/company/…" />
      <SaveBtn onClick={() => saveSection('company', company)} loading={saving.company} />
    </Section>

    <Section title="About" icon={BookOpen}>
      <TxtArea label="About the Company" value={about.about} onChange={v => setAbout({ about: v })} placeholder="What you do, your mission, what makes you unique…" rows={4} />
      <SaveBtn onClick={() => saveSection('about', about)} loading={saving.about} />
    </Section>
  </>);
}

// ─── Helper ────────────────────────────────────────────────────────────────
function parseJson(value, fallback) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return fallback;
}
