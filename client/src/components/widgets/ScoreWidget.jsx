'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ScoreWidget() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    apiClient.get(`/score/${user.id}`)
      .then(r => setData(r.data?.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const score = data?.total_score ?? data?.score ?? null;
  const weeklyChange = data?.weekly_change ?? data?.change ?? null;
  const maxScore = 1000;
  const pct = score !== null ? Math.min(100, Math.round((score / maxScore) * 100)) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Syllabrix Score</p>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-7 w-20 bg-gray-100 rounded" />
          <div className="h-2 bg-gray-100 rounded-full" />
        </div>
      ) : score === null ? (
        <p className="text-[12px] text-gray-400">Score not available yet</p>
      ) : (
        <>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-[26px] font-extrabold text-[#378ADD] leading-none">{score.toLocaleString()}</span>
            {weeklyChange !== null && (
              <span className={`flex items-center gap-0.5 text-[11px] font-semibold mb-0.5 ${weeklyChange > 0 ? 'text-emerald-500' : weeklyChange < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {weeklyChange > 0 ? <TrendingUp size={12} /> : weeklyChange < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                {weeklyChange > 0 ? '+' : ''}{weeklyChange} this week
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#378ADD] to-[#534AB7] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{pct}% to 1,000 XP milestone</p>
        </>
      )}
    </div>
  );
}
