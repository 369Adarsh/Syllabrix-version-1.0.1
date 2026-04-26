'use client';
import { useState } from 'react';
import { ArrowLeft, Send, RotateCcw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { ANSWER_WRITING_QUESTIONS, getTodayQuestion } from '@/data/upsc-syllabus';
import { aiAPI } from '@/lib/api/ai.api';

const WORD_TARGETS = { 10: 150, 15: 250 };

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function AnswerWriting() {
  const [selectedQ, setSelectedQ] = useState(() => getTodayQuestion());
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQPicker, setShowQPicker] = useState(false);

  const target = WORD_TARGETS[selectedQ.marks] || 200;
  const wc = wordCount(answer);
  const pct = Math.min(100, Math.round((wc / target) * 100));

  const handleSubmit = async () => {
    if (wc < 30) { setError('Write at least 30 words before submitting.'); return; }
    setError('');
    setLoading(true);
    setFeedback(null);
    try {
      const context = `UPSC ${selectedQ.type} Question (${selectedQ.marks} marks). Target: ~${target} words. Evaluate this answer for: structure (introduction, body, conclusion), content accuracy, presentation (headings/subheadings), and relevance. Give a score out of ${selectedQ.marks} and specific suggestions to improve.`;
      const res = await aiAPI.clearDoubt(
        `Question: ${selectedQ.q}\n\nMy Answer:\n${answer}`,
        context
      );
      setFeedback(res.data?.answer || res.data?.response || res.data);
    } catch {
      setError('AI feedback failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setAnswer(''); setFeedback(null); setError(''); };

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/upsc" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-[16px] font-extrabold text-gray-800">Answer Writing</h1>
          <p className="text-[11px] text-gray-400">Practice Mains answers · AI feedback</p>
        </div>
      </div>

      {/* Question selector */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <button
          onClick={() => setShowQPicker(o => !o)}
          className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[11px] font-extrabold text-violet-700">{selectedQ.marks}M</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-bold border border-violet-200">{selectedQ.type}</span>
              <span className="text-[9px] text-gray-400 font-semibold">~{target} words</span>
            </div>
            <p className="text-[12px] text-gray-700 font-medium leading-snug line-clamp-2">{selectedQ.q}</p>
          </div>
          {showQPicker
            ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0 mt-1" />
            : <ChevronDown size={14} className="text-gray-400 flex-shrink-0 mt-1" />
          }
        </button>

        {showQPicker && (
          <div className="border-t border-gray-50 max-h-64 overflow-y-auto">
            {ANSWER_WRITING_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => { setSelectedQ(q); setShowQPicker(false); reset(); }}
                className={`w-full text-left px-4 py-2.5 hover:bg-violet-50 transition-colors border-b border-gray-50 last:border-0 ${selectedQ === q ? 'bg-violet-50' : ''}`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-bold text-violet-600">{q.type}</span>
                  <span className="text-[9px] text-gray-400">{q.marks}M</span>
                </div>
                <p className="text-[11px] text-gray-600 line-clamp-2">{q.q}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Answer textarea */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-gray-600">Your Answer</p>
          <span className={`text-[10px] font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-gray-400'}`}>
            {wc} / ~{target} words
          </span>
        </div>

        {/* Word count bar */}
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-violet-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder={`Write your answer here...\n\nTips:\n• Start with a crisp introduction\n• Use headings/subheadings\n• Include examples or data\n• End with a balanced conclusion`}
          rows={12}
          className="w-full text-[13px] text-gray-700 leading-relaxed resize-none outline-none placeholder:text-gray-300 font-['Georgia',serif]"
          style={{ minHeight: 240 }}
        />

        {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}

        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
          <button
            onClick={reset}
            disabled={!answer && !feedback}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-[11px] font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || wc < 30}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 text-white font-extrabold text-[12px] hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Getting AI Feedback...
              </>
            ) : (
              <><Sparkles size={13} /> Get AI Feedback</>
            )}
          </button>
        </div>
      </div>

      {/* AI Feedback */}
      {feedback && (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-violet-200 flex items-center justify-center">
              <Sparkles size={13} className="text-violet-700" />
            </div>
            <p className="text-[12px] font-extrabold text-violet-800">AI Feedback</p>
          </div>
          <div className="text-[12px] text-gray-700 leading-relaxed whitespace-pre-wrap">
            {typeof feedback === 'string' ? feedback : JSON.stringify(feedback, null, 2)}
          </div>
          <button
            onClick={reset}
            className="mt-4 w-full py-2.5 rounded-xl border-2 border-violet-300 text-violet-700 font-extrabold text-[12px] hover:bg-violet-100 transition-colors"
          >
            Write Another Answer
          </button>
        </div>
      )}
    </div>
  );
}
