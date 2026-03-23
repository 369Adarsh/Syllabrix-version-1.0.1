'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI } from '@/lib/api/jobs.api';
import Link from 'next/link';
import { Briefcase, ArrowLeft, Loader2 } from 'lucide-react';

export default function Page() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { jobsAPI.getMyPosts().then(r => setData(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/jobs" className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ArrowLeft size={16} className="text-gray-500" /></Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm"><Briefcase size={20} className="text-white" /></div>
        <h1 className="font-bold text-lg text-gray-800">My Job Posts</h1>
      </div>
      {loading ? <div className="text-center py-16"><Loader2 size={28} className="animate-spin text-emerald-500 mx-auto" /></div>
      : data.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-gray-400">Nothing here yet.</p>
        </div>
      ) : (
        <div className="space-y-2">{data.map((item, i) => (
          <div key={item.id || i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-800">{item.title || item.job_title || `Item #${item.id}`}</p>
            <p className="text-[11px] text-gray-400 mt-1">{item.status || item.location || ''}</p>
          </div>
        ))}</div>
      )}
    </div>
  );
}
