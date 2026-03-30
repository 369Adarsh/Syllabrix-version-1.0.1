'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FadeIn, SlideUp, ScaleIn, StaggerChildren, StaggerItem,
} from '@/components/ui/Animate';
import { libraryAPI } from '@/lib/api/library.api';
import {
  LibraryBig, School, Trophy, GraduationCap, ChevronRight, ChevronDown,
  Sparkles, Send, Loader2, BookOpen, RotateCcw, X, Search, Bot,
  BookMarked, Lightbulb, HelpCircle, Target, Star, ExternalLink,
  ShoppingCart, Building2, Layers, Hash, Award, MapPin, Clock,
  FileDown, AlignLeft, List, BookText, CheckCircle2,
} from 'lucide-react';
import NumberFlow from '@number-flow/react';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'school',      label: 'School',      icon: School,       emoji: '🏫', desc: 'NCERT · State Boards · All Classes' },
  { id: 'competitive', label: 'Competitive', icon: Trophy,       emoji: '🥇', desc: 'JEE · NEET · UPSC · 38+ Exams' },
  { id: 'university',  label: 'University',  icon: GraduationCap,emoji: '🎓', desc: 'IITs · NITs · AIIMS · Top 136 Unis' },
];

const UNI_TYPE_LABEL = {
  iit: 'IITs', nit: 'NITs', aiims: 'AIIMS', iim: 'IIMs',
  central: 'Central Universities', state: 'State Universities',
  deemed: 'Deemed Universities', private: 'Private Universities', autonomous: 'Other',
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-gray-100 rounded-lg ${className}`}
    />
  );
}

function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREADCRUMB
// ─────────────────────────────────────────────────────────────────────────────
function Breadcrumb({ crumbs, onClickIndex }) {
  if (!crumbs.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center flex-wrap gap-1 text-[11px] text-gray-400 mb-4"
    >
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={10} />}
          <button
            onClick={() => onClickIndex(i)}
            className={`hover:text-blue-600 transition-colors font-medium ${
              i === crumbs.length - 1 ? 'text-gray-700 pointer-events-none' : 'text-blue-500 hover:underline'
            }`}
          >
            {c}
          </button>
        </span>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTION CARD
// ─────────────────────────────────────────────────────────────────────────────
function SelectCard({ label, sub, badge, icon: Icon, color = 'blue', onClick, selected }) {
  const colors = {
    blue:   'border-blue-200 bg-blue-50 text-blue-700',
    green:  'border-green-200 bg-green-50 text-green-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    teal:   'border-teal-200 bg-teal-50 text-teal-700',
    rose:   'border-rose-200 bg-rose-50 text-rose-700',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  };
  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-3 transition-colors ${
        selected
          ? colors[color] + ' ring-2 ring-offset-1 ring-' + color + '-400'
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {Icon && <Icon size={16} className={selected ? '' : 'text-gray-400'} />}
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-semibold truncate ${selected ? '' : 'text-gray-800'}`}>{label}</p>
          {sub && <p className={`text-[10px] mt-0.5 truncate ${selected ? 'opacity-70' : 'text-gray-400'}`}>{sub}</p>}
        </div>
        {badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/60 border border-current opacity-70 whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP SECTION
// ─────────────────────────────────────────────────────────────────────────────
function StepSection({ step, title, children, onReset, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            {step}
          </span>
          <h3 className="text-[14px] font-bold text-gray-800">{title}</h3>
        </div>
        {onReset && (
          <button onClick={onReset} className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>
      {loading ? <SkeletonGrid /> : children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPEWRITER HOOK
// ─────────────────────────────────────────────────────────────────────────────
function useTypewriter(text, speed = 14) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!text) { setDisplayed(''); setDone(false); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return { displayed, done };
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOK CARD
// ─────────────────────────────────────────────────────────────────────────────
function BookCard({ book, index }) {
  const [showTOC, setShowTOC] = useState(false);
  return (
    <StaggerItem>
      <motion.div
        whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', transition: { duration: 0.15 } }}
        className="bg-white rounded-xl border border-gray-200/80 p-4 flex flex-col gap-3"
      >
        {/* Cover + title */}
        <div className="flex gap-3">
          {book.cover_image_url ? (
            <img src={book.cover_image_url} alt={book.title}
              className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0 border border-gray-100" />
          ) : (
            <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
              <BookOpen size={20} className="text-blue-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {book.is_prescribed && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 mb-1">
                <Star size={8} fill="currentColor" /> Prescribed
              </span>
            )}
            {book.priority_rank === 1 && !book.is_prescribed && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 mb-1">
                <Award size={8} /> Top Pick
              </span>
            )}
            <p className="text-[13px] font-bold text-gray-800 leading-tight line-clamp-2">{book.title}</p>
            {book.author && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{book.author}</p>}
            {(book.publisher_name || book.publisher_short) && (
              <p className="text-[10px] text-gray-400 truncate">{book.publisher_name || book.publisher_short}</p>
            )}
          </div>
        </div>

        {/* Tip */}
        {book.usage_tip && (
          <p className="text-[11px] text-indigo-600 bg-indigo-50 rounded-lg px-2.5 py-1.5 leading-relaxed italic border border-indigo-100">
            💡 {book.usage_tip}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTOC(true)}
            className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition-colors">
            <List size={10} /> Contents
          </motion.button>
          {book.google_books_preview_url && (
            <a href={book.google_books_preview_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors">
              <ExternalLink size={10} /> Preview
            </a>
          )}
          {book.amazon_affiliate_url && (
            <a href={book.amazon_affiliate_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 transition-colors">
              <ShoppingCart size={10} /> Amazon
            </a>
          )}
          {book.flipkart_affiliate_url && (
            <a href={book.flipkart_affiliate_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-200 transition-colors">
              <ShoppingCart size={10} /> Flipkart
            </a>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {showTOC && <BookTOCModal book={book} onClose={() => setShowTOC(false)} />}
      </AnimatePresence>
    </StaggerItem>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI RESPONSE PANEL
// ─── Simple markdown renderer (bold + bullets only) ──────────────────────────
function RichText({ text, className = '' }) {
  if (!text) return null;
  // Split into paragraphs
  const paragraphs = text.split('\n').filter(l => l.trim());
  return (
    <div className={`space-y-1.5 ${className}`}>
      {paragraphs.map((p, i) => {
        const isBullet = p.trim().startsWith('- ') || p.trim().startsWith('• ');
        const content = isBullet ? p.trim().slice(2) : p;
        // Bold: **text**
        const rendered = content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
            : part
        );
        if (isBullet) return (
          <div key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-2" />
            <p className="text-[13px] text-gray-700 leading-relaxed flex-1">{rendered}</p>
          </div>
        );
        return <p key={i} className="text-[13px] text-gray-700 leading-relaxed">{rendered}</p>;
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function AIResponsePanel({ response, books, mode, context }) {
  const { displayed, done } = useTypewriter(response?.explanation || '', 10);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [copyCode, setCopyCode]     = useState(false);

  const handlePDF = async () => {
    setPdfLoading(true);
    try { await generateStudyPDF({ response, context }); }
    finally { setPdfLoading(false); }
  };

  const handleCopyCode = () => {
    if (response.code_example?.code) {
      navigator.clipboard.writeText(response.code_example.code);
      setCopyCode(true);
      setTimeout(() => setCopyCode(false), 2000);
    }
  };

  if (!response) return null;

  const qType = response.question_type || 'explain';
  const QTYPE_BADGE = {
    code: { label: 'Code', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    derivation: { label: 'Derivation', color: 'bg-violet-100 text-violet-700 border-violet-200' },
    solve: { label: 'Solved', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    compare: { label: 'Comparison', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    complexity: { label: 'Complexity', color: 'bg-red-100 text-red-700 border-red-200' },
    examples: { label: 'Examples', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    explain: { label: 'Explanation', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  };
  const badge = QTYPE_BADGE[qType] || QTYPE_BADGE.explain;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-4"
    >
      {/* Explanation */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60 p-5">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <span className="text-[12px] font-bold text-blue-700 uppercase tracking-wider">AI Explanation</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span>
            {response.depth_level && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200 capitalize">{response.depth_level}</span>
            )}
          </div>
          {done && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
              onClick={handlePDF}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-bold shadow-sm shadow-indigo-200/50 hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-60"
            >
              {pdfLoading ? <Loader2 size={11} className="animate-spin" /> : <FileDown size={11} />}
              {pdfLoading ? 'Generating…' : 'Download PDF'}
            </motion.button>
          )}
        </div>
        <p className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">
          {displayed}
          {!done && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 align-middle" />}
        </p>
      </div>

      {/* ── CODE BLOCK ── */}
      {done && response.code_example && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="w-3 h-3 rounded-full bg-yellow-500" /><span className="w-3 h-3 rounded-full bg-green-500" /></div>
              <span className="text-[11px] font-mono text-gray-400 ml-1">{response.code_example.language || 'code'}</span>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 hover:text-white transition-colors">
              {copyCode ? <CheckCircle2 size={12} className="text-green-400" /> : <AlignLeft size={12} />}
              {copyCode ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>
          {/* Code */}
          <pre className="bg-gray-950 text-green-300 text-[12px] font-mono p-4 overflow-x-auto leading-relaxed whitespace-pre">
            {response.code_example.code}
          </pre>
          {/* Code explanation */}
          {response.code_example.explanation && (
            <div className="bg-white p-4 border-t border-gray-100">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">How it works</p>
              <RichText text={response.code_example.explanation} />
            </div>
          )}
          {/* Sample I/O */}
          {response.code_example.sample_io && (
            <div className="bg-gray-50 p-4 border-t border-gray-100">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Sample I/O</p>
              <pre className="text-[12px] text-gray-700 font-mono whitespace-pre-wrap">{response.code_example.sample_io}</pre>
            </div>
          )}
        </motion.div>
      )}

      {/* ── COMPLEXITY ANALYSIS ── */}
      {done && response.complexity_analysis && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-red-50 rounded-2xl border border-red-200/60 p-4">
          <h4 className="text-[12px] font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers size={13} /> Complexity Analysis
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Time', value: response.complexity_analysis.time,         color: 'bg-red-100 text-red-700' },
              { label: 'Space', value: response.complexity_analysis.space,        color: 'bg-orange-100 text-orange-700' },
              { label: 'Best', value: response.complexity_analysis.best_case,     color: 'bg-green-100 text-green-700' },
              { label: 'Worst', value: response.complexity_analysis.worst_case,   color: 'bg-red-100 text-red-700' },
            ].filter(c => c.value).map(c => (
              <div key={c.label} className={`${c.color} rounded-xl p-2.5 text-center`}>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{c.label}</p>
                <p className="text-[13px] font-mono font-bold mt-0.5">{c.value}</p>
              </div>
            ))}
          </div>
          {response.complexity_analysis.average_case && (
            <p className="text-[12px] text-gray-600 mt-2">Average case: <span className="font-mono font-semibold text-gray-800">{response.complexity_analysis.average_case}</span></p>
          )}
        </motion.div>
      )}

      {/* ── DERIVATION STEPS ── */}
      {done && response.derivation_steps?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-violet-50 rounded-2xl border border-violet-200/60 p-5">
          <h4 className="text-[12px] font-bold text-violet-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <AlignLeft size={13} /> Step-by-Step Derivation
          </h4>
          <StaggerChildren className="space-y-3" stagger={0.06}>
            {response.derivation_steps.map((step, i) => (
              <StaggerItem key={i}>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-violet-200 text-violet-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-[13px] text-gray-700 leading-relaxed font-mono whitespace-pre-wrap flex-1">{step}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
          {response.formula && (
            <div className="mt-4 pt-4 border-t border-violet-200">
              <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wider mb-1">Result</p>
              <p className="text-[15px] font-mono font-bold text-violet-800 bg-violet-100 rounded-xl px-4 py-2.5 inline-block">{response.formula}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── SOLVED EXAMPLE ── */}
      {done && response.solved_example && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-orange-50 rounded-2xl border border-orange-200/60 p-5">
          <h4 className="text-[12px] font-bold text-orange-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BookText size={13} /> Worked Solution
          </h4>
          {response.solved_example.problem && (
            <div className="bg-white rounded-xl border border-orange-200 p-3 mb-4">
              <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Problem</p>
              <p className="text-[13px] text-gray-800 font-medium">{response.solved_example.problem}</p>
            </div>
          )}
          {response.solved_example.approach && (
            <p className="text-[12px] text-orange-700 bg-orange-100 rounded-lg px-3 py-1.5 mb-3 font-medium">
              Approach: {response.solved_example.approach}
            </p>
          )}
          {response.formula && !response.derivation_steps?.length && (
            <p className="text-[12px] text-gray-500 mb-3">Formula: <span className="font-mono font-semibold text-gray-800">{response.formula}</span></p>
          )}
          <StaggerChildren className="space-y-2" stagger={0.05}>
            {(response.solved_example.solution_steps || []).map((step, i) => (
              <StaggerItem key={i}>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-orange-200 text-orange-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{step}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
          {response.solved_example.answer && (
            <div className="mt-4 pt-3 border-t border-orange-200 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              <p className="text-[14px] font-bold text-gray-800">Answer: <span className="text-green-700">{response.solved_example.answer}</span></p>
            </div>
          )}
          {response.solved_example.verification && (
            <p className="text-[11px] text-gray-500 mt-2 italic">✓ Verification: {response.solved_example.verification}</p>
          )}
        </motion.div>
      )}

      {/* ── COMPARISON TABLE ── */}
      {done && response.comparison && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-cyan-200/60 overflow-hidden shadow-sm">
          <div className="bg-cyan-50 px-4 py-3 border-b border-cyan-100">
            <h4 className="text-[12px] font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} /> Comparison: {response.comparison.header_a} vs {response.comparison.header_b}
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-1/3">Aspect</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-cyan-600 uppercase tracking-wider w-1/3">{response.comparison.header_a}</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider w-1/3">{response.comparison.header_b}</th>
                </tr>
              </thead>
              <tbody>
                {(response.comparison.points || []).map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-2.5 font-semibold text-gray-700 border-b border-gray-100">{row.aspect}</td>
                    <td className="px-4 py-2.5 text-gray-600 border-b border-gray-100">{row.a}</td>
                    <td className="px-4 py-2.5 text-gray-600 border-b border-gray-100">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(response.comparison.when_to_use_a || response.comparison.when_to_use_b) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 bg-gray-50">
              {response.comparison.when_to_use_a && (
                <div className="p-4">
                  <p className="text-[10px] font-bold text-cyan-600 uppercase mb-1">Use {response.comparison.header_a} when:</p>
                  <p className="text-[12px] text-gray-700">{response.comparison.when_to_use_a}</p>
                </div>
              )}
              {response.comparison.when_to_use_b && (
                <div className="p-4">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Use {response.comparison.header_b} when:</p>
                  <p className="text-[12px] text-gray-700">{response.comparison.when_to_use_b}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* ── GRADED EXAMPLES ── */}
      {done && response.graded_examples?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="space-y-3">
          <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Target size={13} className="text-blue-500" /> Graded Examples
          </h4>
          <StaggerChildren className="space-y-3" stagger={0.07}>
            {response.graded_examples.map((ex, i) => {
              const levelColors = { Basic: 'border-green-200 bg-green-50', Intermediate: 'border-amber-200 bg-amber-50', Advanced: 'border-red-200 bg-red-50' };
              const textColors  = { Basic: 'text-green-700', Intermediate: 'text-amber-700', Advanced: 'text-red-700' };
              return (
                <StaggerItem key={i}>
                  <div className={`rounded-xl border p-4 ${levelColors[ex.level] || 'border-gray-200 bg-gray-50'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${textColors[ex.level] || 'text-gray-600'}`}>{ex.level}</span>
                    <p className="text-[13px] font-semibold text-gray-800 mt-1 mb-2">{ex.problem}</p>
                    <p className="text-[12px] text-gray-600 border-t border-current/10 pt-2">{ex.solution}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </motion.div>
      )}

      {/* Key points */}
      {done && response.key_points?.length > 0 && (
        <StaggerChildren className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-2.5" stagger={0.07}>
          <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Target size={13} className="text-blue-500" /> Key Points
          </h4>
          {response.key_points.map((pt, i) => (
            <StaggerItem key={i}>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <RichText text={pt} className="flex-1" />
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      {/* Real-life example + Remember this */}
      {done && (response.real_life_example || response.remember_this) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {response.real_life_example && (
            <ScaleIn className="bg-amber-50 rounded-xl border border-amber-200/60 p-4">
              <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Lightbulb size={12} /> Real-Life Example</h4>
              <p className="text-[13px] text-gray-700 leading-relaxed">{response.real_life_example}</p>
            </ScaleIn>
          )}
          {response.remember_this && (
            <ScaleIn delay={0.05} className="bg-green-50 rounded-xl border border-green-200/60 p-4">
              <h4 className="text-[11px] font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Star size={12} fill="currentColor" /> Remember This</h4>
              <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{response.remember_this}</p>
            </ScaleIn>
          )}
        </div>
      )}

      {/* University-mode extras */}
      {done && mode === 'university' && (
        <AnimatePresence>
          {(response.university_exam_tip || response.textbook_reference || response.viva_questions?.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(response.university_exam_tip || response.textbook_reference) && (
                <div className="bg-purple-50 rounded-xl border border-purple-200/60 p-4">
                  <h4 className="text-[11px] font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <GraduationCap size={12} /> Exam Tip
                  </h4>
                  {response.university_exam_tip && <p className="text-[13px] text-gray-700 leading-relaxed">{response.university_exam_tip}</p>}
                  {response.textbook_reference && (
                    <p className="text-[11px] text-purple-500 mt-2 border-t border-purple-100 pt-2 font-medium">📖 {response.textbook_reference}</p>
                  )}
                </div>
              )}
              {response.viva_questions?.length > 0 && (
                <div className="bg-rose-50 rounded-xl border border-rose-200/60 p-4">
                  <h4 className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <HelpCircle size={12} /> Viva Questions
                  </h4>
                  <StaggerChildren className="space-y-2" stagger={0.08}>
                    {response.viva_questions.map((q, i) => (
                      <StaggerItem key={i}>
                        <p className="text-[12px] text-gray-700 flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold flex-shrink-0">Q{i + 1}.</span> {q}
                        </p>
                      </StaggerItem>
                    ))}
                  </StaggerChildren>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Follow-up question */}
      {done && response.follow_up_question && (
        <ScaleIn delay={0.2} className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-start gap-3">
          <HelpCircle size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-gray-600 italic">{response.follow_up_question}</p>
        </ScaleIn>
      )}

      {/* Recommended books */}
      {done && books?.length > 0 && (
        <div>
          <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BookMarked size={13} className="text-indigo-500" /> Recommended Books
          </h4>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-3" stagger={0.08}>
            {books.map((b, i) => <BookCard key={i} book={b} index={i} />)}
          </StaggerChildren>
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI INPUT BAR
// ─────────────────────────────────────────────────────────────────────────────
function AIInputBar({ onAsk, disabled, loading, placeholder }) {
  const [q, setQ] = useState('');
  const ref = useRef(null);

  const submit = () => {
    if (!q.trim() || loading || disabled) return;
    onAsk(q.trim());
    setQ('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="sticky bottom-0 z-10 pt-2 pb-1"
    >
      <div className={`flex gap-2 p-3 rounded-2xl border-2 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white ${
        disabled ? 'border-gray-200 opacity-60' : 'border-blue-200 focus-within:border-blue-400'
      }`}>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        <textarea
          ref={ref}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={disabled ? 'Select a subject first…' : placeholder || 'Ask your AI professor anything…'}
          disabled={disabled || loading}
          rows={1}
          style={{ resize: 'none', overflow: 'hidden' }}
          onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
          className="flex-1 bg-transparent text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={submit}
          disabled={!q.trim() || loading || disabled}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </motion.button>
      </div>
      {!disabled && (
        <p className="text-center text-[10px] text-gray-400 mt-1">Enter to send · Shift+Enter for new line</p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF GENERATOR (client-side, jsPDF)
// ─────────────────────────────────────────────────────────────────────────────
async function generateStudyPDF({ response, context }) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const pageW = 210, pageH = 297, margin = 18, contentW = pageW - margin * 2;
  let y = margin;

  const checkPage = (needed = 10) => {
    if (y + needed > pageH - margin) { doc.addPage(); y = margin; }
  };

  // ── Cover gradient bar ──
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 22, pageW, 6, 'F');

  // Syllabrix label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(147, 197, 253);
  doc.text('SYLLABRIX AI LIBRARY', margin, 10);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(191, 219, 254);
  doc.text('Generated Study Notes', margin, 17);

  const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  doc.text(now, pageW - margin, 17, { align: 'right' });

  y = 38;

  // ── Topic / Subject title ──
  const titleText = context?.topicName || context?.subjectName || 'Study Notes';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  const titleLines = doc.splitTextToSize(titleText, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 2;

  if (context?.chapterName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(99, 102, 241);
    doc.text(`Chapter: ${context.chapterName}`, margin, y);
    y += 6;
  }
  if (context?.subjectName && context?.topicName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    const meta = [
      context.subjectName,
      context.uniName && `@ ${context.uniName}`,
    ].filter(Boolean).join(' · ');
    doc.text(meta, margin, y);
    y += 6;
  }

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Explanation ──
  if (response.explanation) {
    doc.setFillColor(239, 246, 255);
    const expLines = doc.splitTextToSize(response.explanation, contentW - 8);
    const boxH = expLines.length * 5.5 + 10;
    checkPage(boxH + 10);
    doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.text('AI EXPLANATION', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    doc.text(expLines, margin + 4, y + 14);
    y += boxH + 6;
  }

  // ── Key Points ──
  if (response.key_points?.length) {
    checkPage(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text('KEY POINTS', margin, y);
    y += 6;
    response.key_points.forEach((pt, i) => {
      const ptLines = doc.splitTextToSize(`${i + 1}.  ${pt}`, contentW - 6);
      checkPage(ptLines.length * 5.5 + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(55, 65, 81);
      doc.text(ptLines, margin + 3, y);
      y += ptLines.length * 5.5 + 2;
    });
    y += 4;
  }

  // ── Remember This ──
  if (response.remember_this) {
    const remLines = doc.splitTextToSize(response.remember_this, contentW - 8);
    const boxH = remLines.length * 5.5 + 10;
    checkPage(boxH + 10);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 163, 74);
    doc.text('REMEMBER THIS', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    doc.text(remLines, margin + 4, y + 14);
    y += boxH + 6;
  }

  // ── University Exam Tip ──
  if (response.university_exam_tip) {
    const tipLines = doc.splitTextToSize(response.university_exam_tip, contentW - 8);
    const boxH = tipLines.length * 5.5 + 10;
    checkPage(boxH + 10);
    doc.setFillColor(250, 245, 255);
    doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(109, 40, 217);
    doc.text('EXAM TIP', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    doc.text(tipLines, margin + 4, y + 14);
    y += boxH + 6;
    if (response.textbook_reference) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(109, 40, 217);
      doc.text(`📖 ${response.textbook_reference}`, margin + 4, y);
      y += 7;
    }
  }

  // ── Viva Questions ──
  if (response.viva_questions?.length) {
    checkPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text('VIVA / ORAL EXAM QUESTIONS', margin, y);
    y += 6;
    response.viva_questions.forEach((q, i) => {
      const qLines = doc.splitTextToSize(`Q${i + 1}. ${q}`, contentW - 6);
      checkPage(qLines.length * 5.5 + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(190, 18, 60);
      doc.text(qLines, margin + 3, y);
      y += qLines.length * 5.5 + 3;
    });
    y += 4;
  }

  // ── Real-life example ──
  if (response.real_life_example) {
    const exLines = doc.splitTextToSize(response.real_life_example, contentW - 8);
    const boxH = exLines.length * 5.5 + 10;
    checkPage(boxH + 10);
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text('REAL-LIFE EXAMPLE', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    doc.text(exLines, margin + 4, y + 14);
    y += boxH + 6;
  }

  // ── Footer on every page ──
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text('Syllabrix AI Library · syllabrix.com', margin, pageH - 8);
    doc.text(`Page ${p} / ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' });
  }

  const safeName = (titleText).replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40);
  doc.save(`syllabrix_${safeName}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOK TOC MODAL
// ─────────────────────────────────────────────────────────────────────────────
function BookTOCModal({ book, onClose }) {
  const [chapters, setChapters] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    libraryAPI.getBookChapters(book.id)
      .then(r => setChapters(r.data?.data || []))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [book.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <List size={16} className="text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2">{book.title}</p>
            {book.author && <p className="text-[11px] text-gray-400 mt-0.5">{book.author}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* TOC */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {loading ? (
            <div className="py-8 text-center"><Loader2 size={22} className="animate-spin text-indigo-400 mx-auto" /></div>
          ) : chapters?.length === 0 ? (
            <p className="text-center text-[13px] text-gray-400 py-8">No TOC data available for this book yet.</p>
          ) : (
            chapters?.map((ch, i) => (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-gray-100 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 hover:bg-indigo-50 transition-colors">
                  <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {ch.chapter_num}
                  </span>
                  <span className="flex-1 text-[12px] font-semibold text-gray-700">{ch.chapter_title}</span>
                  {ch.page_start && (
                    <span className="text-[10px] text-gray-400 font-mono">p.{ch.page_start}–{ch.page_end || '?'}</span>
                  )}
                </div>
                {ch.topics?.length > 0 && (
                  <div className="px-3 py-1.5 space-y-1 bg-white">
                    {ch.topics.map((tp, j) => (
                      <div key={j} className="flex items-center gap-2 text-[11px] text-gray-500">
                        <span className="w-1 h-1 rounded-full bg-indigo-300 flex-shrink-0" />
                        <span className="flex-1 truncate">{tp.topic_name}</span>
                        {tp.page_num && <span className="text-gray-300 font-mono flex-shrink-0">p.{tp.page_num}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHOOL DRILL-DOWN
// ─────────────────────────────────────────────────────────────────────────────
function SchoolDrillDown({ onContextReady, onContextClear }) {
  const [boards, setBoards]         = useState(null);
  const [board, setBoard]           = useState(null);
  const [sylVer, setSylVer]         = useState(null);
  const [classes, setClasses]       = useState(null);
  const [cls, setCls]               = useState(null);
  const [subjects, setSubjects]     = useState(null);
  const [subject, setSubject]       = useState(null);
  const [books, setBooks]           = useState(null);
  const [loading, setLoading]       = useState({});

  const setLoad = (k, v) => setLoading(p => ({ ...p, [k]: v }));

  // Load boards on mount
  useEffect(() => {
    setLoad('boards', true);
    libraryAPI.getBoards()
      .then(r => setBoards(r.data?.data || r.data))
      .finally(() => setLoad('boards', false));
  }, []);

  const selectBoard = async (b) => {
    setBoard(b); setCls(null); setSubjects(null); setSubject(null); setBooks(null);
    onContextClear();
    setLoad('classes', true);
    try {
      const [svRes, clsRes] = await Promise.all([
        libraryAPI.getBoardSyllabus(b.code),
        libraryAPI.getClasses(b.code),
      ]);
      const sv = (svRes.data?.data || []).find(s => s.is_current) || (svRes.data?.data || [])[0];
      setSylVer(sv || null);
      setClasses(clsRes.data?.data || []);
    } finally { setLoad('classes', false); }
  };

  const selectClass = async (c) => {
    setCls(c); setSubjects(null); setSubject(null); setBooks(null);
    onContextClear();
    setLoad('subjects', true);
    try {
      const r = await libraryAPI.getSubjects(c.id);
      setSubjects(r.data?.data || []);
    } finally { setLoad('subjects', false); }
  };

  const selectSubject = async (s) => {
    setSubject(s); setBooks(null);
    onContextClear();
    setLoad('books', true);
    try {
      const r = await libraryAPI.getBooks(s.id);
      const booksData = r.data?.data || [];
      setBooks(booksData);
      onContextReady({ mode: 'school', subjectId: s.id, subjectName: s.name, books: booksData });
    } finally { setLoad('books', false); }
  };

  const crumbs = [
    board && board.name,
    cls && (cls.grade_label || `Grade ${cls.grade}`),
    subject && subject.name,
  ].filter(Boolean);

  const resetToBoard = () => { setCls(null); setSubjects(null); setSubject(null); setBooks(null); onContextClear(); };
  const resetToClass = () => { setSubject(null); setBooks(null); onContextClear(); };

  // Group boards
  const boardGroups = boards
    ? Object.entries(boards).filter(([, arr]) => arr.length > 0)
    : null;

  return (
    <div className="space-y-4">
      <Breadcrumb
        crumbs={['School', ...crumbs]}
        onClickIndex={(i) => {
          if (i === 0) { setBoard(null); setCls(null); setSubjects(null); setSubject(null); setBooks(null); onContextClear(); }
          if (i === 1) resetToBoard();
          if (i === 2) resetToClass();
        }}
      />

      {/* Step 1: Board */}
      <StepSection step={1} title="Select Board" loading={loading.boards}>
        {boardGroups?.map(([type, arr]) => (
          <div key={type} className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
              <Hash size={10} /> {type === 'national' ? 'National Boards' : type === 'state' ? 'State Boards' : 'International'}
              <span className="ml-1 text-gray-300">({arr.length})</span>
            </p>
            <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2" stagger={0.04}>
              {arr.map(b => (
                <StaggerItem key={b.id}>
                  <SelectCard
                    label={b.name} sub={b.type === 'state' ? b.state : b.type}
                    selected={board?.id === b.id} onClick={() => selectBoard(b)}
                    color="blue"
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        ))}
      </StepSection>

      {/* Step 2: Class */}
      <AnimatePresence>
        {board && (
          <StepSection step={2} title={`Select Class — ${board.name}`} loading={loading.classes} onReset={resetToBoard}>
            {sylVer && (
              <p className="text-[10px] text-emerald-600 bg-emerald-50 rounded-lg px-2.5 py-1 mb-3 inline-flex items-center gap-1 border border-emerald-200">
                <Star size={9} fill="currentColor" /> {sylVer.version_name} (current)
              </p>
            )}
            <StaggerChildren className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2" stagger={0.03}>
              {(classes || []).map(c => (
                <StaggerItem key={c.id}>
                  <SelectCard
                    label={c.grade_label || `Grade ${c.grade}`}
                    sub={c.stream !== 'general' ? c.stream : undefined}
                    selected={cls?.id === c.id} onClick={() => selectClass(c)}
                    color="teal"
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </StepSection>
        )}
      </AnimatePresence>

      {/* Step 3: Subject */}
      <AnimatePresence>
        {cls && subjects && (
          <StepSection step={3} title={`Select Subject`} loading={loading.subjects} onReset={resetToClass}>
            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" stagger={0.05}>
              {(subjects || []).map(s => (
                <StaggerItem key={s.id}>
                  <SelectCard
                    label={s.name} sub={s.subject_type}
                    badge={s.code} selected={subject?.id === s.id}
                    onClick={() => selectSubject(s)} color="purple"
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </StepSection>
        )}
      </AnimatePresence>

      {/* Books preview */}
      <AnimatePresence>
        {subject && books?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200/80 p-4"
          >
            <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookMarked size={13} className="text-indigo-500" /> Textbooks for {subject.name}
            </h4>
            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-3" stagger={0.07}>
              {books.map((b, i) => <BookCard key={i} book={b} index={i} />)}
            </StaggerChildren>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPETITIVE DRILL-DOWN
// ─────────────────────────────────────────────────────────────────────────────
function CompetitiveDrillDown({ onContextReady, onContextClear }) {
  const [exams, setExams]         = useState(null);
  const [exam, setExam]           = useState(null);
  const [subjects, setSubjects]   = useState(null);
  const [books, setBooks]         = useState(null);
  const [loading, setLoading]     = useState({});
  const [filter, setFilter]       = useState('');

  const setLoad = (k, v) => setLoading(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setLoad('exams', true);
    libraryAPI.getExams()
      .then(r => setExams(r.data?.data || r.data))
      .finally(() => setLoad('exams', false));
  }, []);

  const selectExam = async (e) => {
    setExam(e); setSubjects(null); setBooks(null);
    onContextClear();
    setLoad('detail', true);
    try {
      const [subRes, bookRes] = await Promise.all([
        libraryAPI.getExamSubjects(e.code),
        libraryAPI.getExamBooks(e.code),
      ]);
      setSubjects(subRes.data?.data || []);
      const booksData = bookRes.data?.data || [];
      setBooks(booksData);
      onContextReady({ mode: 'competitive', examCode: e.code, examName: e.name, books: booksData });
    } finally { setLoad('detail', false); }
  };

  const examGroups = exams ? Object.entries(exams).filter(([, arr]) => arr.length > 0) : null;

  const TYPE_COLOR = {
    engineering: 'blue', medical: 'rose', government: 'orange',
    banking: 'teal', defence: 'indigo', state: 'green', other: 'purple',
  };

  return (
    <div className="space-y-4">
      <Breadcrumb
        crumbs={['Competitive', exam && exam.name].filter(Boolean)}
        onClickIndex={(i) => { if (i === 0) { setExam(null); setSubjects(null); setBooks(null); onContextClear(); } }}
      />

      {/* Step 1: Exam */}
      <StepSection step={1} title="Select Exam" loading={loading.exams}>
        {/* Search */}
        <div className="relative mb-4">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={filter} onChange={e => setFilter(e.target.value)}
            placeholder="Search exams…"
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
        </div>

        {examGroups?.map(([type, arr]) => {
          const filtered = filter ? arr.filter(e => e.name.toLowerCase().includes(filter.toLowerCase())) : arr;
          if (!filtered.length) return null;
          return (
            <div key={type} className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 capitalize">
                {type.replace('_', ' ')} <span className="text-gray-300">({filtered.length})</span>
              </p>
              <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" stagger={0.04}>
                {filtered.map(e => (
                  <StaggerItem key={e.id}>
                    <SelectCard
                      label={e.name} sub={`${e.level || ''} ${e.state ? '· ' + e.state : ''}`}
                      selected={exam?.id === e.id} onClick={() => selectExam(e)}
                      color={TYPE_COLOR[type] || 'blue'}
                    />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          );
        })}
      </StepSection>

      {/* Step 2: Subjects + Books */}
      <AnimatePresence>
        {exam && (
          <StepSection step={2} title={`${exam.name} — Subjects & Books`} loading={loading.detail}
            onReset={() => { setExam(null); setSubjects(null); setBooks(null); onContextClear(); }}>

            {subjects?.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Exam Syllabus</p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s, i) => (
                    <motion.span key={i}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {s.name}
                      {s.weightage_percent ? ` · ${s.weightage_percent}%` : ''}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {books?.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Recommended Books</p>
                <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-3" stagger={0.07}>
                  {books.map((b, i) => <BookCard key={i} book={b} index={i} />)}
                </StaggerChildren>
              </div>
            )}
          </StepSection>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSITY DRILL-DOWN
// ─────────────────────────────────────────────────────────────────────────────
function UniversityDrillDown({ onContextReady, onContextClear }) {
  const [universities, setUniversities] = useState(null);
  const [uni, setUni]                   = useState(null);
  const [uniCourses, setUniCourses]     = useState(null);
  const [course, setCourse]             = useState(null);
  const [semesters, setSemesters]       = useState(null);
  const [semester, setSemester]         = useState(null);
  const [subjects, setSubjects]         = useState(null);
  const [uniSubject, setUniSubject]     = useState(null);
  const [books, setBooks]               = useState(null);
  const [chapters, setChapters]         = useState(null);
  const [chapter, setChapter]           = useState(null);
  const [topics, setTopics]             = useState(null);
  const [topic, setTopic]               = useState(null);
  const [loading, setLoading]           = useState({});
  const [uniFilter, setUniFilter]       = useState('');
  const [expandedType, setExpandedType] = useState(null);

  const setLoad = (k, v) => setLoading(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setLoad('unis', true);
    libraryAPI.getUniversities()
      .then(r => setUniversities(r.data?.data || r.data))
      .finally(() => setLoad('unis', false));
  }, []);

  const selectUni = async (u) => {
    setUni(u); setUniCourses(null); setCourse(null); setSemesters(null); setSemester(null); setSubjects(null); setUniSubject(null); setBooks(null);
    onContextClear();
    setLoad('courses', true);
    try {
      const r = await libraryAPI.getUniversityCourses(u.id);
      setUniCourses(r.data?.data || []);
    } finally { setLoad('courses', false); }
  };

  const selectCourse = async (c) => {
    setCourse(c); setSemesters(null); setSemester(null); setSubjects(null); setUniSubject(null); setBooks(null);
    onContextClear();
    setLoad('subjects', true);
    try {
      const r = await libraryAPI.getCourseSubjects(c.id);
      const data = r.data?.data || {};
      // data is grouped by semester
      const semNums = Object.keys(data).sort((a, b) => Number(a) - Number(b));
      setSemesters({ grouped: data, nums: semNums });
    } finally { setLoad('subjects', false); }
  };

  const selectSemester = (semNum) => {
    setSemester(semNum);
    setSubjects(semesters.grouped[semNum] || []);
    setUniSubject(null); setBooks(null);
    onContextClear();
  };

  const selectSubject = async (s) => {
    setUniSubject(s); setBooks(null); setChapters(null); setChapter(null); setTopics(null); setTopic(null);
    onContextClear();
    setLoad('books', true);
    try {
      const [bookRes, chapRes] = await Promise.all([
        libraryAPI.getSubjectBooks(s.id),
        libraryAPI.getSubjectChapters(s.id),
      ]);
      const booksData = bookRes.data?.data || [];
      const chapsData = chapRes.data?.data || [];
      setBooks(booksData);
      setChapters(chapsData.length > 0 ? chapsData : null);
      onContextReady({ mode: 'university', universitySubjectId: s.id, subjectName: s.name, uniName: uni?.short_name || uni?.name, books: booksData });
    } finally { setLoad('books', false); }
  };

  const selectChapter = async (ch) => {
    setChapter(ch); setTopics(null); setTopic(null);
    onContextReady({ mode: 'university', universitySubjectId: uniSubject.id, subjectName: uniSubject.name, chapterName: ch.chapter_name, uniName: uni?.short_name || uni?.name, books });
    setLoad('topics', true);
    try {
      const r = await libraryAPI.getChapterTopics(ch.id);
      setTopics(r.data?.data || []);
    } finally { setLoad('topics', false); }
  };

  const selectTopic = (tp) => {
    setTopic(tp);
    onContextReady({
      mode: 'university',
      universitySubjectId: uniSubject.id,
      universityTopicId: tp.id,
      subjectName: uniSubject.name,
      chapterName: chapter?.chapter_name,
      topicName: tp.topic_name,
      uniName: uni?.short_name || uni?.name,
      books,
    });
  };

  const uniGroups = universities
    ? Object.entries(universities).filter(([, arr]) => arr.length > 0)
    : null;

  const TYPE_ORDER = ['iit', 'nit', 'aiims', 'iim', 'central', 'deemed', 'private', 'state', 'autonomous'];

  const sortedGroups = uniGroups
    ? [...uniGroups].sort((a, b) => TYPE_ORDER.indexOf(a[0]) - TYPE_ORDER.indexOf(b[0]))
    : [];

  const crumbs = [
    uni && (uni.short_name || uni.name),
    course && course.short_name,
    semester && `Sem ${semester}`,
    uniSubject && uniSubject.name,
    chapter && `Ch.${chapter.chapter_num}`,
    topic && topic.topic_name,
  ].filter(Boolean);

  const resetAll = () => { setUni(null); setUniCourses(null); setCourse(null); setSemesters(null); setSemester(null); setSubjects(null); setUniSubject(null); setBooks(null); setChapters(null); setChapter(null); setTopics(null); setTopic(null); onContextClear(); };

  return (
    <div className="space-y-4">
      <Breadcrumb
        crumbs={['University', ...crumbs]}
        onClickIndex={(i) => {
          if (i === 0) { resetAll(); }
          if (i === 1) { setCourse(null); setSemesters(null); setSemester(null); setSubjects(null); setUniSubject(null); setBooks(null); setChapters(null); setChapter(null); setTopics(null); setTopic(null); onContextClear(); }
          if (i === 2) { setSemester(null); setSubjects(null); setUniSubject(null); setBooks(null); setChapters(null); setChapter(null); setTopics(null); setTopic(null); onContextClear(); }
          if (i === 3) { setUniSubject(null); setBooks(null); setChapters(null); setChapter(null); setTopics(null); setTopic(null); onContextClear(); }
          if (i === 4) { setChapter(null); setTopics(null); setTopic(null); if (uniSubject) onContextReady({ mode: 'university', universitySubjectId: uniSubject.id, subjectName: uniSubject.name, uniName: uni?.short_name || uni?.name, books }); }
          if (i === 5) { setTopic(null); if (chapter) onContextReady({ mode: 'university', universitySubjectId: uniSubject.id, subjectName: uniSubject.name, chapterName: chapter.chapter_name, uniName: uni?.short_name || uni?.name, books }); }
        }}
      />

      {/* Step 1: University */}
      <StepSection step={1} title="Select University" loading={loading.unis}>
        <div className="relative mb-4">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={uniFilter} onChange={e => setUniFilter(e.target.value)}
            placeholder="Search universities…"
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
        </div>

        {sortedGroups.map(([type, arr]) => {
          const filtered = uniFilter
            ? arr.filter(u => u.name.toLowerCase().includes(uniFilter.toLowerCase()) || u.short_name?.toLowerCase().includes(uniFilter.toLowerCase()))
            : arr;
          if (!filtered.length) return null;
          const isExpanded = expandedType === type || !!uniFilter;
          const shown = isExpanded ? filtered : filtered.slice(0, 4);

          return (
            <div key={type} className="mb-4">
              <button
                onClick={() => setExpandedType(isExpanded && !uniFilter ? null : type)}
                className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 hover:text-gray-600 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <Building2 size={10} /> {UNI_TYPE_LABEL[type] || type}
                  <span className="text-gray-300 ml-1">({filtered.length})</span>
                </span>
                {!uniFilter && <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
              </button>
              <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" stagger={0.03}>
                {shown.map(u => (
                  <StaggerItem key={u.id}>
                    <SelectCard
                      label={u.short_name || u.name}
                      sub={`${u.location_city || ''}${u.location_state ? ', ' + u.location_state : ''}`}
                      badge={u.nirf_rank ? `NIRF #${u.nirf_rank}` : u.naac_grade !== 'NA' ? u.naac_grade : undefined}
                      selected={uni?.id === u.id}
                      onClick={() => selectUni(u)}
                      color="indigo"
                      icon={Building2}
                    />
                  </StaggerItem>
                ))}
              </StaggerChildren>
              {!uniFilter && filtered.length > 4 && (
                <button onClick={() => setExpandedType(isExpanded ? null : type)}
                  className="text-[11px] text-blue-500 hover:text-blue-700 mt-1.5 font-medium">
                  {isExpanded ? 'Show less' : `+${filtered.length - 4} more`}
                </button>
              )}
            </div>
          );
        })}
      </StepSection>

      {/* Step 2: Course */}
      <AnimatePresence>
        {uni && (
          <StepSection step={2} title={`Courses at ${uni.short_name || uni.name}`} loading={loading.courses}
            onReset={() => { setUni(null); setUniCourses(null); setCourse(null); setSemesters(null); setSemester(null); setSubjects(null); setUniSubject(null); setBooks(null); onContextClear(); }}>

            {uniCourses && Object.entries(
              uniCourses.reduce((acc, c) => { (acc[c.level] = acc[c.level] || []).push(c); return acc; }, {})
            ).map(([level, list]) => (
              <div key={level} className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 capitalize">{level}</p>
                <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-2" stagger={0.04}>
                  {list.map(c => (
                    <StaggerItem key={c.id}>
                      <SelectCard
                        label={c.short_name} sub={c.specialization || c.name}
                        badge={c.duration_years ? `${c.duration_years}yr` : undefined}
                        selected={course?.id === c.id} onClick={() => selectCourse(c)}
                        color="orange" icon={GraduationCap}
                      />
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </div>
            ))}
          </StepSection>
        )}
      </AnimatePresence>

      {/* Step 3: Semester */}
      <AnimatePresence>
        {course && semesters && (
          <StepSection step={3} title={`Select Semester — ${course.short_name}`} loading={loading.subjects}
            onReset={() => { setCourse(null); setSemesters(null); setSemester(null); setSubjects(null); setUniSubject(null); setBooks(null); onContextClear(); }}>
            <StaggerChildren className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2" stagger={0.04}>
              {semesters.nums.map(s => (
                <StaggerItem key={s}>
                  <SelectCard
                    label={`Sem ${s}`} sub={`${semesters.grouped[s]?.length || 0} subjects`}
                    selected={semester === s} onClick={() => selectSemester(s)}
                    color="green"
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </StepSection>
        )}
      </AnimatePresence>

      {/* Step 4: Subject */}
      <AnimatePresence>
        {semester && subjects && (
          <StepSection step={4} title={`Subjects — Semester ${semester}`}
            onReset={() => { setSemester(null); setSubjects(null); setUniSubject(null); setBooks(null); onContextClear(); }}>
            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-2" stagger={0.05}>
              {subjects.map(s => (
                <StaggerItem key={s.id}>
                  <SelectCard
                    label={s.name} sub={`${s.subject_type} · ${s.credits || 0} credits`}
                    badge={s.subject_code}
                    selected={uniSubject?.id === s.id} onClick={() => selectSubject(s)}
                    color="rose" icon={BookOpen}
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </StepSection>
        )}
      </AnimatePresence>

      {/* Books for selected subject */}
      <AnimatePresence>
        {uniSubject && books?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200/80 p-4"
          >
            <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookMarked size={13} className="text-indigo-500" /> Books for {uniSubject.name}
            </h4>
            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-3" stagger={0.07}>
              {books.map((b, i) => <BookCard key={i} book={b} index={i} />)}
            </StaggerChildren>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 5: Chapters (only shown when chapters exist for the subject) */}
      <AnimatePresence>
        {chapters && uniSubject && (
          <StepSection step={5} title={`Chapters — ${uniSubject.name}`} loading={loading.topics}
            onReset={() => { setChapter(null); setTopics(null); setTopic(null); onContextReady({ mode: 'university', universitySubjectId: uniSubject.id, subjectName: uniSubject.name, uniName: uni?.short_name || uni?.name, books }); }}>
            <p className="text-[11px] text-gray-400 mb-3">Drill into a chapter for focused AI explanations and topic-level PDF notes.</p>
            <StaggerChildren className="space-y-2" stagger={0.05}>
              {chapters.map(ch => (
                <StaggerItem key={ch.id}>
                  <motion.button
                    whileTap={{ scale: 0.99 }} whileHover={{ x: 2 }}
                    onClick={() => selectChapter(ch)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      chapter?.id === ch.id
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 bg-gray-50 hover:border-purple-200 hover:bg-purple-50/40'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
                      chapter?.id === ch.id ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
                    }`}>
                      {ch.chapter_num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold truncate ${chapter?.id === ch.id ? 'text-purple-700' : 'text-gray-800'}`}>
                        {ch.chapter_name}
                      </p>
                      {ch.description && <p className="text-[10px] text-gray-400 truncate mt-0.5">{ch.description}</p>}
                    </div>
                    {chapter?.id === ch.id
                      ? <CheckCircle2 size={16} className="text-purple-500 flex-shrink-0" />
                      : <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                    }
                  </motion.button>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </StepSection>
        )}
      </AnimatePresence>

      {/* Step 6: Topics */}
      <AnimatePresence>
        {chapter && (
          <StepSection step={6} title={`Topics — Ch.${chapter.chapter_num}: ${chapter.chapter_name}`} loading={loading.topics}
            onReset={() => { setTopic(null); setTopics(null); setChapter(null); onContextReady({ mode: 'university', universitySubjectId: uniSubject.id, subjectName: uniSubject.name, uniName: uni?.short_name || uni?.name, books }); }}>
            {loading.topics ? (
              <SkeletonGrid n={4} />
            ) : (
              <>
                <p className="text-[11px] text-gray-400 mb-3">Select a topic for deep AI explanation + downloadable PDF study notes.</p>
                <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-2" stagger={0.05}>
                  {(topics || []).map(tp => (
                    <StaggerItem key={tp.id}>
                      <motion.button
                        whileTap={{ scale: 0.97 }} whileHover={{ y: -1 }}
                        onClick={() => selectTopic(tp)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all group ${
                          topic?.id === tp.id
                            ? 'border-violet-300 bg-violet-50 shadow-sm shadow-violet-100'
                            : 'border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/30'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                          topic?.id === tp.id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {tp.topic_num}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-semibold leading-snug ${topic?.id === tp.id ? 'text-violet-700' : 'text-gray-800'}`}>
                            {tp.topic_name}
                          </p>
                          {tp.description && (
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{tp.description}</p>
                          )}
                        </div>
                        {topic?.id === tp.id
                          ? <CheckCircle2 size={15} className="text-violet-500 flex-shrink-0 mt-0.5" />
                          : <FileDown size={13} className="text-gray-300 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-0.5" />
                        }
                      </motion.button>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
                {topic && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2 p-3 bg-violet-50 rounded-xl border border-violet-200"
                  >
                    <CheckCircle2 size={15} className="text-violet-500 flex-shrink-0" />
                    <p className="text-[12px] text-violet-700 flex-1">
                      <span className="font-semibold">{topic.topic_name}</span> selected — type your question below or ask for a PDF summary.
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </StepSection>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AILibraryPage() {
  const [tab, setTab]               = useState('school');
  const [context, setContext]       = useState(null);   // { mode, subjectId|examCode|universitySubjectId, books }
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiBooksUsed, setAiBooksUsed] = useState([]);
  const aiRef = useRef(null);

  const handleContextReady = useCallback((ctx) => {
    setContext(ctx);
    setAiResponse(null);
    setAiBooksUsed([]);
  }, []);

  const handleContextClear = useCallback(() => {
    setContext(null);
    setAiResponse(null);
    setAiBooksUsed([]);
  }, []);

  const handleTabChange = (id) => {
    setTab(id);
    setContext(null);
    setAiResponse(null);
    setAiBooksUsed([]);
  };

  const handleAsk = async (query) => {
    if (!context) return;
    setAiLoading(true);
    setAiResponse(null);

    const payload = { studentQuery: query };
    if (context.mode === 'school')       { payload.subjectId = context.subjectId; }
    if (context.mode === 'competitive')  { payload.examCode  = context.examCode;  }
    if (context.mode === 'university')   {
      payload.universitySubjectId = context.universitySubjectId;
      if (context.universityTopicId) payload.universityTopicId = context.universityTopicId;
    }

    try {
      const r = await libraryAPI.ask(payload);
      const data = r.data?.data || r.data;
      setAiResponse(data);
      setAiBooksUsed(data.recommended_books || context.books?.slice(0, 4) || []);
      // Scroll to AI panel
      setTimeout(() => aiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setAiResponse({ explanation: 'Sorry, something went wrong. Please try again.', key_points: [] });
    } finally {
      setAiLoading(false);
    }
  };

  const aiPlaceholders = {
    school: 'e.g. "Explain photosynthesis with diagrams"',
    competitive: 'e.g. "Explain depreciation for CA Foundation"',
    university: 'e.g. "Derive the Navier-Stokes equation"',
  };

  // Stats for hero
  const STATS = [
    { label: 'Universities', value: 136 },
    { label: 'Boards', value: 40 },
    { label: 'Exams', value: 38 },
    { label: 'Books', value: 200 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── HERO ── */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-blue-900 to-violet-900 p-6 sm:p-8">
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -translate-y-1/3 translate-x-1/4 blur-2xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-violet-500/10 rounded-full translate-y-1/3 blur-2xl" />

          <div className="relative z-10">
            <StaggerChildren className="space-y-1 mb-5" stagger={0.08}>
              <StaggerItem>
                <div className="flex items-center gap-2 text-blue-300/70 text-[11px] font-bold uppercase tracking-widest">
                  <LibraryBig size={12} /> AI Library
                </div>
              </StaggerItem>
              <StaggerItem>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  India&apos;s Smartest<br />
                  <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    Study Assistant ✨
                  </span>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="text-blue-300/60 text-[13px]">
                  School · Competitive · University · 24/7 AI Professor
                </p>
              </StaggerItem>
            </StaggerChildren>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
                  className="text-center"
                >
                  <p className="text-xl font-extrabold text-white">
                    <NumberFlow value={s.value} />+
                  </p>
                  <p className="text-[10px] text-blue-300/60 uppercase tracking-wider font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── TABS ── */}
      <ScaleIn>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-2">
          <div className="grid grid-cols-3 gap-1 relative">
            {TABS.map(t => (
              <motion.button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                whileHover={{ scale: tab !== t.id ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1.5 px-3 py-3 rounded-xl text-left transition-colors z-10 ${
                  tab === t.id ? 'text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === t.id && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-xl bg-blue-50 border border-blue-200"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="text-lg sm:text-base relative z-10">{t.emoji}</span>
                <span className="relative z-10">
                  <span className="text-[13px] font-bold block sm:inline">{t.label}</span>
                  <span className="hidden sm:block text-[10px] font-normal text-gray-400 mt-0.5">{t.desc}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </ScaleIn>

      {/* ── DRILL-DOWN ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {tab === 'school' && (
            <SchoolDrillDown onContextReady={handleContextReady} onContextClear={handleContextClear} />
          )}
          {tab === 'competitive' && (
            <CompetitiveDrillDown onContextReady={handleContextReady} onContextClear={handleContextClear} />
          )}
          {tab === 'university' && (
            <UniversityDrillDown onContextReady={handleContextReady} onContextClear={handleContextClear} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── AI PANEL ── */}
      <AnimatePresence>
        {context && (
          <motion.div
            ref={aiRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-4"
          >
            {/* Context badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm shadow-blue-200"
              >
                <Sparkles size={11} />
                {context.mode === 'school' && `AI Tutor — ${context.subjectName}`}
                {context.mode === 'competitive' && `AI Coach — ${context.examName}`}
                {context.mode === 'university' && `AI Professor — ${context.subjectName}${context.uniName ? ' @ ' + context.uniName : ''}`}
              </motion.div>
              <span className="text-[11px] text-gray-400">Ask anything below ↓</span>
            </div>

            {/* AI Response */}
            <AnimatePresence>
              {aiLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <Sparkles size={16} className="text-blue-500" />
                    </motion.div>
                    <span className="text-[13px] text-gray-500 font-medium">Your AI professor is thinking…</span>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-3/4" />
                </motion.div>
              )}
            </AnimatePresence>

            {!aiLoading && aiResponse && (
              <AIResponsePanel
                response={aiResponse}
                books={aiBooksUsed}
                mode={context.mode}
                context={context}
              />
            )}

            {/* AI Input */}
            <AIInputBar
              onAsk={handleAsk}
              disabled={!context}
              loading={aiLoading}
              placeholder={aiPlaceholders[tab]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EMPTY STATE (no context yet) ── */}
      <AnimatePresence>
        {!context && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center py-10"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4 shadow-sm"
            >
              <LibraryBig size={28} className="text-blue-400" />
            </motion.div>
            <p className="font-bold text-gray-600 text-[15px]">Select a subject to begin</p>
            <p className="text-[13px] text-gray-400 mt-1">
              {tab === 'school' && 'Choose your board → class → subject above'}
              {tab === 'competitive' && 'Choose your target exam above'}
              {tab === 'university' && 'Choose your university → course → subject above'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
