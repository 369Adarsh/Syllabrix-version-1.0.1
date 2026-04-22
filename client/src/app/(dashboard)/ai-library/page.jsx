'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  GraduationCap, Trophy, Building2, ChevronDown, ChevronRight,
  BookOpen, Brain, Download, Loader2, Sparkles, Copy, Check,
  MessageSquare, FileText, Target, Send, X,
  BookMarked, List, Layers, Search, LayoutList, Image as ImageIcon, AlertCircle,
  Lightbulb, HelpCircle, Link2, BarChart2, FlaskConical, BookText, ArrowRight
} from 'lucide-react';
import { libraryAPI } from '@/lib/api/library.api';

// ─── Constants ────────────────────────────────────────────────────────────────
const H = 'h-[calc(100dvh-56px)]';
const H_MOBILE_WITH_BTMNAV = 'h-[calc(100dvh-56px-64px)]';

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
  doc.text('Syllabrix Premium AI Library', margin, 38);
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
  if (response?.exam_pattern_note) writeSection('Exam Pattern', response.exam_pattern_note, [225, 29, 72]); // Red
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

// ─── SHELF COMPONENTS ─────────────────────────────────────────────────────────

function ShelfItem({ label, sublabel, isSelected, onClick, indent = 0 }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-2.5 sm:py-2 transition-all relative overflow-hidden group ${
        isSelected
          ? 'bg-gradient-to-r from-blue-50 to-transparent'
          : 'hover:bg-gray-50/50'
      }`}
      style={{ paddingLeft: `${16 + indent * 14}px`, paddingRight: '12px' }}
    >
      {isSelected && (
        <motion.div layoutId="shelf-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-md" />
      )}
      {/* whitespace-normal and break-words fixes long Indian university names getting cut off on mobile */}
      <div className={`text-[13px] sm:text-[12px] font-medium leading-tight whitespace-normal break-words ${isSelected ? 'text-blue-700 font-semibold' : 'text-gray-700 group-hover:text-gray-900'}`}>
        {label}
      </div>
      {sublabel && <div className="text-[11px] sm:text-[10px] text-gray-400 mt-0.5 whitespace-normal break-words">{sublabel}</div>}
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
        let data = r.data?.data || [];
        
        // Ensure ALL classes 1 to 12 are available, merging DB data with UI Fallbacks
        const existingGrades = new Set(data.map(c => Number(c.grade)));
        for (let i = 1; i <= 12; i++) {
          if (!existingGrades.has(i)) {
            data.push({
               id: `fb-${board.id}-${i}`,
               grade: i,
               grade_label: `Class ${i}`,
               is_fallback: true
            });
          }
        }
        // Sort ascending strictly so Class 1 is always at top
        data.sort((a, b) => Number(a.grade) - Number(b.grade));
        
        setClasses(c => ({ ...c, [board.id]: data }));
      } catch {}
    }
  };

  const toggleClass = async (boardId, cls) => {
    const key = `c-${cls.id}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
    if (!subjects[cls.id]) {
      let data = [];
      if (!cls.is_fallback) {
        try {
          const r = await libraryAPI.getSubjects(cls.id);
          data = r.data?.data || [];
        } catch {}
      }
      if (data.length === 0) {
        const stdSubjects = cls.grade <= 5 
           ? ['Mathematics', 'English', 'Hindi', 'Environmental Studies'] 
           : cls.grade <= 8 
              ? ['Mathematics', 'Science', 'Social Science', 'Computer Science', 'English', 'Hindi', 'Sanskrit']
           : cls.grade <= 10 
              ? ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Information Technology']
              : ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Economics', 'Business Studies', 'English'];
        
        data = stdSubjects.map((s, i) => ({
           id: `fbs-${cls.id}-${i}`,
           name: s,
           is_fallback: true
        }));
      }
      setSubjects(s => ({ ...s, [cls.id]: data }));
    }
  };

  if (loading) return <div className="p-6 flex justify-center"><Spinner size={20}/></div>;

  return (
    <div className="py-2">
      {boards.map(board => (
        <div key={board.id}>
          <ShelfItem label={board.name || board.code} sublabel={`Board Code: ${board.code}`} isSelected={false} onClick={() => toggleBoard(board)} indent={0} />
          <AnimatePresence>
            {expanded[`b-${board.id}`] && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {(classes[board.id] || []).map(cls => (
                  <div key={cls.id}>
                    <ShelfItem label={cls.grade_label || `Class ${cls.grade}`} isSelected={false} onClick={() => toggleClass(board.id, cls)} indent={1} />
                    {expanded[`c-${cls.id}`] && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        {(subjects[cls.id] || []).map(sub => (
                          <ShelfItem
                            key={sub.id}
                            label={sub.name}
                            isSelected={selected?.type === 'school' && selected?.subjectId === sub.id}
                            onClick={() => onSelect({ type: 'school', subjectId: sub.id, subjectName: sub.name, board: board.code, boardName: board.name, grade: cls.grade, gradeLabel: cls.grade_label })}
                            indent={2}
                          />
                        ))}
                        {subjects[cls.id]?.length === 0 && <div className="px-8 py-2 text-[11px] text-gray-400">No subjects yet...</div>}
                        {!subjects[cls.id] && <div className="px-8 py-2 flex justify-start"><Spinner size={14} /></div>}
                      </motion.div>
                    )}
                  </div>
                ))}
                {!classes[board.id] && <div className="px-6 py-2 flex justify-start"><Spinner size={14} /></div>}
              </motion.div>
            )}
          </AnimatePresence>
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
      let data = [];
      try {
        const r = await libraryAPI.getExamSubjects(exam.code);
        data = r.data?.data || [];
      } catch {}
      
      // Fallback injection for exams
      if (data.length === 0) {
        data = ['General Knowledge', 'Quantitative Aptitude', 'Logical Reasoning', 'English Language', 'Subject Specific'].map((s, i) => ({
          id: `fbe-${exam.code}-${i}`,
          name: s,
          is_fallback: true
        }));
      }
      setSubjects(s => ({ ...s, [exam.code]: data }));
    }
  };

  if (loading) return <div className="p-6 flex justify-center"><Spinner size={20}/></div>;
  const allExams = Object.values(exams).flat();

  return (
    <div className="py-2">
      {allExams.map(exam => (
        <div key={exam.code}>
          <ShelfItem label={exam.name || exam.code} sublabel={exam.code} isSelected={false} onClick={() => toggleExam(exam)} indent={0} />
          <AnimatePresence>
            {expanded[`e-${exam.code}`] && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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
                {!subjects[exam.code] && <div className="px-6 py-2 flex justify-start"><Spinner size={14} /></div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function UniversityShelf({ onSelect, selected }) {
  const [categories, setCategories] = useState({});
  const [expanded, setExpanded] = useState({});
  const [courseSubjects, setCourseSubjects] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. Fetch Courses and group by Category (Engineering, Medical, Commerce, etc.)
  useEffect(() => {
    libraryAPI.getCourses()
      .then(r => {
        const data = Array.isArray(r.data?.data) ? r.data.data : Object.values(r.data?.data || {}).flat();
        const grouped = {};
        data.forEach(c => {
          const cat = c.category || 'General';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(c);
        });
        setCategories(grouped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (catName) => {
    const key = `cat-${catName}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  };

  const toggleCourse = async (course) => {
    const key = `c-${course.id}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));

    if (!courseSubjects[course.id]) {
      let subs = [];
      try {
        const r = await libraryAPI.getCourseSubjects(course.id);
        subs = Array.isArray(r.data?.data) ? r.data.data : Object.values(r.data?.data || {}).flat();
      } catch {}
      
      // Fallback injection for universities globally
      if (subs.length === 0) {
        for (let sem = 1; sem <= 6; sem++) {
          ['Computer Networks', 'Operating Systems', 'Data Structures', 'Database Systems'].forEach((s, i) => {
            subs.push({
              id: `fbu-${course.id}-${sem}-${i}`,
              name: s,
              semester: sem,
              is_fallback: true
            });
          });
        }
      }

      const grouped = {};
      subs.forEach(s => {
        const sem = s.semester || 0;
        if (!grouped[sem]) grouped[sem] = [];
        grouped[sem].push(s);
      });
      setCourseSubjects(s => ({ ...s, [course.id]: grouped }));
    }
  };

  const toggleSem = (courseId, sem) => {
    const key = `s-${courseId}-${sem}`;
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  };

  if (loading) return <div className="p-6 flex justify-center"><Spinner size={20}/></div>;

  return (
    <div className="py-2">
      {Object.entries(categories).map(([catName, coursesList]) => (
        <div key={`cat-${catName}`}>
          {/* Layer 1: Course Category */}
          <ShelfItem
            label={catName}
            sublabel={`${coursesList.length} Technical/Degree Programs`}
            isSelected={false}
            onClick={() => toggleCategory(catName)}
            indent={0}
          />
          <AnimatePresence>
            {expanded[`cat-${catName}`] && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {coursesList.map(course => (
                  <div key={`c-${course.id}`}>
                    {/* Layer 2: Course */}
                    <ShelfItem
                      label={course.short_name || course.name}
                      sublabel={`${course.level} · ${course.duration_years || '?'}yr`}
                      isSelected={false}
                      onClick={() => toggleCourse(course)}
                      indent={1}
                    />
                    <AnimatePresence>
                      {expanded[`c-${course.id}`] && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          {courseSubjects[course.id] ? (
                            Object.entries(courseSubjects[course.id])
                              .sort(([a], [b]) => Number(a) - Number(b))
                              .map(([sem, subs]) => (
                                <div key={sem}>
                                  {/* Layer 3: Semester Dropdown */}
                                  <button
                                    onClick={() => toggleSem(course.id, sem)}
                                    className="w-full flex items-center gap-1.5 py-2 sm:py-1.5 hover:bg-gray-50 text-[11px] sm:text-[10px] text-gray-500 font-semibold uppercase tracking-wider pl-11"
                                  >
                                    <ChevronRight size={12} className={`transition-transform duration-300 ${expanded[`s-${course.id}-${sem}`] ? 'rotate-90' : ''}`} />
                                    {sem === '0' ? 'General' : `Semester ${sem}`}
                                  </button>
                                  <AnimatePresence>
                                    {expanded[`s-${course.id}-${sem}`] && (
                                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        {/* Layer 4: Final Subjects */}
                                        {subs.map(sub => (
                                          <ShelfItem
                                            key={sub.id}
                                            label={sub.name}
                                            sublabel={sub.subject_code || ''}
                                            isSelected={selected?.type === 'university' && selected?.subjectId === sub.id}
                                            onClick={() => onSelect({ 
                                              type: 'university', 
                                              subjectId: sub.id, 
                                              subjectName: sub.name, 
                                              courseId: course.id, 
                                              courseName: course.short_name || course.name, 
                                              semester: sub.semester 
                                            })}
                                            indent={3}
                                          />
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))
                          ) : (
                            <div className="pl-[52px] py-3 flex justify-start"><Spinner size={14} /></div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── RIGHT SHELF PANEL (desktop) ──────────────────────────────────────────────

function RightShelf({ onSelect, selected }) {
  const [section, setSection] = useState('school');

  const TABS = [
    { id: 'school',      icon: GraduationCap, label: 'School',      gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30' },
    { id: 'competitive', icon: Trophy,        label: 'Exams',       gradient: 'from-orange-400 to-rose-500', shadow: 'shadow-orange-500/30' },
    { id: 'university',  icon: Building2,     label: 'University',  gradient: 'from-fuchsia-500 to-purple-600', shadow: 'shadow-purple-500/30' },
  ];

  return (
    <div className="w-80 bg-white/70 backdrop-blur-xl border-l border-white/40 flex flex-col h-full min-h-0 flex-shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="px-4 py-5 pb-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="text-[15px] font-bold text-gray-800 tracking-tight">Library Shelf</span>
        </div>
        <div className="flex gap-1.5 bg-gray-100/80 p-1 rounded-xl">
          {TABS.map(({ id, icon: Icon, label, gradient, shadow }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all duration-300 relative ${
                section === id ? 'text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              {section === id && (
                <motion.div layoutId="tab-bg-shelf" className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-lg shadow-md ${shadow}`} />
              )}
              <Icon size={16} className="relative z-10" />
              <span className="relative z-10 uppercase tracking-wide">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/60 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {section === 'school'      && <SchoolShelf      onSelect={onSelect} selected={selected} />}
            {section === 'competitive' && <CompetitiveShelf onSelect={onSelect} selected={selected} />}
            {section === 'university'  && <UniversityShelf  onSelect={onSelect} selected={selected} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── MOBILE SHELF SHEET ───────────────────────────────────────────────────────

function MobileSheetShelf({ onSelect, selected, onClose }) {
  const [section, setSection] = useState('school');

  const TABS = [
    { id: 'school',      icon: GraduationCap, label: 'School',     gradient: 'from-blue-500 to-indigo-600' },
    { id: 'competitive', icon: Trophy,        label: 'Exams',      gradient: 'from-orange-400 to-rose-500' },
    { id: 'university',  icon: Building2,     label: 'University', gradient: 'from-fuchsia-500 to-purple-600' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden">
      <div className="flex-shrink-0 pt-4 pb-3 px-5 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="w-12 h-1.5 rounded-full bg-gray-200 mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="text-[16px] font-bold text-gray-800 tracking-tight">Library Shelf</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300">
            <X size={18} className="text-gray-600" />
          </button>
        </div>
        <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-2xl">
          {TABS.map(({ id, icon: Icon, label, gradient }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold transition-all relative ${
                section === id ? 'text-white' : 'text-gray-500'
              }`}
            >
              {section === id && (
                <motion.div layoutId="tab-bg-mobile" className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl shadow-md`} />
              )}
              <Icon size={14} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {section === 'school'      && <SchoolShelf      onSelect={(s) => { onSelect(s); onClose(); }} selected={selected} />}
            {section === 'competitive' && <CompetitiveShelf onSelect={(s) => { onSelect(s); onClose(); }} selected={selected} />}
            {section === 'university'  && <UniversityShelf  onSelect={(s) => { onSelect(s); onClose(); }} selected={selected} />}
          </motion.div>
        </AnimatePresence>
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
      <div className="flex flex-col items-center justify-center py-16 gap-5">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
        >
          <Sparkles size={28} className="text-white" />
        </motion.div>
        <p className="text-[14px] font-medium text-gray-500 animate-pulse tracking-wide">AI is deeply analyzing this topic...</p>
      </div>
    );
  }

  if (!response) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mt-6">
      {/* Visual Diagram Layer (New Feature!) */}
      {response.diagram_url && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-blue-900/5 ring-1 ring-white">
          <div className="flex items-center gap-2 mb-3 px-1">
            <ImageIcon size={16} className="text-blue-500" />
            <span className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">Visual Diagram</span>
          </div>
          <div className="relative w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center p-4">
            <img src={response.diagram_url} alt="AI Diagram" className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm mix-blend-multiply" />
          </div>
        </motion.div>
      )}

      {/* Exam Pattern Notification */}
      {response.exam_pattern_note && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-100 shadow-md shadow-rose-500/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-rose-600" />
            <span className="text-[14px] font-bold text-rose-800 tracking-tight">Exam Pattern Alert</span>
          </div>
          <p className="text-[13px] text-rose-700 leading-relaxed font-medium">
            {response.exam_pattern_note}
          </p>
        </motion.div>
      )}

      {/* Main Explanation Block */}
      {response.explanation && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-indigo-50/50 rounded-3xl transform -rotate-1 scale-[1.02] -z-10 transition-transform group-hover:rotate-0 group-hover:scale-100 opacity-50"></div>
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-900/5 border border-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Sparkles size={14} className="text-white" />
                </div>
                <span className="text-[15px] font-bold text-gray-800 tracking-tight">AI Detailed Explanation</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(response.explanation || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handlePDF}
                  disabled={downloading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
                >
                  {downloading ? <Spinner size={14} /> : <Download size={14} />}
                  <span className="hidden sm:inline">Save PDF</span>
                </button>
              </div>
            </div>
            <div className="prose prose-blue prose-sm sm:prose-base max-w-none text-gray-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {response.explanation}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Key Points */}
      {response.key_points?.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Target size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-emerald-800 tracking-tight">Key Takeaways</span>
          </div>
          <ul className="space-y-4">
            {response.key_points.map((pt, i) => (
              <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-700 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">{i + 1}</span>
                <span className="text-[14px] text-emerald-900 leading-relaxed font-medium">{pt}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Formula/Derivation Grid Block */}
      {(response.formula || response.derivation) && (
        <div className="bg-gradient-to-br from-fuchsia-50/80 to-purple-50/80 rounded-3xl p-6 sm:p-8 border border-fuchsia-100 shadow-lg shadow-fuchsia-500/5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <FileText size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-purple-800 tracking-tight">Derivations & Formulas</span>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-inner border border-purple-100">
            <pre className="text-[14px] text-purple-900 whitespace-pre-wrap font-mono leading-relaxed">
              {response.formula || response.derivation}
            </pre>
          </div>
        </div>
      )}

      {/* Code Snippet — handles both object {language,code,explanation} and legacy string */}
      {response.code_example && (() => {
        const codeObj  = typeof response.code_example === 'object' ? response.code_example : null;
        const codeStr  = codeObj ? (codeObj.code || '') : String(response.code_example);
        const lang     = codeObj?.language || 'code';
        const codeExp  = codeObj?.explanation || '';
        const sampleIO = codeObj?.sample_io || '';
        return (
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 ring-1 ring-white/10">
            <div className="bg-[#0B1121] flex items-center justify-between px-6 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-3">{lang}</span>
              </div>
              <button onClick={() => navigator.clipboard.writeText(codeStr)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Copy size={14} className="text-white/60 hover:text-white" />
              </button>
            </div>
            <pre className="bg-[#0B1121] text-[13px] text-emerald-400 p-6 overflow-x-auto leading-relaxed font-mono">
              {codeStr}
            </pre>
            {codeExp && (
              <div className="bg-[#111827] px-6 py-4 border-t border-white/5">
                <p className="text-[12px] text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">{codeExp}</p>
              </div>
            )}
            {sampleIO && (
              <div className="bg-[#0d1117] px-6 py-3 border-t border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sample I/O</span>
                <pre className="text-[12px] text-sky-400 mt-1 font-mono whitespace-pre-wrap">{sampleIO}</pre>
              </div>
            )}
          </div>
        );
      })()}

      {/* Memory Trick / Remember This */}
      {(response.remember_this || response.mnemonic) && (
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 shadow-xl shadow-orange-500/20 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <Brain size={120} className="transform translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-[11px] font-black tracking-widest uppercase text-amber-100 drop-shadow-sm">Memory Hack</span>
            <span className="text-[16px] font-bold leading-relaxed">{response.remember_this || response.mnemonic}</span>
          </div>
        </motion.div>
      )}

      {/* Derivation Steps */}
      {response.derivation_steps?.length > 0 && (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-violet-100 shadow-lg shadow-violet-500/5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <FlaskConical size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-purple-800 tracking-tight">Step-by-Step Derivation</span>
          </div>
          <ol className="space-y-3">
            {response.derivation_steps.map((step, i) => (
              <motion.li initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.05 * i }} key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-violet-200 text-violet-800 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">{i+1}</span>
                <span className="text-[14px] text-purple-900 leading-relaxed font-medium">{step}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      )}

      {/* Solved Example */}
      {response.solved_example && (
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-3xl p-6 sm:p-8 border border-cyan-100 shadow-lg shadow-cyan-500/5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-sky-800 tracking-tight">Worked Example</span>
          </div>
          {response.solved_example.problem && <p className="text-[13px] font-semibold text-sky-900 mb-3 bg-white/70 rounded-xl p-3 border border-sky-100">{response.solved_example.problem}</p>}
          {response.solved_example.approach && <p className="text-[12px] text-sky-700 italic mb-4">{response.solved_example.approach}</p>}
          {response.solved_example.solution_steps?.length > 0 && (
            <ol className="space-y-2 mb-4">
              {response.solved_example.solution_steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-sky-900">
                  <ArrowRight size={14} className="mt-0.5 flex-shrink-0 text-sky-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          )}
          {response.solved_example.answer && (
            <div className="bg-sky-600 text-white rounded-xl px-4 py-2 w-fit font-bold text-[14px] shadow-md">
              ✅ {response.solved_example.answer}
            </div>
          )}
        </div>
      )}

      {/* Comparison Table */}
      {response.comparison?.points?.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 border border-white overflow-x-auto">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-gray-800 tracking-tight">Comparison: {response.comparison.header_a} vs {response.comparison.header_b}</span>
          </div>
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 bg-gray-100 rounded-tl-xl font-bold text-gray-600">Aspect</th>
                <th className="text-left py-2 px-3 bg-indigo-100 font-bold text-indigo-700">{response.comparison.header_a}</th>
                <th className="text-left py-2 px-3 bg-blue-100 rounded-tr-xl font-bold text-blue-700">{response.comparison.header_b}</th>
              </tr>
            </thead>
            <tbody>
              {response.comparison.points.map((pt, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                  <td className="py-2 px-3 font-semibold text-gray-700 border-t border-gray-100">{pt.aspect}</td>
                  <td className="py-2 px-3 text-gray-600 border-t border-gray-100">{pt.a}</td>
                  <td className="py-2 px-3 text-gray-600 border-t border-gray-100">{pt.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(response.comparison.when_to_use_a || response.comparison.when_to_use_b) && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {response.comparison.when_to_use_a && <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-[12px] text-indigo-800 font-medium"><span className="font-bold block mb-1">Use {response.comparison.header_a} when:</span>{response.comparison.when_to_use_a}</div>}
              {response.comparison.when_to_use_b && <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3 text-[12px] text-blue-800 font-medium"><span className="font-bold block mb-1">Use {response.comparison.header_b} when:</span>{response.comparison.when_to_use_b}</div>}
            </div>
          )}
        </div>
      )}

      {/* Graded Examples */}
      {response.graded_examples?.length > 0 && (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-lg shadow-rose-500/5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/20">
              <Lightbulb size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-rose-800 tracking-tight">Graded Examples</span>
          </div>
          <div className="space-y-4">
            {response.graded_examples.map((ex, i) => (
              <div key={i} className="bg-white/70 rounded-2xl p-4 border border-rose-100 shadow-sm">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ex.level === 'Basic' ? 'bg-emerald-100 text-emerald-700' : ex.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{ex.level}</span>
                <p className="text-[13px] font-semibold text-gray-800 mt-2">{ex.problem}</p>
                <p className="text-[13px] text-gray-600 mt-1">{ex.solution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Viva Questions (University mode) */}
      {response.viva_questions?.length > 0 && (
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg shadow-slate-500/5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center shadow-md">
              <BookText size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-gray-800 tracking-tight">Viva / Oral Exam Questions</span>
          </div>
          <ol className="space-y-3">
            {response.viva_questions.map((q, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-md bg-gray-200 text-gray-700 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">Q{i+1}</span>
                <span className="text-[14px] text-gray-700 leading-relaxed font-medium">{q}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Real Life Example */}
      {response.real_life_example && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100 shadow-md shadow-teal-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-teal-600" />
            <span className="text-[13px] font-bold text-teal-800">Real World Application</span>
          </div>
          <p className="text-[13px] text-teal-700 leading-relaxed font-medium">{response.real_life_example}</p>
        </div>
      )}

      {/* Related Topics */}
      {response.related_topics?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Link2 size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-[12px] font-bold text-gray-400 mr-1">Related:</span>
          {response.related_topics.map((t, i) => (
            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-[12px] font-semibold rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-default">{t}</span>
          ))}
        </div>
      )}

      {/* Follow-up Question */}
      {response.follow_up_question && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="border-2 border-dashed border-indigo-200 rounded-2xl p-5 flex items-start gap-3">
          <HelpCircle size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-1">Think Deeper →</p>
            <p className="text-[14px] font-semibold text-indigo-700 leading-relaxed">{response.follow_up_question}</p>
          </div>
        </motion.div>
      )}

    </motion.div>
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
  const [syllabusVersion, setSyllabusVersion] = useState('latest');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!selected) { setChapters([]); setSelectedChapter(null); setSelectedTopic(null); setAiResponse(null); return; }
    setChapters([]);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setAiResponse(null);
    setChaptersLoading(true);

    // Real subject IDs are integers; fallbacks start with 'fbs-', 'fbe-', 'fb-'
    const isFallbackId = (id) => !id || String(id).startsWith('fbs') || String(id).startsWith('fbe') || String(id).startsWith('fb-');

    const loadChapters = async () => {
      // ── 1. Try real DB chapters first (school subjects only) ──────────────────
      if (selected.type === 'school' && !isFallbackId(selected.subjectId)) {
        try {
          const booksRes = await libraryAPI.getBooks(selected.subjectId);
          const books = booksRes.data?.data || [];
          if (books.length > 0) {
            const book = books[0];
            const chapRes = await libraryAPI.getChapters(book.id);
            const dbChapters = chapRes.data?.data || [];
            if (dbChapters.length > 0) {
              setBookTitle(book.title || book.name || '');
              setChapters(dbChapters.map((ch, i) => ({
                num:    ch.chapter_number ?? (i + 1),
                name:   ch.title,
                dbId:   ch.id,
                topics: (ch.key_concepts || []).map(k => ({ id: `kc-${k}`, name: k })),
                description: ch.description,
                estimated_study_time_mins: ch.estimated_study_time_mins,
              })));
              return; // DB had chapters — done
            }
          }
        } catch { /* fall through to AI */ }
      }

      // ── 2. Fall back to AI/NCERT smart chapters ───────────────────────────────
      const params = { version: syllabusVersion };
      if (selected.type === 'school')          { params.board = selected.board; params.class = selected.grade; params.subject = selected.subjectName; }
      else if (selected.type === 'exam')       { params.exam = selected.examName; params.subject = selected.subjectName; }
      else if (selected.type === 'university') { params.subject = selected.subjectName; }
      try {
        const r = await libraryAPI.getSmartChapters(params);
        const data = r.data?.data || {};
        setChapters(data.chapters || []);
        setBookTitle(data.bookTitle || '');
      } catch { setChapters([]); }
    };

    loadChapters().finally(() => setChaptersLoading(false));
  }, [selected, syllabusVersion]);

  const handleAsk = useCallback(async (topicOverride, mode = 'explain') => {
    const chapterCtx = selectedChapter?.name ? ` from the chapter "${selectedChapter.name}"` : '';
    let q = topicOverride ? `Explain the topic "${topicOverride}"${chapterCtx} conceptually in detail.` : query.trim();
    if (topicOverride && mode === 'diagram') {
       q = `Explain the topic "${topicOverride}"${chapterCtx} conceptually and provide a detailed diagram or sketch representation to make it impactful.`;
    } else if (topicOverride && mode === 'pattern') {
       q = `Discuss the exam pattern and highly tested questions regarding the topic "${topicOverride}"${chapterCtx}.`;
    }

    if (!q || !selected) return;
    setAiLoading(true);
    setAiResponse(null);
    if (!topicOverride) setQuery('');

    const payload = { studentQuery: q, version: syllabusVersion };
    if (selected.type === 'school') { payload.subjectId = selected.subjectId; payload.boardCode = selected.board; payload.grade = selected.grade; payload.subjectName = selected.subjectName; }
    else if (selected.type === 'exam') { payload.examCode = selected.examCode; payload.subjectId = selected.subjectId; payload.subjectName = selected.subjectName; }
    else if (selected.type === 'university') { payload.universitySubjectId = selected.subjectId; payload.subjectName = selected.subjectName; }
    if (selectedChapter) payload.chapterId = selectedChapter?.dbId;

    try {
      const r = await libraryAPI.ask(payload);
      setAiResponse(r.data?.data || null);
    } catch {
      setAiResponse({ explanation: 'Sorry, AI encountered an error. Please try again.' });
    }
    setAiLoading(false);
  // syllabusVersion MUST be in deps — without it the closure captures stale value after toggle
  }, [query, selected, selectedChapter, syllabusVersion]);

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
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 sm:px-8 mt-4 sm:mt-10 overflow-hidden" style={{ perspective: '1500px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.85, y: 30, rotateX: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }} 
          transition={{ type: "spring", bounce: 0.25, duration: 1.2 }}
          className="relative flex w-full max-w-[700px] h-auto sm:h-[480px] rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Subtle pages stack background layer */}
          <div className="absolute top-2 bottom-2 -left-1.5 w-full bg-slate-200 rounded-2xl -z-10 shadow-sm hidden sm:block" />
          <div className="absolute top-1 bottom-1 -left-0.5 w-full bg-slate-100 rounded-2xl -z-10 shadow-sm hidden sm:block" />

          {/* Book Spine (Middle Center Craese) - Hidden on mobile */}
          <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-40 z-20 pointer-events-none mix-blend-multiply rounded-full blur-[1px]"></div>

          {/* Left Page - Hidden on mobile */}
          <motion.div 
            initial={{ rotateY: 35 }}
            animate={{ rotateY: 0 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 1.5, delay: 0.1 }}
            className="hidden sm:flex w-1/2 h-full bg-gradient-to-br from-white to-gray-50 rounded-l-2xl origin-right p-6 sm:p-10 flex-col items-center justify-center border-r border-gray-200 shadow-[-5px_0_15px_rgba(0,0,0,0.03)] z-10 relative overflow-hidden"
          >
            {/* Lined paper effect */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #000 27px, #000 28px)', backgroundPositionY: '40px' }} />
            
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-8 z-10"
            >
              <BookOpen size={48} className="text-white drop-shadow-md" />
            </motion.div>
            
            <h2 className="text-[32px] font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-700 to-indigo-900 text-center leading-tight z-10 drop-shadow-sm">Syllabrix AI</h2>
            <h2 className="text-[20px] font-bold text-gray-400 text-center z-10 tracking-[0.2em] mt-1 uppercase">Library</h2>
          </motion.div>

          {/* Right Page - Full width on mobile */}
          <motion.div 
            initial={{ rotateY: -35 }}
            animate={{ rotateY: 0 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 1.6, delay: 0.1 }}
            className="w-full sm:w-1/2 h-full min-h-[400px] bg-gradient-to-br from-white to-slate-50 rounded-2xl sm:rounded-none sm:rounded-r-2xl origin-left p-6 sm:p-10 flex flex-col justify-center border-l border-white shadow-[5px_0_15px_rgba(0,0,0,0.03)] z-10 relative"
          >
            {/* Mobile Header Title */}
            <div className="sm:hidden flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                 <Sparkles size={20} className="text-white" />
               </div>
               <div>
                  <h2 className="text-[18px] font-black text-gray-800 leading-none">Syllabrix AI</h2>
                  <h2 className="text-[12px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">Library</h2>
               </div>
            </div>

            {/* Lined paper effect */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #000 27px, #000 28px)', backgroundPositionY: '40px' }} />

            <div className="relative z-10">
              <h3 className="text-[17px] font-extrabold text-gray-800 mb-2">Welcome to the Vault</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed font-medium mb-6 sm:mb-8">
                Dive into any syllabus globally.<br/> Select an item from the shelf to instantly generate rich diagrams, exact exam patterns, and conceptual breakdowns.
              </p>

              <div className="space-y-3 sm:space-y-4">
                {[
                  { icon: GraduationCap, label: 'K-12 Boards', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
                  { icon: Trophy, label: 'Entrance Exams', color: 'from-orange-500 to-red-600', shadow: 'shadow-red-500/20' },
                  { icon: Building2, label: 'Universities', color: 'from-fuchsia-500 to-purple-600', shadow: 'shadow-purple-500/20' },
                ].map(({ icon: Icon, label, color, shadow }, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (i * 0.1) }}
                    key={label} 
                    className="flex items-center gap-4 group cursor-default"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md ${shadow} group-hover:scale-110 transition-transform`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="text-[14px] font-extrabold text-gray-700 group-hover:text-gray-900 transition-colors">{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto pb-32">
      {/* Header Info Layer */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500 flex-wrap">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
                <span className={i === breadcrumb.length - 1 ? 'text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md' : ''}>{item}</span>
              </span>
            ))}
          </div>
        )}

        {bookTitle && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl w-fit shadow-sm">
            <BookMarked size={14} className="text-blue-600 flex-shrink-0" />
            <span className="text-[13px] text-blue-800 font-bold truncate max-w-[280px] sm:max-w-none">Curriculum: {bookTitle}</span>
          </div>
        )}
      </motion.div>

      {/* Syllabus Era Toggle */}
      {selected?.type === 'school' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center px-4">
          <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-1.5 rounded-[18px] flex flex-wrap justify-center sm:items-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] w-full sm:w-fit gap-1 sm:gap-0 transition-all z-10 relative">
             <button
               onClick={() => setSyllabusVersion('latest')}
               className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all ${syllabusVersion === 'latest' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
             >
               ✨ Latest (2024+)
             </button>
             <button
               onClick={() => setSyllabusVersion('old')}
               className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all ${syllabusVersion === 'old' ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
             >
               📚 Old (Pre-2023)
             </button>
          </div>
        </motion.div>
      )}

      {/* Chapters Carousel */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <List size={16} className="text-blue-600" />
          </div>
          <span className="text-[16px] font-black text-gray-800 tracking-tight">Syllabus Chapters</span>
          {selected?.type === 'school' && (
            <span className={`ml-auto text-[11px] font-bold px-3 py-1 rounded-full ${syllabusVersion === 'latest' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
              {syllabusVersion === 'latest' ? '✨ Latest 2024-25' : '📚 Old (Pre-2023)'}
            </span>
          )}
          {chaptersLoading && <Spinner size={14} />}
        </div>
        
        {chaptersLoading ? (
          <div className="flex items-center justify-center gap-3 text-[13px] text-gray-400 py-8 font-medium">
             <div className="animate-pulse flex gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div><div className="w-2 h-2 rounded-full bg-blue-400 animation-delay-200"></div><div className="w-2 h-2 rounded-full bg-blue-400 animation-delay-400"></div></div>
             Fetching complete syllabus structure...
          </div>
        ) : chapters.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => { setSelectedChapter(ch); setSelectedTopic(null); setAiResponse(null); }}
                className={`px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 border-2 active:scale-95 ${
                  selectedChapter?.num === ch.num
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {ch.num}. {ch.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-[13px] text-gray-400 font-medium">AI is preparing chapters for this subject.</div>
        )}
      </motion.div>

      {/* Topics */}
      <AnimatePresence mode="popLayout">
        {selectedChapter?.topics?.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-100/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Layers size={16} className="text-white" />
              </div>
              <span className="text-[16px] font-black text-gray-800 tracking-tight">Select a Topic to Dive Deep</span>
            </div>
            <div className="flex flex-col gap-3">
              {selectedChapter.topics.map((topic, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white/60 hover:bg-white rounded-2xl border border-white transition-colors group shadow-sm">
                  <div className="flex-1 font-bold text-gray-700 text-[14px] px-2">{topic}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setSelectedTopic(topic); handleAsk(topic, 'explain'); }} className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-[11px] font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors flex justify-center">
                       Explain deeply
                    </button>
                    <button onClick={() => { setSelectedTopic(topic); handleAsk(topic, 'diagram'); }} className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors flex justify-center gap-1.5 items-center">
                       <ImageIcon size={12}/> Visual Diagram
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom AI Chat Input Layer */}
      <motion.div layout className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
        <div className="flex gap-3">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            placeholder={selectedChapter ? `Ask a specific question about ${selectedChapter.name}...` : `Ask anything related to ${selected.subjectName}...`}
            className="flex-1 px-5 py-4 rounded-2xl border-2 border-gray-100 text-[15px] font-medium text-gray-800 focus:outline-none focus:border-indigo-400 bg-gray-50/50 hover:bg-white transition-colors placeholder:text-gray-400 shadow-inner"
          />
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || aiLoading}
            className="w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex flex-shrink-0"
          >
            {aiLoading ? <Spinner size={20} /> : <Send size={20} className="ml-1" />}
          </button>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap px-1">
          {['Draw a diagram', 'What is the exam pattern?', 'Solve an example', 'Provide cheat codes'].map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); inputRef.current?.focus(); }}
              className="px-4 py-2 rounded-xl bg-gray-100 text-[11px] font-bold text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors tracking-wide"
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Rendering the Response Layer */}
      <AnimatePresence>
        {(aiLoading || aiResponse) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <AIResponse response={aiResponse} context={pdfContext} isLoading={aiLoading} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AILibraryPage() {
  const [selected, setSelected] = useState(null);
  const [mobileTab, setMobileTab] = useState('browse');
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSelect = (s) => {
    setSelected(s);
    if (s) setMobileTab('read');
  };

  return (
    <div className="h-[calc(100dvh-120px)] md:h-[calc(100dvh-56px)] w-full relative overflow-hidden flex flex-col">
      
      {/* Absolute background blobs for glassmorphism effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none z-[-1]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] bg-purple-400/20 blur-[120px] rounded-full pointer-events-none z-[-1]" />
      <div className="absolute top-[40%] right-[10%] w-[20%] h-[20%] bg-orange-400/10 blur-[100px] rounded-full pointer-events-none z-[-1]" />

      {/* ── DESKTOP LAYOUT ─────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-row h-full w-full overflow-hidden bg-transparent">
        {/* Center reading space */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          <div className="bg-white/40 backdrop-blur-md border-b border-white/50 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-[17px] font-black text-gray-800 tracking-tight">AI Library Studio</h1>
                <p className="text-[11px] text-gray-500 font-medium">Any Syllabus. Anywhere. Animated visually.</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
             <ReaderPanel selected={selected} isMobile={false} />
          </div>
        </div>
        {/* Right shelf panel */}
        <RightShelf onSelect={setSelected} selected={selected} />
      </div>

      {/* ── MOBILE LAYOUT ──────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col bg-transparent relative z-10 h-full w-full">
        <div className="bg-white/60 backdrop-blur-xl border-b border-white/50 px-5 py-3.5 flex items-center gap-3 flex-shrink-0 shadow-sm sticky top-0 z-20">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Brain size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-black text-gray-800 tracking-tight">AI Library Studio</h1>
            {selected && (
              <p className="text-[11px] text-gray-500 truncate font-semibold">
                {selected.subjectName}
              </p>
            )}
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md text-white text-[12px] font-bold active:scale-95 transition-all flex-shrink-0"
          >
            <LayoutList size={16} />
            {selected ? 'Syllabus' : 'Browse'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
          {!selected ? (
            <div className="flex flex-col items-center justify-center gap-6 text-center px-6 py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full"></div>
                <div className="w-20 h-20 rounded-3xl bg-white/80 backdrop-blur-lg border border-white/50 flex items-center justify-center shadow-2xl relative z-10">
                  <Sparkles size={36} className="text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-[24px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 mb-2 leading-tight">Welcome to the<br/>Future of Learning</h2>
                <p className="text-[14px] text-gray-500 font-medium">Tap Browse above to enter any syllabus and generate visual diagrams instantly.</p>
              </div>
            </div>
          ) : (
            <ReaderPanel selected={selected} isMobile={true} />
          )}
        </div>

        {/* Mobile bottom shelf sheet */}
        <AnimatePresence>
          {sheetOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
                onClick={() => setSheetOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl"
                style={{ height: '80vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
              >
                <MobileSheetShelf
                  onSelect={handleSelect}
                  selected={selected}
                  onClose={() => setSheetOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
}
