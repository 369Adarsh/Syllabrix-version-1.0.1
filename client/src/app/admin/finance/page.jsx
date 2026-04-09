'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import { DollarSign, TrendingUp, CreditCard, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const MONTHLY_MOCK = [
  { month: 'Nov', revenue: 12400 }, { month: 'Dec', revenue: 18900 },
  { month: 'Jan', revenue: 15200 }, { month: 'Feb', revenue: 22100 },
  { month: 'Mar', revenue: 28700 }, { month: 'Apr', revenue: 31500 },
];

const TYPE_COLORS = {
  subscription:   '#7c3aed',
  certificate:    '#a855f7',
  doubt_session:  '#6366f1',
  live_class:     '#22d3ee',
  course:         '#10b981',
  donation:       '#f59e0b',
};

function MetricCard({ label, value, sub, icon: Icon, accent }) {
  const colors = {
    violet: 'from-violet-500/15 to-transparent border-violet-500/20 text-violet-400',
    green:  'from-green-500/15 to-transparent border-green-500/20 text-green-400',
    blue:   'from-blue-500/15 to-transparent border-blue-500/20 text-blue-400',
    amber:  'from-amber-500/15 to-transparent border-amber-500/20 text-amber-400',
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${colors[accent]}`}>
      <div className="flex items-center justify-between mb-3">
        <Icon size={18} />
        {sub && <span className="text-white/30 text-xs font-medium">{sub}</span>}
      </div>
      <p className="text-white font-bold text-2xl mb-1">{value}</p>
      <p className="text-white/40 text-xs font-medium">{label}</p>
    </div>
  );
}

function fmt(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export default function AdminFinancePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getRevenueStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const breakdown = stats?.breakdown || [];

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Lifetime Revenue" value={loading ? '…' : fmt(stats?.total_lifetime)} icon={DollarSign} accent="violet" />
        <MetricCard label="Last 30 Days" value={loading ? '…' : fmt(stats?.last_30_days)} icon={TrendingUp} accent="green" sub="Rolling" />
        <MetricCard label="Payment Types" value={breakdown.length} icon={CreditCard} accent="blue" />
        <MetricCard label="Transactions" value={breakdown.reduce((a, b) => a + (b.count || 0), 0)} icon={BarChart3} accent="amber" sub="Captured" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Monthly Trend */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h2 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={MONTHLY_MOCK} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Bar Chart */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h2 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Revenue by Payment Type</h2>
          {breakdown.length === 0 ? (
            <div className="h-[230px] flex items-center justify-center text-white/20 text-sm">No payment data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={breakdown} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="payment_type" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v?.replace('_', ' ')} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {breakdown.map((entry, i) => (
                    <Cell key={i} fill={TYPE_COLORS[entry.payment_type] || '#7c3aed'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Payment Type', 'Total Revenue', 'Transactions', 'Avg. Value'].map(h => (
                <th key={h} className="text-left text-white/30 text-xs font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 4 }).map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 bg-white/[0.05] rounded animate-pulse" /></td>)}</tr>
            )) : breakdown.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.025] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[row.payment_type] || '#7c3aed' }} />
                    <span className="text-white/75 font-medium capitalize">{row.payment_type?.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-green-400 font-bold">{fmt(row.amount)}</td>
                <td className="px-5 py-3 text-white/50">{row.count} txns</td>
                <td className="px-5 py-3 text-white/40">{fmt(row.amount / row.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
