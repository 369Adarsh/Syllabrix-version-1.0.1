'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Target, BookOpen, ChevronRight, Calendar, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BOARD_SUBJECTS, CBSE_CHAPTERS, loadBoardProgress, loadBoardSettings, saveBoardSettings, getChapterStats,
} from '@/data/board-syllabus';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function SubjectCard({ subject, stats }) {
  return (
    <Link
      href={`/boards/chapters?subject=${subject.slug}`}
      className={`rounded-2xl border p-5 hover:shadow-lg transition-all active:scale-[0.98] group ${subject.light} ${subject.border}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
          {subject.emoji}
        </div>
        <span className={`text-xl font-extrabold ${subject.text}`}>{stats.pct}%</span>
      </div>
      <p className={`text-[14px] font-extrabold ${subject.text} mb-2`}>{subject.name}</p>
      <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stats.pct}%`, backgroundColor: subject.hex }} />
      </div>
      <p className="text-[11px] text-gray-500">{stats.done}/{stats.total} chapters done</p>
      {stats.inProgress > 0 && (
        <p className="text-[10px] text-amber-600 font-bold mt-0.5">{stats.inProgress} in progress</p>
      )}
    </Link>
  );
}

export default function BoardsDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState({});
  const [settings, setSettings] = useState({});
  const [editDate, setEditDate]  = useState(false);
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

  const suggestedSubject = BOARD_SUBJECTS.slice().sort((a, b) => (stats[a.slug]?.pct || 0) - (stats[b.slug]?.pct || 0))[0];
  const suggestedChapter = (CBSE_CHAPTERS[validClass]?.[suggestedSubject?.slug] || [])
    .find(ch => !progress[`${validClass}::${suggestedSubject?.slug}::${ch}`] || progress[`${validClass}::${suggestedSubject?.slug}::${ch}`] === 'not_started');

  const chaptersPerDay = days && totalChapters - totalDone > 0 ? Math.ceil((totalChapters - totalDone) / days) : null;

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f, #059669)' }}>
        <div className="px-6 py-7 md:px-10 md:py-10 relative">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏆</span>
                <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">Board Warrior · Class {validClass}</span>
              </div>
              <h1 className="text-white font-extrabold text-2xl md:text-3xl leading-tight">Ready, {name}?</h1>
              <p className="text-white/60 text-sm mt-1.5">CBSE Board prep — chapter by chapter, subject by subject.</p>
            </div>
            <span className="text-6xl md:text-7xl flex-shrink-0 hidden sm:block">📚</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Countdown */}
        <div className="bg-blue-50 rounded-2xl border border-white p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Clock size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            {editDate ? (
              <div className="flex flex-col gap-1">
                <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
                  className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400" />
                <button onClick={saveDate} className="text-[11px] bg-blue-600 text-white rounded-lg py-0.5 font-bold">Save</button>
              </div>
            ) : (
              <>
                <p className="text-xl font-extrabold text-blue-600">{days !== null ? days : '—'}</p>
                <p className="text-[11px] text-gray-500 font-semibold">Days to Exam</p>
                <button onClick={() => setEditDate(true)} className="mt-0.5">
                  <Edit3 size={11} className="text-gray-300 hover:text-gray-500 transition-colors" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-emerald-50 rounded-2xl border border-white p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Target size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-emerald-600">{overallPct}%</p>
            <p className="text-[11px] text-gray-500 font-semibold">Overall Done</p>
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl border border-white p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <BookOpen size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-amber-600">{totalDone}</p>
            <p className="text-[11px] text-gray-500 font-semibold">Chapters Done</p>
          </div>
        </div>

        <div className="bg-violet-50 rounded-2xl border border-white p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Calendar size={18} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-violet-600">{chaptersPerDay ?? '—'}</p>
            <p className="text-[11px] text-gray-500 font-semibold">Chapters/Day</p>
          </div>
        </div>
      </div>

      {/* Two-column desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — subject cards (2/3) */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Progress by Subject</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {BOARD_SUBJECTS.map(subject => (
                <SubjectCard
                  key={subject.slug}
                  subject={subject}
                  stats={stats[subject.slug] || { total: 0, done: 0, inProgress: 0, pct: 0 }}
                />
              ))}
            </div>
          </div>

          {/* Footer nudge */}
          <div className="bg-gradient-to-r from-blue-950 to-emerald-900 rounded-2xl p-6 flex items-center gap-5">
            <span className="text-4xl flex-shrink-0">📚</span>
            <div>
              <p className="text-white font-extrabold text-[15px]">One chapter at a time</p>
              <p className="text-white/60 text-sm mt-1">Every chapter you complete brings you closer to 90+.</p>
            </div>
            <Link href="/boards/chapters" className="ml-auto flex-shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-colors">
              Open Tracker →
            </Link>
          </div>
        </div>

        {/* RIGHT — sidebar (1/3) */}
        <div className="space-y-5">
          {/* Study tip */}
          {chaptersPerDay !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Calendar size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 font-medium leading-snug">
                Study <span className="font-extrabold">{chaptersPerDay} chapter{chaptersPerDay > 1 ? 's' : ''}/day</span> to complete the syllabus before your exam.
              </p>
            </div>
          )}

          {/* Today's recommended chapter */}
          {suggestedChapter && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <span className="text-sm">✨</span>
                </div>
                <p className="text-sm font-extrabold text-gray-700">Study This Today</p>
              </div>
              <p className="text-[12px] text-gray-500 mb-1">{suggestedSubject?.name}</p>
              <p className="text-[15px] font-extrabold text-gray-800 mb-4">{suggestedChapter}</p>
              <Link
                href={`/boards/chapters?subject=${suggestedSubject?.slug}`}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-extrabold text-sm text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: suggestedSubject?.hex }}
              >
                <BookOpen size={14} /> Open Chapter Tracker
              </Link>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Links</p>
            {[
              { href: '/boards/chapters', emoji: '📖', label: 'Chapter Tracker', sub: 'All subjects & chapters' },
              { href: '/prep/daily-quiz', emoji: '🧠', label: 'Quiz Practice',   sub: 'Board-pattern MCQs'     },
              { href: '/ai-buddy',        emoji: '✨', label: 'AI Doubt Solver', sub: 'Ask any chapter doubt'  },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                <span className="text-lg w-7 text-center">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-700">{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
                <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
