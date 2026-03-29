'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, TrendingUp, Trophy, Zap, Smile, Meh, Frown, X, Maximize2 } from 'lucide-react';
import TutorAvatar from './TutorAvatar';

const MOODS = [
  { icon: Frown,  label: 'Struggling', color: 'text-red-400',    bg: 'bg-red-50',     border: 'border-red-200' },
  { icon: Meh,   label: 'Okay',       color: 'text-amber-400',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  { icon: Smile, label: 'Great!',     color: 'text-emerald-400', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

// TODO: buildInitialMessage will be replaced by Gemini personalisation call
const buildInitialMessage = (profile) => {
  if (!profile) return "Hi! I'm your AI Study Buddy 👋 Ask me anything — no question is too small!";
  const name = profile.name?.split(' ')[0];
  const fear = profile.difficultSubjects?.[0];
  const lang = profile.tutorLanguage;
  if (fear) return `Hi${name ? ` ${name}` : ''}! 👋 I know ${fear} can feel tricky — but we'll go slowly and use examples.`;
  if (lang && lang !== 'English') return `Hi${name ? ` ${name}` : ''}! Ready to learn in ${lang}? Ask me anything! 🚀`;
  return `Hi${name ? ` ${name}` : ''}! 👋 Ask me anything about today's topic, or just say if something feels confusing!`;
};

export default function StudySidebarRight({ learnerProfile, tutorMessage, tutorMood = 'idle' }) {
  const [messages,      setMessages]      = useState(() => [{ role: 'tutor', text: buildInitialMessage(learnerProfile) }]);
  const [input,         setInput]         = useState('');
  const [mood,          setMood]          = useState(null);
  const [chatExpanded,  setChatExpanded]  = useState(false);
  const bottomRef = useRef(null);
  const prevTutorMsg = useRef('');

  const language = learnerProfile?.tutorLanguage || 'English';
  const okBreaks = learnerProfile?.okBreaks;

  // ── Inject proactive tutor messages into the chat ──────────────────────
  useEffect(() => {
    if (tutorMessage && tutorMessage !== prevTutorMsg.current) {
      prevTutorMsg.current = tutorMessage;
      setMessages(prev => [...prev, { role: 'tutor', text: tutorMessage }]);
    }
  }, [tutorMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input.trim() };
    // TODO: Call Gemini API:
    // const reply = await gemini.chat({ message: input, learnerProfile, history: messages });
    const stub = {
      role: 'tutor',
      text: `Great question! 😊 (AI response in ${language} will appear here once Gemini is connected.) Keep going — you're doing amazing! ⭐`,
    };
    setMessages(prev => [...prev, userMsg, stub]);
    setInput('');
  };

  // Map learner mood selection to a tutor mood response
  const moodToTutorMood = (m) => {
    if (m === 'Struggling') return 'concerned';
    if (m === 'Great!') return 'happy';
    return 'idle';
  };

  const activeTutorMood = mood ? moodToTutorMood(mood) : tutorMood;

  const chatUI = (fullScreen = false) => (
    <>
      <div className={`overflow-y-auto space-y-2 ${fullScreen ? 'flex-1 px-4 py-4' : 'max-h-[220px] px-3 py-2'}`}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] px-3 py-2 text-[12px] leading-snug ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                : 'bg-white/10 text-white/85 rounded-2xl rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {/* Empty state */}
        {messages.length === 0 && (
          <p className="text-white/30 text-[12px] text-center py-4">No messages yet. Say hello! 👋</p>
        )}
        <div ref={bottomRef} />
      </div>
      <div className={`flex items-center gap-2 border-t border-white/10 ${fullScreen ? 'px-4 pb-6 pt-3' : 'px-3 pb-3 pt-1'}`}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask anything..."
          className="flex-1 bg-white/10 text-white placeholder-white/30 rounded-2xl px-3 py-2 text-[12px] outline-none border border-white/10 focus:border-blue-500/60 focus:bg-white/15 transition-all"
        />
        <button
          onClick={sendMessage}
          className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center hover:bg-blue-500 hover:scale-105 active:scale-95 flex-shrink-0 transition-all"
        >
          <Send size={13} className="text-white" />
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* ── AI Chat ── */}
      <div className="bg-[#0f172a] rounded-2xl border border-[#1e3a5f] overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            {/* TutorAvatar in chat header — reacts to mood */}
            <TutorAvatar mood={activeTutorMood} size={32} />
            <div>
              <p className="text-white text-[12px] font-bold leading-none">AI Study Buddy</p>
              {language !== 'English' && (
                <span className="text-[9px] text-blue-400 font-medium">{language}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setChatExpanded(true)}
            className="text-white/30 hover:text-white/70 transition-colors"
            title="Expand chat"
          >
            <Maximize2 size={13} />
          </button>
        </div>
        {chatUI(false)}
      </div>

      {/* Full-screen chat */}
      {chatExpanded && (
        <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <TutorAvatar mood={activeTutorMood} size={40} />
              <div>
                <p className="text-white font-bold text-[15px]">AI Study Buddy</p>
                {language !== 'English' && <p className="text-blue-400 text-[11px]">{language}</p>}
              </div>
            </div>
            <button onClick={() => setChatExpanded(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
          </div>
          {chatUI(true)}
        </div>
      )}

      {/* ── Mood Check ── */}
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] border border-gray-200/60 p-4 hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)] transition-shadow duration-300">
        <p className="text-[12px] font-bold text-gray-700 mb-2.5">How are you feeling right now?</p>
        <div className="flex gap-2">
          {MOODS.map(m => (
            <button
              key={m.label}
              onClick={() => setMood(prev => prev === m.label ? null : m.label)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl border transition-all hover:scale-[1.03] active:scale-95 ${
                mood === m.label
                  ? `${m.bg} ${m.border} ${m.color} shadow-sm`
                  : 'border-gray-200 text-gray-400 hover:bg-gray-50'
              }`}
            >
              <m.icon size={18} />
              <span className="text-[10px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>
        {mood === 'Struggling' && okBreaks && (
          <div className="mt-2.5 bg-purple-50 border border-purple-200/60 rounded-2xl px-3 py-2.5 animate-fade-in">
            <p className="text-purple-700 text-[11px] font-medium leading-snug">
              🌿 Take a quick breath — in for 4 counts, hold for 2, out for 6. You&apos;ve got this!
            </p>
          </div>
        )}
        {mood === 'Struggling' && !okBreaks && (
          <p className="text-[11px] text-gray-400 mt-2 animate-fade-in">
            It&apos;s okay to find things hard. Ask me and we&apos;ll work through it together! 💙
          </p>
        )}
        {mood === null && (
          <p className="text-[11px] text-gray-400 mt-2 italic">Your tutor responds to how you feel 💙</p>
        )}
        {/* TODO: Mood influences Gemini's response tone, pacing, and break suggestions */}
      </div>

      {/* ── Progress ── */}
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] border border-gray-200/60 p-4 hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)] transition-shadow duration-300">
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp size={13} className="text-blue-500" />
          <p className="text-[12px] font-bold text-gray-700">This Week&apos;s Progress</p>
        </div>
        {/* TODO: Fetch from backend: GET /api/ai-study/progress */}
        <div className="space-y-3">
          {[
            { label: 'Maths',   pct: 68, color: 'bg-blue-500' },
            { label: 'Science', pct: 45, color: 'bg-emerald-500' },
            { label: 'English', pct: 82, color: 'bg-purple-500' },
          ].map(p => (
            <div key={p.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-gray-600">{p.label}</span>
                <span className="text-[11px] font-semibold text-gray-700">{p.pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${p.color} rounded-full transition-all duration-700`} style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        {/* Empty state */}
        {false && <p className="text-[12px] text-gray-400 text-center py-2">No progress data yet. Start a session! 🚀</p>}
      </div>

      {/* ── Streaks & Badges ── */}
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] border border-gray-200/60 p-4 hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)] transition-shadow duration-300">
        <div className="flex items-center gap-1.5 mb-3">
          <Trophy size={13} className="text-amber-500" />
          <p className="text-[12px] font-bold text-gray-700">Streaks &amp; Badges</p>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200/60 rounded-2xl px-3 py-2 hover:scale-105 transition-transform cursor-default">
            <Zap size={14} className="text-orange-500" />
            <span className="text-[16px] font-black text-orange-600">7</span>
            <span className="text-[9px] text-orange-400 font-medium">day streak</span>
          </div>
          <div>
            <p className="text-[13px] font-black text-gray-700">342 XP</p>
            <p className="text-[10px] text-gray-400">this week</p>
          </div>
        </div>
        {/* TODO: Fetch badges from backend: GET /api/badges */}
        <div className="flex gap-2 flex-wrap">
          {[
            { emoji: '🧠', label: 'Quick Learner' },
            { emoji: '🔥', label: '7-day streak' },
            { emoji: '⭐', label: 'Perfect Quiz' },
          ].map(b => (
            <div key={b.label}
              className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl px-2.5 py-1 hover:scale-105 hover:shadow-sm transition-all cursor-default"
            >
              <span className="text-[14px]">{b.emoji}</span>
              <span className="text-[10px] text-gray-600 font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
