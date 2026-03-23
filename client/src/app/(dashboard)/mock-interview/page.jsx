'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  Mic, Send, Loader2, Sparkles, Star, BarChart3, Trophy, ArrowLeft,
  CheckCircle, MessageSquare, Download, ChevronRight, User, Clock, Target
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MockInterviewPage() {
  const { user } = useAuth();
  const [types, setTypes] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [phase, setPhase] = useState('select'); // select | setup | interview | report
  const [loading, setLoading] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [report, setReport] = useState(null);
  const [setupForm, setSetupForm] = useState({ name: '', background: '', career_goal: '' });

  useEffect(() => { aiAPI.getInterviewTypes().then(r => setTypes(r.data?.data)).catch(() => {}); }, []);

  const startInterview = async () => {
    setLoading(true); setHistory([]); setFeedback(null);
    try {
      const res = await aiAPI.startInterview(selectedType, { ...setupForm, class_level: user?.class_name?.toString().replace(/\D/g, '') });
      setInterviewData(res.data?.data || res.data);
      setCurrentQIdx(0); setPhase('interview');
    } catch { toast.error('Could not start interview'); }
    finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) { toast.error('Type your answer'); return; }
    const q = interviewData?.questions?.[currentQIdx];
    if (!q) return;
    setLoading(true); setFeedback(null);
    try {
      const res = await aiAPI.evaluateInterviewAnswer(selectedType, q.question, answer.trim(), history);
      const fb = res.data?.data || res.data;
      setFeedback(fb);
      setHistory(prev => [...prev, { question: q.question, answer: answer.trim(), score: fb.score }]);
      setAnswer('');
    } catch { toast.error('Could not evaluate'); }
    finally { setLoading(false); }
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (feedback?.follow_up_question) {
      const updated = { ...interviewData };
      updated.questions = [...(updated.questions || [])];
      updated.questions.splice(currentQIdx + 1, 0, feedback.follow_up_question);
      setInterviewData(updated);
    }
    if (currentQIdx < (interviewData?.questions?.length || 0) - 1) setCurrentQIdx(prev => prev + 1);
    else endInterview();
  };

  const endInterview = async () => {
    if (history.length === 0) { toast.error('Answer at least one question'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.getInterviewReport(selectedType, history);
      setReport(res.data?.data || res.data); setPhase('report');
    } catch { toast.error('Could not generate report'); }
    finally { setLoading(false); }
  };

  const TYPE_EMOJIS = { upsc: '🏛️', banking: '🏦', campus: '💼', ssb: '🎖️', scholarship: '🎓', school_admission: '🏫' };
  const currentQ = interviewData?.questions?.[currentQIdx];

  // ═══ SELECT TYPE ═══
  if (phase === 'select') return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/15 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-6 right-10 text-3xl">🎤</div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0"><Mic size={24} className="text-blue-300" /></div>
          <div><h1 className="text-xl font-extrabold text-white">AI Mock Interview</h1>
          <p className="text-blue-300/70 text-sm mt-0.5">Practice UPSC, Banking, Campus, SSB &amp; more — AI adapts to your answers</p></div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {types && Object.entries(types).map(([key, t]) => (
          <button key={key} onClick={() => { setSelectedType(key); setPhase('setup'); }}
            className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group">
            <span className="text-3xl block mb-2">{TYPE_EMOJIS[key] || '📋'}</span>
            <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600">{t.name}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{t.desc}</p>
            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><Clock size={10} /> ~{t.duration} min</p>
          </button>
        ))}
      </div>
    </div>
  );

  // ═══ SETUP ═══
  if (phase === 'setup') return (
    <div className="max-w-lg mx-auto space-y-5">
      <button onClick={() => setPhase('select')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={14} /> Back</button>
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{TYPE_EMOJIS[selectedType]}</span><h2 className="font-bold text-gray-800">{types?.[selectedType]?.name} Interview</h2></div>
        <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Your Name</label>
        <input value={setupForm.name} onChange={e => setSetupForm({...setupForm, name: e.target.value})} placeholder={user?.username || 'Name'} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" /></div>
        <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Background (optional)</label>
        <input value={setupForm.background} onChange={e => setSetupForm({...setupForm, background: e.target.value})} placeholder="e.g. B.Tech Computer Science, 2 years at TCS" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" /></div>
        <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Career Goal (optional)</label>
        <input value={setupForm.career_goal} onChange={e => setSetupForm({...setupForm, career_goal: e.target.value})} placeholder="e.g. IAS Officer, Software Engineer at Google" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" /></div>
        <button onClick={startInterview} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg disabled:opacity-50 transition-all">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />} Start Interview
        </button>
      </div>
    </div>
  );

  // ═══ INTERVIEW ═══
  if (phase === 'interview') return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-xl">{TYPE_EMOJIS[selectedType]}</span><span className="text-sm font-bold text-gray-700">{types?.[selectedType]?.name}</span></div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Q{currentQIdx + 1}/{interviewData?.questions?.length || '?'}</span>
          <button onClick={endInterview} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">End Interview</button>
        </div>
      </div>

      {/* Greeting */}
      {currentQIdx === 0 && interviewData?.greeting && !feedback && (
        <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100/50">
          <p className="text-sm text-gray-700 italic">{interviewData.greeting}</p>
        </div>
      )}

      {/* Current Question */}
      {currentQ && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0"><User size={16} className="text-white" /></div>
            <div>
              <p className="text-[10px] text-gray-400 mb-1">{currentQ.category} · {currentQ.difficulty}</p>
              <p className="text-[15px] font-semibold text-gray-800 leading-relaxed">{currentQ.question}</p>
            </div>
          </div>
          {!feedback && (
            <>
              <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4}
                placeholder="Type your answer... (Be detailed, as you would in a real interview)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
              <div className="flex justify-end mt-3">
                <button onClick={submitAnswer} disabled={loading || !answer.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md disabled:opacity-50 transition-all">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit Answer
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Score</p>
              <span className={`text-lg font-extrabold ${feedback.score >= 7 ? 'text-emerald-600' : feedback.score >= 4 ? 'text-amber-600' : 'text-red-500'}`}>{feedback.score}/10</span>
            </div>
            {feedback.feedback?.strengths?.length > 0 && (
              <div className="mb-2">{feedback.feedback.strengths.map((s, i) => <p key={i} className="text-[12px] text-emerald-600 flex items-start gap-1.5"><CheckCircle size={12} className="mt-0.5 flex-shrink-0" />{s}</p>)}</div>
            )}
            {feedback.feedback?.improvements?.length > 0 && (
              <div className="mb-2">{feedback.feedback.improvements.map((s, i) => <p key={i} className="text-[12px] text-amber-600 flex items-start gap-1.5"><Target size={12} className="mt-0.5 flex-shrink-0" />{s}</p>)}</div>
            )}
            {feedback.feedback?.ideal_answer_summary && (
              <div className="bg-blue-50 rounded-lg px-3 py-2 mt-2"><p className="text-[11px] text-blue-700"><strong>Ideal:</strong> {feedback.feedback.ideal_answer_summary}</p></div>
            )}
            {feedback.body_language_tip && <p className="text-[11px] text-purple-600 mt-2">💡 {feedback.body_language_tip}</p>}
          </div>
          <button onClick={nextQuestion}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transition-all">
            {currentQIdx < (interviewData?.questions?.length || 0) - 1 ? <><ChevronRight size={14} /> Next Question</> : <><Trophy size={14} /> Get Report</>}
          </button>
        </div>
      )}
    </div>
  );

  // ═══ REPORT ═══
  if (phase === 'report' && report) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className={`rounded-2xl p-8 text-center ${report.overall_score >= 70 ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200' : report.overall_score >= 40 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200' : 'bg-gradient-to-br from-red-50 to-pink-50 border border-red-200'}`}>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg"><Trophy size={36} className="text-white" /></div>
        <p className="text-5xl font-extrabold text-gray-900">{report.overall_score}<span className="text-2xl text-gray-400">/100</span></p>
        <p className="text-lg font-bold text-gray-600 mt-1">Grade: {report.grade}</p>
        <p className="text-sm text-gray-500 mt-2">{report.summary}</p>
      </div>

      {report.category_scores && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4"><BarChart3 size={11} className="inline text-blue-500 mr-1" /> Category Scores</p>
          <div className="space-y-2.5">{Object.entries(report.category_scores).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 capitalize w-24">{k.replace('_', ' ')}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${v * 10}%` }} /></div>
              <span className="text-xs font-bold text-gray-600 w-8 text-right">{v}/10</span>
            </div>
          ))}</div>
        </div>
      )}

      {report.areas_to_improve?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Areas to Improve</p>
          <div className="space-y-1.5">{report.areas_to_improve.map((a, i) => <p key={i} className="text-[12.5px] text-gray-600 flex items-start gap-2"><Target size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />{a}</p>)}</div>
        </div>
      )}

      {report.motivational_note && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100/50">
          <p className="text-sm text-gray-700 italic">{report.motivational_note}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => { setPhase('select'); setReport(null); setHistory([]); }}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">New Interview</button>
        <button onClick={() => { const w = window.open('','_blank'); if(!w) return; w.document.write(`<pre>${JSON.stringify(report,null,2)}</pre>`); w.document.close(); setTimeout(()=>w.print(),400); }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100"><Download size={14} /> PDF</button>
      </div>
    </div>
  );

  return null;
}
