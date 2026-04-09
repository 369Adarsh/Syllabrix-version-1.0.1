'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import LD_API from '@/lib/api/ld.api';
import { 
  Users, Target, MessageSquare, TrendingUp, ChevronRight, 
  Sparkles, Calendar, BookOpen, CheckCircle, AlertCircle,
  BarChart3, UserCheck, Zap, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

function ManagerDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberGaps, setSelectedMemberGaps] = useState([]);
  const [managerStats, setManagerStats] = useState(null);
  const [agenda, setAgenda] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (orgId) loadTeam();
  }, [orgId]);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const [membersRes, statsRes] = await Promise.all([
        LD_API.getMembers(orgId),
        LD_API.getManagerStats(orgId)
      ]);
      const members = membersRes.data?.data || [];
      setTeam(members);
      setManagerStats(statsRes.data?.data);
      if (members.length > 0) handleSelectMember(members[0]);
    } catch (e) {
      toast.error('Failed to load team data');
    }
    setLoading(false);
  };

  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setSelectedMemberGaps([]);
    try {
      const res = await LD_API.getGaps(orgId, member.id);
      setSelectedMemberGaps(res.data?.data || []);
    } catch (e) {
      console.error("Failed to load member gaps", e);
    }
  };

  const generateAgenda = async (member) => {
    setGenerating(true);
    setAgenda(null);
    try {
      const res = await LD_API.getManagerAgenda(orgId, member.id);
      setAgenda(res.data?.data);
    } catch (e) {
      toast.error('AI Generator busy. Try again.');
    }
    setGenerating(false);
  };

  if (loading) return <div className="p-20 text-center text-gray-400">Loading Team Capability Suite...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Users size={20} />
             </div>
             <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Manager Enablement Suite</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Reinforce & Apply Learning</p>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
         <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <UserCheck size={18} className="text-emerald-500" /> My Direct Reports
                  </h3>
                  <div className="space-y-2">
                    {team.map((m, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleSelectMember(m)}
                        className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${selectedMember?.id === m.id ? 'bg-indigo-50 border-indigo-100 border' : 'hover:bg-gray-50 border border-transparent'}`}
                      >
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-white uppercase">
                            {m.full_name?.[0]}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{m.full_name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{m.job_title}</p>
                         </div>
                         {selectedMember?.id === m.id && <ChevronRight size={14} className="text-indigo-400" />}
                      </button>
                    ))}
                  </div>
               </div>
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
                  <BarChart3 size={24} className="mb-4 opacity-50" />
                  <h4 className="font-bold text-lg leading-tight mb-2 text-indigo-100">Team Readiness Score</h4>
                  <div className="text-4xl font-black mb-4">{managerStats?.readiness_score || 0}%</div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-4">
                     <div className="bg-white h-full" style={{ width: `${managerStats?.readiness_score || 0}%` }} />
                  </div>
                  <p className="text-xs text-indigo-100/70">
                    {managerStats?.critical_gaps?.[0] 
                      ? `Focusing on ${managerStats.critical_gaps[0].name} could improve readiness by ~10%.`
                      : "Your team readiness is stable. Keep up the learning cycles."}
                  </p>
               </div>
            </div>
            <div className="lg:col-span-8 space-y-8">
               {selectedMember ? (
                 <>
                   <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
                      <div className="w-24 h-24 rounded-3xl bg-amber-50 flex items-center justify-center text-3xl font-black text-amber-600">
                         {selectedMember.full_name?.[0]}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                         <h2 className="text-2xl font-black text-gray-900">{selectedMember.full_name}</h2>
                         <p className="text-gray-500 font-medium">{selectedMember.job_title} • {selectedMember.department}</p>
                         <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4 text-[10px] font-bold uppercase tracking-wider">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">Primary Report</span>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">High Engagement</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => generateAgenda(selectedMember)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                      >
                         <Sparkles size={18} /> 1:1 Prep with AI
                      </button>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                         <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Target size={18} className="text-rose-500" /> Improvement Areas (Gaps)
                         </h4>
                         <div className="space-y-4">
                            {selectedMemberGaps.length === 0 ? (
                               <p className="text-xs text-gray-400 text-center py-4">No critical skill gaps identified.</p>
                            ) : (
                               selectedMemberGaps.slice(0, 4).map((s, i) => (
                                 <div key={i} className="group">
                                    <div className="flex justify-between items-end mb-1">
                                       <p className="text-sm font-bold text-gray-800">{s.skill_name}</p>
                                       <p className="text-[10px] font-mono text-gray-400">Current {parseFloat(s.composite_score || 0).toFixed(1)} / Target {s.required_proficiency}</p>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex">
                                       <div className={`h-full ${s.gap > 1 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                                         style={{ width: `${Math.min(100, (s.composite_score/s.required_proficiency)*100)}%` }} />
                                    </div>
                                 </div>
                               ))
                            )}
                         </div>
                      </div>
                      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                         <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-blue-500" /> Learning Velocity
                         </h4>
                         <div className="flex items-center gap-4 mb-6">
                            <div className="text-3xl font-black text-gray-900">4.2h</div>
                            <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">+18% this week</div>
                         </div>
                         <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                               <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100">
                                  <BookOpen size={14} className="text-indigo-500" />
                               </div>
                               <div>
                                  <p className="text-xs font-bold text-gray-800">Advanced Negotiation</p>
                                  <p className="text-[10px] text-gray-400">Section 2: Values & Empathy</p>
                               </div>
                               <div className="ml-auto text-[10px] font-bold text-indigo-600">80% Done</div>
                            </div>
                         </div>
                      </div>
                   </div>
                   {generating && (
                      <div className="p-20 bg-white rounded-3xl border border-dashed border-indigo-200 text-center animate-pulse">
                         <Zap size={32} className="text-indigo-400 mx-auto mb-4" />
                         <p className="text-indigo-600 font-bold">AI is parsing skill gaps and recent learning activity...</p>
                      </div>
                   )}
                   {agenda && (
                      <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={120} />
                         </div>
                         <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                               <span className="px-3 py-1 bg-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-full">AI 1:1 Agenda Generator</span>
                               <span className="text-gray-400 text-xs font-medium">Updated 1m ago</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Coaching Strategy for {agenda.member}</h3>
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                               <div className="col-span-2 space-y-3">
                                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Suggested Talking Points</p>
                                  {agenda.talking_points.map((p, i) => (
                                    <div key={i} className="flex gap-3 text-sm group">
                                       <div className="mt-1 w-4 h-4 rounded-full border border-gray-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold group-hover:border-indigo-400 transition-colors">{i+1}</div>
                                       <p className="text-gray-300">{p}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                   <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Manager Nudge</p>
                                   <p className="text-xs italic text-gray-300 leading-relaxed">"{agenda.ai_insight}"</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                               <button className="flex-1 py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                                  <MessageSquare size={16} /> Send to {agenda.member.split(' ')[0]}
                               </button>
                               <button className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2">
                                  <CheckCircle size={16} /> Mark as Discussed
                               </button>
                            </div>
                         </div>
                      </div>
                   )}
                 </>
               ) : (
                 <div className="p-20 text-center text-gray-400 border border-dashed border-gray-200 rounded-3xl">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Select a team member to see Capability Insights</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

export default function ManagerDashboardPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gray-400">Loading Manager Suite...</div>}>
      <ManagerDashboardContent />
    </Suspense>
  );
}
