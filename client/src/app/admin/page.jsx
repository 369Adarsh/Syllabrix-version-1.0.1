'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import {
  Users, ShieldAlert, DollarSign, TrendingUp,
  Activity, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// Removed Fake GROWTH_DATA

const REVENUE_BREAKDOWN_COLORS = ['#7c3aed', '#a855f7', '#c084fc', '#e879f9', '#f0abfc'];

function StatCard({ label, value, change, icon: Icon, accent = 'violet', loading }) {
  const accentMap = {
    violet: { bg: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/20', icon: 'text-violet-400', text: 'text-violet-300' },
    blue:   { bg: 'from-blue-500/20 to-blue-500/5',   border: 'border-blue-500/20',   icon: 'text-blue-400',   text: 'text-blue-300'   },
    red:    { bg: 'from-red-500/20 to-red-500/5',     border: 'border-red-500/20',     icon: 'text-red-400',    text: 'text-red-300'    },
    green:  { bg: 'from-green-500/20 to-green-500/5', border: 'border-green-500/20',   icon: 'text-green-400',  text: 'text-green-300'  },
  };
  const c = accentMap[accent];
  const isPositive = change >= 0;

  return (
    <div className={`relative rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-5 overflow-hidden`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center ${c.icon}`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-white/10 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-white font-bold text-2xl mb-1">{value}</p>
      )}
      <p className="text-white/40 text-xs font-medium">{label}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">{children}</h2>;
}

export default function AdminOverviewPage() {
  const [revenueStats, setRevenueStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [growthStats, setGrowthStats] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);

  useEffect(() => {
    adminAPI.getRevenueStats()
      .then(r => setRevenueStats(r.data))
      .catch(() => {})
      .finally(() => setRevenueLoading(false));

    adminAPI.getGrowthStats()
      .then(r => setGrowthStats(r.data))
      .catch(() => {});

    adminAPI.getReports({ limit: 5 })
      .then(r => setReports(r.data || []))
      .catch(() => {})
      .finally(() => setReportsLoading(false));
  }, []);

  const breakdownData = revenueStats?.breakdown?.map(b => ({
    name: b.payment_type?.replace('_', ' '),
    value: parseFloat(b.amount),
  })) || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Revenue (Lifetime)" value={revenueStats ? `₹${Number(revenueStats.total_lifetime).toLocaleString('en-IN')}` : '—'} icon={DollarSign} accent="violet" loading={revenueLoading} change={12} />
        <StatCard label="Revenue (Last 30 Days)" value={revenueStats ? `₹${Number(revenueStats.last_30_days).toLocaleString('en-IN')}` : '—'} icon={TrendingUp} accent="blue" loading={revenueLoading} change={8} />
        <StatCard label="Pending Reports" value={reports.length} icon={ShieldAlert} accent="red" loading={reportsLoading} />
        <StatCard label="Platform Health" value="99.9%" icon={Activity} accent="green" change={0.1} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* User Growth */}
        <div className="xl:col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <SectionTitle>User Activity (This Week)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={growthStats.length > 0 ? growthStats : []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                cursor={{ stroke: 'rgba(124,58,237,0.3)' }}
              />
              <Area type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2} fill="url(#userGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Breakdown */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <SectionTitle>Revenue Breakdown</SectionTitle>
          {breakdownData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {breakdownData.map((_, i) => (
                      <Cell key={i} fill={REVENUE_BREAKDOWN_COLORS[i % REVENUE_BREAKDOWN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {breakdownData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: REVENUE_BREAKDOWN_COLORS[i] }} />
                      <span className="text-white/50 capitalize">{item.name}</span>
                    </div>
                    <span className="text-white/80 font-semibold">₹{Number(item.value).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-white/20 text-sm">No payment data yet</div>
          )}
        </div>
      </div>

      {/* Pending Reports Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Latest Pending Reports</SectionTitle>
          <a href="/admin/moderation" className="text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">View All →</a>
        </div>
        {reportsLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-white/[0.04] rounded-xl animate-pulse" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-white/25 text-sm">✅ No pending reports. Platform is clean.</div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-4 py-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                  r.reason === 'hate_speech' || r.reason === 'self_harm' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' :
                  'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>{r.reason?.replace('_', ' ')}</span>
                <span className="text-white/60 text-sm flex-1">Reported by <strong className="text-white/80">{r.reporter_name}</strong></span>
                <span className="text-white/30 text-xs flex items-center gap-1"><Clock size={11} /> {new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
