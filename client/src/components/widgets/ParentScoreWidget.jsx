'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ParentScoreWidget() {
  const { user } = useAuth();
  const [score, setScore] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.allSettled([
      apiClient.get(`/score/${user.id}`),
      apiClient.get('/moderation/my-streak'),
    ]).then(([scoreRes, streakRes]) => {
      if (scoreRes.status === 'fulfilled') setScore(scoreRes.value.data?.data || scoreRes.value.data);
      if (streakRes.status === 'fulfilled') setStreak(streakRes.value.data?.data);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  const total = score?.total_score ?? score?.score ?? null;
  const change = score?.weekly_change ?? score?.change ?? null;
  const maxScore = 1000;
  const pct = total !== null ? Math.min(100, Math.round((total / maxScore) * 100)) : 0;
  const currentStreak = streak?.current_streak ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Syllabrix Score</p>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-7 w-20 bg-gray-100 rounded" />
          <div className="h-2 bg-gray-100 rounded-full" />
        </div>
      ) : total === null ? (
        <p className="text-[12px] text-gray-400">Start learning to earn your score!</p>
      ) : (
        <>
          <div className="flex items-end gap-2 mb-1.5">
            <span className="text-[26px] font-extrabold text-emerald-600 leading-none">{total.toLocaleString()}</span>
            {change !== null && (
              <span className={`flex items-center gap-0.5 text-[11px] font-semibold mb-0.5 ${change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                {change > 0 ? '+' : ''}{change} this week
              </span>
            )}
          </div>
          {currentStreak > 0 && (
            <p className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mb-1.5">
              <Flame size={11} className="text-orange-500" /> {currentStreak}-day streak
            </p>
          )}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{pct}% to 1,000 XP milestone</p>
        </>
      )}
    </div>
  );
}
