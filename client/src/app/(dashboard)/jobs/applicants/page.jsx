'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { jobsAPI } from '@/lib/api/jobs.api';
import Link from 'next/link';
import {
  Users, ArrowLeft, Loader2, Mail, MapPin, FileText,
  CheckCircle, XCircle, Clock, ChevronRight, ExternalLink,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    cls: 'bg-amber-50 text-amber-600 border border-amber-100' },
  reviewed:   { label: 'Reviewed',   cls: 'bg-blue-50 text-blue-600 border border-blue-100' },
  shortlisted:{ label: 'Shortlisted',cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  rejected:   { label: 'Rejected',   cls: 'bg-red-50 text-red-500 border border-red-100' },
  hired:      { label: 'Hired',      cls: 'bg-violet-50 text-violet-600 border border-violet-100' },
};

function ApplicantCard({ applicant }) {
  const avatar = applicant.profile_photo_url
    || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(applicant.full_name || applicant.username || 'U')}`;
  const status = STATUS_CONFIG[applicant.status] || STATUS_CONFIG.pending;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${applicant.user_id || applicant.id}`}>
          <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
            onError={e => { e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=U'; }} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/profile/${applicant.user_id || applicant.id}`}
                className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                {applicant.full_name || applicant.username}
              </Link>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{applicant.headline || applicant.user_type?.replace('_', ' ') || 'Candidate'}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${status.cls}`}>
              {status.label}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {applicant.email && (
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <Mail size={10} /> {applicant.email}
              </span>
            )}
            {applicant.location && (
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <MapPin size={10} /> {applicant.location}
              </span>
            )}
          </div>

          {/* Cover note */}
          {applicant.cover_letter && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 bg-gray-50 rounded-lg px-3 py-2">
              {applicant.cover_letter}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <Link href={`/profile/${applicant.user_id || applicant.id}`}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all">
              <ExternalLink size={11} /> View Profile
            </Link>
            {applicant.resume_url && (
              <a href={applicant.resume_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all">
                <FileText size={11} /> Resume
              </a>
            )}
            <p className="text-[11px] text-gray-300 ml-auto">
              {applicant.applied_at ? new Date(applicant.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicantsContent() {
  const params = useSearchParams();
  const jobId = params.get('jobId');
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!jobId) { setLoading(false); return; }
    Promise.all([
      jobsAPI.getApplications(jobId),
      jobsAPI.getById(jobId),
    ]).then(([appRes, jobRes]) => {
      setApplicants(appRes.data?.data || []);
      setJobTitle(jobRes.data?.data?.title || jobRes.data?.data?.job_title || 'Job');
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [jobId]);

  const filtered = filter === 'all' ? applicants : applicants.filter(a => a.status === filter);

  const FILTERS = [
    { key: 'all', label: `All (${applicants.length})` },
    { key: 'pending', label: 'Pending' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'hired', label: 'Hired' },
  ];

  if (!jobId) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
        <Users size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-600 mb-1">No job selected</p>
        <p className="text-xs text-gray-400 mb-4">Go to My Job Posts and click Applicants on a listing.</p>
        <Link href="/jobs/my-posts"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
          My Job Posts
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filter === f.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-blue-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-14 text-center">
          <Users size={26} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          </p>
          <p className="text-xs text-gray-400">Candidates who apply will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => <ApplicantCard key={a.id} applicant={a} />)}
        </div>
      )}
    </>
  );
}

export default function ApplicantsPage() {
  const params = useSearchParams ? null : null;

  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-blue-400" /></div>}>
      <ApplicantsPageInner />
    </Suspense>
  );
}

function ApplicantsPageInner() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/jobs/my-posts" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-800">Applicants</h1>
          <p className="text-xs text-gray-400">Review and manage candidates</p>
        </div>
      </div>

      <Suspense fallback={<div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-blue-400" /></div>}>
        <ApplicantsContent />
      </Suspense>
    </div>
  );
}
