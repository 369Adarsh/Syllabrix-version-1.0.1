'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import { getPlatformMode, PLATFORM_MODES } from '@/utils/platformMode';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, TrendingUp, BarChart2 } from 'lucide-react';

const MODE_ORDER = ['young_explorer', 'curious_mind', 'board_warrior', 'exam_command', 'upsc_aspirant', 'skill_builder', 'default'];

function computeModeDistribution(users) {
  const counts = Object.fromEntries(MODE_ORDER.map(m => [m, 0]));
  for (const u of users) {
    const m = getPlatformMode(u);
    counts[m] = (counts[m] || 0) + 1;
  }
  return MODE_ORDER
    .filter(m => counts[m] > 0)
    .map(m => ({
      mode: m,
      label: PLATFORM_MODES[m]?.label || m,
      emoji: PLATFORM_MODES[m]?.emoji || '📚',
      color: PLATFORM_MODES[m]?.primaryColor || '#6366f1',
      count: counts[m],
    }));
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAPI.getUsers({ limit: 1000, page: 1 });
        const users = res?.users || res?.data || [];
        const dist = computeModeDistribution(users);
        const total = users.length;
        setData({ dist, total, studentCount: users.filter(u => u.user_type === 'student').length });
      } catch (e) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
          <BarChart2 size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Platform Analytics</h1>
          <p className="text-sm text-gray-500 font-medium">Mode distribution across all students</p>
        </div>
      </div>

      {loading && (
        <div className="h-64 bg-gray-50 rounded-[32px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="h-64 bg-red-50 rounded-[32px] flex items-center justify-center text-red-600 font-bold text-sm">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total Users</p>
              <p className="text-3xl font-black text-gray-900">{data.total.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Students</p>
              <p className="text-3xl font-black text-gray-900">{data.studentCount.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Active Modes</p>
              <p className="text-3xl font-black text-gray-900">{data.dist.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" /> Mode Share
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.dist}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {data.dist.map((entry) => (
                      <Cell key={entry.mode} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} users`, name]}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {data.dist.map(d => (
                  <div key={d.mode} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                      {d.emoji} {d.label}
                    </span>
                    <span className="font-black text-gray-900">{d.count} <span className="text-gray-400 font-medium">({Math.round(d.count / data.studentCount * 100) || 0}%)</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <Users size={16} className="text-indigo-500" /> Users per Mode
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.dist} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    width={110}
                  />
                  <Tooltip
                    formatter={(v) => [`${v} users`]}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {data.dist.map((entry) => (
                      <Cell key={entry.mode} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
