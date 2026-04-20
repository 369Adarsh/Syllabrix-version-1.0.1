'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI } from '@/lib/api/jobs.api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Briefcase, ArrowLeft, Loader2, MapPin, DollarSign,
  Clock, Building2, FileText, Tag, Send,
} from 'lucide-react';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Remote'];
const EXPERIENCE_LEVELS = ['Entry Level (0-1 yr)', 'Junior (1-3 yrs)', 'Mid (3-5 yrs)', 'Senior (5-10 yrs)', 'Lead / Principal (10+ yrs)'];

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 focus:bg-white transition-all placeholder-gray-400";

export default function CreateJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    company: user?.profile?.company_name || user?.company_name || '',
    location: '',
    job_type: 'Full-time',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    description: '',
    requirements: '',
    skills: '',
    application_deadline: '',
  });

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const canPost = ['teacher', 'institute', 'organization', 'hr_professional'].includes(user?.user_type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required.');
      return;
    }
    setLoading(true);
    try {
      await jobsAPI.create({
        title: form.title.trim(),
        company: form.company.trim() || undefined,
        location: form.location.trim() || undefined,
        job_type: form.job_type || undefined,
        experience_level: form.experience_level || undefined,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        description: form.description.trim(),
        requirements: form.requirements.trim() || undefined,
        skills_required: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        application_deadline: form.application_deadline || undefined,
      });
      toast.success('Job posted successfully!');
      router.push('/jobs/my-posts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  if (!canPost) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Briefcase size={24} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-700 mb-2">Not authorised</h2>
        <p className="text-sm text-gray-400 mb-4">Only HR professionals, institutes, and organisations can post jobs.</p>
        <Link href="/jobs" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
          Browse Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={user?.user_type === 'hr_professional' ? '/home' : '/jobs'}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
          <Briefcase size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-800">Post a Job</h1>
          <p className="text-xs text-gray-400">Fill in the details to attract the right candidates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Basic Info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Basic Information</p>

          <Field label="Job Title" required>
            <div className="relative">
              <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={form.title}
                onChange={e => u('title', e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className={`${inputCls} pl-10`}
                required
              />
            </div>
          </Field>

          <Field label="Company Name">
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={form.company}
                onChange={e => u('company', e.target.value)}
                placeholder="Company name"
                className={`${inputCls} pl-10`}
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Location">
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={form.location}
                  onChange={e => u('location', e.target.value)}
                  placeholder="City, State or Remote"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </Field>

            <Field label="Job Type">
              <div className="relative">
                <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select value={form.job_type} onChange={e => u('job_type', e.target.value)}
                  className={`${inputCls} pl-10 appearance-none`}>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Experience Level">
              <select value={form.experience_level} onChange={e => u('experience_level', e.target.value)}
                className={`${inputCls} appearance-none`}>
                <option value="">Any level</option>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>

            <Field label="Application Deadline">
              <input type="date" value={form.application_deadline}
                onChange={e => u('application_deadline', e.target.value)}
                className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Salary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Salary (Optional)</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min (₹/year)">
              <div className="relative">
                <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="number" value={form.salary_min}
                  onChange={e => u('salary_min', e.target.value)}
                  placeholder="e.g. 500000"
                  className={`${inputCls} pl-10`} />
              </div>
            </Field>
            <Field label="Max (₹/year)">
              <div className="relative">
                <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="number" value={form.salary_max}
                  onChange={e => u('salary_max', e.target.value)}
                  placeholder="e.g. 1200000"
                  className={`${inputCls} pl-10`} />
              </div>
            </Field>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Job Details</p>

          <Field label="Job Description" required>
            <textarea
              value={form.description}
              onChange={e => u('description', e.target.value)}
              rows={5}
              placeholder="Describe the role, responsibilities, and what a typical day looks like..."
              className={`${inputCls} resize-none`}
              required
            />
          </Field>

          <Field label="Requirements">
            <textarea
              value={form.requirements}
              onChange={e => u('requirements', e.target.value)}
              rows={3}
              placeholder="List qualifications, degrees, certifications needed..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field label="Skills Required">
            <div className="relative">
              <Tag size={15} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
              <input
                value={form.skills}
                onChange={e => u('skills', e.target.value)}
                placeholder="React, Node.js, SQL — comma separated"
                className={`${inputCls} pl-10`}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1 ml-1">Separate skills with commas</p>
          </Field>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all disabled:opacity-60 shadow-sm shadow-emerald-200"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={15} /> Post Job</>}
        </button>
      </form>
    </div>
  );
}
