'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { badgesAPI } from '@/lib/api/badges.api';
import { Award, Loader2, Lock, CheckCircle } from 'lucide-react';

export default function BadgesPage() {
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my');

  useEffect(() => {
    Promise.all([badgesAPI.getAll(), badgesAPI.getMyBadges()])
      .then(([a, m]) => { setAll(a.data?.data || []); setMine(m.data?.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const myIds = mine.map(b => b.badge_id || b.id);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-sm"><Award size={20} className="text-white" /></div>
        <div><h1 className="font-bold text-lg text-gray-800">Badges</h1><p className="text-[11px] text-gray-400">{mine.length} earned of {all.length}</p></div>
      </div>

      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {[{ k: 'my', l: `My Badges (${mine.length})` }, { k: 'all', l: `All Badges (${all.length})` }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${tab === t.k ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>{t.l}</button>
        ))}
      </div>

      {loading ? <div className="text-center py-16"><Loader2 size={28} className="animate-spin text-amber-500 mx-auto" /></div>
      : tab === 'my' && mine.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4"><Award size={28} className="text-amber-400" /></div>
          <h2 className="font-bold text-gray-700 mb-2">No Badges Yet</h2>
          <p className="text-sm text-gray-400">Complete activities to earn your first badge!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(tab === 'my' ? mine : all).map(b => {
            const earned = tab === 'my' || myIds.includes(b.id);
            return (
              <div key={b.id} className={`relative border rounded-2xl p-5 text-center shadow-sm transition-all ${earned ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 hover:shadow-md' : 'bg-white border-gray-200 opacity-60'}`}>
                <span className="text-4xl block mb-2">{b.icon_emoji || '🏅'}</span>
                <h3 className="font-bold text-gray-800 text-sm">{b.name}</h3>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{b.description}</p>
                <div className="mt-3">{earned
                  ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold"><CheckCircle size={10} /> Earned</span>
                  : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold"><Lock size={10} /> Locked</span>
                }</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
