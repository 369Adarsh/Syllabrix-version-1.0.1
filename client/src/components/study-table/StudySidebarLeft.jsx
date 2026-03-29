'use client';
import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Calendar, BookOpen, ClipboardList } from 'lucide-react';

// TODO: Fetch from backend: GET /api/ai-study/plan?date=today
const STUB_PLAN = [
  { id: 1, label: "Revise yesterday's notes on fractions", done: true },
  { id: 2, label: 'Study the visual diagram: 1/4 = 2/8',  done: false },
  { id: 3, label: 'Attempt 4 practice questions',          done: false },
  { id: 4, label: 'Create 3 new flashcards',               done: false },
  { id: 5, label: 'Mark progress in tracker',              done: false },
];

// TODO: Fetch from user's timetable: GET /api/ai-study/timetable
const STUB_TIMETABLE = [
  { time: '4:00 PM', subject: 'Maths',   topic: 'Fractions' },
  { time: '5:00 PM', subject: 'Science', topic: 'Photosynthesis' },
  { time: '6:00 PM', subject: 'English', topic: 'Comprehension' },
];

// TODO: Fetch from backend: GET /api/ai-study/tasks
const STUB_TASKS = [
  { id: 1, label: 'Maths worksheet — submit tomorrow', urgent: true },
  { id: 2, label: 'Science chapter 5 reading',         urgent: false },
  { id: 3, label: 'English essay rough draft',         urgent: false },
];

// TODO: Fetch from backend: GET /api/ai-study/resources
const STUB_BOOKS = [
  { label: 'NCERT Maths Class 6',         type: 'textbook' },
  { label: 'RS Aggarwal — Fractions',     type: 'reference' },
  { label: 'Vedic Maths Shortcuts',       type: 'extra' },
];

const TYPE_BADGE = {
  textbook:  'bg-blue-100 text-blue-600',
  reference: 'bg-purple-100 text-purple-600',
  extra:     'bg-amber-100 text-amber-600',
};

function Collapsible({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] border border-gray-200/60 overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-blue-500 flex-shrink-0" />
          <span className="text-[12px] font-bold text-gray-700">{title}</span>
        </div>
        {open
          ? <ChevronUp size={13} className="text-gray-400" />
          : <ChevronDown size={13} className="text-gray-400" />
        }
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

export default function StudySidebarLeft({ learnerProfile }) {
  const [plan, setPlan]           = useState(STUB_PLAN);
  const [mobileOpen, setMobileOpen] = useState(false);

  const done  = plan.filter(t => t.done).length;
  const total = plan.length;
  const pct   = Math.round((done / total) * 100);

  const toggleTask = (id) => setPlan(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const sidebarContent = (
    <div className="space-y-3">
      {/* ── Today's Plan ── */}
      <Collapsible title={`Today's Plan · ${done}/${total}`} icon={CheckCircle2}>
        <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="space-y-2">
          {plan.map(task => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-start gap-2.5 text-left group"
            >
              {task.done
                ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                : <Circle     size={15} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" />
              }
              <span className={`text-[12px] leading-snug ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.label}
              </span>
            </button>
          ))}
        </div>
        {/* TODO: AI will auto-generate today's plan based on topic + learning gaps */}
      </Collapsible>

      {/* ── Timetable ── */}
      <Collapsible title="Today's Timetable" icon={Calendar} defaultOpen={false}>
        <div className="space-y-2">
          {STUB_TIMETABLE.map((slot, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono text-gray-400 w-14 flex-shrink-0">{slot.time}</span>
              <span className="text-[11px] font-semibold text-gray-700">{slot.subject}</span>
              <span className="text-gray-300 text-[10px]">·</span>
              <span className="text-[11px] text-gray-500 truncate">{slot.topic}</span>
            </div>
          ))}
        </div>
        {/* TODO: Timetable will sync with user-defined schedule or school schedule */}
      </Collapsible>

      {/* ── Homework & Tasks ── */}
      <Collapsible title="Homework & Tasks" icon={ClipboardList} defaultOpen={false}>
        <div className="space-y-2.5">
          {STUB_TASKS.map(t => (
            <div key={t.id} className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${t.urgent ? 'bg-red-500' : 'bg-gray-300'}`} />
              <span className="text-[12px] text-gray-700 leading-snug flex-1">{t.label}</span>
              {t.urgent && (
                <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">Due soon</span>
              )}
            </div>
          ))}
        </div>
      </Collapsible>

      {/* ── Books & Resources ── */}
      <Collapsible title="Books & Resources" icon={BookOpen} defaultOpen={false}>
        <div className="space-y-2">
          {STUB_BOOKS.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold capitalize flex-shrink-0 ${TYPE_BADGE[b.type]}`}>
                {b.type}
              </span>
              <span className="text-[12px] text-gray-700 truncate">{b.label}</span>
            </div>
          ))}
        </div>
        {/* TODO: Resources linked to platform's PDF/video library */}
      </Collapsible>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile: collapsible accordion */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(p => !p)}
          className="w-full flex items-center justify-between bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] border border-gray-200/60 px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <ClipboardList size={14} className="text-blue-500" />
            <span className="text-[13px] font-bold text-gray-700">Plan &amp; Tasks</span>
            {done > 0 && (
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">{done}/{total} done</span>
            )}
          </div>
          {mobileOpen
            ? <ChevronUp size={14} className="text-gray-400" />
            : <ChevronDown size={14} className="text-gray-400" />
          }
        </button>
        {mobileOpen && <div className="mt-2">{sidebarContent}</div>}
      </div>
    </>
  );
}
