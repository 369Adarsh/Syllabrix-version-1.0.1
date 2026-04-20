'use client';
import { useState, useEffect } from 'react';
import {
  Building2, Users, GraduationCap,
  BarChart3, Globe, ShieldCheck,
  Search, Filter, ExternalLink,
  MoreHorizontal, Plus, Download,
  ArrowUpRight, Target
} from 'lucide-react';
import { adminAPI } from '@/lib/api/admin.api';
import { toast } from 'sonner';

export default function AdminEnterprisePage() {
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [orgsRes, healthRes] = await Promise.all([
        adminAPI.getOrganizations(),
        adminAPI.getMasterHealth()
      ]);
      setOrgs(orgsRes.data.organizations || []);
      setStats(healthRes.data.corporate);
    } catch {
      toast.error('Failed to load Enterprise Command intel');
    } finally {
      setLoading(false);
    }
  }

  const filteredOrgs = orgs.filter(o =>
    o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.org_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Managed Organizations" value={stats?.corporate_tenants || 0} icon={Building2} iconBg="bg-blue-100 text-blue-700" />
        <StatCard label="Enterprise Learners"   value={stats?.enterprise_learners || 0} icon={Users}     iconBg="bg-violet-100 text-violet-700" />
        <StatCard label="Active Programs"        value={stats?.active_programs || 0}    icon={GraduationCap} iconBg="bg-emerald-100 text-emerald-700" />
        <StatCard label="System Health"          value="STABLE"                          icon={ShieldCheck}   iconBg="bg-amber-100 text-amber-700" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Organization Management */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-gray-900 font-bold text-lg">Organization Command</h2>
              <p className="text-gray-400 text-xs mt-0.5 uppercase tracking-widest font-black">Managed Corporate Tenants</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all w-48 lg:w-64 shadow-sm"
                />
              </div>
              <button className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm">
                <Filter size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Organization</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Learners</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Programs</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [1,2,3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="5" className="px-6 py-6"><div className="h-8 bg-gray-100 rounded-xl" /></td>
                      </tr>
                    ))
                  ) : filteredOrgs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm italic">
                        No organizations found in this command sector.
                      </td>
                    </tr>
                  ) : filteredOrgs.map((org) => (
                    <tr key={org.id} className="group hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                            {org.name?.[0] || 'O'}
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold text-sm leading-none">{org.name}</p>
                            <p className="text-gray-400 text-[10px] mt-1 uppercase font-black">ID: {org.org_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                          org.plan === 'enterprise'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={12} className="text-gray-300" />
                          <span className="text-gray-700 text-xs font-bold">{org.employee_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={12} className="text-gray-300" />
                          <span className="text-gray-700 text-xs font-bold">{org.program_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 transition-all">
                            <ExternalLink size={14} />
                          </button>
                          <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 transition-all">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] italic">
                Syllabrix Enterprise Ledger • All Records Encrypted
              </p>
              <div className="text-gray-300 text-[10px] font-black uppercase tracking-widest">Sector Alpha-6</div>
            </div>
          </div>
        </div>

        {/* Sidebar Intel */}
        <div className="space-y-6">

          {/* Skill Map */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-md">Skill Intelligence</h3>
              <Target size={18} className="text-indigo-500" />
            </div>
            <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-4">Top Platform-Wide Proficiencies</p>
            <div className="space-y-4">
              <SkillIndicator label="Generative AI"      value={88} color="bg-indigo-500" />
              <SkillIndicator label="Cloud Architecture" value={72} color="bg-violet-500" />
              <SkillIndicator label="Fullstack Design"   value={65} color="bg-cyan-500" />
              <SkillIndicator label="Project Mastery"    value={44} color="bg-rose-500" />
            </div>
            <div className="mt-8 pt-6 border-t border-indigo-100">
              <button className="w-full py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                View Full Skill Map <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm">
            <h3 className="text-gray-900 font-bold text-sm mb-4">Master Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <ActionButton icon={Plus}     label="Onboard New Org"          iconBg="bg-emerald-100 text-emerald-700" />
              <ActionButton icon={Globe}    label="Global L&D Broadcast"     iconBg="bg-blue-100 text-blue-700" />
              <ActionButton icon={Download} label="Sector Export (.xlsx)"    iconBg="bg-amber-100 text-amber-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, iconBg }) {
  return (
    <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconBg} mb-4 transition-transform group-hover:scale-110 duration-300`}>
        <Icon size={20} />
      </div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-gray-900 font-black text-2xl tracking-tighter">{value}</p>
        <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold mb-1">
          <ArrowUpRight size={12} /><span>+4.2%</span>
        </div>
      </div>
    </div>
  );
}

function SkillIndicator({ label, value, color }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-gray-700 text-xs font-medium">{label}</span>
        <span className="text-gray-400 text-[10px] font-bold">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, iconBg }) {
  return (
    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform`}>
        <Icon size={14} />
      </div>
      <span className="text-gray-700 text-[13px] font-semibold">{label}</span>
    </button>
  );
}
