'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BOARD_SUBJECTS, CBSE_CHAPTERS, CHAPTER_STATUSES,
  loadBoardProgress, saveBoardProgress,
} from '@/data/board-syllabus';

const STATUS_CYCLE = ['not_started', 'reading', 'practising', 'done'];

function nextStatus(current) {
  const idx = STATUS_CYCLE.indexOf(current || 'not_started');
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

export default function ChaptersPage() {
  const searchParams  = useSearchParams();
  const { user }      = useAuth();
  const classLevel    = parseInt(user?.profile?.class_level || user?.class_level || '10') || 10;
  const validClass    = classLevel === 9 ? 9 : 10;

  const initialSlug   = searchParams.get('subject') || BOARD_SUBJECTS[0].slug;
  const [activeSlug, setActiveSlug]   = useState(initialSlug);
  const [progress, setProgress]       = useState({});
  const [showClass, setShowClass]     = useState(validClass);

  useEffect(() => { setProgress(loadBoardProgress()); }, []);

  const activeSubject = BOARD_SUBJECTS.find(s => s.slug === activeSlug) || BOARD_SUBJECTS[0];
  const chapters      = CBSE_CHAPTERS[showClass]?.[activeSlug] || [];

  const key = (ch) => `${showClass}::${activeSlug}::${ch}`;
  const getStatus = (ch) => progress[key(ch)] || 'not_started';

  const cycleStatus = (ch) => {
    const next = nextStatus(getStatus(ch));
    const updated = { ...progress, [key(ch)]: next };
    setProgress(updated);
    saveBoardProgress(updated);
  };

  const done = chapters.filter(ch => getStatus(ch) === 'done').length;
  const pct  = chapters.length ? Math.round((done / chapters.length) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/boards" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-[16px] font-extrabold text-gray-800">Chapter Tracker</h1>
          <p className="text-[11px] text-gray-400">CBSE · Class {showClass}</p>
        </div>
        {/* Class toggle */}
        <div className="ml-auto flex rounded-xl overflow-hidden border border-gray-200 bg-white">
          {[9, 10].map(cls => (
            <button
              key={cls}
              onClick={() => setShowClass(cls)}
              className={`px-3 py-1.5 text-[11px] font-bold transition-colors ${showClass === cls ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Class {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Subject tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {BOARD_SUBJECTS.map(s => (
          <button
            key={s.slug}
            onClick={() => setActiveSlug(s.slug)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border transition-colors flex-shrink-0 ${
              activeSlug === s.slug
                ? `${s.color} text-white border-transparent`
                : `bg-white ${s.border} ${s.text} hover:opacity-80`
            }`}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[12px] font-extrabold text-gray-700">{activeSubject.name}</p>
          <span className={`text-[13px] font-extrabold ${activeSubject.text}`}>{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: activeSubject.hex }} />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">{done} of {chapters.length} chapters done</p>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-2">
        {CHAPTER_STATUSES.map(s => (
          <span key={s.value} className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${s.bg} ${s.color} border-current/20`}>
            {s.label}
          </span>
        ))}
        <span className="text-[9px] text-gray-400 font-medium self-center">← tap chapter to cycle</span>
      </div>

      {/* Chapter list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {chapters.map((ch, i) => {
          const status = getStatus(ch);
          const statusCfg = CHAPTER_STATUSES.find(s => s.value === status) || CHAPTER_STATUSES[0];
          return (
            <button
              key={ch}
              onClick={() => cycleStatus(ch)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left group"
            >
              <span className="text-[11px] text-gray-300 font-bold w-5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <span className={`text-[12px] font-medium flex-1 leading-snug transition-colors ${status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {ch}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${statusCfg.bg} ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </button>
          );
        })}
      </div>

      {pct === 100 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
          <p className="text-[20px] mb-1">🎉</p>
          <p className="text-emerald-700 font-extrabold text-[14px]">{activeSubject.name} Complete!</p>
          <p className="text-emerald-600 text-[11px] mt-1">Now revise with previous year questions.</p>
        </div>
      )}
    </div>
  );
}
