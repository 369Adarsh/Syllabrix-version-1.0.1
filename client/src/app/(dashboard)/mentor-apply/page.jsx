'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api/auth.api';
import { Loader2, CheckCircle, ArrowLeft, Plus, X, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const inp = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';
const lbl = 'block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5';

const Field = ({ label, required, hint, children }) => (
  <div>
    <label className={lbl}>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

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

export default function MentorApplyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    specialization_field: '',
    current_expertise: [],
    motivation: '',
    years_experience: '',
    highest_qualification: '',
    linkedin_url: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.specialization_field.trim()) { toast.error('Specialization field is required'); return; }
    if (form.current_expertise.length === 0) { toast.error('Please add at least one area of expertise'); return; }
    if (!form.motivation.trim()) { toast.error('Please tell us your motivation'); return; }
    setLoading(true);
    try {
      await authAPI.applyMentor(form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-[20px] font-extrabold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-[13px] text-gray-500 mb-6">
            Thank you for applying to become a Syllabrix Mentor. Our team will review your application and reach out within 3–5 business days.
          </p>
          <button
            onClick={() => router.push('/home')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[13px] font-bold shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6 sm:p-8">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-[18px] font-extrabold text-gray-900">Apply to Become a Mentor</h1>
              <p className="text-[12px] text-gray-400">Share your expertise and guide the next generation</p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[12px] font-bold">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-800">{user.username}</p>
                <p className="text-[11px] text-gray-400">{user.email}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Specialization Field" required hint="The primary domain you want to mentor in (e.g. Data Science, Finance, Music, Cricket)">
              <input
                value={form.specialization_field}
                onChange={e => set('specialization_field', e.target.value)}
                placeholder="e.g. Software Engineering, Career Counselling, Fine Arts…"
                className={inp}
              />
            </Field>

            <TagInput
              label="Current Areas of Expertise *"
              tags={form.current_expertise}
              onChange={v => set('current_expertise', v)}
              placeholder="Add a skill or topic you can mentor…"
            />

            <Field label="Years of Experience" hint="Total years of professional / practical experience in your field">
              <input
                type="number"
                min="0"
                max="60"
                value={form.years_experience}
                onChange={e => set('years_experience', e.target.value)}
                placeholder="e.g. 8"
                className={inp}
              />
            </Field>

            <Field label="Highest Qualification">
              <select value={form.highest_qualification} onChange={e => set('highest_qualification', e.target.value)} className={inp}>
                <option value="">Select qualification</option>
                {['High School','Graduation','Post Graduation','Doctorate','Professional Certification','Other'].map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </Field>

            <Field label="LinkedIn Profile URL" hint="Optional but helps us verify your background">
              <input
                type="url"
                value={form.linkedin_url}
                onChange={e => set('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                className={inp}
              />
            </Field>

            <Field label="Why do you want to become a Syllabrix Mentor?" required hint="Tell us about your motivation, teaching philosophy, and what you hope to offer learners.">
              <textarea
                value={form.motivation}
                onChange={e => set('motivation', e.target.value)}
                placeholder="Share your story — what drives you to mentor, any past teaching/coaching experience, and the impact you want to create…"
                rows={5}
                className={inp + ' resize-none'}
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[14px] font-bold shadow-md shadow-blue-200/50 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting…</>
              ) : (
                <><CheckCircle size={15} /> Submit Application</>
              )}
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              Applications are reviewed manually. We may contact you for a short interview before approval.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
