'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getWordBuilderWords, randomMessage } from '@/data/literacy-games';
import Mascot from '@/components/learn-play/Mascot';
import { ArrowLeft, Volume2, Star, RotateCcw } from 'lucide-react';

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
        <button onClick={onRetry} className="flex-1 py-3 rounded-2xl font-extrabold text-[14px] bg-violet-500 text-white hover:bg-violet-600 transition-colors shadow-md">Play Again 🎮</button>
        <button onClick={onHome}  className="flex-1 py-3 rounded-2xl font-extrabold text-[14px] bg-white border-2 border-gray-200 text-gray-700">Home 🏠</button>
      </div>
    </div>
  );
}

export default function WordBuilderGame() {
  const router = useRouter();
  const [words, setWords]             = useState([]);
  const [current, setCurrent]         = useState(0);
  const [score, setScore]             = useState(0);
  const [built, setBuilt]             = useState([]);     // letters placed so far
  const [available, setAvailable]     = useState([]);     // remaining shuffled letters
  const [status, setStatus]           = useState(null);   // null | 'correct' | 'wrong'
  const [done, setDone]               = useState(false);
  const [mascotMsg, setMascotMsg]     = useState('Build the word!');
  const [mascotState, setMascotState] = useState('idle');

  const init = useCallback(() => {
    const w = getWordBuilderWords(TOTAL);
    setWords(w);
    setCurrent(0); setScore(0);
    setBuilt([]); setAvailable(w[0]?.letters || []);
    setStatus(null); setDone(false);
    setMascotMsg('Build the word!'); setMascotState('idle');
  }, []);

  useEffect(() => { init(); }, [init]);

  const w = words[current];

  const addLetter = (idx) => {
    if (status) return;
    const letter = available[idx];
    const newBuilt = [...built, letter];
    const newAvail = available.filter((_, i) => i !== idx);
    setBuilt(newBuilt);
    setAvailable(newAvail);

    // Auto-check when all letters placed
    if (newBuilt.length === (w?.word?.length || 0)) {
      const formed = newBuilt.join('');
      if (formed === w.word) {
        setScore(s => s + 1);
        setStatus('correct');
        setMascotMsg(randomMessage('correct'));
        setMascotState('happy');
        speak(w.word);
        setTimeout(() => advance(words), 1400);
      } else {
        setStatus('wrong');
        setMascotMsg(randomMessage('wrong'));
        setMascotState('sad');
        setTimeout(() => {
          setBuilt([]);
          setAvailable(w.letters.slice());
          setStatus(null);
          setMascotMsg('Try again! 💪');
          setMascotState('idle');
        }, 1200);
      }
    }
  };

  const advance = (ws) => {
    const next = current + 1;
    if (next >= TOTAL) { setDone(true); return; }
    setCurrent(next);
    setBuilt([]);
    setAvailable(ws[next]?.letters || []);
    setStatus(null);
    setMascotMsg('Build the word!');
    setMascotState('idle');
  };

  const resetWord = () => {
    if (!w || status === 'correct') return;
    setBuilt([]);
    setAvailable(w.letters.slice());
    setStatus(null);
    setMascotMsg('Build the word!');
    setMascotState('idle');
  };

  if (done) return <ResultScreen score={score} total={TOTAL} onRetry={init} onHome={() => router.push('/learn-play')} />;
  if (!w) return null;

  const progress = (current / TOTAL) * 100;

  return (
    <div className="max-w-sm mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/learn-play')} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <p className="text-[13px] font-bold text-gray-600">Word Builder 🧩</p>
        <div className="flex items-center gap-1 text-[12px] font-bold text-amber-600">
          <Star size={13} className="text-amber-400 fill-amber-400" />{score}
        </div>
      </div>

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-400 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-center text-[11px] text-gray-400 font-semibold -mt-3">Word {current + 1} of {TOTAL}</p>

      <div className="flex justify-center">
        <Mascot message={mascotMsg} state={mascotState} size="md" />
      </div>

      {/* Word picture */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-3xl p-6 text-center">
        <p className="text-[11px] text-violet-500 font-bold uppercase tracking-widest mb-2">Build this word</p>
        <p className="text-[70px] leading-none mb-2">{w.emoji}</p>
        <p className="text-[12px] text-gray-400 italic">{w.hint}</p>
        <button
          onClick={() => speak(w.word)}
          className="mt-2 mx-auto flex items-center gap-1.5 px-4 py-1.5 bg-violet-100 border border-violet-200 rounded-full text-[11px] font-bold text-violet-600 hover:bg-violet-200 transition-colors"
        >
          <Volume2 size={12} /> Hear it
        </button>
      </div>

      {/* Answer slots */}
      <div>
        <div className="flex justify-center items-center gap-2 mb-1">
          {Array.from({ length: w.word.length }).map((_, i) => {
            const letter = built[i];
            let style = 'w-12 h-14 rounded-xl border-2 flex items-center justify-center text-[22px] font-extrabold transition-all ';
            if (!letter) {
              style += 'border-dashed border-violet-300 bg-white text-transparent';
            } else if (status === 'correct') {
              style += 'border-emerald-400 bg-emerald-50 text-emerald-700 scale-105';
            } else if (status === 'wrong') {
              style += 'border-red-400 bg-red-50 text-red-600';
            } else {
              style += 'border-violet-400 bg-violet-50 text-violet-700';
            }
            return (
              <div key={i} className={style}>
                {letter || '_'}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center">
          <button onClick={resetWord} disabled={built.length === 0 || status === 'correct'} className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1 disabled:opacity-30">
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      {/* Available letter tiles */}
      <div>
        <p className="text-center text-[11px] text-gray-400 font-semibold mb-2">Tap letters to build the word</p>
        <div className="flex flex-wrap justify-center gap-2">
          {available.map((letter, i) => (
            <button
              key={i}
              onClick={() => addLetter(i)}
              disabled={!!status}
              className="w-12 h-14 rounded-xl border-2 border-gray-200 bg-white text-[22px] font-extrabold text-gray-700 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 active:scale-95 transition-all disabled:opacity-40"
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
