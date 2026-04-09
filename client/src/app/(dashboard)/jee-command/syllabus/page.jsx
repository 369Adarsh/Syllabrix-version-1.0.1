'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { jeeAPI } from '@/lib/api/jee.api';
import { useJee } from '../layout';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, ChevronRight, CheckCircle2, Clock, BarChart2,
  Layers, Sparkles, Lock, Search, Loader2
} from 'lucide-react';

const MASTERY_CONFIG = {
  not_started:   { label: 'Not started',   color: 'bg-gray-100 text-gray-500',      bar: 'bg-gray-300',      pct: 0   },
  beginner:      { label: 'Beginner',      color: 'bg-blue-50 text-blue-600',        bar: 'bg-blue-400',      pct: 25  },
  intermediate:  { label: 'Intermediate',  color: 'bg-amber-50 text-amber-600',      bar: 'bg-amber-400',     pct: 50  },
  advanced:      { label: 'Advanced',      color: 'bg-purple-50 text-purple-600',    bar: 'bg-purple-500',    pct: 75  },
  mastered:      { label: 'Mastered',      color: 'bg-emerald-50 text-emerald-700',  bar: 'bg-emerald-500',   pct: 100 },
};

const SUBJECT_CONFIG = {
  physics:     { color: '#378ADD', bg: 'bg-blue-500',    label: 'Physics',     icon: '⚛️' },
  chemistry:   { color: '#0F6E56', bg: 'bg-emerald-600', label: 'Chemistry',   icon: '🧪' },
  mathematics: { color: '#534AB7', bg: 'bg-violet-600',  label: 'Mathematics', icon: '📐' },
};

function ChapterCard({ chapter, index }) {
  const mastery = MASTERY_CONFIG[chapter.mastery_level || 'not_started'];
  const weightage = chapter.jee_main_weightage || 0;

  return (
    <Link
      href={`/jee-command/syllabus/${chapter.subject_slug}/${chapter.slug}?class=${chapter.class_level}`}
      className="group bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-md transition-all"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-gray-500">
          {index}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[13px] font-semibold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">
              {chapter.name}
            </h3>
            <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-0.5 transition-colors" />
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${mastery.color}`}>
              {mastery.label}
            </span>
            {weightage > 0 && (
              <span className="text-[10px] text-gray-400">{weightage}% weightage</span>
            )}
            {chapter.total_topics > 0 && (
              <span className="text-[10px] text-gray-400">{chapter.total_topics} topics</span>
            )}
          </div>
          {chapter.questions_attempted > 0 && (
            <p className="text-[10px] text-gray-400 mt-1">{chapter.questions_attempted} questions attempted</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function SyllabusContent() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { selectedClass } = useJee();
  const [activeSubject, setActiveSubject] = useState(searchParams?.get('subject') || 'physics');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;
    
    setLoading(true);
    jeeAPI.getChapters({ subject: activeSubject, class: selectedClass })
      .then(r => setChapters(r.data?.data || []))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [activeSubject, selectedClass, user, authLoading]);

  const filtered = search.trim()
    ? chapters.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : chapters;

  const masteredCount = chapters.filter(c => c.mastery_level === 'mastered').length;
  const studiedCount = chapters.filter(c => c.mastery_level && c.mastery_level !== 'not_started').length;

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {Object.entries(SUBJECT_CONFIG).map(([slug, cfg]) => (
          <button
            key={slug}
            onClick={() => setActiveSubject(slug)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
              activeSubject === slug
                ? `${cfg.bg} text-white shadow-sm`
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <span>{cfg.icon}</span> {cfg.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chapters..."
            className="w-full pl-8 pr-4 py-2 rounded-full text-[13px] bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[12px] text-gray-500">
          <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> {masteredCount} mastered</span>
          <span className="flex items-center gap-1"><BarChart2 size={12} className="text-blue-500" /> {studiedCount}/{chapters.length} studied</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4 text-[11px]">
        {filtered.some(c => c.class_level === 11) && (
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
            Class 11 chapters
          </span>
        )}
        {filtered.some(c => c.class_level === 12) && (
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium">
            Class 12 chapters
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array(10).fill(0).map((_, i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}
        </div>
      ) : (
        <>
          {filtered.filter(c => c.class_level === 11).length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Class 11</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filtered.filter(c => c.class_level === 11).map((ch, i) => (
                  <ChapterCard key={ch.id} chapter={ch} index={i + 1} />
                ))}
              </div>
            </div>
          )}
          {filtered.filter(c => c.class_level === 12).length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Class 12</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filtered.filter(c => c.class_level === 12).map((ch, i) => (
                  <ChapterCard key={ch.id} chapter={ch} index={i + 1} />
                ))}
              </div>
            </div>
          )}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <BookOpen size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No chapters found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SyllabusPage() {
  return (
    <Suspense fallback={
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}
       </div>
    }>
      <SyllabusContent />
    </Suspense>
  );
}
