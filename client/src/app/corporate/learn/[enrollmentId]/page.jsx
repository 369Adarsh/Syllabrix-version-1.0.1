'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LD_API from '@/lib/api/ld.api';
import toast from 'react-hot-toast';
import {
  BookOpen, CheckCircle, ArrowLeft, Loader2, Sparkles, Send, Lock,
  PlayCircle, X, Bot, User, Target, Menu, ChevronDown, AlertCircle
} from 'lucide-react';

function LmsCoursePlayerContent({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enrollmentId } = params;
  const orgId = searchParams.get('orgId');
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // AI Coach State
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', content: "Hi! I'm your Syllabrix AI Coach. Ask me anything about this module and I'll help clarify it for you." }
  ]);
  const [currentMsg, setCurrentMsg] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  // Recommendations & Assessments
  const [recommendation, setRecommendation] = useState(null);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  useEffect(() => { loadCourseDetails(); }, [enrollmentId]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isCoachOpen]);

  const loadCourseDetails = async () => {
    if (!orgId) return router.push('/corporate/learn');
    setLoading(true);
    try {
      const res = await LD_API.getEnrollmentDetails(orgId, enrollmentId);
      const output = res.data?.data;
      if (output) {
        setData(output);
        let targetIdx = 0;
        for (let i = 0; i < output.modules.length; i++) {
          if (output.modules[i].status === 'in_progress' || output.modules[i].status === 'available') {
            targetIdx = i; break;
          }
        }
        setActiveModuleIdx(targetIdx);
        if (output.modules[targetIdx]?.status === 'available') {
          await LD_API.startModule(orgId, enrollmentId, output.modules[targetIdx].id);
          output.modules[targetIdx].status = 'in_progress';
          setData({ ...output });
        }
      }
    } catch (e) {
      toast.error('Failed to load course');
      router.push(`/corporate/learn?orgId=${orgId}`);
    }
    setLoading(false);
  };

  const handleModuleClick = async (idx) => {
    const mod = data.modules[idx];
    if (mod.status === 'locked') return toast.error('Complete previous modules first.');
    setActiveModuleIdx(idx);
    setIsSidebarOpen(false); // close on mobile after select
    setChatHistory([{ role: 'model', content: `You switched to "${mod.title}". What questions do you have?` }]);
    if (mod.status === 'available') {
      try {
        await LD_API.startModule(orgId, enrollmentId, mod.id);
        const newData = { ...data };
        newData.modules[idx].status = 'in_progress';
        setData(newData);
      } catch { /* silent */ }
    }
  };

  const handleCompleteModule = async () => {
    const mod = data.modules[activeModuleIdx];
    try {
      const res = await LD_API.completeModule(orgId, enrollmentId, mod.id, { time_spent_sec: 120 });
      setRecommendation(res.data?.data?.recommendation);
      toast.success('Module completed!');
      loadCourseDetails();
    } catch { toast.error('Failed to mark complete'); }
  };

  const handleStartAssessment = async (assessment) => {
    setActiveAssessment(assessment);
    setAssessmentAnswers({});
    setAssessmentResult(null);
  };

  const handleSubmitAssessment = async () => {
    setIsSubmittingTest(true);
    try {
      const res = await LD_API.submitAssessment(orgId, activeAssessment.id, assessmentAnswers);
      setAssessmentResult(res.data?.data);
      toast.success('Assessment submitted!');
      loadCourseDetails();
    } catch { toast.error('Failed to submit assessment'); }
    setIsSubmittingTest(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMsg.trim() || isChatting) return;
    const userMsg = currentMsg.trim();
    setCurrentMsg('');
    const newHistory = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(newHistory);
    setIsChatting(true);
    try {
      const activeModId = data.modules[activeModuleIdx].id;
      const apiHistory = newHistory.slice(1, -1).map(h => ({ role: h.role === 'model' ? 'model' : 'user', content: h.content }));
      const res = await LD_API.chatWithCoach(orgId, enrollmentId, activeModId, userMsg, apiHistory);
      setChatHistory(prev => [...prev, { role: 'model', content: res.data?.data || 'Sorry, I encountered an error.' }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'model', content: "Couldn't connect to coaching server. Try again." }]);
    }
    setIsChatting(false);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10 mb-4" />
        <p className="text-gray-500 font-medium text-center">Loading Learning Environment...</p>
      </div>
    );
  }

  const { enrollment, modules } = data;
  const activeModule = modules[activeModuleIdx];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden relative">
      <div className="bg-indigo-950 text-white shadow-md z-30 shrink-0">
        <div className="px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href={`/corporate/learn?orgId=${enrollment.org_id}`}
              className="text-indigo-300 hover:text-white flex items-center gap-1 text-sm font-semibold shrink-0 transition-colors">
              <ArrowLeft size={16} /> <span className="hidden xs:inline">Exit</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors shrink-0">
              <Menu size={18} />
            </button>
            <div className="hidden lg:block w-px h-6 bg-indigo-800 shrink-0" />
            <h1 className="font-bold truncate text-sm sm:text-base flex items-center gap-2 min-w-0">
              <Target size={16} className="text-teal-400 shrink-0" />
              <span className="truncate">{enrollment.title}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 md:w-40 h-2 bg-indigo-900 rounded-full overflow-hidden">
                <div className="bg-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${enrollment.progress_pct || 0}%` }} />
              </div>
              <span className="text-xs font-bold text-teal-400 shrink-0">{enrollment.progress_pct || 0}%</span>
            </div>
            <button onClick={() => setIsCoachOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-amber-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5">
              <Sparkles size={14} /> <span className="hidden xs:inline">AI Coach</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          </div>
        )}

        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-20
          w-72 sm:w-80 flex flex-col
          bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          top-14 sm:top-16 lg:top-0
        `}>
          <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Course Modules</h3>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
              <X size={16} />
            </button>
          </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {data.assessments?.map(a => (
                <button key={a.id} onClick={() => handleStartAssessment(a)}
                  className="w-full text-left p-3 rounded-xl flex gap-3 transition-colors border border-amber-100 bg-amber-50/50 hover:bg-amber-100 mb-2">
                  <div className="shrink-0 mt-0.5"><Target size={18} className="text-amber-600" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 leading-tight">{a.title}</h4>
                    <p className="text-[10px] text-amber-700 font-bold uppercase">{a.assessment_type.replace('_', ' ')}</p>
                  </div>
                </button>
              ))}
              <div className="h-4" />
              {modules.map((mod, idx) => (
              <button key={mod.id} onClick={() => handleModuleClick(idx)}
                className={`w-full text-left p-3 rounded-xl flex gap-3 transition-colors border ${
                  activeModuleIdx === idx ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50 border-transparent'
                } ${mod.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="shrink-0 mt-0.5">
                  {mod.status === 'completed' ? <CheckCircle size={18} className="text-green-500" />
                    : mod.status === 'in_progress' ? <PlayCircle size={18} className="text-indigo-500" />
                    : mod.status === 'locked' ? <Lock size={18} className="text-gray-300" />
                    : <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5 ml-0.5" />}
                </div>
                <div className="min-w-0">
                  <h4 className={`text-sm font-bold leading-tight ${activeModuleIdx === idx ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {idx + 1}. {mod.title}
                  </h4>
                  {mod.description && (
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{mod.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-10">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 shadow-sm border border-gray-200">
            {activeModule ? (
              <>
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg uppercase">
                      Module {activeModuleIdx + 1}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">{activeModule.title}</h2>
                  {activeModule.description && (
                    <p className="text-gray-500 font-medium text-base sm:text-lg border-b border-gray-100 pb-6">{activeModule.description}</p>
                  )}
                </div>
                <div className="prose prose-indigo max-w-none text-gray-700 text-sm sm:text-base leading-relaxed">
                  {activeModule.content ? (
                    <div className="whitespace-pre-wrap">{activeModule.content}</div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                      <BookOpen size={32} className="mb-2 opacity-50" />
                      <p className="text-sm">No content generated for this module yet.</p>
                    </div>
                  )}
                </div>
                <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-100 flex justify-end">
                  <button onClick={handleCompleteModule}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <CheckCircle size={20} /> Mark Module Complete
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p>Select a module from the menu to begin</p>
              </div>
            )}
          </div>
        </div>

        {isCoachOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm sm:hidden" onClick={() => setIsCoachOpen(false)} />
            <div className="relative z-10 w-full sm:w-80 lg:w-96 h-[85vh] sm:h-full bg-white flex flex-col rounded-t-3xl sm:rounded-none shadow-2xl">
              <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center shrink-0 rounded-t-3xl sm:rounded-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">AI Coach</h3>
                    <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Active Module Context
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsCoachOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-amber-100 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center border text-xs ${
                      msg.role === 'user' ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-amber-500 shadow-sm'}`}>
                      {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center border bg-white border-gray-200 text-amber-500 shadow-sm"><Bot size={12} /></div>
                    <div className="px-3 py-2.5 rounded-2xl bg-white border border-gray-100 rounded-tl-none shadow-sm flex items-center gap-1.5">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 sm:p-4 bg-white border-t border-gray-200 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input type="text" value={currentMsg} onChange={e => setCurrentMsg(e.target.value)}
                    placeholder="Ask about this module..."
                    className="flex-1 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-amber-400/30 border border-transparent focus:border-amber-400 transition-all rounded-full py-3 px-4 text-sm outline-none text-gray-900" />
                  <button type="submit" disabled={!currentMsg.trim() || isChatting}
                    className="p-3 bg-amber-500 text-white rounded-full hover:bg-amber-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm shrink-0">
                    <Send size={16} />
                  </button>
                </form>
                <p className="text-[10px] text-center text-gray-400 mt-2">AI can make mistakes.</p>
              </div>
            </div>
          </div>
        )}

        {recommendation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Sparkles className="text-teal-600" size={32} />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">AI Next Step</h3>
               <p className="text-gray-600 mb-6 leading-relaxed">{recommendation.message}</p>
               <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6">
                 <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-1">Recommendation</p>
                 <p className="text-sm font-bold text-teal-900">{recommendation.next_step}</p>
               </div>
               <button onClick={() => setRecommendation(null)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
                 Continue Learning
               </button>
            </div>
          </div>
        )}

        {activeAssessment && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{activeAssessment.title}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase">{activeAssessment.assessment_type.replace('_', ' ')}</p>
                </div>
                <button onClick={() => setActiveAssessment(null)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                {assessmentResult ? (
                  <div className="text-center py-10">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${assessmentResult.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {assessmentResult.passed ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">{assessmentResult.score}%</h3>
                    <p className="text-lg font-bold text-gray-600 mb-8">{assessmentResult.passed ? 'Congratulations!' : 'Keep practicing.'}</p>
                    <div className="space-y-4 text-left max-w-md mx-auto">
                      {assessmentResult.results?.map((r, i) => (
                        <div key={i} className={`p-4 rounded-2xl border ${r.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                          <p className="text-sm font-bold text-gray-800 mb-1">{r.question}</p>
                          <p className={`text-xs ${r.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {r.isCorrect ? 'Correct!' : `Actually: ${r.correct}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {[1, 2, 3].map(qIdx => (
                      <div key={qIdx} className="space-y-4">
                        <h4 className="font-bold text-gray-900 text-lg">{qIdx}. Question?</h4>
                        <div className="grid gap-3">
                          {[0, 1, 2, 3].map(opt => (
                            <button key={opt} 
                              onClick={() => setAssessmentAnswers({...assessmentAnswers, [qIdx-1]: opt})}
                              className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-semibold ${
                                assessmentAnswers[qIdx-1] === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'
                              }`}>
                              Option {String.fromCharCode(65 + opt)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!assessmentResult && (
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                   <button onClick={() => setActiveAssessment(null)} className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all">Cancel</button>
                   <button onClick={handleSubmitAssessment} disabled={isSubmittingTest}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                     {isSubmittingTest ? <Loader2 className="animate-spin" size={20}/> : 'Submit Test'}
                   </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LmsCoursePlayerPage(props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10 mb-4" />
        <p className="text-gray-500 font-medium text-center">Loading Course Player...</p>
      </div>
    }>
      <LmsCoursePlayerContent {...props} />
    </Suspense>
  );
}
