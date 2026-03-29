'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api/auth.api';
import { uploadAPI } from '@/lib/api/upload.api';
import Image from 'next/image';
import { Loader2, ArrowRight, CheckCircle, Plus, X, Lock, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Static data ───────────────────────────────────────────────────────────
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Other'];
const BOARDS = ['CBSE','ICSE','State Board','IB','IGCSE','Other'];
const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12','UG Year 1','UG Year 2','UG Year 3','UG Year 4','PG','Other'];
const MEDIUMS = ['English','Hindi','Gujarati','Tamil','Telugu','Kannada','Malayalam','Marathi','Bengali','Other'];
const SPORTS_LIST = ['Cricket','Football','Basketball','Badminton','Tennis','Table Tennis','Chess','Swimming','Athletics / Running','Volleyball','Kabaddi','Kho-Kho','Gymnastics','Cycling','Yoga','Hockey','Boxing','Wrestling','Other'];
const TECH_COURSES = ['Coding Basics','Digital Literacy','Data Analysis Basics','AI & Machine Learning Intro','Web Design Basics','Cybersecurity Basics','Python Programming','Excel & Spreadsheets'];
const FUNC_COURSES = ['Communication Skills','Time Management','Critical Thinking','Leadership Basics','Financial Literacy','Entrepreneurship Basics','Emotional Intelligence','Public Speaking'];
const SPEC_COURSES = ['Classical Dance','Western Dance','Hindustani Music','Carnatic Music','Guitar / Keyboard','Coding / Programming','Yoga','Fitness Training','Tarot / Astrology','Fine Arts','Martial Arts','Swimming Academy','Other'];
const STREAMS = ['Engineering','Medical / Healthcare','Commerce','Arts / Humanities','Science','Law','Media / Journalism','Design','Agriculture','Other'];
const EXAM_TYPES = ['UPSC Civil Services','SSC CGL','SSC CHSL','IBPS PO','IBPS Clerk','RRB NTPC','State PSC','NDA / CDS','CLAT','CAT / MBA','GATE','Other'];
const INDUSTRIES = ['IT / Software','Finance / Banking','Healthcare','Education','Manufacturing','Retail / E-commerce','Media / Entertainment','Government / PSU','Consulting','Real Estate','Agriculture','Other'];
const LEARNING_GOALS = ['Get a Promotion','Switch Career','Start a Business','Learn a New Technology','Improve Communication','Build Leadership Skills','Get a Certification','Improve Work-Life Balance','Other'];
const LEARNING_INTERESTS = ['Coding','Design','Data Science','AI / Machine Learning','Finance','Public Speaking','Music','Fitness','Photography','Writing / Content'];
const ORG_INDUSTRIES = ['Technology / Software','Manufacturing / Industrial','Banking / Financial Services','Healthcare / Pharma','Retail / E-commerce','Logistics / Supply Chain','Education','Consulting / Professional Services','Government / Public Sector','Media / Entertainment','Real Estate','Other'];
const ORG_SIZES = ['1-50 (Startup)','51-200 (Small)','201-500 (Mid-market)','501-2000 (Enterprise)','2001-10000 (Large Enterprise)','10000+ (Global Enterprise)'];

// ─── Helpers ───────────────────────────────────────────────────────────────
const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

// ─── Reusable input components ─────────────────────────────────────────────
const inp = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';
const lbl = 'block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5';

const Field = ({ label, required, children }) => (
  <div><label className={lbl}>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>{children}</div>
);
const Inp = ({ label, name, form, set, required, placeholder, type = 'text', readOnly }) => (
  <Field label={label} required={required}>
    <div className="relative">
      <input
        type={type}
        value={form[name] || ''}
        onChange={readOnly ? undefined : e => set(name, e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={inp + (readOnly ? ' bg-gray-100 text-gray-500 cursor-not-allowed pr-9' : '')}
      />
      {readOnly && <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
    </div>
  </Field>
);

// Full name is always locked — stored at registration and shown read-only.
// If not captured (pre-fix accounts), show a support notice instead of a blank editable field.
const FullNameField = ({ form, user, label = 'Full Name', placeholder = 'Your full name' }) => (
  <div>
    <Field label={label} required>
      <div className="relative">
        <input
          type="text"
          value={form.full_name || ''}
          readOnly
          placeholder={placeholder}
          className={inp + ' bg-gray-100 text-gray-500 cursor-not-allowed pr-9'}
        />
        <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
    </Field>
    {!user?.full_name && (
      <p className="text-[11px] text-amber-600 mt-1">
        Name was not captured at sign-up — contact{' '}
        <a href="mailto:support@syllabrix.com" className="underline">support@syllabrix.com</a>{' '}
        to update it.
      </p>
    )}
  </div>
);
const Sel = ({ label, name, form, set, options, required, placeholder }) => (
  <Field label={label} required={required}>
    <select value={form[name] || ''} onChange={e => set(name, e.target.value)} className={inp}>
      <option value="">{placeholder || 'Select…'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </Field>
);
const Txt = ({ label, name, form, set, placeholder, rows = 3 }) => (
  <Field label={label}>
    <textarea value={form[name] || ''} onChange={e => set(name, e.target.value)} placeholder={placeholder} rows={rows} className={inp + ' resize-none'} />
  </Field>
);

// Tag Input
const TagInput = ({ label, tags, onChange, placeholder }) => {
  const [val, setVal] = useState('');
  const add = () => { const v = val.trim(); if (v && !tags.includes(v)) { onChange([...tags, v]); } setVal(''); };
  return (
    <Field label={label}>
      <div className="flex gap-2 mb-2 flex-wrap">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-[12px] text-blue-700 font-medium">
            {t}<button type="button" onClick={() => onChange(tags.filter(x => x !== t))}><X size={11} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} className={inp + ' flex-1'} />
        <button type="button" onClick={add} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold flex items-center gap-1 hover:bg-blue-700 transition-all"><Plus size={13} /> Add</button>
      </div>
    </Field>
  );
};

// Checkbox group
const CheckGroup = ({ label, options, selected, onChange, max, required }) => {
  const toggle = (v) => {
    if (selected.includes(v)) { onChange(selected.filter(x => x !== v)); }
    else if (!max || selected.length < max) { onChange([...selected, v]); }
    else { toast.error(`Max ${max} selections allowed`); }
  };
  return (
    <Field label={label} required={required}>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${selected.includes(o) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
            {o}
          </button>
        ))}
      </div>
    </Field>
  );
};

// Progress bar
const Progress = ({ step, total }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Step {step} of {total}</span>
      <span className="text-[11px] text-gray-400">{Math.round((step / total) * 100)}% complete</span>
    </div>
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(step / total) * 100}%` }} />
    </div>
  </div>
);

const NavBtns = ({ step, total, onBack, onNext, loading, isLast, onSkip, skipLoading }) => (
  <div className="pt-2 space-y-2">
    <div className="flex gap-3">
      {step > 1 && (
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-xl font-semibold text-[13px] bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
          Back
        </button>
      )}
      <button type="button" onClick={onNext} disabled={loading || skipLoading}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] transition-all disabled:opacity-50 ${isLast ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'}`}>
        {loading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : isLast ? <><CheckCircle size={14} /> Complete Profile</> : <>Next <ArrowRight size={14} /></>}
      </button>
    </div>
    {onSkip && (
      <div className="text-center">
        <button type="button" onClick={onSkip} disabled={skipLoading || loading}
          className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40">
          {skipLoading ? 'Skipping…' : 'Skip for now →'}
        </button>
      </div>
    )}
  </div>
);

