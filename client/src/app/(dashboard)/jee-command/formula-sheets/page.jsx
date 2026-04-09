'use client';
import { useEffect, useState } from 'react';
import { jeeAPI } from '@/lib/api/jee.api';
import { useJee } from '../layout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Search, BookmarkPlus, ChevronDown, ChevronRight, Loader2, BookOpen } from 'lucide-react';

const SUBJECTS = [
  { slug: 'physics',     label: 'Physics',     icon: '⚛️', color: 'bg-blue-500',    active: 'bg-blue-600 text-white' },
  { slug: 'chemistry',   label: 'Chemistry',   icon: '🧪', color: 'bg-emerald-600', active: 'bg-emerald-600 text-white' },
  { slug: 'mathematics', label: 'Mathematics', icon: '📐', color: 'bg-violet-600',  active: 'bg-violet-600 text-white' },
];

function FormulaCard({ formula, index }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {formula.name && (
            <p className="text-[11px] font-semibold text-gray-600 mb-1">{formula.name}</p>
          )}
          <div className="text-[14px] font-bold text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 inline-block">
            <InlineMath math={formula.formula.replace(/\$/g, '')} />
          </div>
          {formula.description && (
            <p className="text-[11px] text-gray-500 mt-1.5">{formula.description}</p>
          )}
          {formula.variables && (
            <p className="text-[10px] text-gray-400 mt-1 italic">{formula.variables}</p>
          )}
        </div>
        <button onClick={() => jeeAPI.addBookmark({ bookmark_type: 'formula', reference_id: index }).catch(()=>{})}
          className="p-1 rounded hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
          <BookmarkPlus size={13} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}

function ChapterSection({ chapter }) {
  const [open, setOpen] = useState(false);
  const formulas = typeof chapter.formulas === 'string'
    ? JSON.parse(chapter.formulas || '[]')
    : (chapter.formulas || []);

  if (!formulas.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
          <span className="text-[13px] font-semibold text-gray-800">{chapter.chapter_name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{formulas.length} formulas</span>
        </div>
        <span className="text-[10px] text-gray-400">Class {chapter.class_level}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {formulas.map((f, i) => <FormulaCard key={i} formula={f} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormulaSheetsPage() {
  const { selectedClass } = useJee();
  const [activeSubject, setActiveSubject] = useState('physics');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    jeeAPI.getFormulas(activeSubject)
      .then(r => setData(r.data?.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [activeSubject]);

  const filtered = search.trim()
    ? data.filter(ch =>
        ch.chapter_name?.toLowerCase().includes(search.toLowerCase()) ||
        (typeof ch.formulas === 'string' ? JSON.parse(ch.formulas || '[]') : ch.formulas || [])
          .some(f => f.name?.toLowerCase().includes(search.toLowerCase()) || f.formula?.toLowerCase().includes(search.toLowerCase()))
      )
    : data;

  const class11 = filtered.filter(ch => ch.class_level === 11);
  const class12 = filtered.filter(ch => ch.class_level === 12);

  const subCfg = SUBJECTS.find(s => s.slug === activeSubject);

  return (
    <div>
      {/* Subject selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {SUBJECTS.map(s => (
          <button key={s.slug} onClick={() => setActiveSubject(s.slug)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
              activeSubject === s.slug ? `${s.active} shadow-sm` : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search formulas or chapters..."
          className="w-full pl-8 pr-4 py-2 rounded-full text-[13px] bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" />
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-2">
        <BookOpen size={14} className="text-blue-600 flex-shrink-0" />
        <p className="text-[12px] text-blue-700">
          Tap any chapter to expand its formula sheet. Bookmark important formulas for quick revision.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-white rounded-xl animate-pulse border" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <BookOpen size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No formulas found</p>
          <p className="text-[12px] text-gray-400 mt-1">Formula data will be populated as chapters are added.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {class11.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Class 11</p>
              <div className="space-y-2">{class11.map((ch, i) => <ChapterSection key={i} chapter={ch} />)}</div>
            </div>
          )}
          {class12.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2 mt-2">Class 12</p>
              <div className="space-y-2">{class12.map((ch, i) => <ChapterSection key={i} chapter={ch} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
