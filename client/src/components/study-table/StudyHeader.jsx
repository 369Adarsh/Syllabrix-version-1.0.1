'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Timer, Target, Play, Pause, RotateCcw, Volume2, VolumeX, BookOpen } from 'lucide-react';
import TutorAvatar, { useSpeech } from './TutorAvatar';

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'Hindi', 'History',
  'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Social Studies', 'EVS', 'Sanskrit', 'Other',
];
const POMODORO_SECS = 25 * 60;

export default function StudyHeader({
  learnerProfile,
  tutorMessage,
  tutorMood = 'idle',
  sessionActive = false,
  onSubjectChange,
  onTopicChange,
  onSessionStart,
  onSessionStop,
}) {
  const [subject,      setSubject]      = useState(learnerProfile?.mainSubjects?.[0] || 'Mathematics');
  const [topic,        setTopic]        = useState('Fractions');
  const [subjectOpen,  setSubjectOpen]  = useState(false);
  const [goal,         setGoal]         = useState('');
  const [editingGoal,  setEditingGoal]  = useState(false);
  const [timerSec,     setTimerSec]     = useState(POMODORO_SECS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [muted,        setMuted]        = useState(false);
  const [avatarBounce, setAvatarBounce] = useState(false);

  const timerRef    = useRef(null);
  const dropdownRef = useRef(null);
  const prevMessage = useRef('');

  const { speak, stop, speaking } = useSpeech(learnerProfile);

  // ── Speak new tutor message whenever it changes ──────────────────────────
  useEffect(() => {
    if (tutorMessage && tutorMessage !== prevMessage.current && !muted) {
      speak(tutorMessage);
      prevMessage.current = tutorMessage;
    }
  }, [tutorMessage, muted, speak]);

  // ── Focus timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSec(s => {
          if (s <= 1) { clearInterval(timerRef.current); setTimerRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // Auto-start timer + bounce avatar when session begins
  useEffect(() => {
    if (sessionActive && !timerRunning) {
      setTimerSec(POMODORO_SECS);
      setTimerRunning(true);
      setAvatarBounce(true);
      setTimeout(() => setAvatarBounce(false), 800);
    }
    if (!sessionActive) {
      setTimerRunning(false);
    }
  }, [sessionActive]); // eslint-disable-line

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (!dropdownRef.current?.contains(e.target)) setSubjectOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const mins       = String(Math.floor(timerSec / 60)).padStart(2, '0');
  const secs       = String(timerSec % 60).padStart(2, '0');
  const timerPct   = ((POMODORO_SECS - timerSec) / POMODORO_SECS) * 100;
  const timerColor = timerSec < 300 ? 'text-red-400' : timerSec < 600 ? 'text-amber-400' : 'text-emerald-400';

  const handleSubject = (s) => { setSubject(s); setSubjectOpen(false); onSubjectChange?.(s); };
  const handleTopic   = (e) => { setTopic(e.target.value); onTopicChange?.(e.target.value); };

  const handleSessionToggle = () => {
    if (sessionActive) {
      onSessionStop?.();
    } else {
      onSessionStart?.(subject, topic);
    }
  };

  const language = learnerProfile?.tutorLanguage;
  const exStyle  = learnerProfile?.explanationStyle;

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] border border-gray-200/60 p-4 hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)] transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">

        {/* ── Avatar + speech bubble ── */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar + voice toggle stacked */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
            <TutorAvatar mood={tutorMood} size={58} speaking={speaking} wiggle={avatarBounce} />
            <button
              onClick={() => muted ? (setMuted(false), speak(tutorMessage)) : (stop(), setMuted(true))}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold transition-all border ${
                muted
                  ? 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
                  : 'bg-blue-50 border-blue-200 text-blue-500 hover:bg-blue-100'
              }`}
              title={muted ? 'Unmute voice' : 'Mute voice'}
            >
              {muted ? <VolumeX size={9} /> : <Volume2 size={9} />}
              {muted ? 'Off' : 'On'}
            </button>
          </div>

          {/* Speech bubble OR fallback greeting */}
          {tutorMessage ? (
            <div
              key={tutorMessage}
              className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/70 rounded-3xl rounded-tl-sm px-4 py-3 flex-1 min-w-0 animate-fade-in"
            >
              {/* Triangle pointer left */}
              <span className="absolute -left-2 top-4 w-3 h-3 bg-blue-50 border-l border-b border-blue-200/70 rotate-45" />
              <p className="text-[13px] text-gray-800 font-medium leading-snug">{tutorMessage}</p>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-gray-800 leading-snug">
                {(() => {
                  const h = new Date().getHours();
                  const name = learnerProfile?.name || '';
                  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
                  return `${greet}${name ? `, ${name}` : ''}! Pick a subject and start learning. ✨`;
                })()}
              </p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {language && language !== 'English' && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200/60 px-2 py-0.5 rounded-full font-medium">
                    Explaining in {language}
                  </span>
                )}
                {exStyle && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200/60 px-2 py-0.5 rounded-full font-medium">
                    {exStyle} style
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSubjectOpen(p => !p)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-700 text-[12px] font-semibold hover:bg-blue-100 transition-colors"
            >
              {subject}
              <ChevronDown size={12} className={`transition-transform duration-200 ${subjectOpen ? 'rotate-180' : ''}`} />
            </button>
            {subjectOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-200 z-30 py-1.5 min-w-[175px] max-h-[280px] overflow-y-auto">
                {SUBJECTS.map(s => (
                  <button key={s} onClick={() => handleSubject(s)}
                    className={`w-full text-left px-4 py-2 text-[12px] hover:bg-blue-50 transition-colors rounded-lg mx-auto ${
                      s === subject ? 'text-blue-600 font-bold' : 'text-gray-700'
                    }`}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Topic input */}
          <input
            value={topic}
            onChange={handleTopic}
            placeholder="Topic / chapter..."
            className="px-3 py-2 rounded-xl border border-gray-200 text-[12px] text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all w-36 sm:w-44"
          />

          {/* Focus timer */}
          <div className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-2 transition-colors ${
            timerRunning ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="relative w-5 h-5 flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90">
                <circle cx="10" cy="10" r="8" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                <circle cx="10" cy="10" r="8" fill="none" stroke="#3b82f6" strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 8}`}
                  strokeDashoffset={`${2 * Math.PI * 8 * (1 - timerPct / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <Timer size={9} className="absolute inset-0 m-auto text-gray-400" />
            </div>
            <span className={`font-mono text-[13px] font-bold tabular-nums ${timerColor}`}>{mins}:{secs}</span>
            <button onClick={() => setTimerRunning(r => !r)} className="text-gray-500 hover:text-blue-600 transition-colors ml-0.5">
              {timerRunning ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button onClick={() => { setTimerRunning(false); setTimerSec(POMODORO_SECS); }} className="text-gray-400 hover:text-gray-600 transition-colors">
              <RotateCcw size={11} />
            </button>
          </div>

          {/* Start / Stop Studying button */}
          <button
            onClick={handleSessionToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-[12px] transition-all duration-200 shadow-sm active:scale-95 ${
              sessionActive
                ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-md'
            }`}
          >
            {sessionActive ? (
              <><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> End Session</>
            ) : (
              <><BookOpen size={13} /> Start {subject} Session</>
            )}
          </button>
        </div>
      </div>

      {/* Session active pill */}
      {sessionActive && (
        <div className="mt-2.5 flex items-center gap-2 animate-fade-in">
          <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full px-3 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Session active · {subject} — {topic}
          </span>
        </div>
      )}

      {/* Today's goal */}
      <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-100">
        <Target size={13} className="text-amber-500 flex-shrink-0" />
        {editingGoal ? (
          <input
            autoFocus
            value={goal}
            onChange={e => setGoal(e.target.value)}
            onBlur={() => setEditingGoal(false)}
            onKeyDown={e => e.key === 'Enter' && setEditingGoal(false)}
            placeholder="What do you want to understand by the end of today? Press Enter to save."
            className="flex-1 text-[12px] text-gray-700 placeholder-gray-400 outline-none border-b border-amber-300 bg-transparent pb-0.5"
          />
        ) : (
          <button onClick={() => setEditingGoal(true)} className="flex-1 text-left text-[12px] transition-colors">
            {goal
              ? <span className="text-gray-700 font-medium">🎯 {goal}</span>
              : <span className="text-gray-400 hover:text-amber-500">Set today&apos;s goal — what do you want to understand by the end? (tap to set)</span>
            }
          </button>
        )}
      </div>
    </div>
  );
}
