'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Shield, Loader2, Users, Dumbbell, Utensils, Target, BookOpen, TrendingUp, Eye, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [pendingCoaches, setPendingCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsRes, coachesRes] = await Promise.all([
        fitnessAPI.getAdminDashboard(),
        fitnessAPI.getCoaches({ status: 'pending' }),
      ]);
      setStats(statsRes.data?.data);
      setPendingCoaches(coachesRes.data?.data || []);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCoachAction = async (coachId, status) => {
    try {
      await fitnessAPI.updateCoachStatus(coachId, { status });
      loadData();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gray-500" /></div>;

  return (
    <div className="max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
          <Shield size={22} className="text-gray-600" /> Fitness Admin
        </h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Platform analytics and management</p>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: Users, label: 'Total Users', value: stats.total_users, color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: TrendingUp, label: 'Active (7d)', value: stats.active_users_7d, color: 'text-green-500', bg: 'bg-green-50' },
            { icon: Users, label: 'Coaches', value: stats.total_coaches, color: 'text-cyan-500', bg: 'bg-cyan-50' },
            { icon: Target, label: 'Pending Coaches', value: stats.pending_coaches, color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: Dumbbell, label: 'Workouts Done', value: stats.workouts_completed, color: 'text-orange-500', bg: 'bg-orange-50' },
            { icon: Utensils, label: 'Diet Plans', value: stats.diet_plans_created, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { icon: Eye, label: 'Article Views', value: stats.total_article_views, color: 'text-rose-500', bg: 'bg-rose-50' },
            { icon: BookOpen, label: 'Top Goal', value: stats.popular_goals?.[0]?.goal?.replace(/_/g, ' ') || '—', color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`${s.bg} rounded-xl p-4`}>
              <s.icon size={18} className={s.color} />
              <p className="text-[18px] font-extrabold text-gray-800 mt-1">{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Popular Goals */}
      {stats?.popular_goals?.length > 0 && (
        <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4 mb-5">
          <h3 className="text-[14px] font-bold text-gray-800 mb-3">Popular Goals</h3>
          <div className="space-y-2">
            {stats.popular_goals.map((g, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-gray-500 w-6">{i + 1}.</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    style={{ width: `${Math.min((g.count / (stats.total_users || 1)) * 100, 100)}%` }} />
                </div>
                <span className="text-[12px] font-medium text-gray-700 capitalize w-28">{g.goal?.replace(/_/g, ' ')}</span>
                <span className="text-[11px] text-gray-400">{g.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Coach Approvals */}
      <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-800">Pending Coach Approvals ({pendingCoaches.length})</h3>
        </div>
        {pendingCoaches.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {pendingCoaches.map((coach, i) => (
              <div key={coach.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[14px] font-bold">
                    {coach.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-800">{coach.full_name}</p>
                    <p className="text-[11px] text-gray-500">{coach.years_experience} yrs • {coach.mode}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCoachAction(coach.id, 'approved')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-[11px] font-bold hover:bg-green-600">
                    <CheckCircle2 size={12} /> Approve
                  </button>
                  <button onClick={() => handleCoachAction(coach.id, 'rejected')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-bold hover:bg-red-600">
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <CheckCircle2 size={24} className="text-green-300 mx-auto mb-2" />
            <p className="text-[13px] text-gray-500">No pending approvals</p>
          </div>
        )}
      </div>
    </div>
  );
}
