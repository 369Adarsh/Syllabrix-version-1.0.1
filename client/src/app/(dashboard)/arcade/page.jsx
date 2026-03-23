'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Gamepad2, Trophy, Flame, Star, Zap, Brain, BookOpen, Palette,
  Calculator, Globe, Code, Timer, Target, ArrowRight, ArrowLeft,
  Crown, Medal, Sparkles, Check, X, RotateCcw, Play
} from 'lucide-react';
import toast from 'react-hot-toast';

// ═══ GAME DEFINITIONS ═══
const ZONES = [
  {
    id: 'maths', name: 'Maths Zone', emoji: '🧮', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50',
    games: [
      { id: 'math-sprint', name: 'Math Sprint', desc: 'Solve as many as you can in 60s', emoji: '⚡', difficulty: 'easy' },
      { id: 'times-table', name: 'Times Table Champion', desc: 'Master multiplication tables', emoji: '✖️', difficulty: 'easy' },
      { id: 'fraction-fighter', name: 'Fraction Fighter', desc: 'Compare and simplify fractions', emoji: '🥧', difficulty: 'medium' },
      { id: 'number-ninja', name: 'Number Ninja', desc: 'Find the missing number in sequences', emoji: '🥷', difficulty: 'medium' },
    ],
  },
  {
    id: 'language', name: 'Language Zone', emoji: '📖', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50',
    games: [
      { id: 'word-wizard', name: 'Word Wizard', desc: 'Build words from scrambled letters', emoji: '🪄', difficulty: 'easy' },
      { id: 'grammar-guard', name: 'Grammar Guardian', desc: 'Fix the grammar errors', emoji: '🛡️', difficulty: 'medium' },
      { id: 'spelling-bee', name: 'Spelling Bee', desc: 'Spell increasingly difficult words', emoji: '🐝', difficulty: 'medium' },
    ],
  },
  {
    id: 'logic', name: 'Logic Zone', emoji: '🧩', color: 'from-purple-500 to-fuchsia-600', bg: 'bg-purple-50',
    games: [
      { id: 'pattern-master', name: 'Pattern Master', desc: 'Find the next in the pattern', emoji: '🔮', difficulty: 'medium' },
      { id: 'memory-matrix', name: 'Memory Matrix', desc: 'Remember and recreate the grid', emoji: '🧠', difficulty: 'hard' },
      { id: 'code-blocks', name: 'Code Blocks', desc: 'Arrange logic blocks to solve puzzles', emoji: '💻', difficulty: 'hard' },
    ],
  },
  {
    id: 'knowledge', name: 'Knowledge Zone', emoji: '🌍', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50',
    games: [
      { id: 'quiz-rush', name: 'Quiz Rush', desc: 'GK questions with a timer', emoji: '❓', difficulty: 'easy' },
      { id: 'map-explorer', name: 'Map Explorer', desc: 'Identify countries and capitals', emoji: '🗺️', difficulty: 'medium' },
    ],
  },
  {
    id: 'creative', name: 'Creative Zone', emoji: '🎨', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50',
    games: [
      { id: 'story-builder', name: 'Story Builder', desc: 'Build stories word by word', emoji: '📝', difficulty: 'easy' },
      { id: 'design-studio', name: 'Design Studio', desc: 'Create patterns and art', emoji: '🎭', difficulty: 'easy' },
    ],
  },
];

const DIFF_COLORS = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

