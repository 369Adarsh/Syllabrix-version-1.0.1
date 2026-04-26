'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UPSC_SYLLABUS, loadProgress, saveProgress } from '@/data/upsc-syllabus';

function PaperProgress({ paper, progress }) {
  const allTopics = paper.subjects.flatMap(s => s.topics.map(t => `${s.name}::${t}`));
  const done = allTopics.filter(k => progress[k]).length;
  const pct = allTopics.length ? Math.round((done / allTopics.length) * 100) : 0;
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-current transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold flex-shrink-0">{pct}%</span>
    </div>
  );
}

function SubjectSection({ subject, paperKey, progress, onToggle, activeClass }) {
  const [open, setOpen] = useState(false);
  const done = subject.topics.filter(t => progress[`${subject.name}::${t}`]).length;
  const total = subject.topics.length;

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className={`w-5 h-5 rounded-full ${done === total ? 'bg-emerald-100' : 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
          <span className="text-[8px] font-black text-gray-500">{done}/{total}</span>
        </div>
        <span className="flex-1 text-[12px] font-bold text-gray-700 truncate">{subject.name}</span>
        {open ? <ChevronDown size={13} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="pb-2 px-4 space-y-0.5">
          {subject.topics.map(topic => {
            const key = `${subject.name}::${topic}`;
            const checked = !!progress[key];
            return (
              <button
                key={topic}
                onClick={() => onToggle(key)}
                className="w-full flex items-center gap-2.5 py-1.5 hover:bg-gray-50 rounded-lg px-2 transition-colors text-left group"
              >
                {checked
                  ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  : <Circle size={14} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
                }
                <span className={`text-[11px] font-medium transition-colors ${checked ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                  {topic}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SyllabusTracker() {
  const [progress, setProgress] = useState({});
  const [openPaper, setOpenPaper] = useState(UPSC_SYLLABUS[0]?.paper);

  useEffect(() => { setProgress(loadProgress()); }, []);

  const toggleTopic = (key) => {
    const next = { ...progress, [key]: !progress[key] };
    if (!next[key]) delete next[key];
    setProgress(next);
    saveProgress(next);
  };

  const totalTopics = UPSC_SYLLABUS.flatMap(p => p.subjects.flatMap(s => s.topics)).length;
  const totalDone = Object.values(progress).filter(Boolean).length;
  const overallPct = totalTopics ? Math.round((totalDone / totalTopics) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/upsc" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-[16px] font-extrabold text-gray-800">Syllabus Tracker</h1>
          <p className="text-[11px] text-gray-400">GS1 · GS2 · GS3 · GS4 · CSAT</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white font-extrabold text-[13px]">Overall Progress</p>
          <p className="text-white font-extrabold text-[20px]">{overallPct}%</p>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${overallPct}%` }} />
        </div>
        <p className="text-white/60 text-[10px] mt-1.5">{totalDone} of {totalTopics} topics completed</p>
      </div>

      {/* Paper cards */}
      {UPSC_SYLLABUS.map(paper => {
        const isOpen = openPaper === paper.paper;
        const allTopics = paper.subjects.flatMap(s => s.topics.map(t => `${s.name}::${t}`));
        const done = allTopics.filter(k => progress[k]).length;

        return (
          <div key={paper.paper} className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => setOpenPaper(isOpen ? null : paper.paper)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl ${paper.color} flex items-center justify-center text-[16px] flex-shrink-0`}>
                {paper.emoji}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-extrabold text-gray-800">{paper.paper}</p>
                  <span className="text-[9px] text-gray-400 font-semibold">({done}/{allTopics.length})</span>
                </div>
                <PaperProgress paper={paper} progress={progress} />
              </div>
              {isOpen ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
            </button>

            {isOpen && (
              <div className="border-t border-gray-50">
                {paper.subjects.map(subject => (
                  <SubjectSection
                    key={subject.name}
                    subject={subject}
                    paperKey={paper.short}
                    progress={progress}
                    onToggle={toggleTopic}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {overallPct === 100 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
          <p className="text-[20px] mb-1">🎉</p>
          <p className="text-emerald-700 font-extrabold text-[14px]">Syllabus Complete!</p>
          <p className="text-emerald-600 text-[11px] mt-1">Now focus on revision and answer writing.</p>
        </div>
      )}
    </div>
  );
}
