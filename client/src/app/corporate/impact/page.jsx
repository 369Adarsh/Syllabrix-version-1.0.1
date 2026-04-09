'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LD_API from '@/lib/api/ld.api';
import { 
  TrendingUp, IndianRupee, Clock, Award, Star, 
  BarChart3, PieChart, Activity, Target, Zap, 
  Building2, Users, ArrowUpRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImpactDashboardPage() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (orgId) loadImpact();
  }, [orgId]);

  const loadImpact = async () => {
    setLoading(true);
    try {
      const res = await LD_API.getImpactMetrics(orgId);
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (e) {
      toast.error('Failed to load impact stats');
    }
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center text-gray-400">Calculating Business Impact Metrics...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20">
      {/* ─── HEADER ─── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg">
                 <Building2 size={20} />
              </div>
              <div>
                 <h1 className="text-xl font-black text-gray-900 tracking-tight">Impact & ROI Analytics</h1>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Prove Phase • Kirkpatrick L4 Evaluation</p>
              </div>
           </div>
           <button className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all">
              <Star size={14} /> Global Benchmark Comparison
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
         
         {/* ─── THE ROI ENGINE (MAIN VALUE) ─── */}
         <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-[450px]">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <ShieldCheck size={200} />
               </div>
               <div className="relative z-10">
                  <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Estimated ROI (L4)</span>
                  <div className="mt-8 flex items-baseline gap-2">
                     <span className="text-5xl font-black">₹{stats.roi.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-4 leading-relaxed max-w-[250px]">Business value derived from skill-gap closure, saved contract hours, and risk mitigation.</p>
               </div>
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                     <span>Value/Learning Hour</span>
                     <span>₹2,920</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full" style={{ width: '85%' }} />
                  </div>
                  <button className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all">
                     View Breakdown
                  </button>
               </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
               <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm group hover:border-amber-200 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                     <Star size={24} />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{stats.reaction_score}/5.0</p>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-1">L1: Reaction Score</p>
                  <p className="text-xs text-gray-400 mt-4">Based on 426 post-session surveys. 92% of learners reported "High Relevance".</p>
               </div>

               <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm group hover:border-emerald-200 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                     <TrendingUp size={24} />
                  </div>
                  <p className="text-3xl font-black text-gray-900">+{stats.learning_gain}%</p>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">L2: Knowledge Gain</p>
                  <p className="text-xs text-gray-400 mt-4">Average delta between Pre-test and Post-test module scores.</p>
               </div>

               <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm group hover:border-indigo-200 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                     <Activity size={24} />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{stats.behavior_shift}/5.0</p>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">L3: Behavior Shift</p>
                  <p className="text-xs text-gray-400 mt-4">Score derived from Manager behavior observation forms.</p>
               </div>

               <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm group hover:border-rose-200 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
                     <Clock size={24} />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{stats.learning_hours}h</p>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mt-1">Total Productivity</p>
                  <p className="text-xs text-gray-400 mt-4">Total time invested in high-criticality training across the org.</p>
               </div>
            </div>
         </div>

         {/* ─── KPI LINKAGE ─── */}
         <div className="space-y-6">
            <div className="flex items-end justify-between">
               <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Business KPI Linkage</h3>
                  <p className="text-sm text-gray-500">Mapping learning programs to the company's North Star goals.</p>
               </div>
               <div className="flex gap-2">
                 <button className="px-5 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Filter by Dept</button>
               </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
               {stats.kpis.map((k, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                     <div className={`w-8 h-8 rounded-lg ${k.color} flex items-center justify-center text-white mb-4`}>
                        <Zap size={14} />
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{k.name}</p>
                        <p className="text-lg font-black text-gray-900 mt-1">{k.status}</p>
                     </div>
                     <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-600 mt-4">
                        <ArrowUpRight size={14} /> {k.delta}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* ─── PROGRAM ROI RANKING ─── */}
         <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Award size={20} className="text-amber-500" /> Top Performer Programs
               </h3>
               <button className="text-xs font-bold text-indigo-600 hover:underline">View All Statistics</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-[#FAF9F8] text-[10px] font-black uppercase text-gray-400 tracking-widest">
                     <tr>
                        <th className="px-8 py-4">Learning Program</th>
                        <th className="px-8 py-4">Total Learners</th>
                        <th className="px-8 py-4">Impact Profile</th>
                        <th className="px-8 py-4 text-right">L2 Skills Gain</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {stats.top_programs.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                           <td className="px-8 py-5">
                              <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{p.title}</p>
                           </td>
                           <td className="px-8 py-5">
                              <p className="text-sm font-medium text-gray-500">{p.learners}</p>
                           </td>
                           <td className="px-8 py-5">
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200">{p.impact}</span>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <p className="text-sm font-black text-emerald-600">{p.gain}</p>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

      </div>
    </div>
  );
}
