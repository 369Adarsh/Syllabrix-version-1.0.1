'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Target, BookOpen, ChevronRight, Calendar, Edit3, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BOARD_SUBJECTS, CBSE_CHAPTERS, loadBoardProgress, loadBoardSettings, saveBoardSettings, getChapterStats,
} from '@/data/board-syllabus';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function SubjectCard({ subject, stats, classLevel }) {
  return (
    <Link
      href={`/boards/chapters?subject=${subject.slug}`}
      className={`rounded-2xl border p-4 hover:shadow-md transition-all active:scale-[0.98] ${subject.light} ${subject.border}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center text-[18px]">
          {subject.emoji}
        </div>
        <span className={`text-[20px] font-extrabold ${subject.text}`}>{stats.pct}%</span>
      </div>
      <p className={`text-[13px] font-extrabold ${subject.text} mb-1`}>{subject.name}</p>
      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-1.5">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stats.pct}%`, backgroundColor: subject.hex }} />
      </div>
      <p className="text-[10px] text-gray-500">{stats.done}/{stats.total} chapters done</p>
      {stats.inProgress > 0 && (
        <p className="text-[9px] text-amber-600 font-bold mt-0.5">{stats.inProgress} in progress</p>
      )}
    </Link>
  );
}

export default function BoardsDashboard() {
  const { user } = useAuth();
  const [progress, setProgress]   = useState({});
  const [settings, setSettings]   = useState({});
  const [editDate, setEditDate]   = useState(false);
  const [dateInput, setDateInput] = useState('');

  const classLevel = parseInt(user?.profile?.class_level || user?.class_level || '10') || 10;
  const validClass = classLevel === 9 ? 9 : 10;
  const name = user?.profile?.full_name?.split(' ')[0] || user?.username || 'Student';

  useEffect(() => {
    const p = loadBoardProgress();
    const s = loadBoardSettings();
    setProgress(p);
    setSettings(s);
    setDateInput(s.examDate || '');
  }, []);

  const saveDate = () => {
    const next = { ...settings, examDate: dateInput };
    setSettings(next);
    saveBoardSettings(next);
    setEditDate(false);
  };

  const days = daysUntil(settings.examDate);
  const stats = getChapterStats(validClass, progress);
  const totalDone = Object.values(stats).reduce((a, s) => a + s.done, 0);
  const totalChapters = Object.values(stats).reduce((a, s) => a + s.total, 0);
  const overallPct = totalChapters ? Math.round((totalDone / totalChapters) * 100) : 0;

  // Suggest today's chapter: first subject with lowest pct, first undone chapter
  const suggestedSubject = BOARD_SUBJECTS.slice().sort((a, b) => (stats[a.slug]?.pct || 0) - (stats[b.slug]?.pct || 0))[0];
  const suggestedChapter = (CBSE_CHAPTERS[validClass]?.[suggestedSubject?.slug] || [])
    .find(ch => !progress[`${validClass}::${suggestedSubject?.slug}::${ch}`] || progress[`${validClass}::${suggestedSubject?.slug}::${ch}`] === 'not_started');

  const chaptersPerDay = days && totalChapters - totalDone > 0 ? Math.ceil((totalChapters - totalDone) / days) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f, #059669)' }}>
        <div className="px-5 py-5 relative">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[20px]">🏆</span>
              <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Board Warrior · Class {validClass}</span>
            </div>
            <h1 className="text-white font-extrabold text-[20px] leading-tight">Ready, {name}?</h1>
            <p className="text-white/60 text-[12px] mt-1">CBSE Board prep — chapter by chapter.</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {/* Countdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center col-span-1" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {editDate ? (
            <div className="flex flex-col gap-1">
              <input
                type="date"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                className="text-[9px] border border-gray-200 rounded-lg px-1 py-0.5 w-full outline-none"
              />
              <button onClick={saveDate} className="text-[9px] bg-blue-600 text-white rounded-lg py-0.5 font-bold">Save</button>
            </div>
          ) : (
            <>
              <Clock size={14} className="mx-auto mb-1 text-blue-600" />
              <p className="text-[18px] font-extrabold text-blue-600">{days !== null ? days : '—'}</p>
              <p className="text-[8px] text-gray-400 font-semibold">Days to Exam</p>
              <button onClick={() => setEditDate(true)} className="mt-1">
                <Edit3 size={9} className="text-gray-300 hover:text-gray-500 transition-colors" />
              </button>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Target size={14} className="mx-auto mb-1 text-emerald-600" />
          <p className="text-[18px] font-extrabold text-emerald-600">{overallPct}%</p>
          <p className="text-[8px] text-gray-400 font-semibold">Done</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <BookOpen size={14} className="mx-auto mb-1 text-amber-600" />
          <p className="text-[18px] font-extrabold text-amber-600">{totalDone}</p>
          <p className="text-[8px] text-gray-400 font-semibold">Chapters</p>
        </div>
      </div>

      {/* Estimation tip */}
      {chaptersPerDay !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Calendar size={16} className="text-blue-600 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 font-medium leading-snug">
            Study <span className="font-extrabold">{chaptersPerDay} chapter{chaptersPerDay > 1 ? 's' : ''}/day</span> and you'll complete the syllabus before your exam.
          </p>
        </div>
      )}

      {/* Today's recommended chapter */}
      {suggestedChapter && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <span className="text-[13px]">✨</span>
            </div>
            <p className="text-[12px] font-extrabold text-gray-700">Study This Today</p>
          </div>
          <p className="text-[11px] text-gray-500 mb-0.5">{suggestedSubject?.name}</p>
          <p className="text-[14px] font-extrabold text-gray-800 mb-3">{suggestedChapter}</p>
          <Link
            href={`/boards/chapters?subject=${suggestedSubject?.slug}`}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-extrabold text-[12px] text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: suggestedSubject?.hex }}
          >
            <BookOpen size={13} /> Open Chapter Tracker <ChevronRight size={13} />
          </Link>
        </div>
      )}

      {/* Subject cards */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Progress by Subject</p>
        <div className="grid grid-cols-2 gap-3">
          {BOARD_SUBJECTS.map(subject => (
            <SubjectCard key={subject.slug} subject={subject} stats={stats[subject.slug] || { total: 0, done: 0, inProgress: 0, pct: 0 }} classLevel={validClass} />
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/prep/daily-quiz" className="bg-violet-50 border border-violet-200 rounded-2xl p-4 hover:shadow-md transition-all">
          <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[16px] mb-2">🧠</div>
          <p className="text-[13px] font-extrabold text-violet-700">Quiz Practice</p>
          <p className="text-[11px] text-gray-500 mt-0.5">MCQs board pattern</p>
        </Link>
        <Link href="/ai-buddy" className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 hover:shadow-md transition-all">
          <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[16px] mb-2">✨</div>
          <p className="text-[13px] font-extrabold text-indigo-700">AI Doubt Solver</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Ask any chapter doubt</p>
        </Link>
      </div>

      {/* Footer nudge */}
      <div className="bg-gradient-to-r from-blue-950 to-emerald-900 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-[28px] flex-shrink-0">📚</span>
        <div>
          <p className="text-white font-extrabold text-[13px]">One chapter at a time</p>
          <p className="text-white/60 text-[11px] mt-0.5">Every chapter you complete brings you closer to 90+.</p>
        </div>
      </div>
    </div>
  );
}
