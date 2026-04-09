'use client';
import { useEffect, useState } from 'react';
import { parentAPI } from '@/lib/api/parent.api';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function WeeklyDigestWidget({ children = [] }) {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentAPI.getWeeklyDigest()
      .then(r => setDigest(r.data?.data || r.data))
      .catch(() => setDigest(null))
      .finally(() => setLoading(false));
  }, []);

  // Build a simple summary from children data if no digest API exists
  const summary = digest?.summary || (children.length > 0
    ? `${children.map(c => c.full_name?.split(' ')[0]).join(' & ')} were active this week.`
    : null);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Weekly Digest</p>
      {loading ? (
        <div className="space-y-1.5 animate-pulse">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-4/5" />
        </div>
      ) : !summary ? (
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-gray-300" />
          <p className="text-[12px] text-gray-400">No digest available yet</p>
        </div>
      ) : (
        <>
          <p className="text-[12px] text-gray-600 leading-relaxed">{summary}</p>
          <Link href="/parent-dashboard/reports" className="block mt-2 text-[11px] text-blue-500 font-medium">
            Full report →
          </Link>
        </>
      )}
    </div>
  );
}
