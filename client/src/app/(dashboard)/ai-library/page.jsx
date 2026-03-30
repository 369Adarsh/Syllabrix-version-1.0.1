'use client';
/**
 * AI Library v2.0 — Compact Accordion + Fullscreen AI + PDF
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout  : Fixed header + content area (h-screen, zero page scroll)
 * Nav     : Accordion drill-down (school / competitive / university)
 * AI View : Full-page slide-in with typewriter, code blocks, viva, PDF
 * Data    : NCERT TOC for school, DB for uni, exam subjects for competitive
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Trophy, Building2, ChevronDown, ChevronRight,
  BookOpen, Brain, Download, Star, Share2, ArrowLeft, Loader2,
  Sparkles, Copy, Check, HelpCircle, ExternalLink, MessageSquare,
  FileText, Target, Layers, BookMarked, LayoutGrid, RefreshCw,
  Lightbulb, Code2, GitCompare, Calculator, List, FileDown,
} from 'lucide-react';
import { libraryAPI } from '@/lib/api/library.api';

// ─── PDF Generator ────────────────────────────────────────────────────────────

async function generateStudyPDF({ response, context }) {
  const jsPDFModule = await import('jspdf');
  const { jsPDF } = jsPDFModule;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 0;

  const ensurePage = (need = 30) => {
    if (y + need > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage();
      y = 50;
    }
  };

  const wrap = (text, maxW) => doc.splitTextToSize(String(text || ''), maxW);

  // Cover bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Syllabrix AI Library', margin, 30);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const crumb = [context?.board, context?.subject, context?.chapter, context?.topic].filter(Boolean).join(' › ');
  doc.text(crumb || 'Study Notes', margin, 50);
  doc.setTextColor(0, 0, 0);
  y = 90;

  // Explanation
  if (response.explanation) {
    doc.setFontSize(13); doc.setFont(undefined, 'bold');
    doc.text('Explanation', margin, y); y += 18;
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    const lines = wrap(response.explanation.replace(/\*\*/g, ''), W - margin * 2);
    lines.forEach(l => { ensurePage(); doc.text(l, margin, y); y += 14; });
    y += 8;
  }

  // Key points
  if (response.key_points?.length) {
    ensurePage(40);
    doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text('Key Points', margin, y); y += 16;
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    response.key_points.forEach(p => {
      ensurePage();
      const lines = wrap(`• ${p}`, W - margin * 2 - 10);
      lines.forEach(l => { doc.text(l, margin + 8, y); y += 13; });
    });
    y += 6;
  }

  // Code
  if (response.code_example?.code) {
    ensurePage(60);
    doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text(`Code (${response.code_example.language || ''})`, margin, y); y += 16;
    doc.setFillColor(240, 240, 240);
    const codeLines = String(response.code_example.code).split('\n');
    const boxH = codeLines.length * 12 + 16;
    doc.rect(margin, y - 10, W - margin * 2, boxH, 'F');
    doc.setFontSize(8); doc.setFont('Courier', 'normal');
    codeLines.forEach(l => { ensurePage(); doc.text(l, margin + 8, y); y += 12; });
    y += 10;
    doc.setFont(undefined, 'normal');
  }

  // Derivation
  if (response.derivation_steps?.length) {
    ensurePage(40);
    doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.setTextColor(109, 40, 217);
    doc.text('Derivation Steps', margin, y); doc.setTextColor(0, 0, 0); y += 16;
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    response.derivation_steps.forEach((s, i) => {
      ensurePage();
      const lines = wrap(`${i + 1}. ${s}`, W - margin * 2);
      lines.forEach(l => { doc.text(l, margin, y); y += 13; });
    });
    y += 6;
  }

  // Exam tip + viva
  if (response.university_exam_tip) {
    ensurePage(30);
    doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.setTextColor(124, 58, 237);
    doc.text('Exam Tip', margin, y); doc.setTextColor(0, 0, 0); y += 14;
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    wrap(response.university_exam_tip, W - margin * 2).forEach(l => { doc.text(l, margin, y); y += 13; });
    y += 6;
  }
  if (response.viva_questions?.length) {
    ensurePage(40);
    doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.setTextColor(220, 38, 38);
    doc.text('Viva Questions', margin, y); doc.setTextColor(0, 0, 0); y += 14;
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    response.viva_questions.forEach((q, i) => {
      ensurePage();
      doc.text(`Q${i + 1}: ${q}`, margin, y); y += 13;
    });
  }

  // Footer on every page
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(150, 150, 150);
    doc.text(`Syllabrix AI Library — Page ${i} of ${total}`, margin, doc.internal.pageSize.getHeight() - 20);
  }

  doc.save(`syllabrix-study-${Date.now()}.pdf`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useTypewriter(text, speed = 6) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
}

