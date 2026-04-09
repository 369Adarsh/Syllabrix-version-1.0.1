'use client';
import { useEffect, useState } from 'react';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';

export default function NewsWidget() {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiAPI.getNewsroom({ days: 1, limit: 4 })
      .then(r => {
        const d = r.data?.data || r.data;
        setHeadlines((d?.articles || d || []).slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Newspaper size={12} className="text-[#378ADD]" /> Today&apos;s News
        </p>
        <Link href="/newsroom" className="text-[11px] font-semibold text-[#378ADD] hover:underline">See all</Link>
      </div>
      {loading ? (
        <div className="space-y-2.5 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-3 bg-gray-100 rounded w-full" />)}
        </div>
      ) : headlines.length === 0 ? (
        <p className="text-[12px] text-gray-400">No news available right now</p>
      ) : (
        <div className="space-y-2.5">
          {headlines.map((n, i) => (
            <Link key={i} href="/newsroom" className="block group">
              <p className="text-[12px] font-medium text-gray-700 leading-snug group-hover:text-[#378ADD] transition-colors line-clamp-2">
                {n.headline || n.title}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{n.source || 'Education Today'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
