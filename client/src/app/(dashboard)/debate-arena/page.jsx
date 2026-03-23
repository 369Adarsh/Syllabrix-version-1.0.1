'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  MessageSquare, Send, Loader2, Sparkles, Trophy, BarChart3, Flame,
  ArrowLeft, ArrowRight, ThumbsUp, ThumbsDown, Target, Zap, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DebateArenaPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [phase, setPhase] = useState('home'); // home | topic | debate | result
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(null);
  const [studentSide, setStudentSide] = useState(null);
  const [argument, setArgument] = useState('');
  const [debateHistory, setDebateHistory] = useState([]);
  const [lastResponse, setLastResponse] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    aiAPI.getDebateCategories().then(r => setCategories(r.data?.data || [])).catch(() => {});
    aiAPI.getTrendingDebateTopics().then(r => setTrending(r.data?.data || [])).catch(() => {});
  }, []);

  const generateTopic = async (category) => {
    setLoading(true);
    try {
      const res = await aiAPI.generateDebateTopic(category, { class_level: user?.class_name?.toString().replace(/\D/g, '') });
      setTopic(res.data?.data || res.data); setPhase('topic');
    } catch { toast.error('Could not generate topic'); }
    finally { setLoading(false); }
  };

  const pickSide = (side) => {
    setStudentSide(side); setDebateHistory([]); setLastResponse(null); setPhase('debate');
  };

  const submitArgument = async () => {
    if (!argument.trim()) { toast.error('Type your argument'); return; }
    setLoading(true); setLastResponse(null);
    const newEntry = { speaker: 'student', text: argument.trim() };
    const updatedHistory = [...debateHistory, newEntry];
    setDebateHistory(updatedHistory);
    try {
      const res = await aiAPI.debateRespond(topic.topic, studentSide, argument.trim(), updatedHistory);
      const resp = res.data?.data || res.data;
      setLastResponse(resp);
      setDebateHistory(prev => [...prev, { speaker: 'ai', text: resp.response }]);
      setArgument('');
    } catch { toast.error('AI could not respond'); }
    finally { setLoading(false); }
  };

  const endDebate = async () => {
    if (debateHistory.length < 2) { toast.error('Have at least one exchange'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.evaluateDebate(topic.topic, studentSide, debateHistory);
      setResult(res.data?.data || res.data); setPhase('result');
    } catch { toast.error('Could not evaluate'); }
    finally { setLoading(false); }
  };

  const round = Math.floor(debateHistory.filter(h => h.speaker === 'student').length);

  // ═══ HOME ═══
  if (phase === 'home') return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-700 via-red-700 to-orange-700 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/15 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-5 right-10 text-3xl">🗣️</div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0"><MessageSquare size={24} className="text-rose-200" /></div>
          <div><h1 className="text-xl font-extrabold text-white">AI Debate Arena</h1>
          <p className="text-rose-300/70 text-sm mt-0.5">Practice debates, sharpen arguments, prepare for GD rounds</p></div>
        </div>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center gap-1.5"><Flame size={11} className="text-orange-500" /> Trending Topics</p>
          <div className="space-y-2">{trending.map((t, i) => (
            <button key={i} onClick={() => { setTopic({ topic: t.topic, category: t.category }); setPhase('topic'); }}
              className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all group">
              <Flame size={14} className="text-orange-400 flex-shrink-0" />
              <p className="text-sm font-medium text-gray-700 group-hover:text-rose-600 flex-1">{t.topic}</p>
              {t.exam_relevant && <span className="text-[9px] text-gray-400 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200">{t.exam_relevant}</span>}
            </button>
          ))}</div>
        </div>
      )}

      {/* Categories */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Pick a Category</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => generateTopic(cat.id)}
              className="text-left bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <span className="text-2xl block mb-2">{cat.emoji}</span>
              <h3 className="font-bold text-gray-800 text-sm group-hover:text-rose-600">{cat.name}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>
      {loading && <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-rose-500 mx-auto" /></div>}
    </div>
  );

  // ═══ TOPIC — PICK SIDE ═══
  if (phase === 'topic' && topic) return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => setPhase('home')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={14} /> Back</button>
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-3">Today's Debate</p>
        <h2 className="text-xl font-extrabold text-gray-900 mb-3 leading-snug">"{topic.topic}"</h2>
        {topic.context && <p className="text-sm text-gray-500 mb-5">{topic.context}</p>}
        <p className="text-sm font-bold text-gray-700 mb-4">Pick your side:</p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => pickSide('for')}
            className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:shadow-lg transition-all group">
            <ThumbsUp size={28} className="text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-emerald-700">{topic.side_for?.label || 'For'}</h3>
            <p className="text-[10px] text-emerald-600 mt-1">{topic.side_for?.opening_statement_hint || 'Argue in favor'}</p>
          </button>
          <button onClick={() => pickSide('against')}
            className="p-5 rounded-2xl border-2 border-red-200 bg-red-50 hover:border-red-400 hover:shadow-lg transition-all group">
            <ThumbsDown size={28} className="text-red-500 mx-auto mb-2" />
            <h3 className="font-bold text-red-700">{topic.side_against?.label || 'Against'}</h3>
            <p className="text-[10px] text-red-600 mt-1">{topic.side_against?.opening_statement_hint || 'Argue against'}</p>
          </button>
        </div>
        {/* Arguments cheat sheet */}
        {(studentSide === null) && topic.side_for?.key_arguments && (
          <div className="mt-5 pt-5 border-t border-gray-100 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">💡 Key arguments to help you prepare:</p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div><p className="font-bold text-emerald-600 mb-1">For:</p>{topic.side_for.key_arguments.slice(0,2).map((a,i)=><p key={i} className="text-gray-500 mb-1">• {a.point}</p>)}</div>
              <div><p className="font-bold text-red-600 mb-1">Against:</p>{topic.side_against?.key_arguments?.slice(0,2).map((a,i)=><p key={i} className="text-gray-500 mb-1">• {a.point}</p>)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ═══ DEBATE ═══
  if (phase === 'debate') return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${studentSide === 'for' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>You: {studentSide === 'for' ? 'FOR' : 'AGAINST'}</span>
          <span className="text-xs text-gray-400">Round {round + 1}</span>
        </div>
        <button onClick={endDebate} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200">End & Score</button>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-[12px] text-gray-600 font-medium italic">"{topic?.topic}"</p></div>

      {/* Chat history */}
      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        {debateHistory.map((h, i) => (
          <div key={i} className={`flex ${h.speaker === 'student' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              h.speaker === 'student' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}>
              <p className="text-[10px] font-bold mb-0.5 opacity-60">{h.speaker === 'student' ? 'You' : 'AI Opponent'}</p>
              <p className="text-sm leading-relaxed">{h.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback from last response */}
      {lastResponse && (
        <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100/50 text-[11px]">
          <p className="text-amber-700"><strong>Your argument: {lastResponse.strength_of_student_argument}/10</strong> — {lastResponse.feedback_on_student}</p>
          {lastResponse.suggested_comeback && <p className="text-blue-600 mt-1">💡 Try saying: {lastResponse.suggested_comeback}</p>}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <textarea value={argument} onChange={e => setArgument(e.target.value)} rows={2}
          placeholder="Type your argument... (be specific, use evidence)"
          className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitArgument(); } }} />
        <button onClick={submitArgument} disabled={loading || !argument.trim()}
          className="px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white disabled:opacity-40">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );

  // ═══ RESULT ═══
  if (phase === 'result' && result) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className={`rounded-2xl p-8 text-center ${result.overall_score >= 70 ? 'bg-emerald-50 border border-emerald-200' : result.overall_score >= 40 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
        <Trophy size={36} className="text-amber-500 mx-auto mb-3" />
        <p className="text-5xl font-extrabold text-gray-900">{result.overall_score}<span className="text-2xl text-gray-400">/100</span></p>
        <p className="text-lg font-bold text-gray-600 mt-1">Grade: {result.grade}</p>
        <p className="text-sm text-gray-500 mt-2">{result.summary}</p>
      </div>

      {result.scores && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Scores</p>
          <div className="space-y-2">{Object.entries(result.scores).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 capitalize w-28">{k.replace('_', ' ')}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" style={{ width: `${v * 10}%` }} /></div>
              <span className="text-xs font-bold text-gray-600 w-8 text-right">{v}/10</span>
            </div>
          ))}</div>
        </div>
      )}

      {result.debate_tips?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Tips to Improve</p>
          {result.debate_tips.map((t, i) => <p key={i} className="text-[12.5px] text-gray-600 flex items-start gap-2 mb-1.5"><Sparkles size={12} className="text-rose-500 mt-0.5 flex-shrink-0" />{t}</p>)}
        </div>
      )}

      {result.gd_readiness && (
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-4 border border-rose-100/50">
          <p className="text-[11px] font-bold text-rose-600 mb-1">GD Readiness</p>
          <p className="text-sm text-gray-700">{result.gd_readiness}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => { setPhase('home'); setResult(null); setDebateHistory([]); }}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50">New Debate</button>
        <button onClick={() => { const w = window.open('','_blank'); if(!w) return; w.document.write(`<pre>${JSON.stringify(result,null,2)}</pre>`); w.document.close(); setTimeout(()=>w.print(),400); }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100"><Download size={14} /> PDF</button>
      </div>
    </div>
  );

  return null;
}