// ─── Main page ─────────────────────────────────────────────────────────────
export default function CompleteProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef(null);
  // Pre-populate full_name from user record (stored at registration)
  const [form, setForm] = useState(() => ({ full_name: '' }));
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Pre-fill full_name from user record — always locked, never editable
  useEffect(() => {
    if (user?.full_name) {
      setForm(p => ({ ...p, full_name: user.full_name }));
    }
  }, [user?.full_name]);

  // Pre-load existing profile photo
  useEffect(() => {
    if (user?.profile_photo_url) setPhotoUrl(user.profile_photo_url);
  }, [user?.profile_photo_url]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const res = await uploadAPI.profilePhoto(file);
      const url = res.data?.data?.url || res.data?.url;
      if (!url) throw new Error('No URL returned');
      setPhotoUrl(url);
      toast.success('Photo uploaded!');
    } catch {
      toast.error('Photo upload failed. Please try again.');
    } finally {
      setPhotoUploading(false);
      // Reset input so same file can be re-selected if needed
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!user) router.push('/sign-in');
    else if (user.is_profile_complete) router.push('/home');
  }, [user, router]);

  if (!user) return null;

  const type = user.user_type;
  const age = calcAge(user.date_of_birth);
  const isYoung = age !== null && age < 13;

  // ── Steps config ──────────────────────────────────────────────────────────
  const totalSteps = { student: 6, teacher: 5, institute: 3, parent: 3, professional_learner: 5, organization: 3 }[type] || 3;

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (step === 1 && !form.full_name?.trim()) { toast.error('Full name is required'); return false; }
    if (type === 'student') {
      if (step === 2 && !form.education_level) { toast.error('Please select your education type'); return false; }
      if (step === 4 && !form.hobby?.trim()) { toast.error('Hobby is required'); return false; }
      if (step === 5 && (!form.sports || form.sports.length === 0)) { toast.error('Please select at least one sport'); return false; }
      if (step === 5 && isYoung && !form.guardian_user_id?.trim()) { toast.error('Parent\'s Syllabrix ID is required for students under 13'); return false; }
      if (step === 6) {
        const tc = form.tech_courses || []; const fc = form.func_courses || [];
        if (tc.length !== 2) { toast.error('Please select exactly 2 technical courses'); return false; }
        if (fc.length !== 2) { toast.error('Please select exactly 2 functional courses'); return false; }
      }
    }
    if (type === 'teacher') {
      if (step === 2 && !form.subject_primary?.trim()) { toast.error('Primary subject is required'); return false; }
      if (step === 4 && !form.hobby?.trim()) { toast.error('Hobby is required'); return false; }
      if (step === 4) {
        const tc = form.tech_courses || []; const fc = form.func_courses || [];
        if (tc.length !== 2) { toast.error('Please select exactly 2 technical courses'); return false; }
        if (fc.length !== 2) { toast.error('Please select exactly 2 functional courses'); return false; }
      }
    }
    if (type === 'institute') {
      if (step === 1 && !form.name?.trim()) { toast.error('Institute name is required'); return false; }
      if (step === 1 && !form.institute_type) { toast.error('Institute type is required'); return false; }
      if (step === 2 && !form.platform_handler_name?.trim()) { toast.error('Platform handler name is required'); return false; }
    }
    if (type === 'parent') {
      if (step === 2 && !form.relationship) { toast.error('Relationship is required'); return false; }
    }
    if (type === 'professional_learner') {
      if (step === 5 && !form.hobby?.trim()) { toast.error('Hobby is required'); return false; }
      if (step === 5) {
        const tc = form.tech_courses || []; const fc = form.func_courses || [];
        if (tc.length !== 2) { toast.error('Please select exactly 2 technical courses'); return false; }
        if (fc.length !== 2) { toast.error('Please select exactly 2 functional courses'); return false; }
      }
    }
    if (type === 'organization') {
      if (step === 1 && !form.full_name?.trim()) { toast.error('Admin contact name is required'); return false; }
      if (step === 2 && !form.official_company_name?.trim()) { toast.error('Official company name is required'); return false; }
      if (step === 2 && !form.industry) { toast.error('Please select an industry'); return false; }
    }
    return true;
  };

  // ── Build payload ─────────────────────────────────────────────────────────
  const buildPayload = () => {
    const p = { ...form };
    // Parse hobby string → array
    if (typeof p.hobby === 'string') p.hobby = p.hobby.split(',').map(s => s.trim()).filter(Boolean);
    // Merge tech + functional courses
    p.mandatory_courses = { technical: p.tech_courses || [], functional: p.func_courses || [] };
    delete p.tech_courses; delete p.func_courses;
    // Parse chain_schools (newline separated)
    if (typeof p.chain_schools === 'string') p.chain_schools = p.chain_schools.split('\n').map(s => s.trim()).filter(Boolean);
    // Loved professions array
    if (p.loved_professions && !Array.isArray(p.loved_professions)) {
      p.loved_professions = Object.values(p.loved_professions || {}).filter(Boolean);
    }
    return p;
  };

  const handleSkip = async () => {
    setSkipLoading(true);
    try {
      await authAPI.skipProfile();
      await refreshUser();
      router.push('/home');
    } catch {
      toast.error('Could not skip profile. Please try again.');
    } finally {
      setSkipLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validate()) return;
    if (step < totalSteps) { setStep(s => s + 1); return; }
    setLoading(true);
    try {
      await authAPI.completeProfile(type, buildPayload());
      await refreshUser();
      toast.success('Welcome to Syllabrix! 🎉');
      window.location.href = '/home';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save profile');
    } finally { setLoading(false); }
  };

  // ── Loved professions helper ───────────────────────────────────────────────
  const lovedProfessions = form.loved_professions_arr || [''];
  const setLovedProf = (arr) => setForm(p => ({ ...p, loved_professions_arr: arr, loved_professions: arr.filter(Boolean) }));

  // ─────────────────────────────── RENDER ───────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-5">
          <Image src="/images/logo/syllabrix-logo.png" alt="Syllabrix" width={180} height={50} className="h-9 w-auto mx-auto" priority />
          <p className="text-[12px] text-gray-400 mt-1">Complete your profile to get started</p>

          {/* ── Profile photo uploader ── */}
          <div className="flex flex-col items-center mt-4 mb-2">
            <button
              type="button"
              onClick={() => !photoUploading && photoInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 group"
              aria-label="Upload profile photo"
            >
              {photoUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <Loader2 size={22} className="text-white animate-spin" />
                </div>
              ) : photoUrl ? (
                <>
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera size={18} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <Camera size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[9px] text-gray-400 group-hover:text-blue-500 font-medium leading-tight">Add photo</span>
                </div>
              )}
            </button>
            <p className="text-[10px] text-gray-400 mt-1.5">Optional — you can add it later</p>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Syllabrix ID badge */}
          {user?.syllabrix_id && (
            <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              <Lock size={10} className="text-blue-400" />
              <span className="text-[11px] font-bold text-blue-700 tracking-wider">{user.syllabrix_id}</span>
            </div>
          )}
          {user?.full_name && (
            <p className="text-[12px] font-semibold text-gray-700 mt-1">{user.full_name}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8">
          <Progress step={step} total={totalSteps} />

          {/* ═══════════════ STUDENT ═══════════════ */}
          {type === 'student' && step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Basic Information</h2>
              <FullNameField form={form} user={user} />
              <Inp label="Phone Number" name="phone" form={form} set={set} placeholder="+91 XXXXX XXXXX" type="tel" />
              <Sel label="Gender" name="gender" form={form} set={set} options={['Male','Female','Other','Prefer not to say']} />
              <div className="grid grid-cols-2 gap-3">
                <Inp label="City" name="address_city" form={form} set={set} placeholder="Your city" />
                <Sel label="State" name="address_state" form={form} set={set} options={STATES} />
              </div>
              <NavBtns step={step} total={totalSteps} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'student' && step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Education Type</h2>
              <p className="text-[12px] text-gray-400 -mt-1">What best describes your current education?</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 'school', icon: '🏫', label: 'School Student', sub: 'Class 1–12' },
                  { v: 'college', icon: '🎓', label: 'College / University', sub: 'UG or PG' },
                  { v: 'coaching', icon: '📚', label: 'Competitive Exam', sub: 'UPSC / SSC / Banking' },
                  { v: 'specialization', icon: '🎭', label: 'Specialization Course', sub: 'Dance / Music / IT / Yoga' },
                ].map(({ v, icon, label, sub }) => (
                  <button key={v} type="button" onClick={() => set('education_level', v)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${form.education_level === v ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/15' : 'border-gray-100 hover:border-gray-200'}`}>
                    <span className="text-2xl block mb-1">{icon}</span>
                    <p className={`text-[12px] font-bold ${form.education_level === v ? 'text-blue-700' : 'text-gray-700'}`}>{label}</p>
                    <p className={`text-[10px] mt-0.5 ${form.education_level === v ? 'text-blue-500' : 'text-gray-400'}`}>{sub}</p>
                  </button>
                ))}
              </div>
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(1)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'student' && step === 3 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Education Details</h2>
              {form.education_level === 'school' && (<>
                <Inp label="School Name" name="school_name" form={form} set={set} placeholder="Name of your school" />
                <div className="grid grid-cols-2 gap-3">
                  <Sel label="Class" name="class_name" form={form} set={set} options={CLASSES} required placeholder="Select class" />
                  <Sel label="Board" name="board" form={form} set={set} options={BOARDS} required placeholder="Select board" />
                </div>
                <Sel label="Medium of Instruction" name="medium" form={form} set={set} options={MEDIUMS} />
              </>)}
              {form.education_level === 'college' && (<>
                <Inp label="College / Institute Name" name="college_name" form={form} set={set} placeholder="Name of your college" />
                <Inp label="University" name="university" form={form} set={set} placeholder="Affiliated university" />
                <Sel label="Subject Stream" name="subject_stream" form={form} set={set} options={STREAMS} required placeholder="Select stream" />
              </>)}
              {form.education_level === 'coaching' && (<>
                <Sel label="Exam Preparing For" name="exam_type" form={form} set={set} options={EXAM_TYPES} required placeholder="Select exam" />
                <Sel label="Target Year" name="exam_target_year" form={form} set={set} options={['2025','2026','2027','2028','2029']} placeholder="Select year" />
                <Inp label="Coaching Institute (optional)" name="school_name" form={form} set={set} placeholder="Name of coaching center" />
              </>)}
              {form.education_level === 'specialization' && (<>
                <CheckGroup label="Courses / Activities (select all that apply)" options={SPEC_COURSES} selected={form.specialization_courses || []} onChange={v => set('specialization_courses', v)} />
              </>)}
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(2)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'student' && step === 4 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Personal Details</h2>
              <Txt label="My Ambition" name="ambition" form={form} set={set} placeholder="What do you want to achieve in life? e.g. Become a scientist, start my own company, make India proud in cricket…" rows={2} />
              <Field label="Hobby" required>
                <input value={form.hobby || ''} onChange={e => set('hobby', e.target.value)} placeholder="e.g. Drawing, Football, Coding, Reading (comma-separated)" className={inp} />
                <p className="text-[10px] text-gray-400 mt-1">Separate multiple hobbies with commas. This helps our AI personalise your experience.</p>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Inp label="Favourite Subject" name="favorite_subject" form={form} set={set} placeholder="e.g. Mathematics" />
                <Inp label="Difficult Subject" name="difficult_subject" form={form} set={set} placeholder="e.g. Chemistry" />
              </div>
              <Field label="Professions I Love (up to 5)">
                {lovedProfessions.map((v, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={v} onChange={e => { const a = [...lovedProfessions]; a[i] = e.target.value; setLovedProf(a); }} placeholder={`Profession ${i + 1}`} className={inp + ' flex-1'} />
                    {lovedProfessions.length > 1 && <button type="button" onClick={() => setLovedProf(lovedProfessions.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><X size={16} /></button>}
                  </div>
                ))}
                {lovedProfessions.length < 5 && (
                  <button type="button" onClick={() => setLovedProf([...lovedProfessions, ''])} className="text-[12px] text-blue-600 font-semibold flex items-center gap-1 mt-1 hover:text-blue-700">
                    <Plus size={13} /> Add another profession
                  </button>
                )}
              </Field>
              <Txt label="I see my future as…" name="future_vision" form={form} set={set} placeholder="Describe your dream future in a few words" rows={2} />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(3)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'student' && step === 5 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Sports</h2>
              <p className="text-[12px] text-gray-400 -mt-1">Sports participation is mandatory on Syllabrix.</p>
              <CheckGroup label="Sports you play / follow" options={SPORTS_LIST} selected={form.sports || []} onChange={v => set('sports', v)} required />
              <Sel label="Your Level" name="sports_level" form={form} set={set} options={['Beginner','Intermediate','Advanced','Competitive']} />
              {isYoung && (
                <Field label="Parent's Syllabrix ID" required>
                  <input value={form.guardian_user_id || ''} onChange={e => set('guardian_user_id', e.target.value)} placeholder="e.g. G-RAJ1234 (required for under 13)" className={inp} />
                  <p className="text-[10px] text-amber-600 mt-1">Required for students under 13 years old.</p>
                </Field>
              )}
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(4)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'student' && step === 6 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Free Course Selection</h2>
              <p className="text-[12px] text-gray-400 -mt-1">Select exactly 2 technical + 2 functional courses (free forever).</p>
              <CheckGroup label="Technical Courses (pick 2)" options={TECH_COURSES} selected={form.tech_courses || []} onChange={v => set('tech_courses', v)} max={2} required />
              <CheckGroup label="Functional Courses (pick 2)" options={FUNC_COURSES} selected={form.func_courses || []} onChange={v => set('func_courses', v)} max={2} required />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(5)} onNext={handleNext} loading={loading} isLast onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {/* ═══════════════ TEACHER ═══════════════ */}
          {type === 'teacher' && step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Basic Information</h2>
              <FullNameField form={form} user={user} />
              <Inp label="Phone Number" name="phone" form={form} set={set} placeholder="+91 XXXXX XXXXX" type="tel" />
              <Sel label="Gender" name="gender" form={form} set={set} options={['Male','Female','Other','Prefer not to say']} />
              <div className="grid grid-cols-2 gap-3">
                <Inp label="City" name="city" form={form} set={set} placeholder="Your city" />
                <Sel label="State" name="state" form={form} set={set} options={STATES} />
              </div>
              <NavBtns step={step} total={totalSteps} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'teacher' && step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Teaching Details</h2>
              <Inp label="Primary Subject" name="subject_primary" form={form} set={set} required placeholder="e.g. Mathematics, Physics" />
              <TagInput label="Additional Subjects" tags={form.subjects_additional || []} onChange={v => set('subjects_additional', v)} placeholder="Add subject…" />
              <CheckGroup label="Board Experience" options={BOARDS.concat(['All Boards'])} selected={form.board_experience || []} onChange={v => set('board_experience', v)} />
              <Field label="Teacher Type" required>
                <div className="flex gap-3">
                  {['freelancer','institute_affiliated','both'].map(t => (
                    <button key={t} type="button" onClick={() => set('teacher_type', t)}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold border-2 transition-all capitalize ${form.teacher_type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </Field>
              {(form.teacher_type === 'institute_affiliated' || form.teacher_type === 'both') && (
                <Inp label="Current Institute" name="institute_name" form={form} set={set} placeholder="School / College / Academy name" />
              )}
              <Inp label="Years of Experience" name="experience_years" form={form} set={set} placeholder="e.g. 5" type="number" />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(1)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'teacher' && step === 3 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Experience & Background</h2>
              <TagInput label="Qualifications" tags={form.qualifications || []} onChange={v => set('qualifications', v)} placeholder="e.g. M.Sc., B.Ed., PhD…" />
              <TagInput label="Past Institutes" tags={form.past_institutes || []} onChange={v => set('past_institutes', v)} placeholder="Add past school / college…" />
              <Field label="Do you run your own teaching business?">
                <div className="flex gap-3">
                  {[['yes', true], ['no', false]].map(([label, val]) => (
                    <button key={label} type="button" onClick={() => set('has_own_business', val)}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold border-2 transition-all capitalize ${form.has_own_business === val ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              {form.has_own_business && (
                <Inp label="Business / Institute Name" name="business_name" form={form} set={set} placeholder="Name of your teaching business" />
              )}
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(2)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'teacher' && step === 4 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Interests & Courses</h2>
              <Field label="Hobby" required>
                <input value={form.hobby || ''} onChange={e => set('hobby', e.target.value)} placeholder="e.g. Reading, Cricket, Music (comma-separated)" className={inp} />
              </Field>
              <CheckGroup label="Skills I Want to Learn" options={LEARNING_INTERESTS} selected={form.learning_interests || []} onChange={v => set('learning_interests', v)} />
              <CheckGroup label="Technical Courses (pick 2)" options={TECH_COURSES} selected={form.tech_courses || []} onChange={v => set('tech_courses', v)} max={2} required />
              <CheckGroup label="Functional Courses (pick 2)" options={FUNC_COURSES} selected={form.func_courses || []} onChange={v => set('func_courses', v)} max={2} required />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(3)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'teacher' && step === 5 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">You as a Learner</h2>
              <p className="text-[12px] text-gray-400 -mt-1">Teachers who keep learning make the best teachers. Tell us about your learning side.</p>
              <Txt label="How do you think of yourself as a student?" name="self_as_learner" form={form} set={set} placeholder="e.g. I love exploring new topics outside my subject, I prefer visual learning…" rows={3} />
              <Txt label="How will you use Syllabrix as a student?" name="platform_as_student" form={form} set={set} placeholder="e.g. Take courses, earn certificates, explore career paths…" rows={2} />
              <Txt label="How will you use Syllabrix as a teacher?" name="platform_as_teacher" form={form} set={set} placeholder="e.g. Conduct live classes, create content, connect with students…" rows={2} />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(4)} onNext={handleNext} loading={loading} isLast onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {/* ═══════════════ INSTITUTE ═══════════════ */}
          {type === 'institute' && step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Institute Information</h2>
              <Inp label="Institute Name" name="name" form={form} set={set} required placeholder="Official name of your institute" />
              <Sel label="Institute Type" name="institute_type" form={form} set={set} required options={['school','college','university','coaching','online_academy','other']} placeholder="Select type" />
              <div className="grid grid-cols-2 gap-3">
                <Inp label="Established Year" name="established_year" form={form} set={set} placeholder="e.g. 1995" type="number" />
                <Inp label="UDISE Code" name="udise_code" form={form} set={set} placeholder="For schools" />
              </div>
              <Inp label="Registration Number" name="registration_number" form={form} set={set} placeholder="Govt. registration / affiliation no." />
              <NavBtns step={step} total={totalSteps} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'institute' && step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Location & Platform Handler</h2>
              <Inp label="Address" name="address_line1" form={form} set={set} placeholder="Street / Area" />
              <div className="grid grid-cols-2 gap-3">
                <Inp label="City" name="city" form={form} set={set} placeholder="City" />
                <Sel label="State" name="state" form={form} set={set} options={STATES} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Inp label="Pincode" name="pincode" form={form} set={set} placeholder="6-digit pincode" />
                <Inp label="Website" name="website" form={form} set={set} placeholder="https://…" />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">Platform Handler (person managing this account)</p>
                <Inp label="Handler Name" name="platform_handler_name" form={form} set={set} required placeholder="Full name" />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Inp label="Handler Phone" name="platform_handler_phone" form={form} set={set} placeholder="+91 XXXXX XXXXX" type="tel" />
                  <Inp label="Handler Email" name="platform_handler_email" form={form} set={set} placeholder="handler@institute.com" type="email" />
                </div>
              </div>
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(1)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'institute' && step === 3 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Operations & Details</h2>
              <CheckGroup label="Boards / Syllabi Offered" options={[...BOARDS,'Multiple']} selected={form.boards_offered || []} onChange={v => set('boards_offered', v)} />
              <Txt label="About the Institute" name="about" form={form} set={set} placeholder="Brief description of your institute, its mission, key achievements…" rows={3} />
              <Txt label="How will you use Syllabrix for learning & teaching?" name="how_use_platform" form={form} set={set} placeholder="e.g. Conduct live classes, assign AI-based learning paths to students, track progress, share study materials, connect with parent community…" rows={3} />
              <Field label="Branch / Chain Schools (one per line, optional)">
                <textarea value={form.chain_schools || ''} onChange={e => set('chain_schools', e.target.value)} placeholder={"Branch 1 name\nBranch 2 name"} rows={3} className={inp + ' resize-none'} />
              </Field>
              <Txt label="How are parents involved? (optional)" name="parent_involvement_policy" form={form} set={set} placeholder="Describe your parent engagement model…" rows={2} />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(2)} onNext={handleNext} loading={loading} isLast onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {/* ═══════════════ PARENT ═══════════════ */}
          {type === 'parent' && step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Basic Information</h2>
              <FullNameField form={form} user={user} />
              <Inp label="Phone Number" name="phone" form={form} set={set} placeholder="+91 XXXXX XXXXX" type="tel" />
              <Sel label="Gender" name="gender" form={form} set={set} options={['Male','Female','Other','Prefer not to say']} />
              <div className="grid grid-cols-2 gap-3">
                <Inp label="City" name="city" form={form} set={set} placeholder="Your city" />
                <Sel label="State" name="state" form={form} set={set} options={STATES} />
              </div>
              <NavBtns step={step} total={totalSteps} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'parent' && step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Family Details</h2>
              <Sel label="Relationship to Child" name="relationship" form={form} set={set} required options={['Mother','Father','Guardian','Other']} placeholder="Select relationship" />
              <Inp label="Occupation" name="occupation" form={form} set={set} placeholder="e.g. Engineer, Teacher, Business owner" />
              <Inp label="Notification Email" name="notification_email" form={form} set={set} placeholder="Email for child activity reports" type="email" />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(1)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'parent' && step === 3 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Your Involvement</h2>
              <p className="text-[12px] text-gray-400 -mt-1">Help us understand how you support your child.</p>
              <Txt label="How do you support your child's hobbies?" name="hobby_involvement" form={form} set={set} placeholder="e.g. I take them to art classes, buy materials, attend events…" rows={3} />
              <Txt label="How do you support your child's sports?" name="sports_involvement" form={form} set={set} placeholder="e.g. I attend matches, enrolled them in coaching, practice together…" rows={3} />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(2)} onNext={handleNext} loading={loading} isLast onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {/* ═══════════════ PROFESSIONAL LEARNER ═══════════════ */}
          {type === 'professional_learner' && step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Basic Information</h2>
              <FullNameField form={form} user={user} />
              <Inp label="Phone Number" name="phone" form={form} set={set} placeholder="+91 XXXXX XXXXX" type="tel" />
              <Sel label="Gender" name="gender" form={form} set={set} options={['Male','Female','Other','Prefer not to say']} />
              <div className="grid grid-cols-2 gap-3">
                <Inp label="City" name="address_city" form={form} set={set} placeholder="Your city" />
                <Sel label="State" name="address_state" form={form} set={set} options={STATES} />
              </div>
              <NavBtns step={step} total={totalSteps} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'professional_learner' && step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Professional Details</h2>
              <Inp label="Current Company / Organisation" name="current_company" form={form} set={set} placeholder="Where do you work?" />
              <Inp label="Designation / Role" name="designation" form={form} set={set} placeholder="e.g. Software Engineer, Manager" />
              <Sel label="Industry" name="industry" form={form} set={set} options={INDUSTRIES} placeholder="Select industry" />
              <Inp label="Years of Experience" name="experience_years" form={form} set={set} placeholder="0–40" type="number" />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(1)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'professional_learner' && step === 3 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Education & Skills</h2>
              <Sel label="Highest Education Level" name="education_level" form={form} set={set} options={['High School','Graduation','Post Graduation','Doctorate','Other']} placeholder="Select level" />
              <TagInput label="Current Skills" tags={form.skills || []} onChange={v => set('skills', v)} placeholder="Add a skill…" />
              <TagInput label="Previous Companies / Organisations" tags={form.previous_companies || []} onChange={v => set('previous_companies', v)} placeholder="Add past employer…" />
              <CheckGroup label="Learning Goals (select all that apply)" options={LEARNING_GOALS} selected={form.learning_goals || []} onChange={v => set('learning_goals', v)} />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(2)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'professional_learner' && step === 4 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Platform Usage</h2>
              <Field label="Are you looking for a new job?">
                <div className="flex gap-3">
                  {[['Yes, actively looking', true], ['No, just upskilling', false]].map(([label, val]) => (
                    <button key={String(val)} type="button" onClick={() => set('looking_for_job', val)}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold border-2 transition-all ${form.looking_for_job === val ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <Txt label="How do you plan to use Syllabrix?" name="how_use_platform" form={form} set={set} placeholder="e.g. Learn new skills, get certified, network with peers, find job opportunities…" rows={3} />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(3)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'professional_learner' && step === 5 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Hobby & Free Courses</h2>
              <Field label="Hobby" required>
                <input value={form.hobby || ''} onChange={e => set('hobby', e.target.value)} placeholder="e.g. Photography, Cricket, Cooking (comma-separated)" className={inp} />
              </Field>
              <CheckGroup label="Technical Courses (pick 2)" options={TECH_COURSES} selected={form.tech_courses || []} onChange={v => set('tech_courses', v)} max={2} required />
              <CheckGroup label="Functional Courses (pick 2)" options={FUNC_COURSES} selected={form.func_courses || []} onChange={v => set('func_courses', v)} max={2} required />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(4)} onNext={handleNext} loading={loading} isLast onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {/* ═══════════════ ORGANIZATION ═══════════════ */}
          {type === 'organization' && step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Admin Contact Details</h2>
              <p className="text-[12px] text-gray-400 -mt-1">Details of the person managing this organization account.</p>
              <FullNameField form={form} user={user} label="Admin Full Name" placeholder="Contact person's full name" />
              <Inp label="Admin Phone" name="phone" form={form} set={set} placeholder="+91 XXXXX XXXXX" type="tel" />
              <div className="grid grid-cols-2 gap-3">
                <Inp label="City" name="address_city" form={form} set={set} placeholder="City of HQ" />
                <Sel label="State" name="address_state" form={form} set={set} options={STATES} />
              </div>
              <NavBtns step={step} total={totalSteps} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'organization' && step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">Company Identity</h2>
              <Inp label="Official Company Name" name="official_company_name" form={form} set={set} required placeholder="Registered legal name" />
              <Inp label="Brand / Display Name" name="brand_display_name" form={form} set={set} placeholder="Name you go by publicly (if different)" />
              <Sel label="Industry" name="industry" form={form} set={set} required options={ORG_INDUSTRIES} placeholder="Select industry" />
              <Sel label="Company Size" name="company_size" form={form} set={set} options={ORG_SIZES} placeholder="Select size" />
              <div className="grid grid-cols-2 gap-3">
                <Inp label="Founded Year" name="founded_year" form={form} set={set} placeholder="e.g. 2010" type="number" />
                <Inp label="Website" name="website" form={form} set={set} placeholder="https://company.com" />
              </div>
              <Inp label="LinkedIn URL" name="linkedin_url" form={form} set={set} placeholder="https://linkedin.com/company/…" />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(1)} onNext={handleNext} onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}

          {type === 'organization' && step === 3 && (
            <div className="space-y-4">
              <h2 className="text-[17px] font-extrabold text-gray-900">About Your Organization</h2>
              <Txt label="About the Company" name="about" form={form} set={set} placeholder="Brief description — what you do, your mission, what makes you unique…" rows={4} />
              <Txt label="How will you use Syllabrix?" name="how_use_platform" form={form} set={set} placeholder="e.g. Post job openings, upskill employees, hire fresh talent, run training programmes…" rows={3} />
              <NavBtns step={step} total={totalSteps} onBack={() => setStep(2)} onNext={handleNext} loading={loading} isLast onSkip={handleSkip} skipLoading={skipLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
