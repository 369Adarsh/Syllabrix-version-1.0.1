'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Activity, Loader2, Users, Award, Clock, DollarSign } from 'lucide-react';

export default function CoachDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fitnessAPI.getCoachDashboard().then(r => setData(r.data?.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gray-500" /></div>;
  if (!data) return (
    <div className="max-w-[500px] mx-auto py-10 text-center">
      <Activity size={32} className="text-gray-300 mx-auto mb-3" />
      <h2 className="text-[16px] font-bold text-gray-800 mb-1">No Coach Profile Found</h2>
      <p className="text-[13px] text-gray-500">You need to apply as a coach first.</p>
    </div>
  );

  const { coach, clients, stats } = data;

  return (
    <div className="max-w-[800px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
          <Activity size={22} className="text-gray-600" /> Coach Dashboard
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            coach.status === 'approved' ? 'bg-green-100 text-green-700' :
            coach.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
          }`}>{coach.status}</span>
          <span className="text-[13px] text-gray-500">{coach.full_name}</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { icon: Users, label: 'Total Clients', value: stats.totalClients, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: Activity, label: 'Active Clients', value: stats.activeClients, color: 'text-green-500', bg: 'bg-green-50' },
          { icon: Clock, label: 'Pending', value: stats.pendingClients, color: 'text-amber-500', bg: 'bg-amber-50' },
          { icon: Award, label: 'Plans Created', value: coach.total_plans || 0, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
            <s.icon size={18} className={s.color} />
            <p className="text-[20px] font-extrabold text-gray-800 mt-1">{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Client List */}
      <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-800">Enrolled Clients</h3>
        </div>
        {clients?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {clients.map((client, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
                    {client.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-800">{client.username}</p>
                    <p className="text-[11px] text-gray-500">{client.plan_type} • Started {new Date(client.start_date || client.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  client.status === 'active' ? 'bg-green-100 text-green-700' :
                  client.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                }`}>{client.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-[13px] text-gray-500">No clients enrolled yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
