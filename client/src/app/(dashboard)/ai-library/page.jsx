'use client';
/**
 * AI Library v4.0 — Mobile-First 3-Panel Layout
 * ─────────────────────────────────────────────────────────────────────────────
 * Desktop: [Center reading flex-1] | [Right shelf w-72]
 * Mobile:  Tab bar at bottom — "Browse shelf" tab | "Read" tab
 *
 * This page is full-bleed (layout.jsx skips padding for /ai-library).
 * Heights are calculated as: 100dvh - 56px topbar
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GraduationCap, Trophy, Building2, ChevronDown, ChevronRight,
  BookOpen, Brain, Download, Loader2, Sparkles, Copy, Check,
  MessageSquare, FileText, Target, Send, X,
  BookMarked, List, Layers, Search, LayoutList,
} from 'lucide-react';
import { libraryAPI } from '@/lib/api/library.api';

// ─── Constants ────────────────────────────────────────────────────────────────
const H = 'h-[calc(100dvh-56px)]';   // full height minus topbar
const H_MOBILE_WITH_BTMNAV = 'h-[calc(100dvh-56px-64px)]'; // minus topbar + bottom nav

// ─── PDF Generator ────────────────────────────────────────────────────────────
async function generateStudyPDF({ response, context }) {
  const { jsPDF } = (await import('jspdf'));
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 70;

  const nextPage = () => { doc.addPage(); y = 50; };
  const ensurePage = (need = 30) => { if (y + need > H - 50) nextPage(); };
  const wrap = (text, maxW) => doc.splitTextToSize(String(text || ''), maxW);

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Syllabrix AI Library', margin, 38);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const crumb = [context?.board || context?.exam, context?.subject, context?.chapter, context?.topic].filter(Boolean).join(' › ');
  doc.text(crumb || 'Study Notes', margin, 52);
  doc.setTextColor(0, 0, 0);
  y = 80;

  const writeSection = (title, body, color = [37, 99, 235]) => {
    ensurePage(50);
    doc.setFillColor(...color);
    doc.rect(margin, y, W - margin * 2, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin + 8, y + 15);
    y += 28;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const lines = wrap(body, W - margin * 2 - 10);
    lines.forEach(line => { ensurePage(); doc.text(line, margin + 6, y); y += 15; });
    y += 8;
  };

  if (response?.explanation) writeSection('Explanation', response.explanation);
  if (response?.key_points?.length) writeSection('Key Points', response.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n'), [22, 163, 74]);
  if (response?.formula || response?.derivation) writeSection('Formula / Derivation', response.formula || response.derivation, [168, 85, 247]);
  if (response?.code_example) writeSection('Code Example', response.code_example, [15, 118, 110]);
  if (response?.viva_questions?.length) writeSection('Viva Questions', response.viva_questions.map((q, i) => `Q${i + 1}. ${q}`).join('\n'), [234, 88, 12]);
  if (response?.mnemonic) writeSection('Memory Tip', response.mnemonic, [161, 98, 7]);

  doc.save(`syllabrix-${(context?.topic || context?.chapter || 'notes').replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return <Loader2 size={size} className="animate-spin flex-shrink-0" />;
}

// ─── SHELF COMPONENTS (School / Competitive / University) ─────────────────────

function ShelfItem({ label, sublabel, isSelected, onClick, indent = 0 }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-2.5 sm:py-1.5 transition-colors border-l-2 active:opacity-70 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-transparent hover:bg-gray-100 text-gray-600'
      }`}
      style={{ paddingLeft: `${12 + indent * 12}px`, paddingRight: '12px' }}
    >
      <div className={`text-[12px] sm:text-[11px] font-medium leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
        {label}
      </div>
      {sublabel && <div className="text-[11px] sm:text-[10px] text-gray-400 mt-0.5">{sublabel}</div>}
    </button>
  );
}

function SchoolShelf({ onSelect, selected }) {
  const [boards, setBoards] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [classes, setClasses] = useState({});
  const [subjects, setSubjects] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    libraryAPI.getBoards()
      .then(r => {
        const data = r.data?.data || {};
        setBoards(Array.isArray(data) ? data : Object.values(data).flat());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleBoard = async (board) => {
    const key = `b-${board.id}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
    if (!classes[board.id]) {
      try {
        const r = await libraryAPI.getClasses(board.code);
        setClasses(c => ({ ...c, [board.id]: r.data?.data || [] }));
      } catch {}
    }
  };

  const toggleClass = async (boardId, cls) => {
    const key = `c-${cls.id}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
    if (!subjects[cls.id]) {
      try {
        const r = await libraryAPI.getSubjects(cls.id);
        setSubjects(s => ({ ...s, [cls.id]: r.data?.data || [] }));
      } catch {}
    }
  };

  if (loading) return <div className="p-4 flex justify-center"><Spinner /></div>;

  return (
    <div>
      {boards.map(board => (
        <div key={board.id}>
          <ShelfItem label={board.name || board.code} sublabel={board.code} isSelected={false} onClick={() => toggleBoard(board)} indent={0} />
          {expanded[`b-${board.id}`] && (
            <div>
              {(classes[board.id] || []).map(cls => (
                <div key={cls.id}>
                  <ShelfItem label={cls.grade_label || `Class ${cls.grade}`} isSelected={false} onClick={() => toggleClass(board.id, cls)} indent={1} />
                  {expanded[`c-${cls.id}`] && (
                    <div>
                      {(subjects[cls.id] || []).map(sub => (
                        <ShelfItem
                          key={sub.id}
                          label={sub.name}
                          isSelected={selected?.type === 'school' && selected?.subjectId === sub.id}
                          onClick={() => onSelect({ type: 'school', subjectId: sub.id, subjectName: sub.name, board: board.code, boardName: board.name, grade: cls.grade, gradeLabel: cls.grade_label })}
                          indent={2}
                        />
                      ))}
                      {subjects[cls.id]?.length === 0 && <div className="px-6 py-2 text-[11px] text-gray-400">No subjects</div>}
                      {!subjects[cls.id] && <div className="px-4 py-2 flex justify-center"><Spinner size={14} /></div>}
                    </div>
                  )}
                </div>
              ))}
              {!classes[board.id] && <div className="px-4 py-2 flex justify-center"><Spinner size={14} /></div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CompetitiveShelf({ onSelect, selected }) {
  const [exams, setExams] = useState({});
  const [expanded, setExpanded] = useState({});
  const [subjects, setSubjects] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    libraryAPI.getExams()
      .then(r => setExams(r.data?.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleExam = async (exam) => {
    const key = `e-${exam.code}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
    if (!subjects[exam.code]) {
      try {
        const r = await libraryAPI.getExamSubjects(exam.code);
        setSubjects(s => ({ ...s, [exam.code]: r.data?.data || [] }));
      } catch {}
    }
  };

  if (loading) return <div className="p-4 flex justify-center"><Spinner /></div>;

  const allExams = Object.values(exams).flat();

  return (
    <div>
      {allExams.map(exam => (
        <div key={exam.code}>
          <ShelfItem label={exam.name || exam.code} sublabel={exam.code} isSelected={false} onClick={() => toggleExam(exam)} indent={0} />
          {expanded[`e-${exam.code}`] && (
            <div>
              {(subjects[exam.code] || []).map(sub => (
                <ShelfItem
                  key={sub.id || sub.name}
                  label={sub.name}
                  sublabel={sub.parent_subject || ''}
                  isSelected={selected?.type === 'exam' && selected?.examCode === exam.code && selected?.subjectName === sub.name}
                  onClick={() => onSelect({ type: 'exam', examCode: exam.code, examName: exam.name, subjectId: sub.id, subjectName: sub.name })}
                  indent={1}
                />
              ))}
              {!subjects[exam.code] && <div className="px-4 py-2 flex justify-center"><Spinner size={14} /></div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function UniversityShelf({ onSelect, selected }) {
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [subjects, setSubjects] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    libraryAPI.getCourses()
      .then(r => setCourses(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleCourse = async (course) => {
    const key = `c-${course.id}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
    if (!subjects[course.id]) {
      try {
        const r = await libraryAPI.getCourseSubjects(course.id);
        const subs = r.data?.data || [];
        const grouped = {};
        subs.forEach(s => {
          const sem = s.semester || 0;
          if (!grouped[sem]) grouped[sem] = [];
          grouped[sem].push(s);
        });
        setSubjects(s => ({ ...s, [course.id]: grouped }));
      } catch {}
    }
  };

  const toggleSem = (courseId, sem) => {
    const key = `s-${courseId}-${sem}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  };

  if (loading) return <div className="p-4 flex justify-center"><Spinner /></div>;

  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>
          <ShelfItem
            label={course.short_name || course.name}
            sublabel={`${course.level} · ${course.duration_years || '?'}yr`}
            isSelected={false}
            onClick={() => toggleCourse(course)}
            indent={0}
          />
          {expanded[`c-${course.id}`] && (
            subjects[course.id] ? (
              Object.entries(subjects[course.id])
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([sem, subs]) => (
                  <div key={sem}>
                    <button
                      onClick={() => toggleSem(course.id, sem)}
                      className="w-full flex items-center gap-1.5 px-5 py-2 sm:py-1 hover:bg-gray-100 text-[11px] sm:text-[10px] text-gray-500 font-semibold"
                    >
                      <ChevronRight size={10} className={`transition-transform ${expanded[`s-${course.id}-${sem}`] ? 'rotate-90' : ''}`} />
                      {sem === '0' ? 'General' : `Semester ${sem}`}
                    </button>
                    {expanded[`s-${course.id}-${sem}`] && subs.map(sub => (
                      <ShelfItem
                        key={sub.id}
                        label={sub.name}
                        sublabel={sub.subject_code || ''}
                        isSelected={selected?.type === 'university' && selected?.subjectId === sub.id}
                        onClick={() => onSelect({ type: 'university', subjectId: sub.id, subjectName: sub.name, courseId: course.id, courseName: course.name || course.short_name, semester: sub.semester })}
                        indent={3}
                      />
                    ))}
                  </div>
                ))
            ) : (
              <div className="px-4 py-2 flex justify-center"><Spinner size={14} /></div>
            )
          )}
        </div>
      ))}
    </div>
  );
}

// ─── RIGHT SHELF PANEL (desktop) ──────────────────────────────────────────────

function RightShelf({ onSelect, selected }) {
  const [section, setSection] = useState('school');

  const TABS = [
    { id: 'school',      icon: GraduationCap, label: 'School',      color: 'bg-blue-500' },
    { id: 'competitive', icon: Trophy,        label: 'Exams',       color: 'bg-orange-500' },
    { id: 'university',  icon: Building2,     label: 'University',  color: 'bg-purple-500' },
  ];

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full flex-shrink-0 shadow-[-1px_0_4px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={14} className="text-gray-500" />
          <span className="text-[12px] font-bold text-gray-700">Library Shelf</span>
        </div>
        <div className="flex gap-1">
          {TABS.map(({ id, icon: Icon, label, color }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[9px] font-semibold transition-all ${
                section === id ? `${color} text-white` : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {section === 'school'      && <SchoolShelf      onSelect={onSelect} selected={selected} />}
        {section === 'competitive' && <CompetitiveShelf onSelect={onSelect} selected={selected} />}
        {section === 'university'  && <UniversityShelf  onSelect={onSelect} selected={selected} />}
      </div>

      {/* Selected subject footer */}
      {selected && (
        <div className="border-t border-gray-200 p-3 flex-shrink-0">
          <div className="flex items-start gap-2">
            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
              selected.type === 'school' ? 'bg-blue-100' : selected.type === 'exam' ? 'bg-orange-100' : 'bg-purple-100'
            }`}>
              {selected.type === 'school'      && <GraduationCap size={11} className="text-blue-600"   />}
              {selected.type === 'exam'        && <Trophy        size={11} className="text-orange-600" />}
              {selected.type === 'university'  && <Building2     size={11} className="text-purple-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-gray-700 truncate">{selected.subjectName}</div>
              <div className="text-[10px] text-gray-400 truncate">
                {selected.boardName || selected.examName || selected.courseName}
                {selected.grade ? ` · Class ${selected.grade}` : ''}
              </div>
            </div>
            <button onClick={() => onSelect(null)} className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MOBILE SHELF SHEET ───────────────────────────────────────────────────────

function MobileSheetShelf({ onSelect, selected, onClose }) {
  const [section, setSection] = useState('school');

  const TABS = [
    { id: 'school',      icon: GraduationCap, label: 'School',     color: 'bg-blue-500' },
    { id: 'competitive', icon: Trophy,        label: 'Exams',      color: 'bg-orange-500' },
    { id: 'university',  icon: Building2,     label: 'University', color: 'bg-purple-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sheet handle + header */}
      <div className="flex-shrink-0 pt-3 pb-2 px-4 border-b border-gray-100">
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-3" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-gray-600" />
            <span className="text-[14px] font-bold text-gray-800">Library Shelf</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        {/* Section tabs */}
        <div className="flex gap-2">
          {TABS.map(({ id, icon: Icon, label, color }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                section === id ? `${color} text-white shadow-sm` : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Shelf content */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {section === 'school'      && <SchoolShelf      onSelect={(s) => { onSelect(s); onClose(); }} selected={selected} />}
        {section === 'competitive' && <CompetitiveShelf onSelect={(s) => { onSelect(s); onClose(); }} selected={selected} />}
        {section === 'university'  && <UniversityShelf  onSelect={(s) => { onSelect(s); onClose(); }} selected={selected} />}
      </div>
    </div>
  );
}

// ─── AI RESPONSE ──────────────────────────────────────────────────────────────

function AIResponse({ response, context, isLoading }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePDF = async () => {
    setDownloading(true);
    try { await generateStudyPDF({ response, context }); } catch {}
    setDownloading(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-36 gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <Sparkles size={20} className="text-blue-500 animate-pulse" />
        </div>
        <p className="text-[12px] text-gray-400">AI is thinking...</p>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="text-[11px] font-semibold text-gray-700">AI Explanation</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { navigator.clipboard.writeText(response.explanation || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handlePDF}
            disabled={downloading}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-colors disabled:opacity-50"
          >
            {downloading ? <Spinner size={11} /> : <Download size={11} />}
            PDF
          </button>
        </div>
      </div>

      {response.explanation && (
        <div className="text-[13px] text-gray-700 leading-relaxed bg-white rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
          {response.explanation}
        </div>
      )}

      {response.key_points?.length > 0 && (
        <div className="bg-green-50 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={13} className="text-green-600" />
            <span className="text-[11px] font-semibold text-green-700">Key Points</span>
          </div>
          <ul className="space-y-2">
            {response.key_points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-gray-700">
                <span className="w-4 h-4 rounded-full bg-green-200 text-green-700 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(response.formula || response.derivation) && (
        <div className="bg-purple-50 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-1.5 mb-2">
            <FileText size={13} className="text-purple-600" />
            <span className="text-[11px] font-semibold text-purple-700">Formula / Derivation</span>
          </div>
          <pre className="text-[12px] text-gray-700 whitespace-pre-wrap font-mono bg-white rounded-lg p-3 overflow-x-auto">
            {response.formula || response.derivation}
          </pre>
        </div>
      )}

      {response.code_example && (
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Code</span>
            <button onClick={() => navigator.clipboard.writeText(response.code_example)} className="p-1 rounded hover:bg-white/10">
              <Copy size={13} className="text-white/60" />
            </button>
          </div>
          <pre className="text-[12px] text-green-400 p-4 overflow-x-auto leading-relaxed">
            {response.code_example}
          </pre>
        </div>
      )}

      {response.viva_questions?.length > 0 && (
        <div className="bg-orange-50 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-1.5 mb-2">
            <MessageSquare size={13} className="text-orange-600" />
            <span className="text-[11px] font-semibold text-orange-700">Viva Questions</span>
          </div>
          <ol className="space-y-2">
            {response.viva_questions.map((q, i) => (
              <li key={i} className="text-[12px] text-gray-700">
                <span className="font-semibold text-orange-600">Q{i + 1}.</span> {q}
              </li>
            ))}
          </ol>
        </div>
      )}

      {response.mnemonic && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Memory Tip · </span>
          <span className="text-[12px] text-amber-800">{response.mnemonic}</span>
        </div>
      )}
    </div>
  );
}

// ─── READER (center panel content) ───────────────────────────────────────────

function ReaderPanel({ selected, isMobile = false }) {
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!selected) { setChapters([]); setSelectedChapter(null); setSelectedTopic(null); setAiResponse(null); return; }
    setChapters([]);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setAiResponse(null);
    setChaptersLoading(true);

    const params = {};
    if (selected.type === 'school')      { params.board = selected.board; params.class = selected.grade; params.subject = selected.subjectName; }
    else if (selected.type === 'exam')   { params.exam = selected.examName; params.subject = selected.subjectName; }
    else if (selected.type === 'university') { params.subject = selected.subjectName; }

    libraryAPI.getSmartChapters(params)
      .then(r => { const data = r.data?.data || {}; setChapters(data.chapters || []); setBookTitle(data.bookTitle || ''); })
      .catch(() => setChapters([]))
      .finally(() => setChaptersLoading(false));
  }, [selected]);

  const handleAsk = useCallback(async (topicOverride) => {
    const q = topicOverride ? `Explain "${topicOverride}" in detail` : query.trim();
    if (!q || !selected) return;
    setAiLoading(true);
    setAiResponse(null);
    if (!topicOverride) setQuery('');

    const payload = { studentQuery: q };
    if (selected.type === 'school') { payload.subjectId = selected.subjectId; payload.boardCode = selected.board; payload.grade = selected.grade; }
    else if (selected.type === 'exam') { payload.examCode = selected.examCode; payload.subjectId = selected.subjectId; }
    else if (selected.type === 'university') { payload.universitySubjectId = selected.subjectId; }
    if (selectedChapter) payload.chapterId = selectedChapter?.dbId;

    try {
      const r = await libraryAPI.ask(payload);
      setAiResponse(r.data?.data || null);
    } catch {
      setAiResponse({ explanation: 'Sorry, AI encountered an error. Please try again.' });
    }
    setAiLoading(false);
  }, [query, selected, selectedChapter]);

  const pdfContext = {
    board: selected?.boardName || selected?.examName || selected?.courseName,
    subject: selected?.subjectName,
    chapter: selectedChapter?.name,
    topic: selectedTopic,
  };

  const breadcrumb = [
    selected?.boardName || selected?.examName || selected?.courseName || selected?.universityName,
    selected?.subjectName,
    selectedChapter?.name,
  ].filter(Boolean);

  if (!selected) {
    // Welcome state (only shown in desktop center)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <BookOpen size={32} className="text-white" />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-gray-800 mb-2">Your AI Library</h2>
          <p className="text-[13px] text-gray-500 leading-relaxed max-w-xs">
            Select a subject from the shelf on the right to explore chapters and get AI explanations.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {[
            { icon: GraduationCap, label: 'School', sublabel: 'Classes 1–12', color: 'bg-blue-100 text-blue-600' },
            { icon: Trophy, label: 'Competitive', sublabel: 'JEE, NEET, UPSC', color: 'bg-orange-100 text-orange-600' },
            { icon: Building2, label: 'University', sublabel: 'B.Tech, MBBS, MBA', color: 'bg-purple-100 text-purple-600' },
          ].map(({ icon: Icon, label, sublabel, color }) => (
            <div key={label} className="bg-white rounded-xl p-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-center">
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mx-auto mb-1.5`}><Icon size={16} /></div>
              <div className="text-[11px] font-semibold text-gray-700">{label}</div>
              <div className="text-[10px] text-gray-400">{sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-gray-400 flex-wrap">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={9} />}
              <span className={i === breadcrumb.length - 1 ? 'text-blue-600 font-medium' : ''}>{item}</span>
            </span>
          ))}
        </div>
      )}

      {bookTitle && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg w-fit">
          <BookMarked size={12} className="text-blue-500 flex-shrink-0" />
          <span className="text-[11px] text-blue-600 font-medium truncate max-w-[240px] sm:max-w-none">{bookTitle}</span>
        </div>
      )}

      {/* Chapters */}
      <div className="bg-white rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2 mb-3">
          <List size={14} className="text-gray-500" />
          <span className="text-[12px] font-semibold text-gray-700">Chapters</span>
          {chaptersLoading && <Spinner size={12} />}
        </div>
        {chaptersLoading ? (
          <div className="flex items-center gap-2 text-[12px] text-gray-400 py-2">
            <Spinner size={14} /> Loading chapters...
          </div>
        ) : chapters.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => { setSelectedChapter(ch); setSelectedTopic(null); setAiResponse(null); }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border active:scale-95 ${
                  selectedChapter?.num === ch.num
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {ch.num}. {ch.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-gray-400">No chapters found.</p>
        )}
      </div>

      {/* Topics */}
      {selectedChapter?.topics?.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} className="text-gray-500" />
            <span className="text-[12px] font-semibold text-gray-700">Ch.{selectedChapter.num} — {selectedChapter.name}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedChapter.topics.map((topic, i) => (
              <button
                key={i}
                onClick={() => { setSelectedTopic(topic); handleAsk(topic); }}
                className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition-all border active:scale-95 ${
                  selectedTopic === topic
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Chat Input */}
      <div className="bg-white rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-blue-500" />
          <span className="text-[12px] font-semibold text-gray-700">Ask AI</span>
          {selectedChapter && <span className="text-[10px] text-gray-400">about {selectedChapter.name}</span>}
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            placeholder={selectedChapter ? `Ask about ${selectedChapter.name}...` : `Ask anything about ${selected.subjectName}...`}
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:border-blue-400 bg-gray-50 min-w-0"
          />
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || aiLoading}
            className="px-3 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            {aiLoading ? <Spinner size={14} /> : <Send size={14} />}
            <span className="text-[11px] font-medium hidden sm:inline">Ask</span>
          </button>
        </div>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {['Explain this', 'Give examples', 'Key formulas', 'Exam questions'].map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); inputRef.current?.focus(); }}
              className="px-2 py-1 rounded-md bg-gray-100 text-[10px] text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* AI Response */}
      {(aiLoading || aiResponse) && (
        <div className="bg-white rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
          <AIResponse response={aiResponse} context={pdfContext} isLoading={aiLoading} />
        </div>
      )}

      {/* Spacer for mobile bottom nav */}
      {isMobile && <div className="h-4" />}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AILibraryPage() {
  const [selected, setSelected] = useState(null);
  const [mobileTab, setMobileTab] = useState('browse'); // 'browse' | 'read'
  const [sheetOpen, setSheetOpen] = useState(false);

  // When subject is selected on mobile, switch to read tab
  const handleSelect = (s) => {
    setSelected(s);
    if (s) setMobileTab('read');
  };

  return (
    // Full-bleed: escape layout's padding with negative margins
    // Layout gives px-4 py-4 pb-24 — we cancel that here
    <div className="-mx-4 lg:-mx-6 -mt-4 -mb-24 md:-mb-6">

      {/* ── DESKTOP LAYOUT ─────────────────────────────────────────────── */}
      <div className={`hidden md:flex ${H} overflow-hidden bg-[#F0F2F5]`}>
        {/* Center reading space */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <h1 className="text-[13px] font-bold text-gray-800">AI Library</h1>
          </div>
          {/* Scrollable reader */}
          <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="max-w-3xl">
              <ReaderPanel selected={selected} isMobile={false} />
            </div>
          </div>
        </div>

        {/* Right shelf */}
        <RightShelf onSelect={setSelected} selected={selected} />
      </div>

      {/* ── MOBILE LAYOUT ──────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col bg-[#F0F2F5]" style={{ minHeight: 'calc(100dvh - 56px)' }}>

        {/* Mobile top bar with breadcrumb / shelf toggle */}
        <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Brain size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[13px] font-bold text-gray-800">AI Library</h1>
            {selected && (
              <p className="text-[10px] text-gray-400 truncate">
                {selected.boardName || selected.examName || selected.courseName} · {selected.subjectName}
              </p>
            )}
          </div>
          {/* Browse shelf button */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-semibold active:bg-blue-100 transition-colors flex-shrink-0"
          >
            <LayoutList size={14} />
            {selected ? 'Change' : 'Browse'}
          </button>
        </div>

        {/* Scrollable reader — full width on mobile */}
        <div className="flex-1 overflow-y-auto pb-20" style={{ WebkitOverflowScrolling: 'touch' }}>
          {!selected ? (
            // Mobile welcome state
            <div className="flex flex-col items-center justify-center gap-5 text-center px-6 py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <BookOpen size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-gray-800 mb-2">Your AI Library</h2>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  Tap <strong>Browse</strong> above to pick a subject from School, Competitive, or University.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full">
                {[
                  { icon: GraduationCap, label: 'School',      color: 'bg-blue-100 text-blue-600' },
                  { icon: Trophy,        label: 'Competitive', color: 'bg-orange-100 text-orange-600' },
                  { icon: Building2,     label: 'University',  color: 'bg-purple-100 text-purple-600' },
                ].map(({ icon: Icon, label, color }) => (
                  <button
                    key={label}
                    onClick={() => setSheetOpen(true)}
                    className="bg-white rounded-xl p-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-center active:scale-95 transition-transform"
                  >
                    <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mx-auto mb-1.5`}><Icon size={18} /></div>
                    <div className="text-[11px] font-semibold text-gray-700">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ReaderPanel selected={selected} isMobile={true} />
          )}
        </div>

        {/* Mobile bottom shelf sheet */}
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSheetOpen(false)}
            />
            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl"
              style={{ height: '75vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <MobileSheetShelf
                onSelect={handleSelect}
                selected={selected}
                onClose={() => setSheetOpen(false)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