function RichText({ text, className = '' }) {
  if (!text) return null;
  const parseBold = (str) => {
    const parts = str.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
  };
  return (
    <div className={`space-y-1 ${className}`}>
      {String(text).split('\n').filter(l => l.trim()).map((line, i) => {
        const isBullet = /^[-•*]\s/.test(line.trim());
        const content = isBullet ? line.trim().replace(/^[-•*]\s/, '') : line;
        return (
          <p key={i} className={`text-[13px] leading-relaxed ${isBullet ? 'flex gap-2' : ''}`}>
            {isBullet && <span className="text-blue-500 mt-1 flex-shrink-0">•</span>}
            <span>{parseBold(content)}</span>
          </p>
        );
      })}
    </div>
  );
}

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({ icon: Icon, iconColor = 'text-blue-600', label, sublabel, isOpen, isSelected, onClick, children, depth = 0, loading = false }) {
  return (
    <div className={`${depth > 0 ? 'ml-4 border-l border-gray-100 pl-2' : ''}`}>
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 text-left group ${
          isSelected
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'hover:bg-gray-50 text-gray-700'
        }`}
      >
        {Icon && <Icon size={15} className={`flex-shrink-0 ${isSelected ? 'text-blue-600' : iconColor}`} />}
        <span className="flex-1 min-w-0">
          <span className="text-[13px] truncate block">{label}</span>
          {sublabel && <span className="text-[10px] text-gray-400">{sublabel}</span>}
        </span>
        {loading && <Loader2 size={12} className="animate-spin text-gray-400 flex-shrink-0" />}
        {!loading && children && (
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronRight size={13} className="text-gray-400" />
          </motion.div>
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Topic row with AI trigger ────────────────────────────────────────────────

function TopicRow({ topic, onAsk }) {
  return (
    <div className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 group cursor-pointer border-l border-gray-100 pl-3"
      onClick={() => onAsk(topic.name || topic.topic_name, topic)}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0 group-hover:bg-blue-500 transition-colors" />
      <span className="flex-1 text-[12px] text-gray-600 group-hover:text-blue-700 truncate">
        {topic.name || topic.topic_name}
      </span>
      <span className="hidden group-hover:flex items-center gap-1 text-[10px] text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
        <Sparkles size={9} /> AI
      </span>
    </div>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────

function CodeBlock({ language, code, explanation, sampleIO }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm my-3">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2">
        <span className="text-[11px] text-gray-400 font-mono">{language || 'code'}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors">
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="bg-gray-950 text-green-300 font-mono text-[12px] p-4 overflow-x-auto leading-5 max-h-64">
        <code>{code}</code>
      </pre>
      {explanation && <div className="bg-gray-50 px-4 py-2.5 text-[12px] text-gray-600 border-t border-gray-200">{explanation}</div>}
      {sampleIO && <div className="bg-gray-50 px-4 pb-3 text-[11px] text-gray-500 font-mono whitespace-pre-wrap border-t border-gray-100">{sampleIO}</div>}
    </div>
  );
}

// ─── Full AI Response Panel ───────────────────────────────────────────────────

const QTYPE_ICONS = {
  code: Code2, derivation: Calculator, solve: Target,
  compare: GitCompare, complexity: Layers, examples: List, explain: Lightbulb,
};
const DEPTH_COLORS = { beginner: 'bg-green-100 text-green-700', intermediate: 'bg-blue-100 text-blue-700', advanced: 'bg-purple-100 text-purple-700' };

function FullscreenAIView({ response, context, query, onBack, onNewQuestion }) {
  const { displayed: typedText, done: typeDone } = useTypewriter(response.explanation || '', 4);
  const [customQ, setCustomQ] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const QIcon = QTYPE_ICONS[response.question_type] || Lightbulb;

  const handlePDF = async () => {
    setPdfLoading(true);
    try { await generateStudyPDF({ response, context }); }
    finally { setPdfLoading(false); }
  };

  const variants = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
    item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="flex flex-col h-full bg-white"
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-blue-200 truncate">
            {[context?.board, context?.university, context?.course, context?.subject, context?.chapter].filter(Boolean).join(' › ')}
          </div>
          <div className="text-[13px] font-medium truncate">{context?.topic || query}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${DEPTH_COLORS[response.depth_level] || 'bg-white/10 text-white'}`}>
            {response.depth_level}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 flex items-center gap-1">
            <QIcon size={9} />{response.question_type}
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">

          {/* Explanation */}
          <motion.div variants={variants.item} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={15} className="text-blue-600" />
              <span className="text-[13px] font-semibold text-gray-800">AI Explanation</span>
            </div>
            <RichText text={typedText} className="text-gray-700" />
            {!typeDone && <span className="inline-block w-1 h-4 bg-blue-500 animate-pulse ml-0.5" />}
          </motion.div>

          {/* Code block */}
          {response.code_example?.code && typeDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Code2 size={13} className="text-gray-600" />
                <span className="text-[12px] font-semibold text-gray-700">Code Implementation</span>
              </div>
              <CodeBlock {...response.code_example} />
              {response.complexity_analysis && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { label: 'Time', val: response.complexity_analysis.time, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Space', val: response.complexity_analysis.space, color: 'bg-green-50 text-green-700' },
                    { label: 'Best', val: response.complexity_analysis.best_case, color: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Worst', val: response.complexity_analysis.worst_case, color: 'bg-red-50 text-red-700' },
                  ].map(({ label, val, color }) => val && (
                    <div key={label} className={`rounded-lg p-2.5 ${color}`}>
                      <div className="text-[10px] font-semibold opacity-60 uppercase">{label}</div>
                      <div className="text-[12px] font-mono mt-0.5">{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Derivation */}
          {response.derivation_steps?.length > 0 && typeDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-violet-50 rounded-xl border border-violet-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator size={13} className="text-violet-600" />
                <span className="text-[12px] font-semibold text-violet-700">Derivation</span>
              </div>
              <ol className="space-y-2">
                {response.derivation_steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-[12px] text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              {response.formula && (
                <div className="mt-3 bg-white rounded-lg p-3 border border-violet-200 font-mono text-[13px] text-violet-800 text-center">
                  {response.formula}
                </div>
              )}
            </motion.div>
          )}

          {/* Solved example */}
          {response.solved_example?.problem && typeDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-orange-50 rounded-xl border border-orange-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target size={13} className="text-orange-600" />
                <span className="text-[12px] font-semibold text-orange-700">Solved Example</span>
              </div>
              <div className="bg-white rounded-lg p-3 text-[12px] text-gray-700 mb-3 border border-orange-100">
                <span className="font-semibold text-orange-600">Problem: </span>{response.solved_example.problem}
              </div>
              {response.solved_example.approach && (
                <p className="text-[11px] text-gray-500 mb-2">
                  <span className="font-medium">Approach: </span>{response.solved_example.approach}
                </p>
              )}
              <ol className="space-y-1.5">
                {(response.solved_example.solution_steps || []).map((s, i) => (
                  <li key={i} className="flex gap-2 text-[12px] text-gray-600">
                    <span className="text-orange-500 font-semibold flex-shrink-0">{i + 1}.</span>{s}
                  </li>
                ))}
              </ol>
              {response.solved_example.answer && (
                <div className="mt-3 flex items-center gap-2 bg-green-50 rounded-lg p-2.5">
                  <Check size={14} className="text-green-600" />
                  <span className="text-[12px] font-semibold text-green-700">{response.solved_example.answer}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Comparison table */}
          {response.comparison?.points?.length > 0 && typeDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-cyan-100 overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-cyan-600 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Aspect</th>
                    <th className="px-3 py-2 text-left font-medium">{response.comparison.header_a}</th>
                    <th className="px-3 py-2 text-left font-medium">{response.comparison.header_b}</th>
                  </tr>
                </thead>
                <tbody>
                  {response.comparison.points.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-cyan-50'}>
                      <td className="px-3 py-2 font-medium text-gray-700">{row.aspect}</td>
                      <td className="px-3 py-2 text-gray-600">{row.a}</td>
                      <td className="px-3 py-2 text-gray-600">{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(response.comparison.when_to_use_a || response.comparison.when_to_use_b) && (
                <div className="grid grid-cols-2 bg-cyan-50 border-t border-cyan-100">
                  {response.comparison.when_to_use_a && (
                    <div className="px-3 py-2 text-[11px] text-gray-600">
                      <span className="font-semibold text-cyan-700">Use {response.comparison.header_a}: </span>
                      {response.comparison.when_to_use_a}
                    </div>
                  )}
                  {response.comparison.when_to_use_b && (
                    <div className="px-3 py-2 text-[11px] text-gray-600 border-l border-cyan-100">
                      <span className="font-semibold text-cyan-700">Use {response.comparison.header_b}: </span>
                      {response.comparison.when_to_use_b}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Graded examples */}
          {response.graded_examples?.length > 0 && typeDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <span className="text-[12px] font-semibold text-gray-700 flex items-center gap-1.5">
                <List size={13} /> Graded Examples
              </span>
              {response.graded_examples.map((ex, i) => {
                const colors = ['bg-green-50 border-green-100', 'bg-yellow-50 border-yellow-100', 'bg-red-50 border-red-100'];
                const badges = ['text-green-700 bg-green-100', 'text-yellow-700 bg-yellow-100', 'text-red-700 bg-red-100'];
                return (
                  <div key={i} className={`rounded-xl border p-3 ${colors[i] || 'bg-gray-50 border-gray-100'}`}>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badges[i] || ''}`}>{ex.level}</span>
                    <p className="text-[12px] text-gray-700 mt-2 font-medium">{ex.problem}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{ex.solution}</p>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Key points */}
          {response.key_points?.length > 0 && typeDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <div className="text-[12px] font-semibold text-blue-700 mb-2.5 flex items-center gap-1.5">
                <Lightbulb size={13} /> Key Takeaways
              </div>
              <motion.ul variants={variants.container} initial="hidden" animate="show" className="space-y-1.5">
                {response.key_points.map((p, i) => (
                  <motion.li key={i} variants={variants.item} className="flex gap-2 text-[12px] text-gray-700">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">▸</span>{p}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}

          {/* Remember this */}
          {response.remember_this && typeDone && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5">
              <span className="text-lg flex-shrink-0">💡</span>
              <p className="text-[12px] text-amber-800 font-medium">{response.remember_this}</p>
            </div>
          )}

          {/* University extras */}
          {response.university_exam_tip && typeDone && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-violet-600 mb-1">📝 Exam Tip</div>
              <p className="text-[12px] text-gray-700">{response.university_exam_tip}</p>
            </div>
          )}
          {response.viva_questions?.length > 0 && typeDone && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <div className="text-[11px] font-semibold text-red-600 mb-2 flex items-center gap-1.5">
                <HelpCircle size={12} /> Viva Questions
              </div>
              {response.viva_questions.map((q, i) => (
                <p key={i} className="text-[12px] text-gray-700 mb-1 flex gap-2">
                  <span className="text-red-400 font-semibold flex-shrink-0">Q{i + 1}.</span>{q}
                </p>
              ))}
            </div>
          )}

          {/* Recommended books */}
          {response.recommended_books?.length > 0 && typeDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-[12px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <BookOpen size={13} /> Textbooks
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {response.recommended_books.slice(0, 4).map((b, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.08)] p-3">
                    <div className="text-[12px] font-semibold text-gray-800 line-clamp-2">{b.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{b.author} · {b.publisher}</div>
                    {b.usage_tip && <div className="text-[10px] text-blue-600 mt-1 italic">{b.usage_tip}</div>}
                    {b.priority_rank === 1 && <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full mt-1 inline-block">⭐ Top pick</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Ask another question */}
          {typeDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <div className="text-[11px] font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                <MessageSquare size={12} /> Ask a follow-up
              </div>
              <div className="flex gap-2">
                <input
                  value={customQ}
                  onChange={e => setCustomQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && customQ.trim() && (onNewQuestion(customQ), setCustomQ(''))}
                  placeholder={response.follow_up_question || 'Ask anything about this topic...'}
                  className="flex-1 text-[12px] bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  onClick={() => { if (customQ.trim()) { onNewQuestion(customQ); setCustomQ(''); } }}
                  className="px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  <Sparkles size={13} />
                </button>
              </div>
            </motion.div>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* Action bar */}
      {typeDone && (
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0"
        >
          <button
            onClick={handlePDF}
            disabled={pdfLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[12px] font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {pdfLoading ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />}
            PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-[12px] rounded-lg hover:bg-gray-200 transition-colors">
            <Star size={12} /> Save
          </button>
          <button
            onClick={() => navigator.share?.({ title: 'Syllabrix Study Notes', text: response.explanation || '' })}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-[12px] rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Share2 size={12} /> Share
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── School Accordion ─────────────────────────────────────────────────────────

function SchoolAccordion({ onAsk, loading }) {
  const [boards, setBoards] = useState([]);
  const [board, setBoard] = useState(null);
  const [classes, setClasses] = useState([]);
  const [cls, setCls] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [openChapter, setOpenChapter] = useState(null);
  const [topics, setTopics] = useState({});   // chapterId → topics[]
  const [customQ, setCustomQ] = useState('');
  const [fetching, setFetching] = useState('');

  useEffect(() => {
    libraryAPI.getBoards().then(r => setBoards(r.data?.data || [])).catch(() => {});
  }, []);

  const selectBoard = async (b) => {
    setBoard(b); setCls(null); setSubject(null); setChapters([]); setOpenChapter(null);
    setFetching('classes');
    try { const r = await libraryAPI.getClasses(b.code); setClasses(r.data?.data || []); }
    finally { setFetching(''); }
  };

  const selectClass = async (c) => {
    setCls(c); setSubject(null); setChapters([]); setOpenChapter(null);
    setFetching('subjects');
    try { const r = await libraryAPI.getSubjects(c.id); setSubjects(r.data?.data || []); }
    finally { setFetching(''); }
  };

  const selectSubject = async (s) => {
    setSubject(s); setChapters([]); setOpenChapter(null);
    setFetching('chapters');
    try {
      // Try NCERT TOC first
      const gradeNum = parseInt(cls?.grade_label || '10', 10);
      let chaps = [];
      if (!isNaN(gradeNum)) {
        const ncertRes = await libraryAPI.getNCERTToc({ class: gradeNum, subject: s.name }).catch(() => null);
        if (ncertRes?.data?.data?.chapters?.length) {
          chaps = ncertRes.data.data.chapters.map(ch => ({
            id: `ncert-${gradeNum}-${ch.num}`,
            title: ch.name,
            ncertTopics: ch.topics || [],
            chapter_number: ch.num,
            isNCERT: true,
          }));
        }
      }
      // Fallback: DB books → chapters
      if (!chaps.length) {
        const booksRes = await libraryAPI.getBooks(s.id);
        const books = booksRes.data?.data || [];
        if (books[0]) {
          const chRes = await libraryAPI.getChapters(books[0].id);
          chaps = chRes.data?.data || [];
        }
      }
      setChapters(chaps);
    } finally { setFetching(''); }
  };

  const toggleChapter = async (ch) => {
    if (openChapter?.id === ch.id) { setOpenChapter(null); return; }
    setOpenChapter(ch);
    if (ch.isNCERT) return; // topics are inline
    if (!topics[ch.id]) {
      const r = await libraryAPI.getTopics(ch.id).catch(() => null);
      if (r) setTopics(t => ({ ...t, [ch.id]: r.data?.data || [] }));
    }
  };

  const handleAsk = (topicName, ch) => {
    const query = customQ || `Explain ${topicName}`;
    onAsk({
      payload: {
        subjectId: subject?.id,
        chapterId: typeof ch?.id === 'number' ? ch.id : null,
        studentQuery: query,
        studentClass: cls?.grade_label,
        boardCode: board?.code,
      },
      context: {
        board: board?.name,
        subject: subject?.name,
        chapter: ch?.title || ch?.name,
        topic: topicName,
      },
      query,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 p-3 space-y-0.5">
        {/* Boards */}
        {boards.map(b => (
          <AccordionItem
            key={b.id} icon={GraduationCap} iconColor="text-indigo-500"
            label={b.name} sublabel={b.type}
            isOpen={board?.id === b.id} isSelected={board?.id === b.id}
            onClick={() => selectBoard(b)}
            loading={fetching === 'classes' && board?.id === b.id}
          >
            {/* Classes */}
            {classes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 py-2">
                {classes.map(c => (
                  <button key={c.id}
                    onClick={() => selectClass(c)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      cls?.id === c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    Class {c.grade_label}
                  </button>
                ))}
              </div>
            )}
            {/* Subjects */}
            {cls && subjects.map(s => (
              <AccordionItem
                key={s.id} icon={BookOpen} iconColor="text-blue-500" depth={1}
                label={s.name}
                isOpen={subject?.id === s.id} isSelected={subject?.id === s.id}
                onClick={() => selectSubject(s)}
                loading={fetching === 'chapters' && subject?.id === s.id}
              >
                {/* Chapters */}
                {chapters.map(ch => (
                  <AccordionItem
                    key={ch.id} icon={FileText} iconColor="text-teal-500" depth={2}
                    label={ch.title || ch.name}
                    isOpen={openChapter?.id === ch.id}
                    onClick={() => toggleChapter(ch)}
                  >
                    {/* NCERT inline topics */}
                    {ch.isNCERT && ch.ncertTopics?.map((t, i) => (
                      <TopicRow key={i} topic={{ name: t }} onAsk={(name) => handleAsk(name, ch)} />
                    ))}
                    {/* DB topics */}
                    {!ch.isNCERT && (topics[ch.id] || []).map(t => (
                      <TopicRow key={t.id} topic={t} onAsk={(name) => handleAsk(name, ch)} />
                    ))}
                    {/* Ask directly about chapter */}
                    <button
                      onClick={() => handleAsk(ch.title || ch.name, ch)}
                      className="ml-4 flex items-center gap-1.5 text-[11px] text-blue-600 font-medium mt-1 px-2 py-1 rounded-lg hover:bg-blue-50 border-l border-gray-100 pl-3"
                    >
                      <Sparkles size={10} /> Explain full chapter
                    </button>
                  </AccordionItem>
                ))}
              </AccordionItem>
            ))}
          </AccordionItem>
        ))}
      </div>

      {/* Quick ask bar */}
      {subject && (
        <div className="flex gap-2 px-3 py-2.5 border-t border-gray-100 bg-white flex-shrink-0">
          <input
            value={customQ}
            onChange={e => setCustomQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && customQ.trim() && handleAsk(customQ, openChapter)}
            placeholder={`Ask anything about ${subject.name}...`}
            className="flex-1 text-[12px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            onClick={() => customQ.trim() && handleAsk(customQ, openChapter)}
            disabled={loading || !customQ.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Competitive Accordion ────────────────────────────────────────────────────

function CompetitiveAccordion({ onAsk, loading }) {
  const [exams, setExams] = useState([]);
  const [exam, setExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [customQ, setCustomQ] = useState('');
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    libraryAPI.getExams().then(r => setExams(r.data?.data || [])).catch(() => {});
  }, []);

  const selectExam = async (e) => {
    setExam(e); setSubjects([]);
    setFetching(true);
    try { const r = await libraryAPI.getExamSubjects(e.code); setSubjects(r.data?.data || []); }
    finally { setFetching(false); }
  };

  const handleAsk = (subjectName) => {
    const query = customQ || `Explain ${subjectName} for ${exam?.name}`;
    onAsk({
      payload: { examCode: exam?.code, studentQuery: query },
      context: { board: exam?.name, subject: subjectName },
      query,
    });
  };

  // Group exams by type
  const examGroups = exams.reduce((acc, e) => {
    const g = e.type || 'Other';
    (acc[g] = acc[g] || []).push(e);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 p-3 space-y-0.5">
        {Object.entries(examGroups).map(([group, groupExams]) => (
          <AccordionItem
            key={group} icon={Trophy} iconColor="text-amber-500"
            label={group} sublabel={`${groupExams.length} exams`}
            isOpen={groupExams.some(e => e.code === exam?.code)}
            onClick={() => {}}
          >
            {groupExams.map(e => (
              <AccordionItem
                key={e.code} icon={Target} iconColor="text-orange-500" depth={1}
                label={e.name} sublabel={e.conducting_body || e.level}
                isOpen={exam?.code === e.code} isSelected={exam?.code === e.code}
                onClick={() => selectExam(e)}
                loading={fetching && exam?.code === e.code}
              >
                {subjects.map(s => (
                  <div key={s.subject_name || s.id}
                    onClick={() => handleAsk(s.subject_name || s.name)}
                    className="ml-4 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-orange-50 cursor-pointer group border-l border-gray-100 pl-3"
                  >
                    <BookOpen size={12} className="text-gray-400 flex-shrink-0 group-hover:text-orange-500" />
                    <span className="flex-1 text-[12px] text-gray-600 group-hover:text-orange-700">
                      {s.subject_name || s.name}
                    </span>
                    <span className="hidden group-hover:flex items-center gap-1 text-[10px] text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                      <Sparkles size={9} /> Ask
                    </span>
                  </div>
                ))}
              </AccordionItem>
            ))}
          </AccordionItem>
        ))}
      </div>

      {exam && (
        <div className="flex gap-2 px-3 py-2.5 border-t border-gray-100 bg-white flex-shrink-0">
          <input
            value={customQ}
            onChange={e => setCustomQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && customQ.trim() && handleAsk(customQ)}
            placeholder={`Ask about ${exam.name}...`}
            className="flex-1 text-[12px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
          <button
            onClick={() => customQ.trim() && handleAsk(customQ)}
            disabled={loading || !customQ.trim()}
            className="px-3 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-40 hover:bg-orange-600 transition-colors"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── University Accordion ─────────────────────────────────────────────────────

const UNI_ICONS = { iit: '🏅', nit: '🏢', iim: '📊', aiims: '🏥', central: '🏛️', state: '🏫', deemed: '🎓', private: '🎓', iit_nit: '⚡' };

function UniversityAccordion({ onAsk, loading }) {
  const [unis, setUnis] = useState([]);
  const [selectedUni, setSelectedUni] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [openCh, setOpenCh] = useState(null);
  const [topics, setTopics] = useState({});
  const [openUniGroup, setOpenUniGroup] = useState(null);
  const [customQ, setCustomQ] = useState('');
  const [fetching, setFetching] = useState('');

  useEffect(() => {
    libraryAPI.getUniversities().then(r => setUnis(r.data?.data || [])).catch(() => {});
  }, []);

  const selectUni = async (u) => {
    setSelectedUni(u); setSelectedCourse(null); setSelectedSem(null); setSubjects([]); setChapters([]); setOpenCh(null);
    setFetching('courses');
    try { const r = await libraryAPI.getUniversityCourses(u.id); setCourses(r.data?.data || []); }
    finally { setFetching(''); }
  };

  const selectCourse = async (c) => {
    setSelectedCourse(c); setSelectedSem(null); setSubjects([]); setChapters([]); setOpenCh(null);
  };

  const selectSem = async (sem) => {
    setSelectedSem(sem); setSubjects([]); setChapters([]); setOpenCh(null);
    setFetching('subjects');
    try { const r = await libraryAPI.getCourseSubjects(selectedCourse.id, sem); setSubjects(r.data?.data || []); }
    finally { setFetching(''); }
  };

  const selectSub = async (s) => {
    setSelectedSub(s); setChapters([]); setOpenCh(null);
    setFetching('chapters');
    try { const r = await libraryAPI.getSubjectChapters(s.id); setChapters(r.data?.data || []); }
    finally { setFetching(''); }
  };

  const toggleChapter = async (ch) => {
    if (openCh?.id === ch.id) { setOpenCh(null); return; }
    setOpenCh(ch);
    if (!topics[ch.id]) {
      const r = await libraryAPI.getChapterTopics(ch.id).catch(() => null);
      if (r) setTopics(t => ({ ...t, [ch.id]: r.data?.data || [] }));
    }
  };

  const handleAsk = (topicName, chForCtx) => {
    const query = customQ || `Explain ${topicName}`;
    onAsk({
      payload: {
        universitySubjectId: selectedSub?.id,
        studentQuery: query,
      },
      context: {
        university: selectedUni?.short_name || selectedUni?.name,
        course: `${selectedCourse?.short_name || selectedCourse?.name} Sem ${selectedSem}`,
        subject: selectedSub?.name,
        chapter: chForCtx?.chapter_name || chForCtx?.name,
        topic: topicName,
      },
      query,
    });
  };

  // Group universities by type
  const uniGroups = unis.reduce((acc, u) => {
    const g = ['iit', 'nit', 'iim', 'aiims'].includes(u.type) ? u.type.toUpperCase() : (u.type === 'central' ? 'Central Universities' : (u.type === 'state' ? 'State Universities' : 'Private/Deemed'));
    (acc[g] = acc[g] || []).push(u);
    return acc;
  }, {});

  const semestersForCourse = selectedCourse ? Array.from({ length: selectedCourse.duration_years * 2 || 8 }, (_, i) => i + 1) : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 p-3 space-y-0.5">
        {Object.entries(uniGroups).map(([group, groupUnis]) => (
          <AccordionItem
            key={group} icon={Building2} iconColor="text-purple-500"
            label={group} sublabel={`${groupUnis.length} institutions`}
            isOpen={openUniGroup === group}
            onClick={() => setOpenUniGroup(openUniGroup === group ? null : group)}
          >
            {groupUnis.map(u => (
              <AccordionItem
                key={u.id} depth={1}
                label={`${UNI_ICONS[u.type] || '🏫'} ${u.short_name || u.name}`}
                sublabel={u.location_city ? `${u.location_city}, ${u.location_state}` : u.naac_grade !== 'NA' ? `NAAC: ${u.naac_grade}` : ''}
                isOpen={selectedUni?.id === u.id} isSelected={selectedUni?.id === u.id}
                onClick={() => selectUni(u)}
                loading={fetching === 'courses' && selectedUni?.id === u.id}
              >
                {/* Courses */}
                <div className="px-3 py-1 flex flex-wrap gap-1.5">
                  {courses.map(c => (
                    <button key={c.id}
                      onClick={() => selectCourse(selectedCourse?.id === c.id ? null : c)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${selectedCourse?.id === c.id ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                    >
                      {c.short_name || c.name}
                    </button>
                  ))}
                </div>

                {/* Semesters */}
                {selectedCourse && (
                  <div className="px-3 py-1 flex flex-wrap gap-1.5">
                    {semestersForCourse.map(sem => (
                      <button key={sem}
                        onClick={() => selectSem(selectedSem === sem ? null : sem)}
                        className={`w-8 h-8 rounded-full text-[11px] font-medium transition-colors ${selectedSem === sem ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                      >
                        S{sem}
                      </button>
                    ))}
                  </div>
                )}

                {/* Subjects */}
                {subjects.map(s => (
                  <AccordionItem
                    key={s.id} icon={LayoutGrid} iconColor="text-teal-500" depth={2}
                    label={s.name} sublabel={`${s.subject_type} · ${s.credits} cr`}
                    isOpen={selectedSub?.id === s.id} isSelected={selectedSub?.id === s.id}
                    onClick={() => selectSub(selectedSub?.id === s.id ? null : s)}
                    loading={fetching === 'chapters' && selectedSub?.id === s.id}
                  >
                    {/* Chapters */}
                    {chapters.map(ch => (
                      <AccordionItem
                        key={ch.id} icon={BookMarked} iconColor="text-orange-500" depth={3}
                        label={`Ch ${ch.chapter_num}: ${ch.chapter_name}`}
                        isOpen={openCh?.id === ch.id}
                        onClick={() => toggleChapter(ch)}
                      >
                        {(topics[ch.id] || []).map(t => (
                          <TopicRow key={t.id} topic={{ name: t.topic_name || t.name, ...t }} onAsk={(name) => handleAsk(name, ch)} />
                        ))}
                        <button
                          onClick={() => handleAsk(ch.chapter_name, ch)}
                          className="ml-5 flex items-center gap-1.5 text-[11px] text-purple-600 font-medium mt-1 px-2 py-1 rounded-lg hover:bg-purple-50 border-l border-gray-100 pl-3"
                        >
                          <Sparkles size={10} /> Explain chapter
                        </button>
                      </AccordionItem>
                    ))}
                    {/* Ask directly about subject */}
                    {!chapters.length && (
                      <button
                        onClick={() => handleAsk(s.name, null)}
                        className="ml-4 flex items-center gap-1.5 text-[11px] text-purple-600 font-medium px-3 py-1.5 rounded-lg hover:bg-purple-50"
                      >
                        <Brain size={11} /> Ask AI about {s.name}
                      </button>
                    )}
                  </AccordionItem>
                ))}
              </AccordionItem>
            ))}
          </AccordionItem>
        ))}
      </div>

      {selectedSub && (
        <div className="flex gap-2 px-3 py-2.5 border-t border-gray-100 bg-white flex-shrink-0">
          <input
            value={customQ}
            onChange={e => setCustomQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && customQ.trim() && handleAsk(customQ, openCh)}
            placeholder={`Ask about ${selectedSub.name}...`}
            className="flex-1 text-[12px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
          <button
            onClick={() => customQ.trim() && handleAsk(customQ, openCh)}
            disabled={loading || !customQ.trim()}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-40 hover:bg-purple-700 transition-colors"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'school',      label: 'School',      icon: GraduationCap, color: 'blue' },
  { id: 'competitive', label: 'Competitive',  icon: Trophy,        color: 'orange' },
  { id: 'university',  label: 'University',   icon: Building2,     color: 'purple' },
];

export default function AILibraryPage() {
  const [tab, setTab] = useState('school');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiContext, setAiContext] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [askPayload, setAskPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const callAI = useCallback(async ({ payload, context, query }) => {
    setLoading(true);
    setError('');
    setAskPayload(payload);
    setAiContext(context);
    setAiQuery(query || '');
    try {
      const res = await libraryAPI.ask(payload);
      const data = res.data?.data;
      if (data) {
        setAiResponse(data);
        setIsFullscreen(true);
      } else {
        setError('No response from AI. Try again.');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'AI request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNewQuestion = useCallback((newQ) => {
    if (!askPayload) return;
    callAI({ payload: { ...askPayload, studentQuery: newQ }, context: aiContext, query: newQ });
  }, [askPayload, aiContext, callAI]);

  const activeTab = TABS.find(t => t.id === tab);
  const accentColor = { blue: 'border-blue-500 text-blue-600', orange: 'border-orange-500 text-orange-600', purple: 'border-purple-500 text-purple-600' };

  return (
    <div
      className="md:ml-[220px] flex flex-col bg-[#F0F2F5]"
      style={{ height: 'calc(100vh - 0px)', maxHeight: '100vh', overflow: 'hidden' }}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <h1 className="text-[15px] font-semibold text-gray-800">AI Library</h1>
            <Sparkles size={13} className="text-amber-400" />
          </div>
          {loading && (
            <div className="ml-2 flex items-center gap-1.5 text-[11px] text-blue-600">
              <Loader2 size={12} className="animate-spin" /> Asking AI...
            </div>
          )}
        </div>
        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-none">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); if (isFullscreen) setIsFullscreen(false); }}
                className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive ? `${accentColor[t.color]} bg-white` : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={14} />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 border-b border-red-100 px-4 py-2 text-[12px] text-red-600 flex items-center justify-between flex-shrink-0"
          >
            {error}
            <button onClick={() => setError('')} className="ml-4 text-red-400 hover:text-red-600">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isFullscreen && aiResponse ? (
            <FullscreenAIView
              key="fullscreen"
              response={aiResponse}
              context={aiContext}
              query={aiQuery}
              onBack={() => setIsFullscreen(false)}
              onNewQuestion={handleNewQuestion}
            />
          ) : (
            <motion.div
              key={`accordion-${tab}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="h-full bg-white"
            >
              {tab === 'school'      && <SchoolAccordion      onAsk={callAI} loading={loading} />}
              {tab === 'competitive' && <CompetitiveAccordion onAsk={callAI} loading={loading} />}
              {tab === 'university'  && <UniversityAccordion  onAsk={callAI} loading={loading} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
