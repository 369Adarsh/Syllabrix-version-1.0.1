'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import {
  Users, ShieldAlert, DollarSign, TrendingUp,
  Activity, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const REVENUE_BREAKDOWN_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

function StatCard({ label, value, change, icon: Icon, accent = 'violet', loading }) {
  const accentMap = {
    violet: { bg: 'bg-indigo-50 border-indigo-200',   icon: 'bg-indigo-100 text-indigo-600',  text: 'text-indigo-600' },
    blue:   { bg: 'bg-blue-50 border-blue-200',       icon: 'bg-blue-100 text-blue-600',      text: 'text-blue-600'   },
    red:    { bg: 'bg-red-50 border-red-200',         icon: 'bg-red-100 text-red-600',        text: 'text-red-600'    },
    green:  { bg: 'bg-emerald-50 border-emerald-200', icon: 'bg-emerald-100 text-emerald-600',text: 'text-emerald-600'},
  };
  const c = accentMap[accent];
  const isPositive = change >= 0;

  return (
    <div className={`relative rounded-2xl border ${c.bg} p-5 overflow-hidden bg-white`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-gray-100 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-gray-900 font-bold text-2xl mb-1">{value}</p>
      )}
      <p className="text-gray-500 text-xs font-medium">{label}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">{children}</h2>;
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
        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionTitle>User Activity (This Week)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={growthStats.length > 0 ? growthStats : []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 12 }}
                cursor={{ stroke: 'rgba(99,102,241,0.2)' }}
              />
              <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#userGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Breakdown */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {breakdownData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: REVENUE_BREAKDOWN_COLORS[i] }} />
                      <span className="text-gray-500 capitalize">{item.name}</span>
                    </div>
                    <span className="text-gray-800 font-semibold">₹{Number(item.value).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">No payment data yet</div>
          )}
        </div>
      </div>

      {/* Pending Reports Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Latest Pending Reports</SectionTitle>
          <a href="/admin/moderation" className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold transition-colors">View All →</a>
        </div>
        {reportsLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">✅ No pending reports. Platform is clean.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-4 py-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                  r.reason === 'hate_speech' || r.reason === 'self_harm' ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' :
                  'bg-orange-100 text-orange-700 border border-orange-200'
                }`}>{r.reason?.replace('_', ' ')}</span>
                <span className="text-gray-600 text-sm flex-1">Reported by <strong className="text-gray-800">{r.reporter_name}</strong></span>
                <span className="text-gray-400 text-xs flex items-center gap-1"><Clock size={11} /> {new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
