'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LD_API from '@/lib/api/ld.api';
import toast from 'react-hot-toast';
import {
  BookOpen, Target, Shield, Clock, Search, Loader2, Sparkles,
  BarChart, PlayCircle, CheckCircle, TrendingUp, AlertCircle,
  Star, ChevronRight, Trophy, Zap, X
} from 'lucide-react';

function LmsLearningHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-learning');

  const [feed, setFeed] = useState({ enrolled: [], completed: [], recommended: [] });
  const [catalog, setCatalog] = useState([]);
  const [stats, setStats] = useState(null);
  const [compliance, setCompliance] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [reinforcements, setReinforcements] = useState([]);
  const [search, setSearch] = useState('');

  // Assessment state
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [assessmentRatings, setAssessmentRatings] = useState({}); // skillId -> rating

  useEffect(() => {
    if (orgId) {
      loadData();
    } else {
      LD_API.getMyOrgs().then(res => {
        if (res.data?.data?.length > 0) {
          router.replace(`/corporate/learn?orgId=${res.data.data[0].id}`);
        } else {
          router.push('/corporate/dashboard');
        }
      }).catch(() => router.push('/corporate/dashboard'));
    }
  }, [orgId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, gapsRes] = await Promise.allSettled([
        LD_API.getLearnerStats(orgId),
        LD_API.getGaps(orgId)
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data);
      if (gapsRes.status === 'fulfilled') setGaps(gapsRes.value.data?.data || []);

      if (activeTab === 'my-learning') {
        const [feedRes, reRes] = await Promise.all([
          LD_API.getLearnerFeed(orgId),
          LD_API.getReinforcements(orgId)
        ]);
        const raw = feedRes.data?.data;
        setFeed({
          enrolled: raw?.enrolled || [],
          completed: raw?.completed || [],
          recommended: raw?.recommended || []
        });
        setReinforcements(reRes.data?.data || []);
      } else if (activeTab === 'catalog') {
        const progRes = await LD_API.getPrograms(orgId, { status: 'published' });
        setCatalog(progRes.data?.data || []);
      } else if (activeTab === 'compliance') {
        const compRes = await LD_API.getComplianceStatus(orgId);
        setCompliance(compRes.data?.data || []);
      }
    } catch (e) {
      toast.error('Failed to load learning hub data');
    }
    setLoading(false);
  };

  const handleEnroll = async (programId) => {
    try {
      const res = await LD_API.enroll(orgId, { program_id: programId });
      const enrollmentId = res.data?.data?.enrollment_id;
      toast.success('Enrolled! Starting course...');
      if (enrollmentId) {
        router.push(`/corporate/learn/${enrollmentId}`);
      } else {
        setActiveTab('my-learning');
      }
    } catch (e) {
      toast.error('Failed to enroll or already enrolled.');
    }
  };

  const handleSubmitAssessment = async () => {
    const ratings = Object.entries(assessmentRatings).map(([skill_id, rating]) => ({
      skill_id: parseInt(skill_id),
      rating
    }));
    
    if (ratings.length === 0) return toast.error('Please rate at least one skill');
    
    setIsSubmittingAssessment(true);
    try {
      await LD_API.selfAssess(orgId, { ratings });
      toast.success('Self-assessment submitted successfully!');
      setIsAssessmentModalOpen(false);
      loadData();
    } catch (e) {
      toast.error('Failed to submit assessment');
    }
    setIsSubmittingAssessment(false);
  };

  const filteredCatalog = catalog.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Derive the top skill gap for the adaptive pathway banner
  const topGap = gaps.find(g => g.gap > 0);
  const closedSkills = stats?.completed > 0
    ? gaps.filter(g => g.gap === 0 || g.composite_score >= g.required_proficiency).slice(0, 3)
    : [];

  const difficultyColor = (d) => {
    if (d === 'beginner') return 'bg-green-100 text-green-700';
    if (d === 'advanced') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  const urgencyColor = (overdue) => overdue > 0
    ? 'bg-red-50 border-red-200'
    : 'bg-amber-50 border-amber-200';

  if (!orgId) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ─── HEADER ─── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/corporate/dashboard?orgId=${orgId}`} className="text-gray-400 hover:text-gray-600 text-sm">
                ← Dashboard
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <BookOpen size={16} className="text-teal-600" />
              </div>
              <h1 className="text-xl font-extrabold text-gray-900">Learning Hub</h1>
            </div>
            
            <div className="flex bg-gray-100/80 p-1 rounded-xl w-fit">
              {[
                { id: 'my-learning', label: 'My Roadmap' },
                { id: 'skills-profile', label: 'My Skills' },
                { id: 'catalog', label: 'Course Catalog' },
                { id: 'compliance', label: 'Compliance' }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex flex-col md:flex-row gap-8">
        
        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 min-w-0">
          {loading && <div className="mb-4 flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="animate-spin" size={16}/> Loading...</div>}

          {/* ─── MY LEARNING ROADMAP ─── */}
          {activeTab === 'my-learning' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              
              {/* AI Adaptive Pathway Banner */}
              <div className="bg-indigo-900 rounded-2xl p-8 relative overflow-hidden text-white shadow-lg">
                <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]" />
                <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-teal-400" />
                    <span className="text-teal-300 font-bold text-sm tracking-wide uppercase">AI Adaptive Pathway</span>
                  </div>
                  <h2 className="text-3xl font-extrabold mb-3">Welcome back, {user?.full_name || user?.username || 'Learner'}</h2>
                  {topGap ? (
                    <p className="text-indigo-200">
                      Based on your Skill Gap Analysis, focusing on{' '}
                      <strong className="text-white">{topGap.skill_name}</strong> will yield the highest ROI 
                      for your role. Your current score is {parseFloat(topGap.composite_score || 0).toFixed(1)}/5 vs.{' '}
                      {topGap.required_proficiency} required. Your queue has been prioritized accordingly.
                    </p>
                  ) : (
                    <p className="text-indigo-200">
                      Great work! No critical skill gaps detected. Browse the catalog to discover upskilling opportunities.
                    </p>
                  )}
                </div>
              </div>

              {/* Spaced Repetition: Daily Reinforcement Nuggets */}
              {reinforcements.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <Zap className="text-amber-600" size={20} />
                       <h3 className="font-bold text-gray-900">Daily Reinforcement Nuggets</h3>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded uppercase tracking-wider">Reinforce Stage</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reinforcements.map((nugget) => (
                      <div key={nugget.id} className="relative bg-white border border-amber-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-amber-50 rounded-bl-full flex items-center justify-center translate-x-1 -translate-y-1">
                          <CheckCircle className="text-amber-200" size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{nugget.program_title}</p>
                          <h4 className="font-bold text-gray-800 text-sm mt-1">Review: Key Concepts</h4>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-3 italic leading-relaxed">"Practicing retrieval today will lock in 90% long-term retention of what you learned in this course."</p>
                        </div>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await LD_API.completeReinforcement(orgId, nugget.id);
                              toast.success('Concepts reviewed! Retention score increased.');
                              loadData();
                            } catch (e) { toast.error('Failed to complete update'); }
                          }}
                          className="mt-4 w-full py-2 bg-amber-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all opacity-0 group-hover:opacity-100"
                        >
                          Mark as Reviewed
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Enrollments */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PlayCircle className="text-indigo-600" /> Up Next
                </h3>

                {feed.enrolled.length === 0 ? (
                  <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-10 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Target size={24} className="text-gray-400"/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Your learning queue is empty</h3>
                    <p className="text-sm text-gray-500 mb-4">Enroll in a course from the catalog to start learning.</p>
                    <button onClick={() => setActiveTab('catalog')} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700">Browse Catalog</button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-5">
                    {feed.enrolled.map((ep) => (
                      <div key={ep.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all flex flex-col group cursor-pointer"
                        onClick={() => ep.enrollment_id && router.push(`/corporate/learn/${ep.enrollment_id || ep.id}`)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${ep.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            {ep.status?.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 capitalize">
                            <Star size={11}/> {ep.difficulty || 'intermediate'}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                          {ep.title}
                        </h4>
                        {ep.skill_name && (
                          <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold mb-3 self-start">{ep.skill_name}</span>
                        )}
                        <div className="mt-auto pt-4 flex items-center gap-4">
                           <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full transition-all" style={{width: `${ep.progress_pct || 0}%`}}/>
                           </div>
                           <span className="text-xs font-bold text-gray-600 shrink-0">{ep.progress_pct || 0}%</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 font-bold">
                          Continue <ChevronRight size={14}/>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed */}
              {feed.completed.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="text-amber-500" /> Completed
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {feed.completed.map((c) => (
                      <div key={c.id} className="bg-white rounded-xl border border-green-100 p-4 flex items-center gap-3">
                        <CheckCircle className="text-green-500 shrink-0" size={20}/>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{c.title}</p>
                          <p className="text-xs text-gray-400 capitalize">{c.difficulty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended */}
              {feed.recommended.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="text-indigo-500" /> Recommended For You
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {feed.recommended.map((r) => (
                      <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
                        <div>
                          <p className="font-bold text-gray-800">{r.title}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                        </div>
                        <button onClick={() => handleEnroll(r.id)}
                          className="mt-auto px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-xs rounded-lg transition-colors">
                          Enroll Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── CATALOG ─── */}
          {activeTab === 'catalog' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 mb-6">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">Course Catalog</h2>
                   <p className="text-gray-500 text-sm">{catalog.length} SME-approved programs available</p>
                </div>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search skills, topics..." 
                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              {filteredCatalog.length === 0 ? (
                <div className="bg-white border rounded-2xl p-10 text-center">
                  <Target className="mx-auto text-gray-300 mb-3" size={32}/>
                  <h3 className="font-bold text-gray-600 text-lg">No Published Programs</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {search ? `No results for "${search}"` : "Your organization hasn't published any courses yet."}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCatalog.map((prog) => (
                    <div key={prog.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all">
                      <div className="h-28 bg-gradient-to-br from-indigo-50 to-teal-50 flex items-center justify-center border-b border-gray-100">
                         <BookOpen size={36} className="text-indigo-300" />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                         <div className="flex gap-2 mb-2 flex-wrap">
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${difficultyColor(prog.difficulty)}`}>
                              {prog.difficulty || 'intermediate'}
                            </span>
                            {prog.is_mandatory === 1 && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] uppercase font-bold rounded flex items-center gap-1">
                                <Shield size={9}/> Mandatory
                              </span>
                            )}
                         </div>
                         <h4 className="font-bold text-gray-900 mb-1 leading-tight">{prog.title}</h4>
                         <p className="text-xs text-gray-500 line-clamp-2 mb-1 flex-1">{prog.description}</p>
                         {prog.target_skill_name && (
                           <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded w-fit mb-4">{prog.target_skill_name}</span>
                         )}
                         <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                           <span className="flex items-center gap-1"><BookOpen size={11}/> {prog.module_count || 0} modules</span>
                           <span className="flex items-center gap-1"><BarChart size={11}/> {prog.enrollment_count || 0} enrolled</span>
                         </div>
                         <button onClick={() => handleEnroll(prog.id)}
                           className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors font-bold text-sm rounded-lg">
                           Enroll Now
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── COMPLIANCE ─── */}
          {activeTab === 'compliance' && (
             <div className="space-y-6 animate-in fade-in">
               <div className="mb-6">
                 <h2 className="text-2xl font-bold text-gray-900">Compliance & Certifications</h2>
                 <p className="text-gray-500 text-sm">Mandatory training aligned to your organization's requirements</p>
               </div>

               {compliance.length === 0 ? (
                 <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
                   <Shield className="mx-auto text-gray-300 mb-3" size={32}/>
                   <h3 className="font-bold text-gray-600">No Mandatory Training</h3>
                   <p className="text-sm text-gray-500 mt-1">Your organization hasn't flagged any courses as mandatory yet.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {compliance.map((c) => (
                     <div key={c.id} className={`border rounded-xl p-5 flex gap-4 ${urgencyColor(c.overdue)}`}>
                       <AlertCircle className={`shrink-0 mt-0.5 ${c.overdue > 0 ? 'text-red-500' : 'text-amber-500'}`} size={22}/>
                       <div className="flex-1">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                           <h4 className={`font-bold ${c.overdue > 0 ? 'text-red-900' : 'text-amber-900'}`}>{c.title}</h4>
                           {c.overdue > 0 ? (
                             <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full w-fit">
                               Overdue by {c.overdue} {c.overdue === 1 ? 'person' : 'people'}
                             </span>
                           ) : (
                             <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full w-fit">Pending</span>
                           )}
                         </div>
                         <div className="text-xs text-gray-600 flex gap-6 mb-3">
                           <span>Enrolled: <strong>{c.total_enrolled}</strong></span>
                           <span>Completed: <strong className="text-green-700">{c.completed}</strong></span>
                           <span>Overdue: <strong className={c.overdue > 0 ? 'text-red-700' : 'text-gray-600'}>{c.overdue}</strong></span>
                         </div>
                         {/* Completion progress bar */}
                         <div className="flex items-center gap-3">
                           <div className="flex-1 bg-white/60 h-2 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${c.overdue > 0 ? 'bg-red-500' : 'bg-amber-400'}`}
                               style={{width: `${c.total_enrolled > 0 ? Math.round((c.completed/c.total_enrolled)*100) : 0}%`}}/>
                           </div>
                           <span className="text-xs font-bold">
                             {c.total_enrolled > 0 ? Math.round((c.completed/c.total_enrolled)*100) : 0}%
                           </span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}
        </div>

        {/* ─── SIDEBAR STATS ─── */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-600"/> My Impact</h3>
            
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Learning Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.total_learning_hours ?? 0}
                <span className="text-sm text-gray-400 font-medium ml-1">hrs</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase">Enrolled</p>
                <p className="text-xl font-bold text-indigo-700 mt-1">{stats?.enrolled ?? 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase">Completed</p>
                <p className="text-xl font-bold text-green-600 mt-1">{stats?.completed ?? 0}</p>
              </div>
            </div>

            {stats?.avg_score > 0 && (
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-600 uppercase">Avg. Assessment Score</p>
                <p className="text-2xl font-bold text-indigo-700 mt-1">{stats.avg_score}%</p>
              </div>
            )}

            {gaps.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Skill Gap Priority</p>
                <div className="space-y-2">
                  {gaps.slice(0, 4).map((g, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700 truncate max-w-[120px]">{g.skill_name}</span>
                        <span className={`font-bold ${g.gap > 1.5 ? 'text-red-600' : g.gap > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                          {g.gap > 0 ? `−${parseFloat(g.gap).toFixed(1)} gap` : '✓ Met'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${g.gap > 1.5 ? 'bg-red-400' : g.gap > 0 ? 'bg-amber-400' : 'bg-green-500'}`}
                          style={{width: `${Math.min(100, ((g.composite_score || 0) / (g.required_proficiency || 5)) * 100)}%`}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="w-full py-2 border-2 border-indigo-100 text-indigo-700 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors">
              View Full Analytics
            </button>
          </div>
        </div>

      </div>
      {/* ─── SELF-ASSESSMENT MODAL ─── */}
      {isAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Self-Assessment</h3>
                <p className="text-sm text-gray-500">Rate your proficiency from 1 (Novice) to 5 (Expert)</p>
              </div>
              <button onClick={() => setIsAssessmentModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {gaps.map((g) => (
                <div key={g.skill_id} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-bold text-gray-900">{g.skill_name}</h4>
                      <p className="text-xs text-gray-500">{g.category}</p>
                    </div>
                    <span className="text-lg font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                      {assessmentRatings[g.skill_id] || 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Novice</span>
                    <input 
                      type="range" min="1" max="5" step="1"
                      value={assessmentRatings[g.skill_id] || 1}
                      onChange={(e) => setAssessmentRatings({...assessmentRatings, [g.skill_id]: parseInt(e.target.value)})}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Expert</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsAssessmentModalOpen(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitAssessment}
                disabled={isSubmittingAssessment}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2"
              >
                {isSubmittingAssessment ? <Loader2 className="animate-spin" size={18} /> : 'Submit Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LmsLearningHubPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>}>
      <LmsLearningHubPage />
    </Suspense>
  );
}
