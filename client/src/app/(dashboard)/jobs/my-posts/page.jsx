'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI } from '@/lib/api/jobs.api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Briefcase, ArrowLeft, Loader2, Plus, MapPin, Clock,
  Users, Eye, Pencil, Trash2, ChevronRight, Building2,
} from 'lucide-react';

const STATUS_STYLES = {
  active:  'bg-emerald-50 text-emerald-600 border border-emerald-100',
  closed:  'bg-gray-100 text-gray-500 border border-gray-200',
  draft:   'bg-amber-50 text-amber-600 border border-amber-100',
};

export default function MyJobPostsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    jobsAPI.getMyPosts()
      .then(r => setJobs(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this job posting?')) return;
    setDeletingId(id);
    try {
      await jobsAPI.delete(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      toast.success('Job deleted.');
    } catch {
      toast.error('Failed to delete job.');
    } finally {
      setDeletingId(null);
    }
  };

  const isHR = user?.user_type === 'hr_professional';
  const backHref = isHR ? '/home' : '/jobs';

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800">My Job Posts</h1>
            <p className="text-xs text-gray-400">{jobs.length} posting{jobs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Link href="/jobs/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-100">
          <Plus size={14} /> Post a Job
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-emerald-400" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-700 mb-1">No job postings yet</h3>
          <p className="text-xs text-gray-400 mb-4">Post your first job to start receiving applications from candidates.</p>
          <Link href="/jobs/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
            <Plus size={14} /> Post a Job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Briefcase size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/jobs/${job.id}`}
                        className="text-sm font-bold text-gray-800 hover:text-emerald-600 transition-colors truncate">
                        {job.title || job.job_title}
                      </Link>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[job.status] || STATUS_STYLES.active}`}>
                        {job.status || 'active'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {job.company && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Building2 size={10} /> {job.company}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <MapPin size={10} /> {job.location}
                        </span>
                      )}
                      {job.job_type && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Clock size={10} /> {job.job_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Application count */}
                {job.applications_count > 0 && (
                  <Link href={`/jobs/applicants?jobId=${job.id}`}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shrink-0">
                    <Users size={12} /> {job.applications_count}
                  </Link>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <Link href={`/jobs/${job.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all">
                  <Eye size={12} /> View
                </Link>
                <Link href={`/jobs/applicants?jobId=${job.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  <Users size={12} /> Applicants
                </Link>
                <div className="flex-1" />
                <button
                  onClick={() => handleDelete(job.id)}
                  disabled={deletingId === job.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                >
                  {deletingId === job.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
