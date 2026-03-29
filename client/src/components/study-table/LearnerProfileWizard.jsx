'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Check, Sparkles } from 'lucide-react';

// ─── Reusable primitives ────────────────────────────────────────────────────

function ChipSelect({ options, value = [], onChange, max }) {
  const toggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
    } else {
      if (max && value.length >= max) return;
      onChange([...value, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
            value.includes(opt)
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
          }`}
        >
          {value.includes(opt) && <Check size={10} className="inline mr-1" />}
          {opt}
        </button>
      ))}
    </div>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map(opt => {
        const label = typeof opt === 'object' ? opt.label : opt;
        const val   = typeof opt === 'object' ? opt.value : opt;
        const active = value === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all text-[13px] ${
              active
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              active ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
            }`}>
              {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function NumberedComfort({ label, stateKey, options, data, onChange }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-gray-700 mb-2">{label}</p>
      <div className="space-y-1.5">
        {options.map((opt, i) => {
          const level = i + 1;
          const active = data[stateKey] === level;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ ...data, [stateKey]: level })}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${
                active
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{level}</span>
              <span className="text-[12px]">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step content components ────────────────────────────────────────────────

const SUBJECTS_LIST = [
  'Maths', 'Science', 'English', 'Hindi', 'History', 'Geography',
  'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Social Studies', 'EVS', 'Sanskrit', 'Commerce', 'Economics', 'Other',
];
const BOARDS   = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'];
const CLASSES  = [
  'Nursery / KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12',
  '1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Other',
];

function Step1({ data, onChange }) {
  const isStudent = data.role?.startsWith('Student');
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">Who are you? 👋</p>
        <RadioGroup
          options={['Student (school)', 'Student (college / university)', 'Working professional', 'Parent', 'Other']}
          value={data.role}
          onChange={v => onChange({ ...data, role: v })}
        />
      </div>

      {isStudent && (
        <>
          <div>
            <p className="text-[13px] font-semibold text-gray-700 mb-2">Which class or year are you in?</p>
            <div className="flex flex-wrap gap-2">
              {CLASSES.map(c => (
                <button key={c} type="button"
                  onClick={() => onChange({ ...data, classYear: c })}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                    data.classYear === c
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                  }`}
                >{c}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-gray-700 mb-2">Board / curriculum?</p>
            <div className="flex flex-wrap gap-2">
              {BOARDS.map(b => (
                <button key={b} type="button"
                  onClick={() => onChange({ ...data, board: b })}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                    data.board === b
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                  }`}
                >{b}</button>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">What subjects are you studying? <span className="text-gray-400 font-normal">(pick all that apply)</span></p>
        <ChipSelect
          options={SUBJECTS_LIST}
          value={data.mainSubjects || []}
          onChange={v => onChange({ ...data, mainSubjects: v })}
        />
      </div>
    </div>
  );
}

function Step2({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-1">Which subjects do you ENJOY? 😊</p>
        <ChipSelect options={SUBJECTS_LIST} value={data.enjoySubjects || []} onChange={v => onChange({ ...data, enjoySubjects: v })} />
        <textarea
          value={data.enjoyWhy || ''}
          onChange={e => onChange({ ...data, enjoyWhy: e.target.value })}
          placeholder="(Optional) Why do you enjoy them?"
          className="mt-2 w-full text-[12px] border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 resize-none h-16 transition-colors"
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-1">Which subjects or topics feel difficult or scary? 😰</p>
        <ChipSelect options={SUBJECTS_LIST} value={data.difficultSubjects || []} onChange={v => onChange({ ...data, difficultSubjects: v })} />
        <textarea
          value={data.difficultWhy || ''}
          onChange={e => onChange({ ...data, difficultWhy: e.target.value })}
          placeholder="(Optional) What makes them feel scary or hard?"
          className="mt-2 w-full text-[12px] border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 resize-none h-16 transition-colors"
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">When you think about studies, which feeling is closest?</p>
        <RadioGroup
          options={['Very afraid 😨', 'A bit nervous 😬', 'Okay 😐', 'Excited / happy 😄']}
          value={data.studyFeeling}
          onChange={v => onChange({ ...data, studyFeeling: v })}
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">Have you ever felt embarrassed or scolded about your studies?</p>
        <RadioGroup
          options={['Yes', 'No']}
          value={data.embarrassed}
          onChange={v => onChange({ ...data, embarrassed: v })}
        />
        {data.embarrassed === 'Yes' && (
          <textarea
            value={data.embarrassedNote || ''}
            onChange={e => onChange({ ...data, embarrassedNote: e.target.value })}
            placeholder="You can share more here — this is just between you and your AI tutor, completely optional 💙"
            className="mt-2 w-full text-[12px] border border-blue-200 bg-blue-50/30 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 resize-none h-20 transition-colors"
          />
        )}
      </div>
    </div>
  );
}

function Step3({ data, onChange }) {
  const scales = [
    {
      key: 'readingComfort', label: '📖 Reading comfort',
      options: ['I struggle to read basic words', 'I can read slowly with help', 'I read okay but big texts scare me', 'I read comfortably'],
    },
    {
      key: 'writingComfort', label: '✏️ Writing comfort',
      options: ['I find writing very hard', 'I can write but make many mistakes', 'I write okay but slowly', 'I write confidently'],
    },
    {
      key: 'mathsComfort', label: '🔢 Maths comfort',
      options: ['I find even simple sums difficult', "I'm okay with basic sums, scared of word problems", "I'm comfortable with most topics", 'I enjoy maths and find it fun'],
    },
    {
      key: 'englishComfort', label: '🌍 English / second language comfort',
      options: ['I struggle with basic words and sentences', "I can read but don't always understand", 'I understand but fear grammar / writing', "I'm comfortable in English"],
    },
  ];

  return (
    <div className="space-y-5">
      {scales.map(s => (
        <NumberedComfort key={s.key} label={s.label} stateKey={s.key} options={s.options} data={data} onChange={onChange} />
      ))}
    </div>
  );
}

function Step4({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">How many days a week do you study seriously outside school?</p>
        <div className="flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
            <button key={d} type="button"
              onClick={() => onChange({ ...data, studyDays: d })}
              className={`w-10 h-10 rounded-full font-bold text-[13px] border transition-all ${
                data.studyDays === d
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >{d}</button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-1">0 = not at all, 7 = every day</p>
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">How long can you focus before feeling tired?</p>
        <RadioGroup
          options={['5–10 minutes', '15–25 minutes', '30–45 minutes', 'More than 45 minutes']}
          value={data.focusDuration}
          onChange={v => onChange({ ...data, focusDuration: v })}
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">Where do you usually study?</p>
        <RadioGroup
          options={['Home (quiet room)', 'Home (noisy environment)', 'Library / tuition center', 'Other']}
          value={data.studyLocation}
          onChange={v => onChange({ ...data, studyLocation: v })}
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">Do you usually study alone or with others?</p>
        <RadioGroup
          options={['Alone', 'With family', 'With friends / classmates']}
          value={data.studyWith}
          onChange={v => onChange({ ...data, studyWith: v })}
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">What helps you understand best? <span className="text-gray-400 font-normal">(pick all that apply)</span></p>
        <ChipSelect
          options={['Pictures and diagrams', 'Real life examples and stories', 'Step-by-step instructions', 'Short videos / animations', 'Practice questions']}
          value={data.learningStyle || []}
          onChange={v => onChange({ ...data, learningStyle: v })}
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">Which language should the AI tutor use?</p>
        <RadioGroup
          options={['English', 'Hindi', 'Hinglish (mix of Hindi + English)', 'Other']}
          value={data.tutorLanguage}
          onChange={v => onChange({ ...data, tutorLanguage: v })}
        />
        {data.tutorLanguage === 'Other' && (
          <input type="text"
            placeholder="Type your preferred language..."
            value={data.tutorLanguageOther || ''}
            onChange={e => onChange({ ...data, tutorLanguageOther: e.target.value })}
            className="mt-2 w-full text-[12px] border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400"
          />
        )}
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">How do you like explanations to be?</p>
        <RadioGroup
          options={['Very short — just the key points', 'Medium — clear and balanced', 'Detailed with many examples']}
          value={data.explanationStyle}
          onChange={v => onChange({ ...data, explanationStyle: v })}
        />
      </div>
    </div>
  );
}

function Step5({ data, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">What is your main goal right now?</p>
        <RadioGroup
          options={['Pass my class / exams', 'Score high marks in board exams', 'Improve my reading and writing', 'Prepare for entrance exams (JEE, NEET, etc.)', 'Learn for career or personal growth']}
          value={data.mainGoal}
          onChange={v => onChange({ ...data, mainGoal: v })}
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-1">What result this year would make you feel truly proud? ⭐</p>
        <input
          type="text"
          placeholder="e.g. Score 80% in Maths, understand Science without fear, get into college..."
          value={data.proudResult || ''}
          onChange={e => onChange({ ...data, proudResult: e.target.value })}
          className="w-full text-[12px] border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">Do you use any support tools while studying?</p>
        <ChipSelect
          options={['Bigger text / reading glasses', 'Text-to-speech (listening instead of reading)', 'Someone reads to me', 'None / Not sure']}
          value={data.supportTools || []}
          onChange={v => onChange({ ...data, supportTools: v })}
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">Is it okay if the AI suggests a short breathing break when you seem stuck for a long time?</p>
        <RadioGroup
          options={['Yes — that would help!', "No — I'll manage on my own"]}
          value={data.okBreaks === true ? 'Yes — that would help!' : data.okBreaks === false ? "No — I'll manage on my own" : undefined}
          onChange={v => onChange({ ...data, okBreaks: v.startsWith('Yes') })}
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">Who can see your progress reports?</p>
        <RadioGroup
          options={['Only me', 'Me + my parent', 'Me + my teacher', 'Me + both parent and teacher']}
          value={data.progressSharing}
          onChange={v => onChange({ ...data, progressSharing: v })}
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-2">If I notice you&apos;re stuck on a topic repeatedly, can I suggest talking to a real teacher or parent?</p>
        <RadioGroup
          options={['Yes — that sounds helpful', 'No — please keep it between us']}
          value={data.suggestHuman === true ? 'Yes — that sounds helpful' : data.suggestHuman === false ? 'No — please keep it between us' : undefined}
          onChange={v => onChange({ ...data, suggestHuman: v.startsWith('Yes') })}
        />
      </div>

      <div>
        <p className="text-[13px] font-semibold text-gray-700 mb-1">Is there anything you want me to NEVER do? <span className="text-gray-400 font-normal">(optional)</span></p>
        <input
          type="text"
          placeholder={`e.g. "Don't compare me with others", "Don't use scary words", "Don't rush me"...`}
          value={data.neverDo || ''}
          onChange={e => onChange({ ...data, neverDo: e.target.value })}
          className="w-full text-[12px] border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
        />
      </div>
    </div>
  );
}

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS = [
  {
    label: 'About You', icon: '👋',
    component: Step1,
    validate: d => !!d.role && (d.mainSubjects?.length > 0),
    hint: 'Tell me who you are and what you study.',
  },
  {
    label: 'Likes & Fears', icon: '💙',
    component: Step2,
    validate: d => !!d.studyFeeling,
    hint: 'Your feelings about subjects matter — they help me teach you better.',
  },
  {
    label: 'Your Skills', icon: '💪',
    component: Step3,
    validate: d => !!d.readingComfort && !!d.writingComfort && !!d.mathsComfort && !!d.englishComfort,
    hint: 'Be honest — there are no wrong answers here!',
  },
  {
    label: 'How You Learn', icon: '📚',
    component: Step4,
    validate: d => !!d.tutorLanguage && !!d.explanationStyle,
    hint: 'Help me explain things in the way that works best for you.',
  },
  {
    label: 'Goals', icon: '🎯',
    component: Step5,
    validate: d => !!d.mainGoal,
    hint: 'Almost done! Tell me your goals and how you want me to behave.',
  },
];

const INITIAL_DATA = {
  role: '', classYear: '', board: '', mainSubjects: [],
  enjoySubjects: [], enjoyWhy: '', difficultSubjects: [], difficultWhy: '',
  studyFeeling: '', embarrassed: '', embarrassedNote: '',
  readingComfort: null, writingComfort: null, mathsComfort: null, englishComfort: null,
  studyDays: null, focusDuration: '', studyLocation: '', studyWith: '',
  learningStyle: [], tutorLanguage: '', tutorLanguageOther: '', explanationStyle: '',
  mainGoal: '', proudResult: '', supportTools: [],
  okBreaks: null, progressSharing: '', suggestHuman: null, neverDo: '',
};

// ─── Wizard shell ────────────────────────────────────────────────────────────

export default function LearnerProfileWizard({ onComplete, onClose }) {
  const [step, setStep]   = useState(0);
  const [data, setData]   = useState(INITIAL_DATA);
  const [error, setError] = useState('');

  const { component: StepComponent, validate, hint } = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const pct    = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (!validate(data)) {
      setError('Please answer the required questions before continuing.');
      return;
    }
    setError('');
    if (isLast) {
      // TODO: POST /api/ai-study/learner-profile to save data to backend
      onComplete(data);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleChange = (d) => { setData(d); setError(''); };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-scale-in">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{STEPS[step].icon}</span>
              <div>
                <h2 className="text-[15px] font-bold text-gray-800">My Study Profile</h2>
                <p className="text-[11px] text-gray-400">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {/* Step labels (desktop only) */}
          <div className="hidden sm:flex justify-between mt-1.5">
            {STEPS.map((s, i) => (
              <span key={i} className={`text-[9px] font-semibold ${i <= step ? 'text-blue-600' : 'text-gray-300'}`}>
                {s.label}
              </span>
            ))}
          </div>

          {/* Hint */}
          {hint && (
            <p className="text-[12px] text-blue-600/80 mt-2 leading-snug">{hint}</p>
          )}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <StepComponent data={data} onChange={handleChange} />
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
          {error && (
            <p className="text-red-500 text-[12px] mb-2.5">⚠️ {error}</p>
          )}
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => { setStep(s => s - 1); setError(''); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-medium hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[13px] font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              {isLast ? (
                <><Sparkles size={14} /> Finish &amp; Start My Study Table</>
              ) : (
                <>Next <ChevronRight size={14} /></>
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2.5 leading-snug">
            Your answers help me teach you better — they are never used to judge or grade you. 💙
          </p>
        </div>
      </div>
    </div>
  );
}
