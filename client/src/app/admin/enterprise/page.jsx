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

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Parallel fetch for enterprise intelligence
      const [orgsRes, healthRes] = await Promise.all([
        adminAPI.getOrganizations(),
        adminAPI.getMasterHealth()
      ]);

      setOrgs(orgsRes.data.organizations || []);
      setStats(healthRes.data.corporate);
    } catch (err) {
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Managed Organizations" 
          value={stats?.corporate_tenants || 0} 
          icon={Building2} 
          color="text-blue-400" 
          bg="bg-blue-500/10"
        />
        <StatCard 
          label="Enterprise Learners" 
          value={stats?.enterprise_learners || 0} 
          icon={Users} 
          color="text-violet-400" 
          bg="bg-violet-500/10" 
        />
        <StatCard 
          label="Active Training Programs" 
          value={stats?.active_programs || 0} 
          icon={GraduationCap} 
          color="text-emerald-400" 
          bg="bg-emerald-500/10"
        />
        <StatCard 
          label="System Health" 
          value="STABLE" 
          icon={ShieldCheck} 
          color="text-amber-400" 
          bg="bg-amber-500/10"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Organization Management */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-white font-bold text-lg">Organization Command</h2>
              <p className="text-white/40 text-xs mt-0.5 uppercase tracking-widest font-black">Managed Corporate Tenants</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Seach tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all w-48 lg:w-64"
                />
              </div>
              <button className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white transition-all">
                <Filter size={14} />
              </button>
            </div>
          </div>

          <div className="bg-[#0A0A0F] border border-white/[0.07] rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Organization</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Learners</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Programs</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {loading ? (
                    <TableLoading />
                  ) : filteredOrgs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-white/20 text-sm italic">
                          No organizations found in this command sector.
                        </td>
                      </tr>
                  ) : filteredOrgs.map((org) => (
                    <tr key={org.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
                            {org.name?.[0] || 'O'}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm leading-none">{org.name}</p>
                            <p className="text-white/30 text-[10px] mt-1 uppercase font-black">ID: {org.org_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                          org.plan === 'enterprise' 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <Users size={12} className="text-white/20" />
                           <span className="text-white/70 text-xs font-bold">{org.employee_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <GraduationCap size={12} className="text-white/20" />
                           <span className="text-white/70 text-xs font-bold">{org.program_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white transition-all">
                              <ExternalLink size={14} />
                           </button>
                           <button className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white transition-all">
                              <MoreHorizontal size={14} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer / Pagination Placeholder */}
            <div className="bg-white/[0.01] px-6 py-3 border-t border-white/[0.05] flex justify-between items-center">
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.15em] italic">
                Syllabrix Enterprise Ledger • All Records Encrypted
              </p>
              <div className="flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
                 Sector Alpha-6
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Intel */}
        <div className="space-y-6">
          
          {/* Skill Map Summary */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-500/[0.08] to-transparent border border-indigo-500/20 shadow-xl">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-md">Skill intelligence</h3>
                <Target size={18} className="text-indigo-400" />
             </div>
             <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-4">Top Platform-Wide Proficiencies</p>
             
             <div className="space-y-4">
                <SkillIndicator label="Generative AI" value={88} color="bg-indigo-500" />
                <SkillIndicator label="Cloud Architecture" value={72} color="bg-violet-500" />
                <SkillIndicator label="Fullstack Design" value={65} color="bg-cyan-500" />
                <SkillIndicator label="Project Mastery" value={44} color="bg-rose-500" />
             </div>

             <div className="mt-8 pt-6 border-t border-white/[0.05]">
                <button className="w-full py-2.5 rounded-2xl bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-all flex items-center justify-center gap-2">
                   View Full Skill Map
                   <ArrowUpRight size={14} />
                </button>
             </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08]">
             <h3 className="text-white font-bold text-sm mb-4">Master Actions</h3>
             <div className="grid grid-cols-1 gap-2">
                <ActionButton icon={Plus} label="Onboard New Org" color="text-emerald-400" />
                <ActionButton icon={Globe} label="Global L&D Broadcast" color="text-blue-400" />
                <ActionButton icon={Download} label="Sector Export (.xlsx)" color="text-amber-400" />
             </div>
          </div>

        </div>

      </div>

    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.04] transition-all duration-300">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${bg} ${color} mb-4 transition-transform group-hover:scale-110 duration-500 shadow-lg shadow-black/20`}>
        <Icon size={20} />
      </div>
      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-white font-black text-2xl tracking-tighter">{value}</p>
        <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold mb-1">
          <ArrowUpRight size={12} />
          <span>+4.2%</span>
        </div>
      </div>
    </div>
  );
}

function SkillIndicator({ label, value, color }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-white/80 text-xs font-medium">{label}</span>
        <span className="text-white/40 text-[10px] font-bold">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color }) {
  return (
    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all group">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.04] ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={14} />
      </div>
      <span className="text-white/80 text-[13px] font-semibold">{label}</span>
    </button>
  );
}

function TableLoading() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <tr key={i} className="animate-pulse">
          <td colSpan="5" className="px-6 py-6 h-12 bg-white/[0.01]" />
        </tr>
      ))}
    </>
  );
}
