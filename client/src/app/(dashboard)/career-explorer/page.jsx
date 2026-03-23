'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  ChevronRight, Sparkles, BookOpen, GraduationCap, Briefcase, TrendingUp,
  ArrowRight, ArrowLeft, RotateCcw, MessageCircle, Map, Target, Users,
  Brain, BarChart3, Lightbulb, CheckCircle, Star, Download, Loader2,
  Heart, Crown, Flame, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const STREAMS = [
  { id: 'PCM', label: 'PCM', sub: 'Physics, Chemistry, Maths', emoji: '🔬', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50 border-blue-200' },
  { id: 'PCB', label: 'PCB', sub: 'Physics, Chemistry, Biology', emoji: '🧬', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 border-emerald-200' },
  { id: 'Commerce', label: 'Commerce', sub: 'Accounts, Business, Economics', emoji: '📊', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 border-amber-200' },
  { id: 'Arts/Humanities', label: 'Arts / Humanities', sub: 'History, Political Science, Languages', emoji: '🎨', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 border-purple-200' },
];

// ═══ INTEREST MAP BAR CHART ═══
function InterestMap({ data }) {
  if (!data) return null;
  const entries = Object.entries(data).map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: v }));
  const max = Math.max(...entries.map(e => e.value), 1);
  return (
    <div className="grid grid-cols-2 gap-2">
      {entries.map(e => (
        <div key={e.label} className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 capitalize w-20 truncate">{e.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${(e.value / max) * 100}%` }} />
          </div>
          <span className="text-[10px] font-bold text-gray-600 w-8 text-right">{e.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ═══ STEP INDICATOR ═══
function StepDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-5">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < current ? 'bg-emerald-500' : i === current ? 'bg-indigo-600 scale-125' : 'bg-gray-200'}`} />
      ))}
    </div>
  );
}

export default function CareerExplorerPage() {
  const { user } = useAuth();
  const [mainTab, setMainTab] = useState('explore'); // explore | aptitude | alignment | roadmap

  // ── EXPLORE STREAMS STATE ──
  const [step, setStep] = useState('choose');
  const [selectedStream, setSelectedStream] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [compareWith, setCompareWith] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── APTITUDE STATE ──
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [assessment, setAssessment] = useState(null);

  // ── ALIGNMENT STATE ──
  const [parentForm, setParentForm] = useState({ preferred_stream: '', career_expectation: '', concerns: '' });
  const [alignmentReport, setAlignmentReport] = useState(null);

  // ── ROADMAP STATE ──
  const [roadmapCareer, setRoadmapCareer] = useState('');
  const [roadmap, setRoadmap] = useState(null);

  // ═══ EXPLORE METHODS ═══
  const exploreStream = async (stream) => {
    setSelectedStream(stream); setStep('exploring'); setLoading(true);
    try {
      const cls = user?.class_name?.toString().replace(/\D/g, '') || '10';
      const res = await aiAPI.getStreamGuidance(stream.id, '', cls);
      setGuidance(res.data?.data); setStep('result');
    } catch { toast.error('Try again'); setStep('choose'); }
    finally { setLoading(false); }
  };

  const doCompare = async (stream2) => {
    setCompareWith(stream2); setLoading(true);
    try {
      const res = await aiAPI.compareStreams(selectedStream.id, stream2.id, '');
      setComparison(res.data?.data); setStep('compare');
    } catch { toast.error('Failed to compare'); }
    finally { setLoading(false); }
  };

  const resetExplore = () => { setStep('choose'); setSelectedStream(null); setGuidance(null); setComparison(null); };

  // ═══ APTITUDE METHODS ═══
  const startAptitude = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getAptitudeQuestions();
      setQuestions(res.data?.data || []); setAnswers({}); setCurrentQ(0);
    } catch { toast.error('Could not load questions'); }
    finally { setLoading(false); }
  };

  const submitAptitude = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.submitAptitudeAssessment(answers, {
        class_level: user?.class_name?.toString().replace(/\D/g, ''), board: user?.board,
      });
      setAssessment(res.data?.data || res.data);
    } catch { toast.error('Assessment failed'); }
    finally { setLoading(false); }
  };

  // ═══ ALIGNMENT METHODS ═══
  const submitAlignment = async () => {
    if (!assessment) { toast.error('Complete aptitude test first'); setMainTab('aptitude'); return; }
    setLoading(true);
    try {
      const studentData = {
        interests: assessment.interest_map,
        preferred_stream: assessment.recommended_streams?.[0]?.stream,
        dream_career: assessment.recommended_streams?.[0]?.top_careers?.[0],
      };
      const res = await aiAPI.generateAlignmentReport(studentData, parentForm);
      setAlignmentReport(res.data?.data || res.data);
    } catch { toast.error('Could not generate report'); }
    finally { setLoading(false); }
  };

  // ═══ ROADMAP METHODS ═══
  const genRoadmap = async (career) => {
    const c = career || roadmapCareer;
    if (!c.trim()) { toast.error('Enter a career'); return; }
    setRoadmapCareer(c); setLoading(true); setRoadmap(null);
    try {
      const res = await aiAPI.generateCareerRoadmap(c, {
        class_level: user?.class_name?.toString().replace(/\D/g, ''),
        stream: assessment?.recommended_streams?.[0]?.stream,
      });
      setRoadmap(res.data?.data || res.data);
    } catch { toast.error('Could not generate roadmap'); }
    finally { setLoading(false); }
  };

  const handleExportPDF = (title, content) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${title} — Syllabrix</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',system-ui;padding:40px;color:#1e293b;max-width:800px;margin:0 auto}h1{font-size:20px;color:#4F46E5;margin-bottom:12px}pre{white-space:pre-wrap;font-size:13px;line-height:1.7}.footer{margin-top:30px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:11px;color:#94a3b8;text-align:center}</style></head><body>
    <h1>${title}</h1><pre>${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}</pre>
    <div class="footer">Syllabrix — India's Education Ecosystem</div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/15 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-52 h-52 bg-purple-500/10 rounded-full translate-y-1/2" />
        <div className="absolute top-4 right-8 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
            <Map size={24} className="text-indigo-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Career Explorer</h1>
            <p className="text-indigo-300/70 text-sm mt-0.5">Explore streams, take the aptitude test, align with parents &amp; build your career roadmap</p>
          </div>
        </div>
      </div>

      {/* ═══ TAB BAR ═══ */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {[
          { k: 'explore', l: 'Explore Streams', icon: Sparkles },
          { k: 'aptitude', l: 'Aptitude Test', icon: Brain },
          { k: 'alignment', l: 'Parent Alignment', icon: Users },
          { k: 'roadmap', l: 'Career Roadmap', icon: Target },
        ].map(t => (
          <button key={t.k} onClick={() => setMainTab(t.k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              mainTab === t.k ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}>
            <t.icon size={13} /> <span className="hidden sm:inline">{t.l}</span>
          </button>
        ))}
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles size={28} className="text-white" />
          </div>
          <p className="font-bold text-gray-700">AI is working...</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════
           TAB 1: EXPLORE STREAMS
         ═══════════════════════════════════════════ */}
      {mainTab === 'explore' && !loading && (
        <>
          {step === 'choose' && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 text-center">Tap a stream to explore its career paths</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {STREAMS.map(s => (
                  <button key={s.id} onClick={() => exploreStream(s)}
                    className={`${s.bg} border-2 rounded-2xl p-6 text-left hover:shadow-lg transition-all group active:scale-[0.98]`}>
                    <span className="text-4xl block mb-3">{s.emoji}</span>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition">{s.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">{s.sub}</p>
                    <div className="flex items-center gap-1 mt-3 text-blue-600 text-sm font-medium">Explore paths <ArrowRight size={16} /></div>
                  </button>
                ))}
              </div>
              {assessment && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200/50 rounded-xl p-3.5 flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <p className="text-sm text-emerald-700 flex-1">Your aptitude suggests: <strong>{assessment.recommended_streams?.[0]?.stream}</strong> ({assessment.recommended_streams?.[0]?.match_score}% match)</p>
                </div>
              )}
            </div>
          )}

          {step === 'result' && guidance && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedStream?.emoji}</span>
                  <div><h2 className="font-bold text-lg text-gray-800">{guidance.stream || selectedStream?.label}</h2><p className="text-xs text-gray-400">{guidance.best_for}</p></div>
                </div>
                <button onClick={resetExplore} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><RotateCcw size={16} className="text-gray-400" /></button>
              </div>

              <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100/50">
                <p className="text-sm text-gray-700 leading-relaxed">{guidance.overview}</p>
              </div>

              {/* Career paths */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center gap-1.5"><Briefcase size={11} /> Career Paths (tap for roadmap)</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(guidance.career_paths || []).map((c, i) => (
                    <button key={i} onClick={() => { setMainTab('roadmap'); genRoadmap(c.career); }}
                      className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:shadow-md hover:border-indigo-200 transition-all group">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600">{c.career}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.demand === 'high' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{c.demand}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">{c.description}</p>
                      <p className="text-sm font-bold text-indigo-600 mt-2">{c.avg_salary}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exams */}
              {guidance.top_exams?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2 flex items-center gap-1.5"><GraduationCap size={11} /> Key Exams</p>
                  <div className="space-y-1.5">{guidance.top_exams.map((e, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                      <div><span className="font-bold text-sm text-gray-800">{e.exam}</span><span className="text-xs text-gray-400 ml-2">{e.purpose}</span></div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.difficulty === 'hard' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>{e.difficulty}</span>
                    </div>
                  ))}</div>
                </div>
              )}

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
                  <p className="font-bold text-emerald-700 text-[10px] uppercase tracking-wider mb-2">Advantages</p>
                  {(guidance.pros || []).map((p, i) => <p key={i} className="text-[12px] text-emerald-800 flex items-start gap-1.5 mb-1"><CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />{p}</p>)}
                </div>
                <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
                  <p className="font-bold text-amber-700 text-[10px] uppercase tracking-wider mb-2">Challenges</p>
                  {(guidance.cons || []).map((c, i) => <p key={i} className="text-[12px] text-amber-800 flex items-start gap-1.5 mb-1"><Flame size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />{c}</p>)}
                </div>
              </div>

              {/* Compare */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <p className="font-bold text-gray-700 text-sm mb-3">Compare with another stream</p>
                <div className="flex justify-center gap-2">
                  {STREAMS.filter(s => s.id !== selectedStream?.id).map(s => (
                    <button key={s.id} onClick={() => doCompare(s)}
                      className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all">
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'compare' && comparison && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-800">{comparison.stream1?.name} vs {comparison.stream2?.name}</h2>
                <button onClick={resetExplore} className="p-2 hover:bg-gray-100 rounded-xl"><RotateCcw size={16} className="text-gray-400" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
                  <span className="text-3xl">{selectedStream?.emoji}</span>
                  <p className="font-extrabold text-2xl text-gray-900 mt-2">{comparison.stream1?.score}/100</p>
                  <p className="text-sm text-gray-500">{comparison.stream1?.name}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-center">
                  <span className="text-3xl">{compareWith?.emoji}</span>
                  <p className="font-extrabold text-2xl text-gray-900 mt-2">{comparison.stream2?.score}/100</p>
                  <p className="text-sm text-gray-500">{comparison.stream2?.name}</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                {(comparison.comparison || []).map((f, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">{f.factor}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden"><div className="bg-blue-500 h-full rounded-full" style={{ width: (f.stream1_rating / 5 * 100) + '%' }} /></div>
                      <span className="text-[10px] text-gray-400 w-6 text-center">vs</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden"><div className="bg-purple-500 h-full rounded-full" style={{ width: (f.stream2_rating / 5 * 100) + '%' }} /></div>
                    </div>
                  </div>
                ))}
              </div>
              {comparison.recommendation && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-1.5">AI Recommendation</p>
                  <p className="text-sm text-gray-700">{comparison.recommendation}</p>
                </div>
              )}
              <button onClick={resetExplore} className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all">Explore More Streams</button>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════
           TAB 2: APTITUDE TEST
         ═══════════════════════════════════════════ */}
      {mainTab === 'aptitude' && !loading && (
        <>
          {questions.length === 0 && !assessment ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4"><Brain size={28} className="text-indigo-500" /></div>
              <h2 className="font-bold text-lg text-gray-700 mb-2">Discover Your Strengths</h2>
              <p className="text-sm text-gray-400 max-w-sm mx-auto mb-5">Answer 8 quick questions. AI will analyze your personality type, interests, and recommend the best stream for you.</p>
              <button onClick={startAptitude}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 transition-all">
                <Brain size={16} /> Start Aptitude Test
              </button>
            </div>
          ) : assessment ? (
            <div className="space-y-4">
              {/* Personality card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md"><Star size={28} className="text-white" /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Your Type</p>
                    <h2 className="text-xl font-extrabold text-gray-800">{assessment.personality_type}</h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">{(assessment.top_strengths || []).map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">{s}</span>
                ))}</div>
                {assessment.learning_style && <p className="text-xs text-indigo-600 mt-3">Learning style: <strong>{assessment.learning_style}</strong></p>}
              </div>

              {assessment.interest_map && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3"><BarChart3 size={11} className="inline text-blue-500 mr-1" /> Interest Map</p>
                  <InterestMap data={assessment.interest_map} />
                </div>
              )}

              {assessment.recommended_streams?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">Recommended Streams</p>
                  <div className="space-y-3">{assessment.recommended_streams.map((s, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${i === 0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{s.stream}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.match_score >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{s.match_score}%</span>
                      </div>
                      <p className="text-[12px] text-gray-600 mb-2">{s.why}</p>
                      <div className="flex flex-wrap gap-1.5">{(s.top_careers || []).map((c, j) => (
                        <button key={j} onClick={() => { setMainTab('roadmap'); genRoadmap(c); }}
                          className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100 hover:bg-blue-100 transition-all">{c} →</button>
                      ))}</div>
                    </div>
                  ))}</div>
                </div>
              )}

              {assessment.advice && (
                <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-1.5"><Lightbulb size={12} className="inline mr-1" /> Advice</p>
                  <p className="text-sm text-gray-700">{assessment.advice}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setAssessment(null); setQuestions([]); setAnswers({}); }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all">Retake Test</button>
                <button onClick={() => handleExportPDF('Aptitude Assessment', assessment)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"><Download size={14} /> PDF</button>
              </div>
            </div>
          ) : (
            /* Questions */
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6">
              <StepDots total={questions.length} current={currentQ} />
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-2">Question {currentQ + 1} of {questions.length}</p>
              <h2 className="text-lg font-bold text-gray-800 mb-5">{questions[currentQ]?.question}</h2>
              <div className="space-y-2">{questions[currentQ]?.options?.map((opt, i) => (
                <button key={i} onClick={() => { setAnswers(prev => ({ ...prev, [questions[currentQ].id]: opt.value })); if (currentQ < questions.length - 1) setTimeout(() => setCurrentQ(p => p + 1), 250); }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium border transition-all ${
                    answers[questions[currentQ]?.id] === opt.value ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`}>{opt.label}</button>
              ))}</div>
              <div className="flex justify-between mt-5">
                <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-30"><ArrowLeft size={14} className="inline mr-1" /> Prev</button>
                {currentQ === questions.length - 1 ? (
                  <button onClick={submitAptitude} disabled={Object.keys(answers).length < questions.length}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md disabled:opacity-50">
                    <Sparkles size={14} /> Get Results
                  </button>
                ) : (
                  <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Next <ArrowRight size={14} className="inline ml-1" /></button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════
           TAB 3: PARENT ALIGNMENT
         ═══════════════════════════════════════════ */}
      {mainTab === 'alignment' && !loading && (
        <>
          {!alignmentReport ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2"><Users size={20} className="text-rose-500" /><h2 className="font-bold text-gray-800">Parent-Child Career Alignment</h2></div>
              {!assessment && (
                <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200/50 text-sm text-amber-700 flex items-center gap-2">
                  <Brain size={16} /> Complete the <button onClick={() => setMainTab('aptitude')} className="font-bold underline">Aptitude Test</button> first for a personalized report.
                </div>
              )}
              <p className="text-sm text-gray-400">Fill in what the parent expects. AI will create a balanced report showing alignment, gaps, and a recommended path.</p>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Parent&apos;s preferred stream</label>
                <select value={parentForm.preferred_stream} onChange={e => setParentForm({ ...parentForm, preferred_stream: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all">
                  <option value="">Select...</option>
                  {['PCM (Science with Maths)', 'PCB (Science with Biology)', 'Commerce', 'Arts / Humanities', 'Vocational', 'Not sure'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Career expectation</label>
                <input value={parentForm.career_expectation} onChange={e => setParentForm({ ...parentForm, career_expectation: e.target.value })}
                  placeholder="e.g. Doctor, Engineer, IAS Officer, CA..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Concerns (optional)</label>
                <textarea value={parentForm.concerns} onChange={e => setParentForm({ ...parentForm, concerns: e.target.value })}
                  placeholder="e.g. Job security, salary, child's interest..." rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all" />
              </div>
              <button onClick={submitAlignment} disabled={!parentForm.preferred_stream}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md disabled:opacity-50 transition-all">
                <Sparkles size={16} /> Generate Report
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`rounded-2xl p-5 text-center border ${alignmentReport.alignment_score >= 70 ? 'bg-emerald-50 border-emerald-200' : alignmentReport.alignment_score >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-4xl font-extrabold text-gray-900">{alignmentReport.alignment_score}<span className="text-xl text-gray-400">%</span></p>
                <p className="text-sm font-bold text-gray-600 mt-1">Alignment: {alignmentReport.alignment_level}</p>
              </div>
              {alignmentReport.recommended_path && (
                <div className="bg-indigo-50/60 rounded-2xl border border-indigo-200/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-2">Recommended Path</p>
                  <h3 className="font-bold text-gray-800 mb-2">{alignmentReport.recommended_path.stream}</h3>
                  <p className="text-sm text-gray-600 mb-3">{alignmentReport.recommended_path.reasoning}</p>
                  <div className="flex flex-wrap gap-1.5">{(alignmentReport.recommended_path.careers || []).map((c, i) => (
                    <button key={i} onClick={() => { setMainTab('roadmap'); genRoadmap(c); }}
                      className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold hover:bg-indigo-200 transition-all">{c} →</button>
                  ))}</div>
                </div>
              )}
              {alignmentReport.conversation_starters?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3"><Heart size={11} className="inline text-rose-500 mr-1" /> Conversation Starters</p>
                  <div className="space-y-2">{alignmentReport.conversation_starters.map((q, i) => (
                    <div key={i} className="bg-rose-50/50 rounded-xl p-3 text-[13px] text-gray-700 border border-rose-100/40">{q}</div>
                  ))}</div>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setAlignmentReport(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">Redo</button>
                <button onClick={() => handleExportPDF('Alignment Report', alignmentReport)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100"><Download size={14} /> PDF</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════
           TAB 4: CAREER ROADMAP
         ═══════════════════════════════════════════ */}
      {mainTab === 'roadmap' && !loading && (
        <>
          {!roadmap ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2"><Target size={20} className="text-amber-500" /><h2 className="font-bold text-gray-800">Career Roadmap Generator</h2></div>
              <p className="text-sm text-gray-400">Enter any career — AI builds a step-by-step roadmap with exams, colleges, salaries &amp; timeline.</p>
              <input value={roadmapCareer} onChange={e => setRoadmapCareer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && genRoadmap()}
                placeholder="e.g. Software Engineer, Doctor, IAS Officer, CA..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
              <div className="flex flex-wrap gap-1.5">
                {['Software Engineer', 'Doctor (MBBS)', 'IAS Officer', 'CA', 'Lawyer', 'Data Scientist', 'Architect', 'Pilot', 'Fashion Designer', 'Journalist'].map(c => (
                  <button key={c} onClick={() => genRoadmap(c)}
                    className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all">{c}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg text-gray-800">{roadmap.career}</h2>
                  <button onClick={() => setRoadmap(null)} className="text-xs font-semibold text-gray-500 hover:text-gray-700">← Change career</button>
                </div>
                <p className="text-sm text-gray-600 mb-5">{roadmap.overview}</p>
                {roadmap.timeline?.length > 0 && (
                  <div className="space-y-3">{roadmap.timeline.map((phase, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>{i + 1}</div>
                        {i < roadmap.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <h3 className="font-bold text-gray-800 text-sm">{phase.phase}</h3>
                        <p className="text-[12px] text-gray-500 mb-2">{phase.focus}</p>
                        {(phase.key_actions || []).map((a, j) => (
                          <p key={j} className="text-[12px] text-gray-600 flex items-start gap-1.5"><CheckCircle size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />{a}</p>
                        ))}
                      </div>
                    </div>
                  ))}</div>
                )}
              </div>
              {roadmap.salary_progression && (
                <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200/50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-3">Salary Progression (India)</p>
                  <div className="grid grid-cols-4 gap-2">{Object.entries(roadmap.salary_progression).map(([k, v]) => (
                    <div key={k} className="text-center"><p className="text-sm font-bold text-gray-800">{v}</p><p className="text-[10px] text-gray-400 capitalize">{k}</p></div>
                  ))}</div>
                </div>
              )}
              {roadmap.top_colleges?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Top Colleges</p>
                  <div className="space-y-1.5">{roadmap.top_colleges.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>{c}
                    </div>
                  ))}</div>
                </div>
              )}
              <button onClick={() => handleExportPDF(`Roadmap: ${roadmap.career}`, roadmap)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"><Download size={14} /> Export as PDF</button>
            </div>
          )}
        </>
      )}

      {/* Bottom link */}
      <div className="flex justify-center pb-4">
        <Link href="/ai-buddy" className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold flex items-center gap-1"><MessageCircle size={12} /> Still confused? Talk to AI Buddy</Link>
      </div>
    </div>
  );
}
