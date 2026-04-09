'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LD_API from '@/lib/api/ld.api';
import toast from 'react-hot-toast';
import {
  Brain, Users, BarChart3, ChevronRight, Search, Plus, Loader2, Sparkles,
  FileText, Briefcase, Zap, Shield, HelpCircle, Check, X, AlertCircle, Map, Target, TrendingUp
} from 'lucide-react';

function SkillIntelligenceContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'taxonomy');
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  // Modals / Forms
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [jdText, setJdText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);

  // New Role Form
  const [newRole, setNewRole] = useState({ title: '', department: '', level: 'mid' });
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  // Mapping state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mappingSkill, setMappingSkill] = useState(null);
  const [profLevel, setProfLevel] = useState(3);
  const [critWeight, setCritWeight] = useState(5);
  const [isMapping, setIsMapping] = useState(false);

  // Career state
  const [targetRole, setTargetRole] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  useEffect(() => {
    if (orgId) {
      loadData();
    } else {
      LD_API.getMyOrgs().then(res => {
        if (res.data?.data?.length > 0) {
          router.replace(`/corporate/skills?orgId=${res.data.data[0].id}`);
        } else {
          router.push('/corporate/dashboard');
        }
      }).catch(() => {
        router.push('/corporate/dashboard');
      });
    }
  }, [orgId, activeTab, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'taxonomy') {
        const [rolesRes, skillsRes] = await Promise.all([
          LD_API.getRoles(orgId),
          LD_API.getSkills(orgId)
        ]);
        setRoles(rolesRes.data?.data || []);
        setSkills(skillsRes.data?.data || []);
      } else if (activeTab === 'heatmap') {
        const heatRes = await LD_API.getHeatmap(orgId);
        setHeatmap(heatRes.data?.data || []);
      } else if (activeTab === 'members') {
        const memRes = await LD_API.getMembers(orgId);
        setMembers(memRes.data?.data || []);
      } else if (activeTab === 'career') {
        const rolesRes = await LD_API.getRoles(orgId);
        setRoles(rolesRes.data?.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const handleExtractJD = async () => {
    if (!jdText.trim()) return toast.error('Please paste a Job Description');
    setIsExtracting(true);
    setExtractedSkills([]);
    try {
      const res = await LD_API.extractSkillsFromJD(orgId, jdText);
      setExtractedSkills(res.data?.data?.skills || []);
      toast.success('Skills extracted successfully via AI');
    } catch (e) {
      toast.error('Failed to extract skills');
    }
    setIsExtracting(false);
  };

  const handleSaveExtractedSkills = async () => {
    try {
      const promises = extractedSkills.map(async (s) => {
        const skillRes = await LD_API.createSkill(orgId, {
          name: s.skill,
          description: s.context || 'Auto-extracted from JD',
          category: s.type || 'Technical',
          importance_level: s.importance === 'high' ? 5 : (s.importance === 'medium' ? 3 : 1)
        });
        
        if (selectedRole && skillRes.data?.data?.id) {
          await LD_API.mapRoleSkill(orgId, selectedRole.id, {
            skill_id: skillRes.data.data.id,
            required_proficiency: s.importance === 'high' ? 4 : (s.importance === 'medium' ? 3 : 2),
            criticality_weight: s.importance === 'high' ? 8 : (s.importance === 'medium' ? 5 : 3)
          });
        }
      });
      await Promise.all(promises);
      toast.success(`${extractedSkills.length} skills added ${selectedRole ? 'and mapped to ' + selectedRole.title : 'to taxonomy'}!`);
      setIsJDModalOpen(false);
      setJdText('');
      setExtractedSkills([]);
      loadData();
    } catch (e) {
      toast.error('Some skills may already exist or failed to save');
    }
  };

  const handleMapSkill = async () => {
    if (!selectedRole || !mappingSkill) return;
    setIsMapping(true);
    try {
      await LD_API.mapRoleSkill(orgId, selectedRole.id, {
        skill_id: mappingSkill.id,
        required_proficiency: profLevel,
        criticality_weight: critWeight
      });
      toast.success(`Skill mapped to ${selectedRole.title}`);
      setIsMapModalOpen(false);
      loadData();
    } catch (e) {
      toast.error('Failed to map skill');
    }
    setIsMapping(false);
  };

  const handleCreateRole = async () => {
    if (!newRole.title) return toast.error('Role title is required');
    setIsSubmittingRole(true);
    try {
      await LD_API.createRole(orgId, newRole);
      toast.success('Role created successfully');
      setNewRole({ title: '', department: '', level: 'mid' });
      setIsRoleModalOpen(false);
      loadData();
    } catch (e) {
      toast.error('Failed to create role');
    }
    setIsSubmittingRole(false);
  };

  const handleGenerateRoadmap = async (roleId) => {
    setIsGeneratingRoadmap(true);
    setRoadmap(null);
    try {
      const res = await LD_API.getCareerRoadmap(orgId, roleId);
      setRoadmap(res.data?.data);
      const selRole = roles.find(r => r.id === roleId);
      setTargetRole(selRole);
    } catch (e) {
      toast.error('Failed to generate career roadmap');
    }
    setIsGeneratingRoadmap(false);
  };

  const TABS = [
    { id: 'taxonomy', label: 'Taxonomy Builder', icon: Briefcase },
    { id: 'members', label: 'Team Members', icon: Users },
    { id: 'heatmap', label: 'Skill Gap Heatmap', icon: BarChart3 },
    { id: 'career', label: 'Career Pathing', icon: Map },
  ];

  if (!orgId) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <Link href="/corporate/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
                &larr; Dashboard
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Brain size={16} className="text-indigo-600" />
              </div>
              <h1 className="text-xl font-extrabold text-gray-900">Skill Intelligence Engine</h1>
            </div>
            
            <div className="flex bg-gray-100/80 p-1 rounded-xl w-fit">
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setActiveTab(t.id); router.replace(`/corporate/skills?orgId=${orgId}&tab=${t.id}`) }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
          </div>
        ) : (
          <>
            {activeTab === 'taxonomy' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-indigo-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                  <div className="relative z-10 w-full max-w-2xl">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="text-amber-400" /> Auto-Build via Job Descriptions
                    </h2>
                    <p className="text-indigo-200 text-sm mb-6">
                      Don&apos;t build your taxonomy from scratch. Paste any Job Description and our AI will extract specific skills, tools, and competencies instantly.
                    </p>
                    <button onClick={() => setIsJDModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 text-sm font-bold shadow hover:bg-indigo-50 transition-colors flex items-center gap-2">
                      <FileText size={16} /> Paste Job Description
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2"><Briefcase size={16} className="text-indigo-500"/> Defined Roles ({roles.length})</h3>
                      <button 
                        onClick={() => setIsRoleModalOpen(true)}
                        className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
                      {roles.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">No roles defined yet.</div>
                      ) : (
                        <div className="space-y-2">
                          {roles.map(r => (
                            <button key={r.id} onClick={() => setSelectedRole(r)} className={`w-full text-left p-3 rounded-xl border transition-all ${selectedRole?.id === r.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'}`}>
                              <p className="font-bold text-gray-800 text-sm">{r.title}</p>
                              <p className="text-[11px] text-gray-500 mt-1">{r.department} • Level {r.level}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Zap size={16} className="text-amber-500"/> 
                        {selectedRole ? `Skills for ${selectedRole.title}` : `All Skills (${skills.length})`}
                      </h3>
                      {selectedRole && <button onClick={() => setSelectedRole(null)} className="text-xs text-gray-500 hover:text-gray-800 font-medium px-2 py-1 bg-gray-200 rounded">Show All</button>}
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
                      {skills.length === 0 ? (
                         <div className="text-center py-10 text-gray-400 text-sm">No skills yet. Use AI to extract them!</div>
                      ) : (
                        <div className="space-y-3">
                          {skills.map(s => (
                            <div key={s.id} className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start justify-between group">
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{s.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-600 border border-gray-200">{s.category}</span>
                                  <span className="text-xs text-gray-400 truncate max-w-[200px]">{s.description}</span>
                                </div>
                              </div>
                              {selectedRole && (
                                <button 
                                  onClick={() => {
                                    setMappingSkill(s);
                                    setProfLevel(3);
                                    setCritWeight(5);
                                    setIsMapModalOpen(true);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded hover:bg-indigo-100 transition-all"
                                >
                                  Map
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Directory</h3>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow flex items-center gap-2">
                    <Plus size={16} /> Invite Members
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Assessed Skills</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {members.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-400">No members found.</td></tr>
                      ) : members.map(m => (
                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-semibold text-gray-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex justify-center items-center text-white font-bold text-xs">{m.full_name?.[0] || '?'}</div>
                            {m.full_name}
                          </td>
                          <td className="p-4 text-gray-600">{m.job_title || <span className="text-amber-500 text-xs font-semibold bg-amber-50 px-2 py-1 rounded">Unassigned</span>}</td>
                          <td className="p-4">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[100px]"><div className="bg-indigo-500 h-1.5 rounded-full" style={{width: '25%'}}></div></div>
                          </td>
                          <td className="p-4"><button className="text-indigo-600 hover:underline font-medium text-xs">View Profile</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'heatmap' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                 <div className="max-w-md mx-auto mb-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex justify-center items-center mx-auto shadow-lg mb-4">
                        <BarChart3 size={32} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Team Readiness Matrix</h2>
                    <p className="text-sm text-gray-500">Visualizes skill gaps across the entire organization to help you target L&D initiatives effectively.</p>
                 </div>

                 {heatmap.length === 0 ? (
                    <div className="p-10 border border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 text-sm text-center">
                      Not enough assessment data yet. Assign roles to members and request assessments to see the heatmap.
                    </div>
                 ) : (() => {
                    const userMap = {};
                    const skillSet = new Set();
                    heatmap.forEach(row => {
                      if (!userMap[row.user_id]) {
                        userMap[row.user_id] = { name: row.full_name, department: row.department, title: row.job_title, skills: {} };
                      }
                      if (row.skill_name) {
                        skillSet.add(row.skill_name);
                        userMap[row.user_id].skills[row.skill_name] = {
                          current: parseFloat(row.current_score || 0),
                          required: parseFloat(row.required_proficiency || 3),
                          gap: parseFloat(row.gap || 0)
                        };
                      }
                    });
                    const users = Object.values(userMap);
                    const skillNames = Array.from(skillSet);
                    const cellColor = (score, required) => {
                      if (score === 0) return 'bg-gray-100 text-gray-400';
                      if (score < 2) return 'bg-red-100 text-red-800';
                      if (score < required) return 'bg-amber-100 text-amber-800';
                      return 'bg-green-100 text-green-800';
                    };
                    return (
                      <div className="overflow-x-auto border rounded-xl">
                        <table className="w-full text-xs text-left min-w-[500px]">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="p-3 font-semibold text-gray-500 min-w-[160px]">Member / Role</th>
                              {skillNames.map(s => (
                                <th key={s} className="p-3 text-center font-semibold text-gray-600 min-w-[110px]">{s}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y text-gray-700">
                            {users.map((u, i) => (
                              <tr key={i} className="hover:bg-gray-50/50">
                                <td className="p-3">
                                  <div className="font-bold text-gray-800">{u.name || '—'}</div>
                                  <div className="text-[10px] text-gray-400 mt-0.5">{u.title || u.department}</div>
                                </td>
                                {skillNames.map(s => {
                                  const cell = u.skills[s];
                                  return (
                                    <td key={s} className="p-2 text-center">
                                      {cell ? (
                                        <div className={`rounded-lg px-2 py-1.5 font-bold inline-flex flex-col items-center gap-0.5 min-w-[70px] ${cellColor(cell.current, cell.required)}`}>
                                          <span className="text-sm">{cell.current.toFixed(1)}<span className="text-[10px] font-normal opacity-70">/{cell.required}</span></span>
                                          {cell.gap > 0 && <span className="text-[9px] uppercase tracking-wide opacity-60">−{cell.gap.toFixed(1)} gap</span>}
                                        </div>
                                      ) : (
                                        <span className="text-gray-300 text-lg">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                 })()}

                 <div className="mt-6 flex items-center justify-center gap-6 text-xs font-semibold">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block"/> Critical Gap (&lt;2)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block"/> Developing (below target)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block"/> Proficient (meets target)</span>
                 </div>
              </div>
            )}
            {activeTab === 'career' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-emerald-900 to-teal-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                   <div className="absolute right-0 top-0 opacity-10 -mr-10 -mt-10">
                      <Map size={240} />
                   </div>
                   <div className="relative z-10 max-w-2xl">
                      <h2 className="text-3xl font-black mb-3">AI Career Architect</h2>
                      <p className="text-emerald-100 text-sm mb-6 leading-relaxed">
                        Select your target role and let Syllabrix analyze the skill delta between your current profile and the role requirements. We'll generate a personalized, 3-step learning roadmap to get you there.
                      </p>
                      <div className="flex flex-wrap gap-4">
                         <div className="flex-1 min-w-[240px]">
                            <select 
                              onChange={(e) => handleGenerateRoadmap(Number(e.target.value))}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-white/30 transition-all appearance-none cursor-pointer"
                              defaultValue=""
                            >
                               <option value="" disabled className="bg-[#0D2E28]">Select Future Target Role...</option>
                               {roles.map(r => (
                                 <option key={r.id} value={r.id} className="bg-[#0D2E28]">{r.title} ({r.department})</option>
                               ))}
                            </select>
                         </div>
                      </div>
                   </div>
                </div>

                {isGeneratingRoadmap && (
                  <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-emerald-200 animate-pulse">
                     <Sparkles size={40} className="text-emerald-400 mx-auto mb-4" />
                     <p className="text-emerald-700 font-bold">Gemini is architecting your growth roadmap...</p>
                  </div>
                )}

                {roadmap && (
                  <div className="grid lg:grid-cols-12 gap-10">
                     <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                           <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <Target size={18} className="text-rose-500" /> Skill Delta: {targetRole?.title}
                           </h4>
                           <div className="space-y-4">
                              {roadmap.gaps?.map((g, i) => (
                                <div key={i}>
                                   <div className="flex justify-between items-end mb-1">
                                      <p className="text-xs font-bold text-gray-700">{g.skill_name}</p>
                                      <p className="text-[10px] font-mono text-gray-400">Current {g.current} → Target {g.required}</p>
                                   </div>
                                   <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-rose-500 h-full" style={{ width: `${(g.current / g.required) * 100}%` }} />
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                           <div className="flex items-center gap-2 mb-6">
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest rounded-full">AI Roadmap</span>
                              <span className="text-xs text-gray-400 font-medium">Personalized for {user?.username}</span>
                           </div>
                           
                           <div className="prose prose-slate max-w-none prose-sm prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed">
                              <div className="whitespace-pre-wrap font-medium text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                 {roadmap.roadmap_text}
                              </div>
                           </div>

                           <div className="mt-8 flex gap-4">
                              <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2">
                                 <Plus size={16} /> Enroll in Suggested Courses
                              </button>
                              <button className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                                 <FileText size={16} /> Save to PDF
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Define New Job Role</h3>
              <p className="text-sm text-gray-500">Add a role to map specific skills and competencies.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Role Title</label>
                <input type="text" value={newRole.title} onChange={e => setNewRole({...newRole, title: e.target.value})} placeholder="e.g. Senior Frontend Engineer" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Department</label>
                <input type="text" value={newRole.department} onChange={e => setNewRole({...newRole, department: e.target.value})} placeholder="e.g. Engineering" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Seniority Level</label>
                <select value={newRole.level} onChange={e => setNewRole({...newRole, level: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none">
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button onClick={() => setIsRoleModalOpen(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100">Cancel</button>
              <button onClick={handleCreateRole} disabled={isSubmittingRole || !newRole.title} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50">
                {isSubmittingRole ? <Loader2 className="animate-spin" size={18} /> : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isJDModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Sparkles className="text-amber-500" /> AI Skill Extraction</h3>
              <button onClick={() => setIsJDModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-bold text-gray-700 mb-2">Paste Job Description</label>
                <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="e.g. We are looking for a Senior Frontend Engineer..." className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm resize-none min-h-[300px]" />
                <button onClick={handleExtractJD} disabled={isExtracting || !jdText.trim()} className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold disabled:opacity-50 flex justify-center items-center gap-2">
                  {isExtracting ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />} Extract Skills
                </button>
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Check size={16} className="text-emerald-500" /> Detected Skills</h4>
                {isExtracting ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center"><Sparkles className="w-10 h-10 text-amber-400 animate-pulse mb-3" /><p className="text-gray-600 font-semibold text-sm">Analyzing...</p></div>
                ) : extractedSkills.length > 0 ? (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                      {extractedSkills.map((s, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                          <div><p className="font-bold text-sm">{s.skill}</p><p className="text-[10px] uppercase">{s.type}</p></div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${s.importance === 'high' ? 'bg-red-100' : 'bg-blue-100'}`}>{s.importance}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleSaveExtractedSkills} className="mt-4 w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold">Save to Taxonomy</button>
                  </>
                ) : <div className="flex-1 flex flex-col items-center justify-center text-gray-400"><AlertCircle className="w-10 h-10 mb-3 opacity-20" /><p className="text-sm">Results will appear here.</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-center mb-1"><h3 className="text-lg font-bold">Map Skill to Role</h3><button onClick={() => setIsMapModalOpen(false)}><X/></button></div>
              <p className="text-sm">Linking <span className="font-bold text-indigo-600">{mappingSkill?.name}</span> to <span className="font-bold">{selectedRole?.title}</span></p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between mb-2"><label className="text-sm font-bold">Proficiency</label><span className="font-extrabold">{profLevel}/5</span></div>
                <input type="range" min="1" max="5" value={profLevel} onChange={e => setProfLevel(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between mb-2"><label className="text-sm font-bold">Criticality</label><span className="font-extrabold">{critWeight}/10</span></div>
                <input type="range" min="1" max="10" value={critWeight} onChange={e => setCritWeight(parseInt(e.target.value))} className="w-full accent-amber-500" />
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button onClick={() => setIsMapModalOpen(false)} className="flex-1 py-3 border rounded-xl">Cancel</button>
              <button onClick={handleMapSkill} disabled={isMapping} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">
                {isMapping ? <Loader2 className="animate-spin" size={18} /> : 'Save Mapping'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillIntelligencePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" /></div>}>
      <SkillIntelligenceContent />
    </Suspense>
  );
}
