'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPhonicsQuestions, randomMessage } from '@/data/literacy-games';
import Mascot from '@/components/learn-play/Mascot';
import { ArrowLeft, Volume2, Star } from 'lucide-react';

const TOTAL = 10;

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-IN';
  u.rate = 0.75;
  window.speechSynthesis.speak(u);
}

function ResultScreen({ score, total, onRetry, onHome }) {
  const pct    = Math.round((score / total) * 100);
  const stars  = pct === 100 ? 3 : pct >= 70 ? 2 : 1;
  const msg    = randomMessage(stars === 3 ? 'complete_3' : stars === 2 ? 'complete_2' : 'complete_1');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
      <Mascot message={msg} state="celebrating" size="lg" />

      <div>
        <p className="text-[13px] text-gray-400 font-semibold uppercase tracking-widest mb-1">Your Score</p>
        <p className="text-[56px] font-extrabold text-gray-800 leading-none">{score}<span className="text-[24px] text-gray-400">/{total}</span></p>
      </div>

      {/* Stars */}
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <Star
            key={i}
            size={36}
            className={i <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
          />
        ))}
      </div>

      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-2xl font-extrabold text-[14px] bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-md"
        >
          Play Again 🎮
        </button>
        <button
          onClick={onHome}
          className="flex-1 py-3 rounded-2xl font-extrabold text-[14px] bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 transition-colors"
        >
          Home 🏠
        </button>
      </div>
    </div>
  );
}

export default function SoundTapGame() {
  const router = useRouter();
  const [questions, setQuestions]   = useState([]);
  const [current, setCurrent]       = useState(0);
  const [score, setScore]           = useState(0);
  const [answered, setAnswered]     = useState(null); // null | 'yes' | 'no'
  const [correct, setCorrect]       = useState(null); // null | true | false
  const [done, setDone]             = useState(false);
  const [mascotMsg, setMascotMsg]   = useState('Does this word start with the letter?');
  const [mascotState, setMascotState] = useState('idle');

  const init = useCallback(() => {
    setQuestions(getPhonicsQuestions(TOTAL));
    setCurrent(0); setScore(0);
    setAnswered(null); setCorrect(null); setDone(false);
    setMascotMsg('Does this word start with the letter?');
    setMascotState('idle');
  }, []);

  useEffect(() => { init(); }, [init]);

  const q = questions[current];

  const handleAnswer = (choice) => {
    if (answered !== null) return;
    const isCorrect = (choice === 'yes') === q.correct;
    setAnswered(choice);
    setCorrect(isCorrect);

    if (isCorrect) {
      setScore(s => s + 1);
      setMascotMsg(randomMessage('correct'));
      setMascotState('happy');
      speak('Correct!');
    } else {
      setMascotMsg(randomMessage('wrong'));
      setMascotState('sad');
      speak('Oops! Try again!');
    }

    setTimeout(() => {
      if (current + 1 >= TOTAL) {
        setDone(true);
      } else {
        setCurrent(c => c + 1);
        setAnswered(null); setCorrect(null);
        setMascotMsg('Does this word start with the letter?');
        setMascotState('idle');
      }
    }, 1200);
  };

  if (done) return <ResultScreen score={score} total={TOTAL} onRetry={init} onHome={() => router.push('/learn-play')} />;
  if (!q) return null;

  const progress = ((current) / TOTAL) * 100;

  return (
    <div className="max-w-sm mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/learn-play')} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <p className="text-[13px] font-bold text-gray-600">Sound Tap 🔤</p>
        <div className="flex items-center gap-1 text-[12px] font-bold text-amber-600">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          {score}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-[11px] text-gray-400 font-semibold -mt-3">Question {current + 1} of {TOTAL}</p>

      {/* Mascot */}
      <div className="flex justify-center">
        <Mascot message={mascotMsg} state={mascotState} size="md" />
      </div>

      {/* Letter display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 text-center">
        <p className="text-[11px] text-blue-500 font-bold uppercase tracking-widest mb-2">The Letter</p>
        <p className="text-[72px] font-extrabold text-blue-600 leading-none">{q.letter}</p>
        <p className="text-[14px] text-blue-400 font-semibold mt-1">says "{q.letter.toLowerCase()}uh"</p>
      </div>

      {/* Word card */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <button
          onClick={() => speak(q.word)}
          className="mb-3 mx-auto w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center hover:bg-blue-100 transition-colors"
        >
          <Volume2 size={16} className="text-blue-500" />
        </button>
        <p className="text-[64px] leading-none mb-3">{q.emoji}</p>
        <p className="text-[28px] font-extrabold text-gray-800 tracking-wide">{q.word}</p>
        <p className="text-[12px] text-gray-400 mt-1">Does it start with <strong className="text-blue-600">{q.letter}</strong>?</p>
      </div>

      {/* YES / NO buttons */}
      <div className="grid grid-cols-2 gap-3">
        {['yes', 'no'].map(choice => {
          let base = 'py-4 rounded-2xl font-extrabold text-[16px] transition-all border-2 ';
          if (answered === null) {
            base += choice === 'yes'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 active:scale-95'
              : 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 active:scale-95';
          } else if (answered === choice) {
            base += correct
              ? 'bg-emerald-400 border-emerald-500 text-white scale-105'
              : 'bg-red-400 border-red-500 text-white';
          } else {
            // Show what was actually correct
            const shouldBeSelected = (choice === 'yes') === q.correct;
            base += shouldBeSelected
              ? 'bg-emerald-100 border-emerald-300 text-emerald-600'
              : 'opacity-40 bg-gray-50 border-gray-200 text-gray-400';
          }
          return (
            <button key={choice} onClick={() => handleAnswer(choice)} className={base}>
              {choice === 'yes' ? '✅ YES' : '❌ NO'}
            </button>
          );
        })}
      </div>

    </div>
  );
}
