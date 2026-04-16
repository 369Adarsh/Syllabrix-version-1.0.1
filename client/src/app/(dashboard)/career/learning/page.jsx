'use client';
import { useState, useEffect, useCallback } from 'react';
import { careerAPI } from '@/lib/api/career.api';
import {
  Target, Plus, RefreshCw, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, Play, BookOpen, Calendar,
  ExternalLink, Zap, Award, Globe, Briefcase, FileText,
  Clock, ArrowUpRight, Crown, Sparkles, Loader2, Bot,
  TrendingUp, Share2, ChevronLeft, Copy, X, Code, Terminal, ListChecks,
  Info, Cpu, Lightbulb, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

const STATUS_STYLES = {
  not_started: { bg: 'bg-gray-100',    text: 'text-gray-500',  label: 'Ready' },
  in_progress: { bg: 'bg-blue-600',    text: 'text-white',     label: 'Learning'  },
  paused:      { bg: 'bg-slate-100',   text: 'text-slate-600', label: 'On Hold'       },
  completed:   { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Done'    },
};

function ModuleCard({ title, icon: Icon, children, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-900 text-slate-100 border-slate-800'
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-gray-200/30 transition-all flex flex-col h-full group">
       <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform`}>
             <Icon size={20} strokeWidth={2.5} />
          </div>
          <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">{title}</h4>
       </div>
       <div className="flex-1">
          {children}
       </div>
    </div>
  );
}

function PathDetail({ path, onBack, onUpdate }) {
  const [completing, setCompleting] = useState(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [generatingLab, setGeneratingLab] = useState(false);
  const [labError, setLabError] = useState(null);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);

  const daily = path.daily_plan ? (typeof path.daily_plan === 'string' ? JSON.parse(path.daily_plan) : path.daily_plan) : [];
  const completedDays = path.completed_days ? (typeof path.completed_days === 'string' ? JSON.parse(path.completed_days) : path.completed_days) : [];
  const activeDay = daily[activeDayIdx] || null;

  const handleComplete = async (day) => {
    setCompleting(day);
    try {
      await careerAPI.completeDay(path.id, day);
      onUpdate();
    } finally {
      setCompleting(null);
    }
  };

  const fetchDayDetail = useCallback(async (dayIdx, force = false) => {
    const rawDaily = path.daily_plan ? (typeof path.daily_plan === 'string' ? JSON.parse(path.daily_plan) : path.daily_plan) : [];
    const dayItem = rawDaily[dayIdx];
    if (!dayItem || (!force && dayItem.conceptual_theory)) return;

    setGeneratingLab(true);
    setLabError(null);
    try {
      const res = await careerAPI.generateDayContent(path.id, dayItem.day);
      if (res.data?.success) {
        onUpdate(); 
      }
    } catch (err) {
      setLabError("The AI nodes are busy. Retrying calibration...");
      console.error(err);
    } finally {
      setGeneratingLab(false);
    }
  }, [path.id, path.daily_plan, onUpdate]);

  useEffect(() => {
    fetchDayDetail(activeDayIdx);
  }, [activeDayIdx, fetchDayDetail]);

  if (!activeDay) return null;

  const isDayCompleted = completedDays.includes(activeDay.day);
  const totalDays = daily.length;
  const progressPct = totalDays > 0 ? Math.round((completedDays.length / totalDays) * 100) : 0;

  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-hidden animate-fade-in shadow-2xl">
       {/* Institute Top Bar */}
       <header className="h-16 md:h-20 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-6">
             <button onClick={onBack} className="p-2 md:p-3 rounded-full hover:bg-gray-50 text-gray-400 transition-all border border-gray-50">
                <ChevronLeft size={18} />
             </button>
             <button 
               onClick={() => setIsSyllabusOpen(!isSyllabusOpen)}
               className="lg:hidden p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100"
             >
                <ListChecks size={18} />
             </button>
             <div className="hidden md:block h-8 w-px bg-gray-100" />
             <div className="max-w-[150px] md:max-w-none">
                <div className="flex items-center gap-2 mb-0.5 truncate">
                   <h1 className="text-sm md:text-lg font-black text-gray-900 tracking-tighter uppercase leading-none truncate">{path.skill_name} Mastery Hub</h1>
                   <span className="hidden sm:inline-block text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{path.difficulty}</span>
                </div>
                <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">Syllabrix Professional Learning Institute</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden xl:flex flex-col items-end">
                <div className="flex items-center gap-3 mb-1.5">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Progress</span>
                   <span className="text-sm font-black text-gray-900">{progressPct}%</span>
                </div>
                <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} className="h-full bg-blue-600" />
                </div>
             </div>
             <button onClick={() => window.print()} className="p-2 md:p-3 bg-gray-900 text-white rounded-xl md:rounded-2xl hover:bg-blue-600 transition-colors shadow-lg shadow-gray-200">
                <Share2 size={16} />
             </button>
          </div>
       </header>

       <div className="flex-1 flex overflow-hidden">
          {/* Dashboard Rail (Sidebar) - Slide out on Mobile */}
          <aside className={`fixed inset-y-0 left-0 z-40 w-[320px] bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-hidden transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSyllabusOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Curriculum Roadmap</h3>
                <button onClick={() => setIsSyllabusOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-gray-900">
                   <X size={18} />
                </button>
             </div>
             <div className="p-6 pt-0">
                <div className="flex items-center justify-between text-[11px] font-black text-gray-900 border border-gray-100 p-3 rounded-2xl bg-gray-50 mt-4">
                   <span>{path.difficulty}</span>
                   <span className="text-gray-300">|</span>
                   <span>{totalDays} Sessions</span>
                </div>
             </div>

             <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {daily.map((day, idx) => {
                  const isComp = completedDays.includes(day.day);
                  const isActive = activeDayIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => { setActiveDayIdx(idx); setIsSyllabusOpen(false); }}
                      className={`w-full text-left p-4 rounded-3xl transition-all group relative overflow-hidden flex flex-col border ${
                        isActive 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-100' 
                        : 'bg-white border-transparent hover:border-gray-100 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1 relative z-10">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>S.{day.day}</span>
                        {isComp && <CheckCircle2 size={14} className={isActive ? 'text-white' : 'text-emerald-500'} />}
                      </div>
                      <h4 className="text-[12px] font-black leading-tight tracking-tight uppercase relative z-10 truncate">{day.title}</h4>
                    </button>
                  );
                })}
             </nav>
          </aside>

          {/* Backdrop for mobile syllabus */}
          {isSyllabusOpen && (
            <div 
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setIsSyllabusOpen(false)}
            />
          )}

          {/* Main Stage - Densified */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-white custom-scrollbar">
             <div className="max-w-[1400px] mx-auto space-y-8">
                {/* Active Unit Header */}
                <section className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-8 gap-6">
                   <div>
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                         <div className="w-fit px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                            Active Session
                         </div>
                         <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">{activeDay.title}</h2>
                      </div>
                      {path.career_alignment && (
                         <p className="text-[10px] md:text-[11px] font-medium text-gray-400 leading-relaxed max-w-2xl italic">Strategic Context: &quot;{path.career_alignment}&quot;</p>
                      )}
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <div className="text-left md:text-right">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Session Progress</p>
                         <p className="text-xl font-black text-gray-900">{isDayCompleted ? '100%' : 'In Progress'}</p>
                      </div>
                   </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {/* Left Col: Theory & Video (Dominant) */}
                   <div className="lg:col-span-2 space-y-8">
                      <ModuleCard title="Conceptual Grounding" icon={Lightbulb} color="amber">
                         {generatingLab ? (
                            <div className="space-y-6 py-12 text-center">
                               <Loader2 size={48} className="animate-spin text-amber-500 mx-auto mb-6" strokeWidth={1.5} />
                               <div className="space-y-2">
                                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Calibrating Industrial Nodes</p>
                                  <p className="text-[13px] font-bold text-gray-400">Constructing 2000+ words of expertise...</p>
                               </div>
                            </div>
                         ) : !activeDay.conceptual_theory ? (
                            <div className="p-10 bg-amber-50 rounded-[40px] border-2 border-dashed border-amber-200 text-center space-y-8">
                               <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto text-amber-500">
                                  <Crown size={40} />
                               </div>
                               <div className="space-y-3">
                                  <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">Initialize Deep Mastery</h4>
                                  <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-sm mx-auto">
                                     Unlock industrial-grade theory (2000+ words) and the 15-exercise mastery bank for this session.
                                  </p>
                               </div>
                               <button 
                                  onClick={() => fetchDayDetail(activeDayIdx, true)}
                                  className="px-10 py-5 bg-amber-500 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-100 hover:bg-amber-600 active:scale-95 transition-all"
                               >
                                  Deploy Strategic Content
                               </button>
                            </div>
                         ) : (
                            <div className="prose prose-slate max-w-none">
                               <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 mb-6">
                                  <p className="text-[14px] text-gray-700 font-medium leading-[1.8] whitespace-pre-wrap">
                                     {activeDay.conceptual_theory}
                                  </p>
                               </div>
                            </div>
                         )}
                      </ModuleCard>

                      <ModuleCard title="Technical mastery" icon={Play} color="blue">
                         <div className="aspect-video w-full bg-slate-900 rounded-3xl overflow-hidden shadow-sm relative group">
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(`${path.skill_name} ${activeDay.title} professional tutorial`)}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                         </div>
                      </ModuleCard>

                      <ModuleCard title="Study Materials" icon={BookOpen} color="emerald">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {(activeDay.study_materials || []).map((m, i) => (
                               <a 
                                  key={i} 
                                  href={m.link} 
                                  target="_blank" 
                                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-emerald-500 hover:bg-white transition-all group"
                               >
                                  <div className="flex items-center gap-3 text-left truncate">
                                      <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0">
                                         <FileText size={16} />
                                      </div>
                                      <div className="truncate">
                                         <p className="text-[10px] font-black text-gray-900 group-hover:text-emerald-700 truncate">{m.title}</p>
                                      </div>
                                  </div>
                                  <ArrowUpRight size={14} className="text-gray-300 group-hover:text-emerald-500" />
                               </a>
                             ))}
                          </div>
                      </ModuleCard>
                   </div>

                   {/* Middle Col: 15-Exercise Bank */}
                   <div className="lg:col-span-1 border-x border-gray-100 px-4 space-y-6">
                      <div className="flex items-center justify-between mb-2">
                         <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Mastery Drills (15)</h4>
                         <Zap size={14} className="text-amber-500" />
                      </div>
                      
                      <div className="bg-gray-50 rounded-3xl p-2 space-y-1 max-h-[800px] overflow-y-auto custom-scrollbar">
                         {generatingLab ? (
                            [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => (
                               <div key={i} className="h-12 bg-white rounded-2xl animate-pulse flex items-center px-4">
                                  <div className="w-4 h-4 rounded bg-gray-100" />
                               </div>
                            ))
                         ) : (activeDay.exercise_bank || []).length > 0 ? (
                            activeDay.exercise_bank.map((ex, idx) => (
                               <button
                                 key={idx}
                                 onClick={() => setActiveExerciseIdx(idx)}
                                 className={`w-full text-left p-4 rounded-2xl transition-all border ${
                                   activeExerciseIdx === idx 
                                   ? 'bg-white border-blue-200 shadow-sm text-blue-600 font-black' 
                                   : 'border-transparent text-gray-400 hover:text-gray-900 hover:bg-white/50 font-bold'
                                 } text-[11px] flex items-center gap-3`}
                               >
                                  <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[9px]">{idx+1}</span>
                                  <span className="truncate">{ex.title}</span>
                               </button>
                            ))
                         ) : (
                            <div className="p-8 text-center space-y-4">
                               <p className="text-[10px] font-black text-gray-300 uppercase italic">Drill bank Locked</p>
                               <button 
                                  onClick={() => fetchDayDetail(activeDayIdx, true)}
                                  className="w-full py-3 bg-white border border-blue-100 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                               >
                                  Calibrate Session
                               </button>
                            </div>
                         )}
                      </div>
                   </div>

                   {/* Right Col: Active Exercise & Capstone */}
                   <div className="lg:col-span-1 space-y-6">
                      {activeDay.exercise_bank?.[activeExerciseIdx] && (
                        <ModuleCard title="Active Drill" icon={Target} color="emerald">
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <span className="text-[9px] font-black px-2 py-1 bg-emerald-50 text-emerald-600 rounded uppercase">Drill {activeExerciseIdx + 1}</span>
                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{activeDay.exercise_bank[activeExerciseIdx].difficulty}</span>
                              </div>
                              <p className="text-sm font-black text-gray-900 leading-tight">
                                 {activeDay.exercise_bank[activeExerciseIdx].title}
                              </p>
                              <p className="text-[11px] font-medium text-gray-600 leading-relaxed">
                                 {activeDay.exercise_bank[activeExerciseIdx].description}
                              </p>
                              {activeDay.exercise_bank[activeExerciseIdx].blueprint && (
                                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
                                   <code className="text-[10px] text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">
                                      {activeDay.exercise_bank[activeExerciseIdx].blueprint}
                                   </code>
                                </div>
                              )}
                           </div>
                        </ModuleCard>
                      )}

                      <ModuleCard title="Strategic AI Assistant" icon={Bot} color="purple">
                          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group border border-slate-800">
                             <div className="relative z-10">
                                <p className="text-[11px] font-bold leading-relaxed text-blue-100 italic">
                                   &quot;{activeDay.ai_assistant?.tip || "Analyze the architectural pattern before implementation."}&quot;
                                </p>
                             </div>
                          </div>
                      </ModuleCard>

                      <ModuleCard title="Session Finale" icon={Award} color="slate">
                          <div className="space-y-4">
                             <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{activeDay.challenge_lab?.title || "Industrial Milestone"}</p>
                             <p className="text-[11px] font-medium text-gray-500 leading-relaxed italic">{activeDay.challenge_lab?.problem_statement?.slice(0, 100)}...</p>
                          </div>
                      </ModuleCard>

                      <div className="pt-4">
                         <button
                            onClick={() => handleComplete(activeDay.day)}
                            disabled={isDayCompleted || completing === activeDay.day}
                            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 ${
                               isDayCompleted 
                                 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-emerald-100/20' 
                                 : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 active:scale-[0.98]'
                            }`}
                         >
                            {completing === activeDay.day ? (
                               <Loader2 size={16} className="animate-spin" />
                            ) : isDayCompleted ? (
                               <><CheckCircle2 size={16} /> Session Mastered</>
                            ) : (
                               <><Zap size={16} /> Complete Session</>
                            )}
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </main>
       </div>
    </div>
  );
}

export default function LearningPage() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [skillProfile, setSkillProfile] = useState(null);

  // Generate form
  const [skillName, setSkillName] = useState('');
  const [totalDays, setTotalDays] = useState(10);
  const [learningMode, setLearningMode] = useState('polish');
  const [focus, setFocus] = useState('project');

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [pathsRes, profileRes] = await Promise.all([
        careerAPI.listLearningPaths(),
        careerAPI.getSkillProfile()
      ]);
      setPaths(pathsRes.data?.data || []);
      setSkillProfile(profileRes.data?.data || null);
    } catch {
      setPaths([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const refreshSelected = useCallback(async () => {
    if (!selectedPath) return;
    try {
      const res = await careerAPI.getLearningPath(selectedPath.id);
      setSelectedPath(res.data?.data || null);
      const pathsRes = await careerAPI.listLearningPaths();
      setPaths(pathsRes.data?.data || []);
    } catch {
      // ignore
    }
  }, [selectedPath]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!skillName.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await careerAPI.generateLearningPath({
        skill_name: skillName,
        total_days: totalDays,
        mode: learningMode,
        focus: focus
      });
      const newPath = res.data?.data;
      await loadInitialData();
      if (newPath?.id) {
        const fullRes = await careerAPI.getLearningPath(newPath.id);
        setSelectedPath(fullRes.data?.data || newPath);
      }
      setShowForm(false);
      setSkillName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Adaptive generation failed. Our strategic nodes are calibrating.');
    } finally {
      setGenerating(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all learning paths? This action cannot be undone.')) return;
    try {
      await careerAPI.clearLearningPaths();
      loadInitialData();
    } catch (err) {
      alert('Failed to clear learning paths.');
    }
  };

  if (selectedPath) {
    return (
      <PathDetail
        path={selectedPath}
        onBack={() => setSelectedPath(null)}
        onUpdate={refreshSelected}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-12 px-3 sm:px-4 md:px-0 pb-20">
      {/* Header & Impulse */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
                 <Target size={16} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Learning Hub</span>
           </div>
           <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-3">
             My Learning Hub
           </h1>
           <p className="text-sm text-gray-400 font-medium max-w-lg">
             Build your IT skills with adaptive roadmaps, deep theory, and interactive challenge labs.
           </p>
        </div>
        <div className="flex flex-wrap gap-3">
           <button
             onClick={() => setShowForm(o => !o)}
             className="flex items-center justify-center gap-2 px-5 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
           >
             {showForm ? <X size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
             {showForm ? 'Cancel' : 'New Path'}
           </button>
           {paths.length > 0 && (
             <button
               onClick={handleClearAll}
               className="flex items-center justify-center gap-2 px-5 sm:px-8 py-3 sm:py-4 bg-white border border-red-200 text-red-600 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all"
             >
               Start Fresh
             </button>
           )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-white border border-gray-100 rounded-[32px] sm:rounded-[48px] p-5 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
            
            <div className="flex items-center gap-4 mb-10">
               <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <Zap size={28} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Universal Mastery Engine</h3>
                  <p className="text-[11px] text-blue-600 font-black uppercase tracking-widest mt-1">Calibrating your adaptive journey...</p>
               </div>
            </div>

            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-10">
              <div className="md:col-span-2 space-y-6">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Select target skill</label>
                
                {skillProfile && (
                  <div className="space-y-6 mb-8">
                     {/* Primary Skills */}
                     <div>
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-3">Primary Mastery</p>
                        <div className="flex flex-wrap gap-2">
                           {skillProfile.skillsDetected?.filter(s => s.type === 'primary').slice(0, 10).map(s => (
                              <button
                                key={s.name}
                                type="button"
                                onClick={() => { setSkillName(s.name); setLearningMode('polish'); }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                  skillName === s.name ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-white shadow-sm'
                                }`}
                              >
                                 Polish {s.name}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Gaps / Bridge */}
                     {skillProfile.skillGaps?.length > 0 && (
                        <div>
                           <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-3">Bridge Skill Gaps</p>
                           <div className="flex flex-wrap gap-2">
                              {skillProfile.skillGaps.slice(0, 6).map(g => (
                                 <button
                                   key={g.name}
                                   type="button"
                                   onClick={() => { setSkillName(g.name); setLearningMode('bridge'); }}
                                   className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                     skillName === g.name ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-white shadow-sm'
                                   }`}
                                 >
                                    Bridge {g.name}
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Associated / Secondary Skills */}
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Associated Skills</p>
                        <div className="flex flex-wrap gap-2 text-wrap">
                           {skillProfile.skillsDetected?.filter(s => !s.type || s.type === 'secondary').slice(0, 12).map(s => (
                              <button
                                key={s.name}
                                type="button"
                                onClick={() => { setSkillName(s.name); setLearningMode('polish'); }}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                                  skillName === s.name ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                                }`}
                              >
                                 {s.name}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

                <input
                  type="text"
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  placeholder="e.g. Python, SAP ABAP, Gen AI, Prompt Engineering"
                  className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-8 py-5 text-base font-black text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Duration (Days)</label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                   {[7, 10, 14, 21, 30].map(d => (
                     <button
                       key={d}
                       type="button"
                       onClick={() => setTotalDays(d)}
                       className={`py-3 sm:py-4 rounded-2xl border text-xs font-black transition-all ${
                         totalDays === d ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'
                       }`}
                     >
                       {d}
                     </button>
                   ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Learning Focus</label>
                <div className="grid grid-cols-3 gap-2">
                   {['project', 'academic', 'speed'].map(f => (
                     <button
                       key={f}
                       type="button"
                       onClick={() => setFocus(f)}
                       className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                         focus === f ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-slate-400'
                       }`}
                     >
                       {f}
                     </button>
                   ))}
                </div>
              </div>

              <div className="md:col-span-2 pt-6">
                 {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold leading-relaxed">
                       <AlertCircle size={16} /> {error}
                    </motion.div>
                 )}
                 <button
                    type="submit"
                    disabled={generating || !skillName.trim()}
                    className="w-full py-6 bg-blue-600 text-white rounded-[32px] text-sm font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/10 flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {generating ? (
                      <><Loader2 size={24} className="animate-spin" /> Calibrating Adaptive Roadmap...</>
                    ) : (
                      <><Sparkles size={24} /> Generate Mastery Journey</>
                    )}
                 </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active Mastery Paths</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1,2,3,4].map(i => <div key={i} className="h-72 bg-gray-50 rounded-[48px] animate-pulse" />)}
          </div>
        ) : paths.length === 0 ? (
          <div className="p-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[64px] text-center">
             <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Layout size={40} className="text-gray-200" />
             </div>
             <h3 className="text-3xl font-black text-gray-900 uppercase mb-4">Your dashboard is empty</h3>
             <p className="text-gray-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                Scan your resume or enter a skill above to generate your first adaptive mastery journey.
             </p>
             <button
               onClick={() => setShowForm(true)}
               className="px-12 py-5 bg-white border border-gray-200 text-gray-900 rounded-[2.5rem] text-xs font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
             >
                Initialize Training
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {paths.map(path => {
              const completedDays = path.completed_days ? (typeof path.completed_days === 'string' ? JSON.parse(path.completed_days) : path.completed_days) : [];
              const pct = path.total_days > 0 ? Math.round((completedDays.length / path.total_days) * 100) : 0;
              const status = STATUS_STYLES[path.status] || STATUS_STYLES.not_started;
              
              return (
                <button
                  key={path.id}
                  onClick={async () => {
                    const res = await careerAPI.getLearningPath(path.id);
                    setSelectedPath(res.data?.data || path);
                  }}
                  className="group bg-white border border-gray-100 rounded-[56px] p-10 text-left hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/30 transition-all relative overflow-hidden flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-10">
                     <div className="w-16 h-16 rounded-[28px] bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-100 transition-transform group-hover:scale-110">
                        <Target size={28} className="text-white" strokeWidth={3} />
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full border ${status.bg} ${status.text} ${path.status === 'in_progress' ? 'border-transparent' : 'border-gray-100'}`}>
                        {status.label}
                     </span>
                  </div>

                  <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-[0.85] mb-4 group-hover:text-blue-600 transition-colors">
                     {path.skill_name}
                  </h3>
                  
                  <div className="flex items-center gap-5 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-12">
                     <span className="flex items-center gap-2"><Clock size={14} /> {path.total_days} Days</span>
                     <span className="w-1 h-1 rounded-full bg-gray-200" />
                     <span className="text-blue-600">{path.difficulty}</span>
                  </div>

                  <div className="mt-auto">
                     <div className="flex items-end justify-between mb-4">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Mastery</p>
                           <p className="text-2xl font-black text-gray-900">{pct}%</p>
                        </div>
                        <div className="px-4 py-2 bg-gray-50 rounded-2xl flex items-center gap-2 border border-gray-100">
                           <CheckCircle2 size={14} className="text-emerald-500" />
                           <span className="text-[10px] font-black text-gray-900 uppercase">{completedDays.length}/{path.total_days} Modules</span>
                        </div>
                     </div>
                     <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-blue-600 rounded-full" />
                     </div>
                  </div>
                  
                  <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                     <ArrowUpRight size={28} className="text-blue-600" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Universal Institute Footer */}
      <div className="p-16 bg-slate-900 rounded-[64px] text-white relative overflow-hidden border border-white/5">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 opacity-20 blur-[150px] -mr-64 -mt-64" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                  <Award size={24} className="text-blue-400" />
                  <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">The Syllabrix Professional Standard</span>
               </div>
               <h2 className="text-4xl font-black tracking-tight uppercase mb-6 leading-tight">Master Any Skill.<br />Build Any Industry.</h2>
               <p className="text-slate-400 font-medium max-w-xl leading-relaxed text-lg">
                  Every path in our institute is uniquely tailored to its domain—whether it's high-level AI coding, SAP architecture, or Python engineering.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
               <div className="w-40 h-40 bg-white/5 rounded-[40px] border border-white/10 flex flex-col items-center justify-center gap-2 backdrop-blur-md">
                  <Cpu size={32} className="text-blue-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center">Adaptive<br />Intelligence</p>
               </div>
               <div className="w-40 h-40 bg-white/5 rounded-[40px] border border-white/10 flex flex-col items-center justify-center gap-2 backdrop-blur-md">
                  <Terminal size={32} className="text-emerald-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center">Rigorous<br />Practice</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
