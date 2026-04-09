'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function DailyChallengeWidget() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/prep/quizzes/daily')
      .then(r => setChallenge(r.data?.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#378ADD] to-[#534AB7] rounded-xl p-4 text-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.10)' }}>
      <div className="flex items-center gap-1.5 mb-2">
        <Zap size={13} className="text-blue-200" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Daily Challenge</p>
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-white/20 rounded w-full" />
          <div className="h-3 bg-white/20 rounded w-3/4" />
        </div>
      ) : challenge ? (
        <>
          <p className="text-[13px] font-semibold leading-snug mb-1">
            {challenge.title || challenge.question || 'Solve today\'s challenge'}
          </p>
          <p className="text-[11px] text-blue-200 mb-3">
            {challenge.xp_reward ? `+${challenge.xp_reward} XP` : '+50 XP'} reward
          </p>
          <Link
            href={`/prep?quiz=${challenge.id || 'daily'}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white text-[#378ADD] hover:bg-blue-50 transition-colors"
          >
            Start Challenge →
          </Link>
        </>
      ) : (
        <>
          <p className="text-[13px] font-semibold leading-snug mb-3">Maintain your streak with a 5-min quiz!</p>
          <Link href="/prep" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white text-[#378ADD] hover:bg-blue-50 transition-colors">
            Go to PrepSmart →
          </Link>
        </>
      )}
    </div>
  );
}
