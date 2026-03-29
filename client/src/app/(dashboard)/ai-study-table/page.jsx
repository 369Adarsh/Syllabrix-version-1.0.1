'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles } from 'lucide-react';
import LearnerProfileWizard from '@/components/study-table/LearnerProfileWizard';
import TutorAvatar          from '@/components/study-table/TutorAvatar';
import StudyHeader          from '@/components/study-table/StudyHeader';
import StudySidebarLeft     from '@/components/study-table/StudySidebarLeft';
import StudyWorkspace       from '@/components/study-table/StudyWorkspace';
import StudySidebarRight    from '@/components/study-table/StudySidebarRight';

export default function AIStudyTablePage() {
  const { user } = useAuth();

  // TODO: Replace with real API call:
  // GET /api/ai-study/learner-profile → { completed, profile }
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [learnerProfile,   setLearnerProfile]   = useState(null);

  const [wizardOpen,     setWizardOpen]     = useState(false);
  const [skipped,        setSkipped]        = useState(false);
  const [subject,        setSubject]        = useState('Mathematics');
  const [topic,          setTopic]          = useState('Fractions');
  // activeSession replaces sessionActive boolean — null means no session running
  const [activeSession,  setActiveSession]  = useState(null);

  // ── Tutor personality state ──────────────────────────────────────────────
  // tutorMessage: what the tutor proactively says (speech bubble + chat injection)
  // tutorMood:    which face the avatar renders
  const [tutorMessage, setTutorMessage] = useState('');
  const [tutorMood,    setTutorMood]    = useState('idle');

  const firstName = user?.profile?.full_name?.split(' ')[0] || user?.username || '';

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleProfileComplete = (profileData) => {
    // TODO: POST /api/ai-study/learner-profile to persist to backend
    const enriched = {
      ...profileData,
      name: user?.profile?.full_name || user?.username || '',
    };
    setLearnerProfile(enriched);
    setProfileCompleted(true);
    setWizardOpen(false);

    // Tutor reacts to profile completion — acknowledges fears specifically
    const name = enriched.name?.split(' ')[0];
    const fear = enriched.difficultSubjects?.[0];
    const lang = enriched.tutorLanguage;
    const msg = fear
      ? `Thanks for telling me about your fears${name ? `, ${name}` : ''}! I'll take extra care with ${fear} — we'll always use examples and pictures first. 🌱`
      : lang && lang !== 'English'
      ? `All set${name ? `, ${name}` : ''}! I'll explain in ${lang} throughout. Pick a subject and let's go! 🚀`
      : `I know how you learn now${name ? `, ${name}` : ''}! Pick a subject and topic, then hit Start Studying. ✨`;
    setTutorMessage(msg);
    setTutorMood('celebrating');
  };

  const handleSkip = () => {
    setSkipped(true);
    setTutorMessage("No worries! I'll do my best with general explanations. You can always complete your profile later.");
    setTutorMood('happy');
  };

  const handleSessionStart = (sub, top) => {
    setActiveSession({ subject: sub, topic: top });
    setSubject(sub);
    setTopic(top);

    const fear = learnerProfile?.difficultSubjects;
    const isFearSubject = fear?.some(f => sub.toLowerCase().includes(f.toLowerCase()));

    const msg = isFearSubject
      ? `We'll go slowly with ${top} today, using pictures first. No rushing — just one step at a time! 🌱`
      : `Let's tackle "${top}" in ${sub}! I'll explain it as clearly as I can. Ask me anything! ✨`;

    setTutorMessage(msg);
    setTutorMood('excited');
  };

  const handleSessionStop = () => {
    setActiveSession(null);
    const name = learnerProfile?.name?.split(' ')[0];
    setTutorMessage(`Great session${name ? `, ${name}` : ''}! How are you feeling? Let me know if anything was confusing. 💙`);
    setTutorMood('happy');
  };

  const handleWrongAnswer = () => {
    setTutorMessage("That's okay — many students miss this one. Let me show it with a diagram. 💙");
    setTutorMood('encouraging');
  };

  // The effective profile passed to all components
  // profileCompleted → full personalised profile
  // skipped           → null (generic mode)
  const activeProfile = profileCompleted ? learnerProfile : null;
  const showStudyTable = profileCompleted || skipped;
  const sessionActive = !!activeSession;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F3F4F6] py-4">
      <div className="max-w-6xl mx-auto px-3 md:px-4 lg:px-6 space-y-3">

        {/* ── Reminder banner (skipped but not completed) ── */}
        {skipped && !profileCompleted && (
          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl px-4 py-3 flex items-center gap-3 animate-fade-in">
            <Sparkles size={15} className="text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 text-[12px] font-medium flex-1">
              Your AI tutor works much better with a personalised profile!{' '}
              <button
                onClick={() => setWizardOpen(true)}
                className="underline font-bold hover:text-amber-900 transition-colors"
              >
                Complete your study profile
              </button>{' '}
              — it only takes 2–3 minutes.
            </p>
          </div>
        )}

        {showStudyTable ? (
          /* ── FULL STUDY TABLE ─────────────────────────────────────────── */
          <>
            <StudyHeader
              learnerProfile={activeProfile}
              tutorMessage={tutorMessage}
              tutorMood={tutorMood}
              sessionActive={sessionActive}
              onSubjectChange={setSubject}
              onTopicChange={setTopic}
              onSessionStart={handleSessionStart}
              onSessionStop={handleSessionStop}
            />

            {/*
             * Three-column grid on lg+:
             *   left  (0.75fr) — Plan & Tasks
             *   centre (1.7fr) — Learn / Practice / Revise workspace
             *   right  (0.8fr) — AI chat, mood, progress
             *
             * Mobile: workspace first (order-1), plan accordion second (order-2), right third (order-3)
             */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.7fr)_minmax(0,0.8fr)] gap-3">
              <div className="lg:order-1 order-2">
                <StudySidebarLeft learnerProfile={activeProfile} />
              </div>
              <div className="lg:order-2 order-1">
                <StudyWorkspace
                  topic={topic}
                  subject={subject}
                  sessionActive={sessionActive}
                  activeSession={activeSession}
                  learnerProfile={activeProfile}
                  onWrongAnswer={handleWrongAnswer}
                />
              </div>
              <div className="lg:order-3 order-3">
                <StudySidebarRight
                  learnerProfile={activeProfile}
                  tutorMessage={tutorMessage}
                  tutorMood={tutorMood}
                />
              </div>
            </div>
          </>
        ) : (
          /* ── FRIENDLY GATE ────────────────────────────────────────────── */
          <div className="relative min-h-[440px]">
            {/* Blurred ghost layout behind the gate */}
            <div className="pointer-events-none select-none blur-sm opacity-25 space-y-3" aria-hidden="true">
              <div className="h-24 bg-white rounded-2xl border border-gray-200" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="h-80 bg-white rounded-2xl border border-gray-200" />
                <div className="h-80 bg-white rounded-2xl border border-gray-200" />
                <div className="h-80 bg-white rounded-2xl border border-gray-200" />
              </div>
            </div>

            {/* Gate card */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/80 p-8 max-w-sm w-full text-center animate-scale-in">
                {/* Avatar — wiggle to draw attention on gate */}
                <div className="flex justify-center mb-4">
                  <TutorAvatar mood="happy" size={88} wiggle />
                </div>

                <h2 className="text-[20px] font-black text-gray-800 mb-2">
                  Hi{firstName ? `, ${firstName}` : ''}! 👋
                </h2>

                <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
                  To teach you properly, I need to know a little about{' '}
                  <strong>how you study</strong> and what feels hard.
                  <br /><br />
                  This takes just <strong>2–3 minutes</strong> and will help me explain things
                  in the best way — <em>just for you</em>. 💙
                </p>

                <button
                  onClick={() => setWizardOpen(true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[14px] hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md mb-3"
                >
                  Complete my study profile ✨
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full py-2.5 rounded-2xl border border-gray-200 text-gray-500 text-[13px] font-medium hover:bg-gray-50 hover:border-gray-300 hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  Maybe later — use generic version
                </button>

                <p className="text-[10px] text-gray-400 mt-4 leading-snug">
                  Your answers are only used to help me teach you better —<br />
                  never to judge, grade, or share without your permission.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard modal */}
      {wizardOpen && (
        <LearnerProfileWizard
          onComplete={handleProfileComplete}
          onClose={() => setWizardOpen(false)}
        />
      )}
    </div>
  );
}
