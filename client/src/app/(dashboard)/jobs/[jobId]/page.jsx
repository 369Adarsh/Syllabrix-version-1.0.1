'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI } from '@/lib/api/jobs.api';
import Link from 'next/link';
import { Briefcase, ArrowLeft, Loader2, MapPin, Calendar, Building2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { jobsAPI.getById(jobId).then(r => setJob(r.data?.data)).catch(() => {}).finally(() => setLoading(false)); }, [jobId]);

  const handleApply = async () => {
    try { await jobsAPI.apply(jobId, {}); toast.success('Applied successfully!'); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-emerald-500" /></div>;
  if (!job) return <div className="text-center py-12"><p className="text-gray-400">Job not found</p></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 p-6">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-emerald-200/80 text-xs font-medium hover:text-white mb-3 transition-colors"><ArrowLeft size={14} /> Back to Jobs</Link>
          <h1 className="text-xl font-extrabold text-white mb-1">{job.title}</h1>
          <div className="flex flex-wrap gap-3 text-emerald-200/70 text-xs mt-2">
            {job.institute_name && <span className="flex items-center gap-1"><Building2 size={12} /> {job.institute_name}</span>}
            {job.location && <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>}
            {job.created_at && <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(job.created_at)}</span>}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6">
        {job.description && <p className="text-sm text-gray-700 leading-relaxed mb-5">{job.description}</p>}
        <div className="flex flex-wrap gap-2 mb-5">
          {job.job_type && <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">{job.job_type}</span>}
          {job.salary_range && <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold">{job.salary_range}</span>}
          {job.subject && <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[11px] font-bold">{job.subject}</span>}
        </div>
        <button onClick={handleApply}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-[0.98]">
          Apply Now
        </button>
      </div>
    </div>
  );
}
