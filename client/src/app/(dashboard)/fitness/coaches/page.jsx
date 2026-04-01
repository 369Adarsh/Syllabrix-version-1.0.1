'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Users, Loader2, Search, Star, MapPin, Award, Globe, ChevronRight, Filter } from 'lucide-react';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fitnessAPI.getCoaches({}).then(r => setCoaches(r.data?.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fitnessAPI.getCoaches({ search });
      setCoaches(res.data?.data || []);
    } catch (e) {} finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-cyan-500" /></div>;

  return (
    <div className="max-w-[800px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
            <Users size={22} className="text-cyan-500" /> Find a Coach
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Connect with certified fitness coaches</p>
        </div>
        <Link href="/fitness/coach/apply"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[12px] font-bold hover:shadow-lg transition-all">
          Become a Coach
        </Link>
      </motion.div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search coaches..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-[13px] outline-none focus:ring-2 focus:ring-cyan-500 bg-white" />
        </div>
        <button onClick={handleSearch} className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-[12px] font-bold hover:bg-cyan-600">Search</button>
      </div>

      {coaches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coaches.map((coach, i) => (
            <motion.div key={coach.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/fitness/coaches/${coach.id}`}
                className="block bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-[18px] font-extrabold flex-shrink-0">
                    {coach.full_name?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-bold text-gray-800 group-hover:text-cyan-600 transition-colors">{coach.full_name}</h3>
                      {coach.is_featured && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[8px] font-bold">FEATURED</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-gray-700">{coach.rating || '—'}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-[10px] text-gray-500">{coach.years_experience} yrs exp</span>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-[10px] text-gray-500">{coach.total_clients} clients</span>
                    </div>
                    {coach.specialization && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(typeof coach.specialization === 'string' ? JSON.parse(coach.specialization) : coach.specialization)?.slice(0, 3).map((s, j) => (
                          <span key={j} className="px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[9px] font-medium capitalize">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Globe size={10} /> {coach.mode}</span>
                        {coach.location && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><MapPin size={10} /> {coach.location}</span>}
                      </div>
                      {coach.pricing_monthly && (
                        <span className="text-[13px] font-extrabold text-emerald-600">₹{coach.pricing_monthly}/mo</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/60 p-10 text-center">
          <Users size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-[13px] text-gray-500">No coaches found. Try a different search or check back later.</p>
        </div>
      )}
    </div>
  );
}
