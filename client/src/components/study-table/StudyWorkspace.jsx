'use client';
import { useState } from 'react';
import { BookOpen, Dumbbell, RefreshCw, Lightbulb, Sparkles, RotateCcw } from 'lucide-react';
import BlackboardDiagram from './BlackboardDiagram';
import SmartNotesPanel   from './SmartNotesPanel';
import PracticePanel     from './PracticePanel';
import RevisePanel       from './RevisePanel';

const TABS = [
  { id: 'learn',    icon: BookOpen,  label: 'Learn' },
  { id: 'practice', icon: Dumbbell,  label: 'Practice' },
  { id: 'revise',   icon: RefreshCw, label: 'Revise' },
];

// TODO: Replace STUB_EXPLANATION with Gemini call:
// gemini.explain({ subject, topic, learnerProfile }) → { title, paragraphs, keyPoint }
const STUB_EXPLANATION = {
  title: 'Understanding Fractions',
  paragraphs: [
    'A fraction is a way to show part of something whole. Imagine a pizza cut into 4 equal slices — if you eat 1 slice, you ate 1/4 (one quarter) of the pizza.',
    'The bottom number (denominator) tells you how many equal pieces the whole was divided into. The top number (numerator) tells you how many of those pieces you have.',
    "Here's the cool part: you can cut the same pizza into 8 slices instead of 4. Now 2 slices equals the same amount as before — because 2/8 is the same as 1/4. They're called equivalent fractions!",
  ],
  keyPoint: 'Two fractions that look different can show exactly the same portion of the whole.',
};

export default function StudyWorkspace({ topic, subject, sessionActive = false, activeSession, learnerProfile, onWrongAnswer }) {
  const [activeTab, setActiveTab] = useState('learn');

  const fearSubject = learnerProfile?.difficultSubjects?.[0];
  const language    = learnerProfile?.tutorLanguage;
  const exStyle     = learnerProfile?.explanationStyle;
  const personalized = !!learnerProfile;

  // Build contextual nudge based on profile
  let nudge = null;
  if (personalized) {
    if (fearSubject) {
      nudge = `You once told me ${fearSubject} feels a bit scary. Today we'll go step by step — no rushing! 🌱`;
    } else if (language && language !== 'English') {
      nudge = `Explaining in ${language}, as you chose. Let me know if you'd like me to switch.`;
    } else if (exStyle === 'Very short') {
      nudge = 'Keeping explanations short and punchy — just for you.';
    } else if (exStyle === 'Detailed with many examples') {
      nudge = 'Going into full detail with plenty of examples — you asked for it! 📚';
    }
  }

  // Empty state — shown before session starts
  if (!sessionActive) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] border border-gray-200/60 p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[320px] hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)] transition-shadow duration-300">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
          <BookOpen size={28} className="text-blue-500" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-gray-700 mb-1">Your workspace is ready</p>
          <p className="text-[13px] text-gray-400 leading-relaxed max-w-xs">
            Choose a subject and topic above, then hit{' '}
            <span className="font-semibold text-emerald-600">Start Studying</span> to load your
            personalised lesson, diagram, and practice questions.
          </p>
        </div>
        {nudge && (
          <div className="bg-indigo-50 border border-indigo-200/60 rounded-2xl px-4 py-2.5 flex items-start gap-2 max-w-xs text-left">
            <Sparkles size={13} className="text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-indigo-700 text-[12px] leading-snug">{nudge}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Personalization nudge */}
      {nudge && (
        <div className="bg-indigo-950/60 border border-indigo-700/40 rounded-2xl px-4 py-2.5 flex items-start gap-2 animate-fade-in">
          <Sparkles size={13} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-indigo-200 text-[12px] leading-snug">{nudge}</p>
        </div>
      )}

      {/* Tab bar */}
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] border border-gray-200/60 p-1.5 flex gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-[1.02] active:scale-95 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── LEARN tab ── */}
      {activeTab === 'learn' && (
        <div className="space-y-3">
          {/* Explanation card */}
          <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] border border-gray-200/60 p-4 hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)] transition-shadow duration-300 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={13} className="text-blue-600" />
                </div>
                <h3 className="text-[14px] font-bold text-gray-800">{STUB_EXPLANATION.title}</h3>
              </div>
              {/* TODO: "Explain differently" calls Gemini with different style/language */}
              <button className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 font-medium">
                <RotateCcw size={10} /> Re-explain
              </button>
            </div>

            <div className="space-y-3">
              {STUB_EXPLANATION.paragraphs.map((p, i) => (
                <p key={i} className="text-[13px] text-gray-700 leading-relaxed">{p}</p>
              ))}
            </div>

            <div className="mt-3 bg-blue-50 border border-blue-200/60 rounded-lg px-3 py-2.5">
              <p className="text-blue-800 text-[12px] leading-snug">
                <span className="font-bold">Key point: </span>{STUB_EXPLANATION.keyPoint}
              </p>
            </div>
          </div>

          {/* Visual diagram */}
          <BlackboardDiagram />

          {/* Smart notes */}
          <SmartNotesPanel topic={topic} />
        </div>
      )}

      {/* ── PRACTICE tab ── */}
      {activeTab === 'practice' && (
        <PracticePanel learnerProfile={learnerProfile} onWrongAnswer={onWrongAnswer} />
      )}

      {/* ── REVISE tab ── */}
      {activeTab === 'revise' && (
        <RevisePanel learnerProfile={learnerProfile} />
      )}
    </div>
  );
}
