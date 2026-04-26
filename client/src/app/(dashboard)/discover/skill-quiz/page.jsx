'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { SKILL_QUIZ, SKILL_RESULTS } from '@/data/curious-mind';

export default function SkillQuizPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers]  = useState([]);
  const [done, setDone]        = useState(false);

  const q = SKILL_QUIZ[current];

  const pick = (trait) => {
    const next = [...answers, trait];
    setAnswers(next);
    if (next.length === SKILL_QUIZ.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
    }
  };

  const getResult = () => {
    const counts = answers.reduce((a, t) => { a[t] = (a[t] || 0) + 1; return a; }, {});
    const c = counts.creative || 0;
    const a = counts.analytical || 0;
    if (Math.abs(c - a) <= 1) return SKILL_RESULTS.balanced;
    return c > a ? SKILL_RESULTS.creative : SKILL_RESULTS.analytical;
  };

  const reset = () => { setCurrent(0); setAnswers([]); setDone(false); };

  const progress = ((done ? SKILL_QUIZ.length : current) / SKILL_QUIZ.length) * 100;

  if (done) {
    const result = getResult();
    return (
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/discover" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <h1 className="text-[16px] font-extrabold text-gray-800">Your Result</h1>
        </div>

        <div className={`rounded-3xl border-2 p-6 text-center ${result.color}`}>
          <p className="text-[48px] mb-3">{result.emoji}</p>
          <p className={`text-[22px] font-extrabold mb-2 ${result.textColor}`}>{result.label}</p>
          <p className="text-[13px] text-gray-600 leading-relaxed">{result.desc}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Careers that could suit you</p>
          <div className="flex flex-wrap gap-2">
            {result.careers.map(c => (
              <span key={c} className={`text-[11px] px-3 py-1 rounded-full font-bold border ${result.color} ${result.textColor}`}>{c}</span>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-center text-gray-400 leading-relaxed px-4">
          This is just a fun explorer — not a box you must fit in. Many great people are both!
        </p>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-[13px] hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={14} /> Retake
          </button>
          <Link
            href="/discover"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-600 text-white font-extrabold text-[13px] hover:bg-violet-700 transition-colors"
          >
            Explore More <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/discover" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-[16px] font-extrabold text-gray-800">Skill Quiz</h1>
          <p className="text-[11px] text-gray-400">Question {current + 1} of {SKILL_QUIZ.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-400 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          <span className="text-[18px]">🎯</span>
        </div>
        <p className="text-[16px] font-extrabold text-gray-800 leading-snug mb-6">{q.q}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(opt.trait)}
              className="w-full text-left px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-violet-400 hover:bg-violet-50 active:scale-[0.98] transition-all"
            >
              <p className="text-[13px] font-bold text-gray-700">{opt.text}</p>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-400">No right or wrong answers — just explore!</p>
    </div>
  );
}
