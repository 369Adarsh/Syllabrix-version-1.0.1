'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getRhymeQuestions, randomMessage } from '@/data/literacy-games';
import Mascot from '@/components/learn-play/Mascot';
import { ArrowLeft, Volume2, Star } from 'lucide-react';

const TOTAL = 8;

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-IN'; u.rate = 0.75;
  window.speechSynthesis.speak(u);
}

function ResultScreen({ score, total, onRetry, onHome }) {
  const pct   = Math.round((score / total) * 100);
  const stars = pct === 100 ? 3 : pct >= 70 ? 2 : 1;
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
      <Mascot message={randomMessage(stars === 3 ? 'complete_3' : stars === 2 ? 'complete_2' : 'complete_1')} state="celebrating" size="lg" />
      <div>
        <p className="text-[13px] text-gray-400 font-semibold uppercase tracking-widest mb-1">Your Score</p>
        <p className="text-[56px] font-extrabold text-gray-800 leading-none">{score}<span className="text-[24px] text-gray-400">/{total}</span></p>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <Star key={i} size={36} className={i <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
        ))}
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={onRetry} className="flex-1 py-3 rounded-2xl font-extrabold text-[14px] bg-pink-500 text-white hover:bg-pink-600 transition-colors shadow-md">Play Again 🎮</button>
        <button onClick={onHome}  className="flex-1 py-3 rounded-2xl font-extrabold text-[14px] bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 transition-colors">Home 🏠</button>
      </div>
    </div>
  );
}

export default function RhymeTimeGame() {
  const router = useRouter();
  const [questions, setQuestions]     = useState([]);
  const [current, setCurrent]         = useState(0);
  const [score, setScore]             = useState(0);
  const [selected, setSelected]       = useState([]);   // indices tapped
  const [submitted, setSubmitted]     = useState(false);
  const [done, setDone]               = useState(false);
  const [mascotMsg, setMascotMsg]     = useState('Which words rhyme?');
  const [mascotState, setMascotState] = useState('idle');

  const init = useCallback(() => {
    setQuestions(getRhymeQuestions(TOTAL));
    setCurrent(0); setScore(0); setSelected([]);
    setSubmitted(false); setDone(false);
    setMascotMsg('Which words rhyme?'); setMascotState('idle');
  }, []);

  useEffect(() => { init(); }, [init]);

  const q = questions[current];

  const toggleOption = (i) => {
    if (submitted) return;
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const handleCheck = () => {
    if (!q || submitted) return;
    const correctIndices = q.options.map((o, i) => o.rhymes ? i : -1).filter(i => i >= 0);
    const isCorrect = correctIndices.length === selected.length &&
      correctIndices.every(i => selected.includes(i));

    setSubmitted(true);
    if (isCorrect) {
      setScore(s => s + 1);
      setMascotMsg(randomMessage('correct'));
      setMascotState('happy');
    } else {
      setMascotMsg(randomMessage('wrong'));
      setMascotState('sad');
    }

    setTimeout(() => {
      if (current + 1 >= TOTAL) setDone(true);
      else {
        setCurrent(c => c + 1);
        setSelected([]); setSubmitted(false);
        setMascotMsg('Which words rhyme?'); setMascotState('idle');
      }
    }, 1400);
  };

  if (done) return <ResultScreen score={score} total={TOTAL} onRetry={init} onHome={() => router.push('/learn-play')} />;
  if (!q) return null;

  const progress = (current / TOTAL) * 100;
  const correctIndices = q.options.map((o, i) => o.rhymes ? i : -1).filter(i => i >= 0);

  const optionStyle = (i) => {
    const base = 'p-4 rounded-2xl border-2 font-extrabold text-[15px] transition-all flex flex-col items-center gap-1.5 active:scale-95 ';
    if (!submitted) {
      return base + (selected.includes(i)
        ? 'bg-pink-100 border-pink-400 text-pink-700 scale-105'
        : 'bg-white border-gray-200 text-gray-700 hover:border-pink-200');
    }
    const shouldBe = correctIndices.includes(i);
    const wasPicked = selected.includes(i);
    if (shouldBe && wasPicked) return base + 'bg-emerald-100 border-emerald-400 text-emerald-700';
    if (shouldBe && !wasPicked) return base + 'bg-emerald-50 border-emerald-300 text-emerald-600 border-dashed';
    if (!shouldBe && wasPicked) return base + 'bg-red-100 border-red-400 text-red-600';
    return base + 'opacity-40 bg-gray-50 border-gray-200 text-gray-400';
  };

  return (
    <div className="max-w-sm mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/learn-play')} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <p className="text-[13px] font-bold text-gray-600">Rhyme Time 🎵</p>
        <div className="flex items-center gap-1 text-[12px] font-bold text-amber-600">
          <Star size={13} className="text-amber-400 fill-amber-400" />{score}
        </div>
      </div>

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-center text-[11px] text-gray-400 font-semibold -mt-3">Question {current + 1} of {TOTAL}</p>

      <div className="flex justify-center">
        <Mascot message={mascotMsg} state={mascotState} size="md" />
      </div>

      {/* Target word */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-3xl p-5 text-center">
        <p className="text-[11px] text-pink-500 font-bold uppercase tracking-widest mb-2">Find words that rhyme with</p>
        <button onClick={() => speak(q.word)} className="mb-2 mx-auto w-9 h-9 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center hover:bg-pink-200 transition-colors">
          <Volume2 size={14} className="text-pink-500" />
        </button>
        <p className="text-[60px] leading-none mb-1">{q.emoji}</p>
        <p className="text-[32px] font-extrabold text-gray-800">{q.word}</p>
        <p className="text-[11px] text-gray-400 mt-1">Tap all words that rhyme!</p>
      </div>

      {/* Options 2x2 */}
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => toggleOption(i)} className={optionStyle(i)}>
            <span className="text-[32px] leading-none">{opt.emoji}</span>
            <button
              onClick={e => { e.stopPropagation(); speak(opt.word); }}
              className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center hover:bg-white transition-colors"
            >
              <Volume2 size={10} className="text-gray-400" />
            </button>
            <span>{opt.word}</span>
          </button>
        ))}
      </div>

      {/* Check button */}
      {!submitted && (
        <button
          onClick={handleCheck}
          disabled={selected.length === 0}
          className="w-full py-4 rounded-2xl font-extrabold text-[15px] bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-600 transition-all"
        >
          Check Answer ✓
        </button>
      )}
    </div>
  );
}
