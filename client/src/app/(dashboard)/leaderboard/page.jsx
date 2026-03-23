'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import Avatar from '@/components/ui/Avatar';
import { Trophy, Loader2, Crown, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiClient.get('/score/leaderboard?limit=50').then(r => setLeaders(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = ['from-amber-400 to-yellow-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-orange-600'];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 p-6">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center"><Trophy size={24} className="text-yellow-200" /></div>
          <div><h1 className="text-xl font-extrabold text-white">Leaderboard</h1><p className="text-yellow-200/70 text-xs">Top Syllabrix Score holders</p></div>
        </div>
      </div>

      {/* Top 3 podium */}
      {leaders.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {[1, 0, 2].map(idx => {
            const l = leaders[idx];
            if (!l) return null;
            const isFirst = idx === 0;
            return (
              <div key={idx} className={`flex flex-col items-center ${isFirst ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}>
                <div className="relative mb-2">
                  {isFirst && <Crown size={20} className="text-amber-500 mx-auto mb-1" />}
                  <Avatar src={l.profile_photo_url} size={isFirst ? 'lg' : 'md'} />
                </div>
                <p className="text-xs font-bold text-gray-800 text-center truncate max-w-[80px]">{l.username || l.full_name}</p>
                <div className={`mt-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${podiumColors[idx]} text-white text-xs font-bold`}>
                  {parseFloat(l.syllabrix_score || 0).toFixed(0)}
                </div>
                <span className="text-lg mt-1">{medals[idx]}</span>
              </div>
            );
          })}
        </div>
      )}

      {loading ? <div className="text-center py-12"><Loader2 size={28} className="animate-spin text-amber-500 mx-auto" /></div>
      : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden">
          {leaders.slice(3).map((l, i) => (
            <div key={l.id || i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''} hover:bg-amber-50/20 transition-colors`}>
              <span className="w-8 text-center text-sm font-bold text-gray-400">{i + 4}</span>
              <Avatar src={l.profile_photo_url} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{l.full_name || l.username}</p>
                {l.city && <p className="text-[10px] text-gray-400">{l.city}</p>}
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-blue-600">{parseFloat(l.syllabrix_score || 0).toFixed(1)}</div>
                <div className="text-[9px] text-gray-400">Score</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
