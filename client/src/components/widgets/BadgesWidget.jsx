'use client';
import { useEffect, useState } from 'react';
import { badgesAPI } from '@/lib/api/badges.api';
import Link from 'next/link';
import { Award } from 'lucide-react';

const BADGE_COLORS = ['bg-amber-100 text-amber-600', 'bg-purple-100 text-purple-600', 'bg-emerald-100 text-emerald-600', 'bg-blue-100 text-blue-600'];

export default function BadgesWidget() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    badgesAPI.getMyBadges()
      .then(r => setBadges((r.data?.data || r.data || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Award size={12} className="text-amber-500" /> Latest Badges
        </p>
        <Link href="/badges" className="text-[11px] font-semibold text-[#378ADD] hover:underline">See all</Link>
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg" />)}
        </div>
      ) : badges.length === 0 ? (
        <p className="text-[12px] text-gray-400">Earn badges by completing activities</p>
      ) : (
        <div className="space-y-2">
          {badges.map((b, i) => (
            <div key={b.id || i} className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${BADGE_COLORS[i % BADGE_COLORS.length]}`}>
                {b.icon || b.emoji || '🏆'}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-gray-700 truncate">{b.name || b.title}</p>
                {b.earned_at && (
                  <p className="text-[10px] text-gray-400">{new Date(b.earned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
