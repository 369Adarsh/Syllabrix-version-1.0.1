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
  subscription:  '#6366f1',
  certificate:   '#8b5cf6',
  doubt_session: '#3b82f6',
  live_class:    '#06b6d4',
  course:        '#10b981',
  donation:      '#f59e0b',
};

function MetricCard({ label, value, sub, icon: Icon, accent }) {
  const colors = {
    violet: 'border-indigo-200 bg-indigo-50 text-indigo-600',
    green:  'border-emerald-200 bg-emerald-50 text-emerald-600',
    blue:   'border-blue-200 bg-blue-50 text-blue-600',
    amber:  'border-amber-200 bg-amber-50 text-amber-600',
  };
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${colors[accent].split(' ').slice(0,1).join(' ')}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[accent].split(' ').slice(1).join(' ')}`}>
          <Icon size={18} />
        </div>
        {sub && <span className="text-gray-400 text-xs font-medium">{sub}</span>}
      </div>
      <p className="text-gray-900 font-bold text-2xl mb-1">{value}</p>
      <p className="text-gray-500 text-xs font-medium">{label}</p>
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
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Lifetime Revenue" value={loading ? '…' : fmt(stats?.total_lifetime)} icon={DollarSign} accent="violet" />
        <MetricCard label="Last 30 Days" value={loading ? '…' : fmt(stats?.last_30_days)} icon={TrendingUp} accent="green" sub="Rolling" />
        <MetricCard label="Payment Types" value={breakdown.length} icon={CreditCard} accent="blue" />
        <MetricCard label="Transactions" value={breakdown.reduce((a, b) => a + (b.count || 0), 0)} icon={BarChart3} accent="amber" sub="Captured" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Monthly Trend */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={MONTHLY_MOCK} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, color: '#111827' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Bar Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Revenue by Payment Type</h2>
          {breakdown.length === 0 ? (
            <div className="h-[230px] flex items-center justify-center text-gray-300 text-sm">No payment data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={breakdown} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="payment_type" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v?.replace('_', ' ')} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, color: '#111827' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {breakdown.map((entry, i) => (
                    <Cell key={i} fill={TYPE_COLORS[entry.payment_type] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Payment Type', 'Total Revenue', 'Transactions', 'Avg. Value'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 4 }).map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
            )) : breakdown.map((row, i) => (
              <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[row.payment_type] || '#6366f1' }} />
                    <span className="text-gray-700 font-medium capitalize">{row.payment_type?.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-emerald-700 font-bold">{fmt(row.amount)}</td>
                <td className="px-5 py-3 text-gray-500">{row.count} txns</td>
                <td className="px-5 py-3 text-gray-400">{fmt(row.amount / row.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
