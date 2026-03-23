'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI } from '@/lib/api/jobs.api';
import Link from 'next/link';
import { Briefcase, Plus, Loader2, ChevronRight, MapPin, Clock, FileText, Building2 } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { jobsAPI.list({ limit: 30 }).then(r => setJobs(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm"><Briefcase size={20} className="text-white" /></div>
          <div><h1 className="font-bold text-lg text-gray-800">Jobs Board</h1><p className="text-[11px] text-gray-400">{jobs.length} open positions</p></div>
        </div>
        <div className="flex gap-2">
          <Link href="/jobs/my-applications" className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 border border-gray-200 transition-all">My Applications</Link>
          {(user?.user_type === 'institute' || user?.user_type === 'teacher') && (
            <Link href="/jobs/create" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-700 transition-all">
              <Plus size={14} /> Post Job
            </Link>
          )}
        </div>
      </div>

      {loading ? <div className="text-center py-16"><Loader2 size={28} className="animate-spin text-emerald-500 mx-auto" /></div>
      : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Briefcase size={28} className="text-emerald-400" /></div>
          <h2 className="font-bold text-gray-700 mb-2">No Jobs Posted Yet</h2>
          <p className="text-sm text-gray-400">Check back soon for new opportunities.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map(j => (
            <Link key={j.id} href={`/jobs/${j.id}`}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors"><Building2 size={20} className="text-emerald-500" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{j.title}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                  {j.institute_name && <span className="flex items-center gap-1"><Building2 size={10} /> {j.institute_name}</span>}
                  {j.location && <span className="flex items-center gap-1"><MapPin size={10} /> {j.location}</span>}
                  <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(j.created_at)}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{j.job_type || 'Full-time'}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