// ═══ MATH SPRINT GAME ═══
function MathSprintGame({ onExit }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [xp, setXp] = useState(0);
  const inputRef = useRef(null);

  const newQuestion = useCallback(() => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b;
    if (op === '×') { a = 2 + Math.floor(Math.random() * 10); b = 2 + Math.floor(Math.random() * 10); }
    else { a = 10 + Math.floor(Math.random() * 90); b = 1 + Math.floor(Math.random() * a); }
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    setQuestion({ a, b, op, answer: ans });
    setAnswer('');
  }, []);

  useEffect(() => { newQuestion(); }, [newQuestion]);

  useEffect(() => {
    if (gameOver || timeLeft <= 0) { setGameOver(true); setXp(score * 2 + streak * 5); return; }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver, score, streak]);

  useEffect(() => { if (!gameOver) inputRef.current?.focus(); }, [question, gameOver]);

  const checkAnswer = () => {
    if (parseInt(answer) === question.answer) {
      setScore(s => s + 1); setStreak(s => s + 1); newQuestion();
    } else { setStreak(0); newQuestion(); }
  };

  if (gameOver) return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg"><Trophy size={36} className="text-white" /></div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Game Over!</h2>
      <p className="text-3xl font-extrabold text-blue-600">{score} correct</p>
      <p className="text-sm text-gray-400 mt-1">Best streak: {streak} · XP earned: {xp}</p>
      <div className="flex justify-center gap-3 mt-6">
        <button onClick={() => { setScore(0); setTimeLeft(60); setStreak(0); setGameOver(false); newQuestion(); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"><RotateCcw size={14} /> Play Again</button>
        <button onClick={onExit} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600">Back to Arcade</button>
      </div>
    </div>
  );

  return (
    <div className="text-center">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2"><Star size={16} className="text-amber-500" /><span className="font-bold text-gray-800">{score}</span></div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'} font-bold text-sm`}>
          <Timer size={14} /> {timeLeft}s
        </div>
        {streak >= 3 && <div className="flex items-center gap-1 text-orange-500 font-bold text-sm"><Flame size={14} /> {streak}🔥</div>}
      </div>
      <div className="bg-gray-50 rounded-2xl p-8 mb-6">
        <p className="text-4xl font-extrabold text-gray-900">{question?.a} {question?.op} {question?.b} = ?</p>
      </div>
      <input ref={inputRef} type="number" value={answer} onChange={e => setAnswer(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && checkAnswer()}
        className="w-40 px-6 py-3 text-center text-2xl font-bold bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 mx-auto" autoFocus />
      <div className="mt-4">
        <button onClick={checkAnswer} disabled={!answer}
          className="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md disabled:opacity-40">Submit</button>
      </div>
    </div>
  );
}

// ═══ MEMORY MATRIX GAME ═══
function MemoryMatrixGame({ onExit }) {
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState([]);
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [phase, setPhase] = useState('show'); // show | input | result
  const [score, setScore] = useState(0);
  const size = Math.min(3 + level, 6);

  const generatePattern = useCallback(() => {
    const count = 2 + level;
    const cells = [];
    while (cells.length < count) {
      const idx = Math.floor(Math.random() * size * size);
      if (!cells.includes(idx)) cells.push(idx);
    }
    return cells;
  }, [level, size]);

  useEffect(() => {
    const p = generatePattern();
    setPattern(p); setUserPattern([]); setPhase('show');
    setGrid(Array(size * size).fill(false));
    const t = setTimeout(() => setPhase('input'), 1500 + level * 300);
    return () => clearTimeout(t);
  }, [level, generatePattern, size]);

  const handleClick = (idx) => {
    if (phase !== 'input' || userPattern.includes(idx)) return;
    const next = [...userPattern, idx];
    setUserPattern(next);
    if (next.length === pattern.length) {
      const correct = pattern.every(p => next.includes(p));
      if (correct) { setScore(s => s + level * 10); setPhase('result'); setTimeout(() => setLevel(l => l + 1), 1000); }
      else { setPhase('result'); }
    }
  };

  const isCorrect = phase === 'result' && pattern.every(p => userPattern.includes(p));

  return (
    <div className="text-center">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-600">Level {level}</span>
        <span className="flex items-center gap-1 text-sm font-bold text-amber-600"><Star size={14} /> {score} XP</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">{phase === 'show' ? 'Memorize the pattern...' : phase === 'input' ? 'Tap the highlighted cells!' : isCorrect ? '✓ Correct!' : '✗ Wrong pattern'}</p>
      <div className="inline-grid gap-2 mx-auto mb-6" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {Array(size * size).fill(0).map((_, i) => {
          const isPatternCell = pattern.includes(i);
          const isUserCell = userPattern.includes(i);
          let bg = 'bg-gray-100 hover:bg-gray-200';
          if (phase === 'show' && isPatternCell) bg = 'bg-indigo-500 scale-95';
          else if (phase === 'input' && isUserCell) bg = isPatternCell ? 'bg-emerald-500' : 'bg-red-400';
          else if (phase === 'result' && isPatternCell) bg = isUserCell ? 'bg-emerald-500' : 'bg-red-300';
          else if (phase === 'result' && isUserCell && !isPatternCell) bg = 'bg-red-400';
          return <button key={i} onClick={() => handleClick(i)} className={`w-12 h-12 rounded-xl transition-all duration-200 ${bg}`} disabled={phase !== 'input'} />;
        })}
      </div>
      {phase === 'result' && !isCorrect && (
        <div className="space-y-3">
          <p className="text-sm text-red-500 font-semibold">Game Over! Score: {score} XP</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => { setLevel(1); setScore(0); }} className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white"><RotateCcw size={14} className="inline mr-1" /> Retry</button>
            <button onClick={onExit} className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600">Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ QUIZ RUSH GAME ═══
function QuizRushGame({ onExit }) {
  const GK = [
    { q: 'Capital of Australia?', o: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], a: 2 },
    { q: 'Which planet is known as the Red Planet?', o: ['Venus', 'Mars', 'Jupiter', 'Saturn'], a: 1 },
    { q: 'Who wrote the Indian national anthem?', o: ['Bankim Chandra', 'Rabindranath Tagore', 'Mahatma Gandhi', 'Sarojini Naidu'], a: 1 },
    { q: 'Which element has the symbol "Au"?', o: ['Silver', 'Gold', 'Aluminum', 'Argon'], a: 1 },
    { q: 'Largest bone in the human body?', o: ['Tibia', 'Humerus', 'Femur', 'Spine'], a: 2 },
    { q: 'Which river is the longest in India?', o: ['Yamuna', 'Ganga', 'Godavari', 'Brahmaputra'], a: 1 },
    { q: 'How many states are in India?', o: ['28', '29', '30', '27'], a: 0 },
    { q: 'Who painted the Mona Lisa?', o: ['Picasso', 'Da Vinci', 'Van Gogh', 'Monet'], a: 1 },
    { q: 'Speed of light is approximately?', o: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], a: 1 },
    { q: 'Which gas do plants absorb?', o: ['Oxygen', 'Nitrogen', 'CO₂', 'Hydrogen'], a: 2 },
  ];
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done || selected !== null) return;
    if (timeLeft <= 0) { setSelected(-1); setTimeout(next, 1200); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done, selected]);

  const pick = (oi) => {
    if (selected !== null) return;
    setSelected(oi);
    if (oi === GK[idx].a) setScore(s => s + 1);
    setTimeout(next, 1200);
  };

  const next = () => {
    if (idx >= GK.length - 1) { setDone(true); return; }
    setIdx(i => i + 1); setSelected(null); setTimeLeft(15);
  };

  if (done) return (
    <div className="text-center py-8">
      <Trophy size={36} className="text-amber-500 mx-auto mb-3" />
      <h2 className="text-2xl font-extrabold">{score}/{GK.length}</h2>
      <p className="text-sm text-gray-400 mt-1">{score >= 8 ? '🎉 Brilliant!' : score >= 5 ? '💪 Good job!' : '📚 Keep learning!'}</p>
      <div className="flex justify-center gap-3 mt-5">
        <button onClick={() => { setIdx(0); setScore(0); setSelected(null); setTimeLeft(15); setDone(false); }}
          className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white"><RotateCcw size={14} className="inline mr-1" /> Retry</button>
        <button onClick={onExit} className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600">Exit</button>
      </div>
    </div>
  );

  const q = GK[idx];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-500">{idx + 1}/{GK.length}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>{timeLeft}s</span>
        <span className="text-xs font-bold text-amber-600">{score} pts</span>
      </div>
      <p className="text-lg font-bold text-gray-800 mb-5 text-center">{q.q}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.o.map((o, oi) => {
          let style = 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300';
          if (selected !== null) {
            if (oi === q.a) style = 'bg-emerald-100 border-emerald-400 text-emerald-800';
            else if (oi === selected) style = 'bg-red-100 border-red-400 text-red-800';
          }
          return <button key={oi} onClick={() => pick(oi)} disabled={selected !== null}
            className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${style}`}>{o}</button>;
        })}
      </div>
    </div>
  );
}

// ═══ WORD WIZARD GAME ═══
function WordWizardGame({ onExit }) {
  const WORDS = ['ELEPHANT', 'COMPUTER', 'MOUNTAIN', 'DINOSAUR', 'UMBRELLA', 'BUTTERFLY', 'TRIANGLE', 'CALENDAR', 'LANGUAGE', 'PRACTICE'];
  const [wordIdx, setWordIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const scramble = useCallback((w) => {
    const arr = w.split('');
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr.join('') === w ? scramble(w) : arr.join('');
  }, []);

  useEffect(() => { setScrambled(scramble(WORDS[wordIdx])); setGuess(''); setFeedback(''); }, [wordIdx, scramble]);

  const check = () => {
    if (guess.toUpperCase() === WORDS[wordIdx]) {
      setScore(s => s + 1); setFeedback('correct');
      setTimeout(() => { if (wordIdx < WORDS.length - 1) setWordIdx(i => i + 1); else setFeedback('done'); }, 800);
    } else { setFeedback('wrong'); }
  };

  if (feedback === 'done') return (
    <div className="text-center py-8">
      <Trophy size={36} className="text-amber-500 mx-auto mb-3" />
      <h2 className="text-2xl font-extrabold">{score}/{WORDS.length}</h2>
      <div className="flex justify-center gap-3 mt-5">
        <button onClick={() => { setWordIdx(0); setScore(0); }} className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white"><RotateCcw size={14} className="inline mr-1" /> Retry</button>
        <button onClick={onExit} className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600">Exit</button>
      </div>
    </div>
  );

  return (
    <div className="text-center">
      <div className="flex justify-between mb-4">
        <span className="text-xs font-bold text-gray-500">{wordIdx + 1}/{WORDS.length}</span>
        <span className="text-xs font-bold text-amber-600">{score} pts</span>
      </div>
      <p className="text-xs text-gray-400 mb-2">Unscramble the word:</p>
      <div className="flex justify-center gap-1.5 mb-6">
        {scrambled.split('').map((c, i) => (
          <span key={i} className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold text-lg flex items-center justify-center">{c}</span>
        ))}
      </div>
      <input value={guess} onChange={e => setGuess(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && check()}
        className="w-48 px-4 py-3 text-center text-lg font-bold bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 mx-auto uppercase" placeholder="Type here..." />
      {feedback === 'wrong' && <p className="text-red-500 text-xs font-semibold mt-2">Try again!</p>}
      {feedback === 'correct' && <p className="text-emerald-500 text-xs font-semibold mt-2">✓ Correct!</p>}
      <div className="mt-4">
        <button onClick={check} className="px-8 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white">Check</button>
      </div>
    </div>
  );
}

const GAME_COMPONENTS = {
  'math-sprint': MathSprintGame,
  'memory-matrix': MemoryMatrixGame,
  'quiz-rush': QuizRushGame,
  'word-wizard': WordWizardGame,
};

// ═══ MAIN ARCADE PAGE ═══
export default function ArcadePage() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState(null);
  const [totalXP, setTotalXP] = useState(0);

  const GameComponent = activeGame ? GAME_COMPONENTS[activeGame.id] : null;

  if (GameComponent) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className={`p-4 bg-gradient-to-r ${activeGame.zone?.color || 'from-blue-500 to-indigo-600'} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveGame(null)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"><ArrowLeft size={14} className="text-white" /></button>
              <span className="text-lg">{activeGame.emoji}</span>
              <h2 className="font-bold text-white text-sm">{activeGame.name}</h2>
            </div>
          </div>
          <div className="p-6"><GameComponent onExit={() => setActiveGame(null)} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500/15 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-44 h-44 bg-purple-400/15 rounded-full translate-y-1/2" />
        <div className="absolute top-5 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        <div className="absolute top-10 right-20 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎮</div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
            <Gamepad2 size={24} className="text-purple-200" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Syllabrix Arcade</h1>
            <p className="text-purple-300/70 text-sm mt-0.5">15 educational games — learn while you play, earn XP!</p>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-center backdrop-blur-sm">
            <Zap size={16} className="text-yellow-400 mx-auto" />
            <p className="text-lg font-extrabold text-white mt-0.5">{totalXP}</p>
            <p className="text-[9px] text-purple-300/60 uppercase tracking-wider">Total XP</p>
          </div>
        </div>
      </div>

      {/* Game Zones */}
      {ZONES.map(zone => (
        <div key={zone.id}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{zone.emoji}</span>
            <h2 className="font-bold text-gray-800 text-sm">{zone.name}</h2>
            <span className="text-[10px] text-gray-400">{zone.games.length} games</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {zone.games.map(game => {
              const playable = !!GAME_COMPONENTS[game.id];
              return (
                <button key={game.id}
                  onClick={() => playable ? setActiveGame({ ...game, zone }) : toast('Coming soon!')}
                  className={`text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm transition-all group ${playable ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : 'opacity-70'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{game.emoji}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${DIFF_COLORS[game.difficulty]}`}>{game.difficulty}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm group-hover:text-purple-600 transition-colors">{game.name}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{game.desc}</p>
                  <div className="flex items-center gap-1 mt-2.5 text-[10px] font-semibold text-purple-500">
                    {playable ? <><Play size={10} /> Play Now</> : <><Timer size={10} /> Coming Soon</>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
