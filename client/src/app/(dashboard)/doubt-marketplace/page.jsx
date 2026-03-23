'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentsAPI } from '@/lib/api/payments.api';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  MessageCircle, Send, Loader2, Sparkles, User, CheckCircle, Clock,
  ArrowLeft, Brain, Zap, Star, IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoubtMarketplacePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('ask'); // ask | my-doubts
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState('ai'); // ai | teacher_live
  const [submitting, setSubmitting] = useState(false);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (tab === 'my-doubts') {
      setSessionsLoading(true);
      paymentsAPI.getMyDoubts(user?.user_type === 'teacher' ? 'teacher' : 'student')
        .then(r => setSessions(r.data?.data || []))
        .catch(() => {})
        .finally(() => setSessionsLoading(false));
    }
  }, [tab, user]);

  const handleAsk = async () => {
    if (!question.trim()) { toast.error('Type your question'); return; }
    setSubmitting(true); setAiAnswer(null);

    try {
      if (mode === 'ai') {
        // Free AI answer
        const res = await aiAPI.clearDoubt(question, subject);
        setAiAnswer(res.data?.data?.answer || res.data?.data);
        // Also save as session for history
        await paymentsAPI.createDoubtSession({ subject: subject || 'General', question, mode: 'ai' }).catch(() => {});
      } else {
        // Create paid teacher session
        await paymentsAPI.createDoubtSession({ subject: subject || 'General', question, mode: 'teacher_live' });
        toast.success('Doubt posted! A teacher will pick it up shortly.');
        setQuestion(''); setSubject('');
      }
    } catch (e) { toast.error('Could not submit doubt'); }
    finally { setSubmitting(false); }
  };

  const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Science', 'Computer Science', 'Accountancy', 'Economics', 'General'];
  const STATUS_COLORS = { pending: 'bg-amber-100 text-amber-700', matched: 'bg-blue-100 text-blue-700', in_progress: 'bg-purple-100 text-purple-700', resolved: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-gray-100 text-gray-500' };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-700 to-purple-600 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={24} className="text-purple-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Instant Doubt Solving</h1>
            <p className="text-purple-300/70 text-sm mt-0.5">Free AI answers or ₹20 for a live teacher session</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {[{ k: 'ask', l: 'Ask a Doubt', icon: MessageCircle }, { k: 'my-doubts', l: 'My Doubts', icon: Clock }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.k ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}><t.icon size={13} /> {t.l}</button>
        ))}
      </div>

      {tab === 'ask' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5 space-y-4">
          {/* Mode selection */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setMode('ai')}
              className={`p-4 rounded-xl border text-left transition-all ${mode === 'ai' ? 'border-indigo-300 bg-indigo-50/50 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-indigo-200'}`}>
              <div className="flex items-center gap-2 mb-1.5"><Sparkles size={18} className="text-indigo-500" /><span className="text-sm font-bold text-gray-800">AI Answer</span></div>
              <p className="text-[11px] text-gray-400">Instant, free answer from AI</p>
              <p className="text-lg font-extrabold text-emerald-600 mt-2">FREE</p>
            </button>
            <button onClick={() => setMode('teacher_live')}
              className={`p-4 rounded-xl border text-left transition-all ${mode === 'teacher_live' ? 'border-purple-300 bg-purple-50/50 ring-2 ring-purple-100' : 'border-gray-200 hover:border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-1.5"><User size={18} className="text-purple-500" /><span className="text-sm font-bold text-gray-800">Live Teacher</span></div>
              <p className="text-[11px] text-gray-400">Verified teacher answers</p>
              <p className="text-lg font-extrabold text-purple-600 mt-2">₹20 <span className="text-xs font-normal text-gray-400">per session</span></p>
            </button>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Subject</label>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => setSubject(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${subject === s ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-indigo-50'}`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Your Question</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
              placeholder="Type your doubt here... Be specific for the best answer!"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
          </div>

          <button onClick={handleAsk} disabled={submitting || !question.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-200/40 transition-all active:scale-[0.98] disabled:opacity-50">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {mode === 'ai' ? 'Get AI Answer (Free)' : 'Post Doubt (₹20)'}
          </button>

          {/* AI Answer */}
          {aiAnswer && (
            <div className="bg-indigo-50/60 rounded-xl p-5 border border-indigo-100/50 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Sparkles size={16} className="text-white" /></div>
                <p className="text-sm font-bold text-gray-800">AI Answer</p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'my-doubts' && (
        <>
          {sessionsLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center"><Loader2 size={28} className="animate-spin text-purple-500 mx-auto" /></div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
              <MessageCircle size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-600">No doubts yet</p>
              <p className="text-sm text-gray-400 mt-1">Ask your first doubt above!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800 flex-1 pr-3">{s.question}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span>{s.subject}</span>
                    <span>·</span>
                    <span className="capitalize">{s.mode?.replace('_', ' ')}</span>
                    {s.amount_inr > 0 && <span>· ₹{s.amount_inr}</span>}
                  </div>
                  {(s.ai_answer || s.teacher_answer) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[12px] text-gray-600 whitespace-pre-wrap">{s.teacher_answer || s.ai_answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
