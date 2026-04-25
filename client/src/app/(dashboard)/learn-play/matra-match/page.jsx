'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getMatraQuestions, randomMessage } from '@/data/literacy-games';
import Mascot from '@/components/learn-play/Mascot';
import { ArrowLeft, Volume2, Star } from 'lucide-react';

const TOTAL = 10;

function speakHindi(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'hi-IN'; u.rate = 0.7;
  window.speechSynthesis.speak(u);
}

function ResultScreen({ score, total, onRetry, onHome }) {
  const pct   = Math.round((score / total) * 100);
  const stars = pct === 100 ? 3 : pct >= 70 ? 2 : 1;
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
      <Mascot message={randomMessage(stars === 3 ? 'complete_3' : stars === 2 ? 'complete_2' : 'complete_1')} state="celebrating" size="lg" />
      <div>
        <p className="text-[13px] text-gray-400 font-semibold uppercase tracking-widest mb-1">आपका स्कोर</p>
        <p className="text-[56px] font-extrabold text-gray-800 leading-none">{score}<span className="text-[24px] text-gray-400">/{total}</span></p>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <Star key={i} size={36} className={i <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
        ))}
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={onRetry} className="flex-1 py-3 rounded-2xl font-extrabold text-[14px] bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-md">फिर खेलें 🎮</button>
        <button onClick={onHome}  className="flex-1 py-3 rounded-2xl font-extrabold text-[14px] bg-white border-2 border-gray-200 text-gray-700">होम 🏠</button>
      </div>
    </div>
  );
}

export default function MatraMatchGame() {
  const router = useRouter();
  const [questions, setQuestions]     = useState([]);
  const [current, setCurrent]         = useState(0);
  const [score, setScore]             = useState(0);
  const [picked, setPicked]           = useState(null);
  const [correct, setCorrect]         = useState(null);
  const [done, setDone]               = useState(false);
  const [mascotMsg, setMascotMsg]     = useState('सही मात्रा चुनो!');
  const [mascotState, setMascotState] = useState('idle');

  const init = useCallback(() => {
    setQuestions(getMatraQuestions(TOTAL));
    setCurrent(0); setScore(0); setPicked(null);
    setCorrect(null); setDone(false);
    setMascotMsg('सही मात्रा चुनो!'); setMascotState('idle');
  }, []);

  useEffect(() => { init(); }, [init]);

  const q = questions[current];

  const handlePick = (matra) => {
    if (picked !== null) return;
    const isCorrect = matra === q.matra;
    setPicked(matra);
    setCorrect(isCorrect);

    if (isCorrect) {
      setScore(s => s + 1);
      setMascotMsg(randomMessage('correct'));
      setMascotState('happy');
      speakHindi(q.syllable);
    } else {
      setMascotMsg(randomMessage('wrong'));
      setMascotState('sad');
      speakHindi('नहीं');
    }

    setTimeout(() => {
      if (current + 1 >= TOTAL) setDone(true);
      else {
        setCurrent(c => c + 1);
        setPicked(null); setCorrect(null);
        setMascotMsg('सही मात्रा चुनो!'); setMascotState('idle');
      }
    }, 1400);
  };

  if (done) return <ResultScreen score={score} total={TOTAL} onRetry={init} onHome={() => router.push('/learn-play')} />;
  if (!q) return null;

  const progress = (current / TOTAL) * 100;

  const optionStyle = (matra) => {
    const base = 'w-full py-5 rounded-2xl border-2 text-[32px] font-bold transition-all active:scale-95 ';
    if (picked === null) return base + 'bg-white border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-700';
    if (matra === q.matra)   return base + 'bg-emerald-100 border-emerald-400 text-emerald-700 scale-105';
    if (matra === picked)    return base + 'bg-red-100 border-red-400 text-red-600';
    return base + 'opacity-30 bg-gray-50 border-gray-200 text-gray-400';
  };

  return (
    <div className="max-w-sm mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/learn-play')} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <p className="text-[13px] font-bold text-gray-600">मात्रा मिलान 🪔</p>
        <div className="flex items-center gap-1 text-[12px] font-bold text-amber-600">
          <Star size={13} className="text-amber-400 fill-amber-400" />{score}
        </div>
      </div>

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-center text-[11px] text-gray-400 font-semibold -mt-3">प्रश्न {current + 1} / {TOTAL}</p>

      <div className="flex justify-center">
        <Mascot message={mascotMsg} state={mascotState} size="md" />
      </div>

      {/* Syllable display */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-3xl p-6 text-center">
        <p className="text-[11px] text-orange-500 font-bold uppercase tracking-widest mb-3">यह अक्षर बनाओ</p>

        {/* Equation: base + ? = syllable */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-white rounded-2xl border border-orange-200 px-5 py-3 shadow-sm">
            <p className="text-[52px] font-bold text-gray-800 leading-none">{q.base}</p>
          </div>
          <span className="text-[28px] text-orange-400 font-bold">+</span>
          <div className="bg-white rounded-2xl border-2 border-dashed border-orange-300 px-5 py-3">
            <p className="text-[52px] font-bold text-orange-300 leading-none">{picked || '?'}</p>
          </div>
          <span className="text-[28px] text-orange-400 font-bold">=</span>
          <div className="bg-white rounded-2xl border border-orange-200 px-5 py-3 shadow-sm">
            <p className="text-[52px] font-bold text-orange-600 leading-none">{q.syllable}</p>
          </div>
        </div>

        <button
          onClick={() => speakHindi(q.syllable)}
          className="mx-auto flex items-center gap-1.5 px-4 py-2 bg-orange-100 border border-orange-200 rounded-full text-[12px] font-bold text-orange-600 hover:bg-orange-200 transition-colors"
        >
          <Volume2 size={13} /> सुनो ({q.hint})
        </button>

        <p className="text-[11px] text-gray-400 mt-3">
          {q.base} + <strong className="text-orange-500">?</strong> = <strong className="text-orange-600">{q.syllable}</strong>
        </p>
      </div>

      {/* Matra options — 2x2 grid */}
      <div>
        <p className="text-center text-[11px] text-gray-400 font-semibold mb-2">सही मात्रा चुनो</p>
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((matra, i) => (
            <button key={i} onClick={() => handlePick(matra)} className={optionStyle(matra)}>
              {matra}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
