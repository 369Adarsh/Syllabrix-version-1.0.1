'use client';
import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import { toast } from 'sonner';
import {
  BookOpen, ChevronRight, ChevronDown, Plus, Search, Upload,
  Trash2, FileText, Brain, School, Layers, X, Loader2, Eye,
  ExternalLink, FlaskConical, Calculator, Globe, Code, Cpu,
  GraduationCap, Trophy, Building2, ArrowLeft, Hash, Check,
  Landmark, Shield, Train, Briefcase, Scale, Stethoscope,
  Cpu as CpuIcon, Palette, BookMarked, Sparkles, BarChart3,
  FolderTree, Star, Clock, ChevronUp, UploadCloud, Layers3,
  Pencil, ListOrdered, Copy
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const EXAM_TYPE_META = {
  engineering_entrance: { label: 'Engineering Entrance',  icon: Cpu,          color: 'blue',   grad: 'from-blue-600 to-indigo-700' },
  medical:              { label: 'Medical Entrance',       icon: Stethoscope,  color: 'emerald',grad: 'from-emerald-500 to-teal-700' },
  civil_services:       { label: 'Civil Services',         icon: Scale,        color: 'amber',  grad: 'from-amber-500 to-orange-600' },
  banking:              { label: 'Banking & Finance',      icon: Landmark,     color: 'green',  grad: 'from-green-600 to-emerald-700' },
  defence:              { label: 'Defence Services',       icon: Shield,       color: 'slate',  grad: 'from-slate-500 to-gray-700' },
  railways:             { label: 'Railways',               icon: Train,        color: 'cyan',   grad: 'from-cyan-500 to-sky-700' },
  ssc:                  { label: 'Staff Selection (SSC)',  icon: FileText,     color: 'orange', grad: 'from-orange-500 to-amber-700' },
  management:           { label: 'Management',             icon: Briefcase,    color: 'violet', grad: 'from-violet-600 to-purple-700' },
  law:                  { label: 'Law Entrance',           icon: Scale,        color: 'rose',   grad: 'from-rose-500 to-pink-700' },
  state_level:          { label: 'State Level (PSC)',      icon: Building2,    color: 'indigo', grad: 'from-indigo-500 to-blue-700' },
  other:                { label: 'Other Exams',            icon: BookOpen,     color: 'gray',   grad: 'from-gray-600 to-slate-700' },
};

const UNIV_CATEGORY_ICONS = {
  Engineering:  Cpu,
  Technology:   Cpu,
  Medical:      Stethoscope,
  Management:   Briefcase,
  Commerce:     Landmark,
  Law:          Scale,
  Science:      FlaskConical,
  Arts:         Palette,
  Humanities:   BookMarked,
  Education:    GraduationCap,
  Architecture: Building2,
  Design:       Palette,
};

const SUBJECT_ICONS = {
  Physics: FlaskConical, Chemistry: FlaskConical, Biology: Stethoscope,
  Mathematics: Calculator, Maths: Calculator, English: Globe,
  'Computer Science': Code, 'Information Technology': Cpu,
};

const REALMS = [
  {
    id: 'school',
    label: 'School Boards',
    sub: 'CBSE · ICSE · State Boards · NIOS',
    icon: School,
    grad: 'from-blue-600 via-indigo-600 to-violet-700',
    glow: 'shadow-blue-500/25',
    accent: 'text-blue-400',
    ring: 'ring-blue-500/30',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    desc: 'Organize course books by board, class, and subject. From Class 6 to Class 12 across all national and state boards.',
  },
  {
    id: 'competitive',
    label: 'Competitive Exams',
    sub: 'UPSC · NEET · JEE · Banking · SSC · CAT',
    icon: Trophy,
    grad: 'from-orange-500 via-rose-500 to-pink-700',
    glow: 'shadow-orange-500/25',
    accent: 'text-orange-400',
    ring: 'ring-orange-500/30',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    desc: 'Curate study material for every competitive exam — engineering, medical, civil services, banking, defence, and more.',
  },
  {
    id: 'university',
    label: 'University',
    sub: 'B.Tech · MBBS · MBA · LLB · B.Sc · M.Tech',
    icon: Building2,
    grad: 'from-emerald-500 via-teal-600 to-cyan-700',
    glow: 'shadow-emerald-500/25',
    accent: 'text-emerald-400',
    ring: 'ring-emerald-500/30',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    desc: 'Manage university syllabi by stream, course, and semester. Engineering, medical, commerce, law, arts, and more.',
  },
];

// ── Tiny UI primitives ────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all';
const selectCls = `${inputCls} appearance-none`;

function Modal({ title, onClose, children, wide, size }) {
  const maxW = size === 'xl' ? 'max-w-4xl' : size === 'lg' ? 'max-w-2xl' : wide ? 'max-w-lg' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={`relative z-10 bg-white border border-gray-200 rounded-2xl shadow-2xl w-full ${maxW} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-gray-900 font-bold text-sm">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"><X size={14} /></button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[9px] uppercase font-black text-gray-400 tracking-widest block">{label}</label>}
      {children}
    </div>
  );
}

function Btn({ variant = 'primary', loading, disabled, onClick, children, className = '', size = 'md' }) {
  const sz = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const vars = {
    primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-200',
    ghost:   'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:text-gray-900',
    danger:  'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
  };
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`flex items-center justify-center gap-1.5 ${sz} rounded-lg font-semibold transition-all disabled:opacity-50 ${vars[variant]} ${className}`}>
      {loading && <Loader2 size={12} className="animate-spin" />}
      {children}
    </button>
  );
}

function Badge({ children, color = 'violet' }) {
  const cls = {
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    blue:   'bg-blue-100 text-blue-700 border-blue-200',
    emerald:'bg-emerald-100 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    amber:  'bg-amber-100 text-amber-700 border-amber-200',
    rose:   'bg-rose-100 text-rose-700 border-rose-200',
  };
  return <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${cls[color] || cls.violet}`}>{children}</span>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminLibraryPage() {
  const [stats, setStats] = useState(null);
  const [realm, setRealm] = useState(null);

  // School state
  const [schoolTree, setSchoolTree] = useState([]);
  const [openBoards, setOpenBoards] = useState({});
  const [openClasses, setOpenClasses] = useState({});
  const [schoolSel, setSchoolSel] = useState(null);
  const [schoolContent, setSchoolContent] = useState([]);

  // Competitive state
  const [examTree, setExamTree] = useState({});
  const [openExamGroups, setOpenExamGroups] = useState({});
  const [openExams, setOpenExams] = useState({});
  const [examSel, setExamSel] = useState(null);
  const [examSubjects, setExamSubjects] = useState([]);
  const [examBooks, setExamBooks] = useState([]);

  // University state
  const [univTree, setUnivTree] = useState([]);
  const [openUnivCats, setOpenUnivCats] = useState({});
  const [univSel, setUnivSel] = useState(null);
  const [univSubjects, setUnivSubjects] = useState({});
  const [univBooks, setUnivBooks] = useState([]);

  // Shared book state
  const [openBooks, setOpenBooks] = useState({});
  const [bookChapters, setBookChapters] = useState({});
  const [bookUploads, setBookUploads] = useState({});
  const [mainLoading, setMainLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [modal, setModal] = useState(null);

  // ── Load stats ─────────────────────────────────────────────────────────────
  useEffect(() => {
    adminAPI.getLibraryStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  // ── Load realm tree ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!realm) return;
    setMainLoading(true);
    setOpenBooks({}); setBookChapters({}); setBookUploads({});
    if (realm === 'school') {
      adminAPI.getLibraryTree().then(r => setSchoolTree(r.data || [])).catch(() => {}).finally(() => setMainLoading(false));
    } else if (realm === 'competitive') {
      adminAPI.getExamTree().then(r => setExamTree(r.data || {})).catch(() => {}).finally(() => setMainLoading(false));
    } else if (realm === 'university') {
      adminAPI.getUniversityTree().then(r => setUnivTree(r.data || [])).catch(() => {}).finally(() => setMainLoading(false));
    }
  }, [realm]);

  // ── Search ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!search || search.length < 2) { setSearchResults(null); return; }
    const t = setTimeout(() => {
      adminAPI.searchLibrary(search).then(r => setSearchResults(r.data)).catch(() => {});
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── School navigation ──────────────────────────────────────────────────────
  const schoolNav = async (type, data, parentData) => {
    setSchoolSel({ type, ...data, ...(parentData || {}) });
    setMainLoading(true);
    try {
      if (type === 'board')   { const r = await adminAPI.getLibraryClasses(data.id); setSchoolContent(r.data || []); }
      if (type === 'class')   { const r = await adminAPI.getLibrarySubjects(data.id); setSchoolContent(r.data || []); }
      if (type === 'subject') { const r = await adminAPI.getLibraryBooks(data.id); setSchoolContent(r.data || []); }
    } catch (_) {} finally { setMainLoading(false); }
  };

  // ── Competitive navigation ─────────────────────────────────────────────────
  const examNav = async (exam) => {
    setExamSel(exam); setExamBooks([]);
    setMainLoading(true);
    try { const r = await adminAPI.getExamSubjects(exam.id); setExamSubjects(r.data || []); }
    catch (_) {} finally { setMainLoading(false); }
  };
  const loadExamBooks = async (subject_id) => {
    try { const r = await adminAPI.getCompetitiveBooks(subject_id); setExamBooks(r.data || []); }
    catch (_) {}
  };

  // ── University navigation ──────────────────────────────────────────────────
  const univNav = async (course) => {
    setUnivSel(course); setUnivBooks([]);
    setMainLoading(true);
    try { const r = await adminAPI.getUniversitySubjects(course.id); setUnivSubjects(r.data || {}); }
    catch (_) {} finally { setMainLoading(false); }
  };
  const loadUnivBooks = async (subject_id) => {
    try { const r = await adminAPI.getUniversitySubjectBooks(subject_id); setUnivBooks(r.data || []); }
    catch (_) {}
  };

  // ── Shared book expand ─────────────────────────────────────────────────────
  const toggleBook = (book_id) => {
    const open = !openBooks[book_id];
    setOpenBooks(p => ({ ...p, [book_id]: open }));
    if (open) {
      adminAPI.getLibraryChapters(book_id).then(r => setBookChapters(p => ({ ...p, [book_id]: r.data || [] }))).catch(() => {});
      adminAPI.getLibraryUploads('book', book_id).then(r => setBookUploads(p => ({ ...p, [book_id]: r.data || [] }))).catch(() => {});
    }
  };
  const toggleCompBook = (book_id) => {
    const open = !openBooks[book_id];
    setOpenBooks(p => ({ ...p, [book_id]: open }));
    if (open) adminAPI.getLibraryUploads('competitive_book', book_id).then(r => setBookUploads(p => ({ ...p, [book_id]: r.data || [] }))).catch(() => {});
  };
  const toggleUnivBook = (book_id) => {
    const open = !openBooks[book_id];
    setOpenBooks(p => ({ ...p, [book_id]: open }));
    if (open) adminAPI.getLibraryUploads('university_book', book_id).then(r => setBookUploads(p => ({ ...p, [book_id]: r.data || [] }))).catch(() => {});
  };

  // ── Upload / AI index handlers ─────────────────────────────────────────────
  const handleUpload = async (fd) => {
    await adminAPI.uploadLibraryFile(fd);
    toast.success('File uploaded'); setModal(null);
    const bid = fd.get('entity_id');
    const etype = fd.get('entity_type');
    if (bid) adminAPI.getLibraryUploads(etype, parseInt(bid)).then(r => setBookUploads(p => ({ ...p, [bid]: r.data || [] }))).catch(() => {});
    adminAPI.getLibraryStats().then(r => setStats(r.data)).catch(() => {});
  };
  const handleToggleAI = async (upload_id, book_id) => {
    await adminAPI.toggleLibraryAiIndex(upload_id).catch(() => {});
    const currentUploads = bookUploads[book_id] || [];
    const etype = currentUploads[0]?.entity_type || 'book';
    adminAPI.getLibraryUploads(etype, book_id).then(r => setBookUploads(p => ({ ...p, [book_id]: r.data || [] }))).catch(() => {});
  };
  const handleDeleteUpload = async (upload_id, book_id) => {
    await adminAPI.deleteLibraryUpload(upload_id).catch(() => {});
    setBookUploads(p => ({ ...p, [book_id]: (p[book_id] || []).filter(u => u.id !== upload_id) }));
  };
  const handleAddChapter = async (data, book_id) => {
    await adminAPI.createLibraryChapter({ ...data, book_id });
    toast.success('Chapter added'); setModal(null);
    adminAPI.getLibraryChapters(book_id).then(r => setBookChapters(p => ({ ...p, [book_id]: r.data || [] }))).catch(() => {});
  };
  const handleBulkAddChapters = async (chapters, book_id) => {
    const res = await adminAPI.bulkCreateLibraryChapters({ book_id, chapters });
    toast.success(`${chapters.length} chapter${chapters.length !== 1 ? 's' : ''} added`);
    setModal(null);
    adminAPI.getLibraryChapters(book_id).then(r => setBookChapters(p => ({ ...p, [book_id]: r.data || [] }))).catch(() => {});
    return res.data; // [{id, title}, ...]
  };
  const handleUpdateChapter = async (chapterId, data, book_id) => {
    await adminAPI.updateLibraryChapter(chapterId, data);
    adminAPI.getLibraryChapters(book_id).then(r => setBookChapters(p => ({ ...p, [book_id]: r.data || [] }))).catch(() => {});
  };

  const realmMeta = REALMS.find(r => r.id === realm);

  return (
    <div className="flex flex-col md:flex-row -m-4 md:-m-6 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ════ LEFT TREE PANEL ════ */}
      <div className={`w-full md:w-[275px] shrink-0 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex-col ${(schoolSel || examSel || univSel) ? 'hidden md:flex' : 'flex'}`}>

        {/* Realm switcher tabs */}
        <div className="p-2.5 border-b border-gray-200 flex gap-1.5">
          {REALMS.map(r => (
            <button key={r.id} onClick={() => { setRealm(r.id); setSchoolSel(null); setExamSel(null); setUnivSel(null); }}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${realm === r.id ? `bg-gradient-to-r ${r.grad} text-white shadow-lg` : 'text-gray-400 hover:text-gray-700 hover:bg-white'}`}>
              {r.id === 'school' ? 'School' : r.id === 'competitive' ? 'Exams' : 'Univ.'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-all" />
            {search && <button onClick={() => { setSearch(''); setSearchResults(null); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X size={10} /></button>}
          </div>
        </div>

        {/* Search Results */}
        {searchResults ? (
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 custom-scrollbar">
            {['books', 'subjects', 'chapters'].map(key => (
              searchResults[key]?.length > 0 && (
                <div key={key}>
                  <p className="text-[8px] uppercase font-black text-gray-400 tracking-widest mb-1.5">{key}</p>
                  {searchResults[key].map(item => (
                    <div key={item.id} className="px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <p className="text-gray-700 text-xs truncate">{item.title || item.name}</p>
                      <p className="text-gray-400 text-[9px]">{item.board_code} · Class {item.grade}</p>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        ) : (
          /* Realm Trees */
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!realm && (
              <div className="flex flex-col items-center justify-center h-full px-4 text-center space-y-2 opacity-40">
                <FolderTree size={32} className="text-gray-400" />
                <p className="text-gray-400 text-xs">Select a realm above to browse the library tree</p>
              </div>
            )}

            {/* ── SCHOOL TREE ── */}
            {realm === 'school' && (
              mainLoading ? <TreeLoader /> :
              <div className="py-1">
                {schoolTree.map(board => (
                  <div key={board.id}>
                    <TreeRow icon={School} label={board.name} badge={board.code} badgeColor="blue"
                      isOpen={openBoards[board.id]}
                      isActive={schoolSel?.id === board.id && schoolSel?.type === 'board'}
                      onClick={() => { schoolNav('board', board); setOpenBoards(p => ({ ...p, [board.id]: !p[board.id] })); }}
                      depth={0} count={board.book_count} />
                    {openBoards[board.id] && board.classes?.map(cls => (
                      <div key={cls.id}>
                        <TreeRow icon={Layers} label={cls.grade_label || `Class ${cls.grade}`}
                          isOpen={openClasses[cls.id]}
                          isActive={schoolSel?.id === cls.id && schoolSel?.type === 'class'}
                          onClick={() => { schoolNav('class', cls, { board }); setOpenClasses(p => ({ ...p, [cls.id]: !p[cls.id] })); }}
                          depth={1} count={cls.subject_count} />
                        {openClasses[cls.id] && cls.subjects?.map(subj => (
                          <TreeRow key={subj.id} icon={BookOpen} label={subj.name}
                            isActive={schoolSel?.id === subj.id && schoolSel?.type === 'subject'}
                            onClick={() => schoolNav('subject', subj, { board, cls })}
                            depth={2} count={subj.book_count} />
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
                {schoolTree.length === 0 && <EmptyTree text="No boards yet" />}
              </div>
            )}

            {/* ── COMPETITIVE EXAM TREE ── */}
            {realm === 'competitive' && (
              mainLoading ? <TreeLoader /> :
              <div className="py-1">
                {Object.entries(examTree).map(([type, group]) => {
                  const meta = EXAM_TYPE_META[type] || EXAM_TYPE_META.other;
                  const Icon = meta.icon;
                  return (
                    <div key={type}>
                      <button onClick={() => setOpenExamGroups(p => ({ ...p, [type]: !p[type] }))}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-all">
                        {openExamGroups[type] ? <ChevronDown size={10} className="text-gray-400 shrink-0" /> : <ChevronRight size={10} className="text-gray-400 shrink-0" />}
                        <Icon size={12} className={`text-${meta.color}-400 shrink-0`} />
                        <span className="text-gray-700 text-[11px] font-bold flex-1 truncate">{meta.label}</span>
                        <span className="text-gray-400 text-[9px]">{group.exams.length}</span>
                      </button>
                      {openExamGroups[type] && group.exams.map(exam => (
                        <div key={exam.id}>
                          <TreeRow label={exam.name} badge={exam.code} badgeColor="orange"
                            isOpen={openExams[exam.id]}
                            isActive={examSel?.id === exam.id && !examBooks.length}
                            onClick={() => { examNav(exam); setOpenExams(p => ({ ...p, [exam.id]: !p[exam.id] })); }}
                            depth={1} count={exam.subject_count} />
                        </div>
                      ))}
                    </div>
                  );
                })}
                {Object.keys(examTree).length === 0 && <EmptyTree text="No exams found" />}
              </div>
            )}

            {/* ── UNIVERSITY TREE ── */}
            {realm === 'university' && (
              mainLoading ? <TreeLoader /> :
              <div className="py-1">
                {univTree.map(cat => {
                  const Icon = Object.entries(UNIV_CATEGORY_ICONS).find(([k]) => cat.name?.includes(k))?.[1] || GraduationCap;
                  return (
                    <div key={cat.id}>
                      <button onClick={() => setOpenUnivCats(p => ({ ...p, [cat.id]: !p[cat.id] }))}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-all">
                        {openUnivCats[cat.id] ? <ChevronDown size={10} className="text-gray-400 shrink-0" /> : <ChevronRight size={10} className="text-gray-400 shrink-0" />}
                        <Icon size={12} className="text-emerald-500 shrink-0" />
                        <span className="text-gray-700 text-[11px] font-bold flex-1 truncate">{cat.name}</span>
                        <span className="text-gray-400 text-[9px]">{cat.course_count}</span>
                      </button>
                      {openUnivCats[cat.id] && cat.courses?.map(course => (
                        <TreeRow key={course.id} label={course.short_name || course.name}
                          badge={course.level} badgeColor="emerald"
                          isActive={univSel?.id === course.id}
                          onClick={() => univNav(course)}
                          depth={1} count={course.subject_count} />
                      ))}
                    </div>
                  );
                })}
                {univTree.length === 0 && <EmptyTree text="No university data" />}
              </div>
            )}
          </div>
        )}

        {/* Add Board button (school only) */}
        {realm === 'school' && !searchResults && (
          <div className="p-3 border-t border-gray-200">
            <button onClick={() => setModal({ type: 'board' })}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-all border border-blue-200">
              <Plus size={12} /> Add Board
            </button>
          </div>
        )}
      </div>

      {/* ════ MAIN PANEL ════ */}
      <div className={`flex-1 flex-col overflow-hidden ${!(schoolSel || examSel || univSel) ? 'hidden md:flex' : 'flex'}`}>

        {/* Topbar */}
        <div className="px-4 md:px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile: back to tree */}
            <button
              onClick={() => { setSchoolSel(null); setExamSel(null); setUnivSel(null); }}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all shrink-0"
            >
              <ArrowLeft size={14} />
            </button>
            {realm && (
              <button onClick={() => { setRealm(null); setSchoolSel(null); setExamSel(null); setUnivSel(null); }}
                className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all shrink-0">
                <ArrowLeft size={14} />
              </button>
            )}
            {realmMeta && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${realmMeta.bg} border ${realmMeta.border}`}>
                <realmMeta.icon size={13} className={realmMeta.accent} />
                <span className={`text-xs font-bold ${realmMeta.accent}`}>{realmMeta.label}</span>
              </div>
            )}
            {/* Breadcrumb */}
            <SchoolBreadcrumb realm={realm} schoolSel={schoolSel} examSel={examSel} univSel={univSel}
              onSchoolNav={schoolNav} onExamNav={examNav} onUnivNav={univNav} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {realm === 'school' && schoolSel?.type === 'subject' && (
              <Btn variant="primary" onClick={() => setModal({ type: 'book', subject: schoolSel })}><Upload size={12} /> Add Book</Btn>
            )}
            {realm === 'school' && schoolSel?.type === 'board' && (
              <Btn variant="ghost" onClick={() => setModal({ type: 'class', board: schoolSel })}><Plus size={12} /> Add Class</Btn>
            )}
            {realm === 'school' && schoolSel?.type === 'class' && (
              <Btn variant="ghost" onClick={() => setModal({ type: 'subject', cls: schoolSel })}><Plus size={12} /> Add Subject</Btn>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!realm ? (
            <RealmSelector stats={stats} onSelect={(id) => { setRealm(id); }} />
          ) : mainLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 size={28} className="animate-spin text-violet-500/50" /></div>
          ) : realm === 'school' ? (
            <SchoolContent
              sel={schoolSel} content={schoolContent}
              openBooks={openBooks} bookChapters={bookChapters} bookUploads={bookUploads}
              onNav={schoolNav} onToggleBook={toggleBook}
              onAddChapter={(bid, bookTitle) => setModal({ type: 'bulk_chapters', book_id: bid, bookTitle })}
              onUpdateChapter={(cid, data, bid) => handleUpdateChapter(cid, data, bid)}
              onDeleteChapter={async (cid, bid) => { await adminAPI.deleteLibraryChapter(cid); adminAPI.getLibraryChapters(bid).then(r => setBookChapters(p => ({ ...p, [bid]: r.data || [] }))).catch(() => {}); }}
              onUploadFile={(bid) => setModal({ type: 'upload', book_id: bid, entity_type: 'book' })}
              onDeleteBook={async (bid) => { if (!confirm('Delete?')) return; await adminAPI.deleteLibraryBook(bid); const r = await adminAPI.getLibraryBooks(schoolSel.id); setSchoolContent(r.data || []); }}
              onToggleAI={handleToggleAI} onDeleteUpload={handleDeleteUpload}
            />
          ) : realm === 'competitive' ? (
            <CompetitiveContent
              examSel={examSel} examSubjects={examSubjects} examBooks={examBooks}
              openBooks={openBooks} bookUploads={bookUploads}
              onLoadBooks={loadExamBooks} onToggleBook={toggleCompBook}
              onUploadFile={(bid) => setModal({ type: 'upload', book_id: bid, entity_type: 'competitive_book' })}
              onToggleAI={handleToggleAI} onDeleteUpload={handleDeleteUpload}
            />
          ) : realm === 'university' ? (
            <UniversityContent
              univSel={univSel} univSubjects={univSubjects} univBooks={univBooks}
              openBooks={openBooks} bookUploads={bookUploads}
              onLoadBooks={loadUnivBooks} onToggleBook={toggleUnivBook}
              onUploadFile={(bid) => setModal({ type: 'upload', book_id: bid, entity_type: 'university_book' })}
              onToggleAI={handleToggleAI} onDeleteUpload={handleDeleteUpload}
            />
          ) : null}
        </div>
      </div>

      {/* ════ MODALS ════ */}
      {modal?.type === 'board'   && <AddBoardModal onClose={() => setModal(null)} onSave={async (d) => { await adminAPI.createLibraryBoard(d); toast.success('Board added'); setModal(null); adminAPI.getLibraryTree().then(r => setSchoolTree(r.data || [])); }} />}
      {modal?.type === 'class'   && <AddClassModal onClose={() => setModal(null)} board={modal.board} onSave={async (d) => { await adminAPI.createLibraryClass({ ...d, board_id: modal.board?.id }); toast.success('Class added'); setModal(null); adminAPI.getLibraryTree().then(r => setSchoolTree(r.data || [])); schoolNav('board', modal.board); }} />}
      {modal?.type === 'subject' && <AddSubjectModal onClose={() => setModal(null)} cls={modal.cls} onSave={async (d) => { await adminAPI.createLibrarySubject({ ...d, class_id: modal.cls?.id }); toast.success('Subject added'); setModal(null); adminAPI.getLibraryTree().then(r => setSchoolTree(r.data || [])); schoolNav('class', modal.cls); }} />}
      {modal?.type === 'book'    && <AddBookModal onClose={() => setModal(null)} subject={modal.subject} onSave={async (fd) => { await adminAPI.createLibraryBook(fd); toast.success('Book added'); setModal(null); const r = await adminAPI.getLibraryBooks(modal.subject?.id); setSchoolContent(r.data || []); }} />}
      {modal?.type === 'bulk_chapters' && <BulkChapterModal onClose={() => setModal(null)} bookTitle={modal.bookTitle} onSave={(chapters) => handleBulkAddChapters(chapters, modal.book_id)} />}
      {modal?.type === 'upload'  && <UploadFileModal onClose={() => setModal(null)} onSave={handleUpload} book_id={modal.book_id} entity_type={modal.entity_type} defaultFileType={modal.defaultFileType || 'notes'} />}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.35); }
      `}</style>
    </div>
  );
}

// ── Tree helpers ──────────────────────────────────────────────────────────────

function TreeRow({ icon: Icon, label, badge, badgeColor = 'blue', isOpen, isActive, onClick, depth = 0, count }) {
  const pl = [' px-3', ' pl-7', ' pl-12', ' pl-16'][depth] || ' px-3';
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2${pl} pr-3 py-1.5 text-left transition-all ${isActive ? 'bg-indigo-50 border-r-2 border-indigo-500' : 'hover:bg-gray-100'}`}>
      {isOpen !== undefined ? (isOpen ? <ChevronDown size={10} className="text-gray-400 shrink-0" /> : <ChevronRight size={10} className="text-gray-400 shrink-0" />) : <span className="w-2.5 shrink-0" />}
      {Icon && <Icon size={11} className={`shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />}
      <span className={`text-[11px] font-semibold flex-1 truncate ${isActive ? 'text-indigo-700' : 'text-gray-500'}`}>{label}</span>
      {badge && <Badge color={badgeColor}>{badge}</Badge>}
      {count > 0 && <span className="text-gray-400 text-[9px] shrink-0">{count}</span>}
    </button>
  );
}

function TreeLoader() {
  return <div className="flex justify-center py-10"><Loader2 size={18} className="animate-spin text-indigo-400" /></div>;
}
function EmptyTree({ text }) {
  return <p className="text-gray-400 text-xs text-center py-8">{text}</p>;
}

function SchoolBreadcrumb({ realm, schoolSel, examSel, univSel }) {
  if (!realm) return null;
  const parts = [];
  if (realm === 'school' && schoolSel) {
    if (schoolSel.board) parts.push(schoolSel.board.name);
    else if (schoolSel.type === 'board') parts.push(schoolSel.name);
    if (schoolSel.cls) parts.push(`Class ${schoolSel.cls.grade}`);
    else if (schoolSel.type === 'class') parts.push(`Class ${schoolSel.grade}`);
    if (schoolSel.type === 'subject') parts.push(schoolSel.name);
  }
  if (realm === 'competitive' && examSel) parts.push(examSel.name);
  if (realm === 'university' && univSel) parts.push(univSel.short_name || univSel.name);

  if (!parts.length) return null;
  return (
    <div className="flex items-center gap-1 min-w-0 overflow-hidden">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1 min-w-0">
          <ChevronRight size={10} className="text-gray-300 shrink-0" />
          <span className={`text-xs font-semibold truncate ${i === parts.length - 1 ? 'text-gray-700' : 'text-gray-400'}`}>{p}</span>
        </span>
      ))}
    </div>
  );
}

// ── Realm Selector (landing) ──────────────────────────────────────────────────

function RealmSelector({ stats, onSelect }) {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-gray-900 font-black text-2xl tracking-tight">Academic Knowledge Repository</h1>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
          One organized hub for every book, note, and study material across all boards, exams, and university courses.
          Enable AI Indexing on any file — the AI tutor will cite it when answering student questions.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { l: 'Boards',    v: stats.boards,    c: 'text-blue-400' },
            { l: 'Classes',   v: stats.classes,   c: 'text-indigo-400' },
            { l: 'Subjects',  v: stats.subjects,  c: 'text-violet-400' },
            { l: 'Books',     v: stats.books,     c: 'text-orange-400' },
            { l: 'Chapters',  v: stats.chapters,  c: 'text-cyan-400' },
            { l: 'AI Indexed',v: stats.ai_indexed,c: 'text-pink-400' },
          ].map(s => (
            <div key={s.l} className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
              <p className="text-2xl font-black text-gray-900">{(s.v || 0).toLocaleString()}</p>
              <p className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 ${s.c}`}>{s.l}</p>
            </div>
          ))}
        </div>
      )}

      {/* Realm Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {REALMS.map(r => (
          <button key={r.id} onClick={() => onSelect(r.id)}
            className={`group text-left p-6 rounded-2xl bg-gradient-to-br ${r.grad} shadow-2xl ${r.glow} ring-1 ${r.ring} hover:scale-[1.02] transition-all duration-200 relative overflow-hidden`}>
            {/* Background glow */}
            <div className="absolute inset-0 bg-black/20 rounded-2xl" />
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <r.icon size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-black text-lg leading-tight">{r.label}</h2>
                <p className="text-white/60 text-xs mt-0.5 font-medium">{r.sub}</p>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">{r.desc}</p>
              <div className="flex items-center gap-2 text-white/80 text-xs font-bold mt-2">
                <span>Explore</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-start gap-3">
        <Brain size={16} className="text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-gray-700 text-sm font-bold">How AI Indexing works</p>
          <p className="text-gray-500 text-xs leading-relaxed">
            Upload any PDF or document to a book. Click the <strong className="text-indigo-600">Brain</strong> icon to mark it as AI-indexed.
            The AI tutor will then pull context from that file when students ask related questions — giving accurate, source-cited answers.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── School Content ────────────────────────────────────────────────────────────

function SchoolContent({ sel, content, openBooks, bookChapters, bookUploads, onNav, onToggleBook, onAddChapter, onUpdateChapter, onDeleteChapter, onUploadFile, onDeleteBook, onToggleAI, onDeleteUpload }) {
  if (!sel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-300 space-y-2">
          <School size={48} className="mx-auto opacity-30" />
          <p className="text-sm text-gray-400">Select a board from the left tree</p>
        </div>
      </div>
    );
  }

  if (sel.type === 'board' || sel.type === 'class') {
    const isBoard = sel.type === 'board';
    return (
      <div className="p-6 space-y-4">
        <p className="text-gray-400 text-xs">{content.length} {isBoard ? 'classes' : 'subjects'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {content.map(item => {
            const Icon = isBoard ? Layers : (SUBJECT_ICONS[item.name] || BookOpen);
            return (
              <button key={item.id} onClick={() => onNav(isBoard ? 'class' : 'subject', item, isBoard ? { board: sel } : { board: sel.board, cls: sel })}
                className="p-4 bg-white border border-gray-200 rounded-xl text-left hover:bg-gray-50 hover:border-indigo-200 hover:shadow-md transition-all group shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${isBoard ? 'bg-blue-100' : 'bg-indigo-100'} flex items-center justify-center mb-3`}>
                  {isBoard ? <span className="text-blue-600 font-black text-xl">{item.grade}</span> : <Icon size={18} className="text-indigo-500" />}
                </div>
                <p className="text-gray-800 font-bold text-sm leading-tight">{isBoard ? (item.grade_label || `Class ${item.grade}`) : item.name}</p>
                {item.stream && <p className="text-gray-400 text-xs mt-0.5">{item.stream}</p>}
                {item.subject_type && <p className="text-gray-400 text-xs capitalize">{item.subject_type}</p>}
                <p className="text-gray-400 text-xs mt-2">{item.subject_count || item.book_count || 0} {isBoard ? 'subjects' : 'books'}</p>
              </button>
            );
          })}
          {content.length === 0 && <p className="col-span-full text-gray-400 text-sm text-center py-12">Nothing here yet</p>}
        </div>
      </div>
    );
  }

  // Subject → Books
  return (
    <div className="p-6 space-y-3">
      <p className="text-gray-400 text-xs">{content.length} books</p>
      {content.length === 0 && <EmptyBooks />}
      {content.map(book => (
        <BookCard key={book.id} book={book} isOpen={openBooks[book.id]}
          chapters={bookChapters[book.id]} uploads={bookUploads[book.id]}
          entityType="book"
          onToggle={() => onToggleBook(book.id)} onDelete={() => onDeleteBook(book.id)}
          onAddChapter={() => onAddChapter(book.id, book.title)}
          onUpdateChapter={(cid, data) => onUpdateChapter(cid, data, book.id)}
          onDeleteChapter={(cid) => onDeleteChapter(cid, book.id)}
          onUploadFile={() => onUploadFile(book.id)}
          onToggleAI={(uid) => onToggleAI(uid, book.id)}
          onDeleteUpload={(uid) => onDeleteUpload(uid, book.id)}
        />
      ))}
    </div>
  );
}

// ── Competitive Content ───────────────────────────────────────────────────────

function CompetitiveContent({ examSel, examSubjects, examBooks, openBooks, bookUploads, onLoadBooks, onToggleBook, onUploadFile, onToggleAI, onDeleteUpload }) {
  const [activeSub, setActiveSub] = useState(null);

  if (!examSel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-300 space-y-2">
          <Trophy size={48} className="mx-auto opacity-30" />
          <p className="text-sm text-gray-400">Select an exam from the left tree</p>
        </div>
      </div>
    );
  }

  const grouped = {};
  for (const s of examSubjects) {
    const key = s.parent_subject || 'General';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  }

  return (
    <div className="flex h-full">
      {/* Subject list */}
      <div className="w-56 shrink-0 border-r border-gray-200 overflow-y-auto custom-scrollbar py-3">
        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest px-4 mb-2">Subjects & Papers</p>
        {Object.entries(grouped).map(([group, subjects]) => (
          <div key={group}>
            <p className="text-[9px] font-bold text-gray-400 px-4 py-1 uppercase tracking-wide">{group}</p>
            {subjects.map(s => (
              <button key={s.id} onClick={() => { setActiveSub(s); onLoadBooks(s.id); }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-all text-xs ${activeSub?.id === s.id ? 'bg-orange-50 border-r-2 border-orange-500 text-orange-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                <BookOpen size={10} className="shrink-0 opacity-60" />
                <span className="truncate font-medium">{s.name}</span>
                {s.book_count > 0 && <span className="text-gray-400 text-[9px] ml-auto shrink-0">{s.book_count}</span>}
              </button>
            ))}
          </div>
        ))}
        {examSubjects.length === 0 && <p className="text-gray-400 text-xs text-center py-8">No subjects</p>}
      </div>
      {/* Books */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {!activeSub ? (
          <ExamOverview exam={examSel} subjects={examSubjects} />
        ) : (
          <>
            <p className="text-gray-400 text-xs">{examBooks.length} books · {activeSub.name}</p>
            {examBooks.length === 0 && <EmptyBooks />}
            {examBooks.map(book => (
              <BookCard key={book.id} book={book} isOpen={openBooks[book.id]}
                uploads={bookUploads[book.id]} entityType="competitive_book"
                onToggle={() => onToggleBook(book.id)}
                onUploadFile={() => onUploadFile(book.id)}
                onToggleAI={(uid) => onToggleAI(uid, book.id)}
                onDeleteUpload={(uid) => onDeleteUpload(uid, book.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ExamOverview({ exam, subjects }) {
  const meta = EXAM_TYPE_META[exam.exam_type] || EXAM_TYPE_META.other;
  const Icon = meta.icon;
  return (
    <div className="space-y-4 max-w-lg">
      <div className={`p-5 rounded-2xl bg-gradient-to-br ${meta.grad} shadow-xl`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg">{exam.name}</h2>
            <p className="text-white/60 text-xs mt-0.5">{exam.code} · {exam.conducting_body}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-white/60 text-xs">
          <span className="flex items-center gap-1"><BookOpen size={11} /> {exam.subject_count || 0} subjects</span>
          <span className="flex items-center gap-1"><FileText size={11} /> {exam.book_count || 0} books</span>
        </div>
      </div>
      <p className="text-gray-400 text-xs">Select a subject from the left to see books and upload materials.</p>
    </div>
  );
}

// ── University Content ────────────────────────────────────────────────────────

function UniversityContent({ univSel, univSubjects, univBooks, openBooks, bookUploads, onLoadBooks, onToggleBook, onUploadFile, onToggleAI, onDeleteUpload }) {
  const [activeSub, setActiveSub] = useState(null);

  if (!univSel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-300 space-y-2">
          <Building2 size={48} className="mx-auto opacity-30" />
          <p className="text-sm text-gray-400">Select a course from the left tree</p>
        </div>
      </div>
    );
  }

  const semesters = Object.entries(univSubjects || {});

  return (
    <div className="flex h-full">
      {/* Semester → Subject list */}
      <div className="w-56 shrink-0 border-r border-gray-200 overflow-y-auto custom-scrollbar py-3">
        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest px-4 mb-2">
          {univSel.short_name || univSel.name}
        </p>
        {semesters.map(([sem, subjects]) => (
          <div key={sem}>
            <p className="text-[9px] font-bold text-gray-400 px-4 py-1 uppercase">{sem}</p>
            {subjects.map(s => (
              <button key={s.id} onClick={() => { setActiveSub(s); onLoadBooks(s.id); }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-all text-xs ${activeSub?.id === s.id ? 'bg-emerald-50 border-r-2 border-emerald-500 text-emerald-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                <BookOpen size={10} className="shrink-0 opacity-60" />
                <span className="flex-1 truncate font-medium">{s.name}</span>
                {s.credits && <span className="text-gray-400 text-[9px] shrink-0">{s.credits}cr</span>}
              </button>
            ))}
          </div>
        ))}
        {semesters.length === 0 && <p className="text-gray-400 text-xs text-center py-8">No subjects</p>}
      </div>
      {/* Books */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {!activeSub ? (
          <div className="space-y-3 max-w-md">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-xl">
              <h2 className="text-white font-black text-lg">{univSel.name}</h2>
              <p className="text-white/60 text-sm mt-0.5">{univSel.level} · {univSel.duration_years} years</p>
              <p className="text-white/50 text-xs mt-3">{semesters.length} semesters · {Object.values(univSubjects || {}).flat().length} subjects</p>
            </div>
            <p className="text-gray-400 text-xs">Select a subject from the left to manage books and materials.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-xs">{univBooks.length} books · {activeSub.name} ({activeSub.subject_code})</p>
            {univBooks.length === 0 && <EmptyBooks />}
            {univBooks.map(book => (
              <BookCard key={book.id} book={book} isOpen={openBooks[book.id]}
                uploads={bookUploads[book.id]} entityType="university_book"
                onToggle={() => onToggleBook(book.id)}
                onUploadFile={() => onUploadFile(book.id)}
                onToggleAI={(uid) => onToggleAI(uid, book.id)}
                onDeleteUpload={(uid) => onDeleteUpload(uid, book.id)}
                isPrescribed={book.is_prescribed}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyBooks() {
  return (
    <div className="text-center text-gray-300 py-16 space-y-2">
      <BookOpen size={40} className="mx-auto opacity-30" />
      <p className="text-sm text-gray-400">No books yet</p>
      <p className="text-xs text-gray-400">Upload materials using the button above</p>
    </div>
  );
}

// ── BookCard ──────────────────────────────────────────────────────────────────

function BookCard({ book, isOpen, chapters, uploads, entityType, onToggle, onDelete, onAddChapter, onUpdateChapter, onDeleteChapter, onUploadFile, onToggleAI, onDeleteUpload, isPrescribed }) {
  const aiCount = uploads?.filter(u => u.ai_indexed).length || 0;
  const [editingChId, setEditingChId] = useState(null);
  const [editChVal, setEditChVal] = useState({ chapter_number: '', title: '' });
  const startEditCh = (ch) => { setEditingChId(ch.id); setEditChVal({ chapter_number: ch.chapter_number ?? '', title: ch.title }); };
  const saveEditCh = async () => {
    if (!editChVal.title.trim()) return toast.error('Title required');
    await onUpdateChapter?.(editingChId, { title: editChVal.title.trim(), chapter_number: editChVal.chapter_number !== '' ? parseInt(editChVal.chapter_number) : null });
    setEditingChId(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-200 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onToggle}>
        {book.cover_image_url ? (
          <img src={book.cover_image_url} alt="" className="w-10 h-12 object-cover rounded-lg shrink-0 border border-gray-200" />
        ) : (
          <div className="w-10 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-indigo-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-800 font-bold text-sm">{book.title}</span>
            {(book.is_official || isPrescribed) && <Badge color="emerald">{book.is_official ? 'Official' : 'Prescribed'}</Badge>}
            {book.is_available_free && <Badge color="blue">Free</Badge>}
            {book.priority_rank === 1 && <Badge color="amber">Must Read</Badge>}
            {aiCount > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                <Brain size={9} /> {aiCount} AI
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {book.publisher_name && <span className="text-gray-400 text-xs">{book.publisher_name}</span>}
            {book.author && <span className="text-gray-400 text-xs">· {book.author}</span>}
            {book.edition && <span className="text-gray-400 text-xs">· {book.edition}</span>}
            {book.publication_year && <span className="text-gray-300 text-xs">· {book.publication_year}</span>}
            {chapters !== undefined && <span className="text-gray-400 text-xs">· {chapters?.length || book.chapter_count || 0} chapters</span>}
            {uploads?.length > 0 && <span className="text-violet-500 text-xs">· {uploads.length} file{uploads.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {book.google_books_preview_url && (
            <a href={book.google_books_preview_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
               className="p-1.5 rounded-lg bg-gray-50 text-gray-300 hover:text-gray-600 transition-all"><ExternalLink size={12} /></a>
          )}
          {onDelete && (
            <button onClick={e => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={12} /></button>
          )}
          {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {isOpen && (
        <div className={`border-t border-gray-200 ${chapters !== undefined ? 'grid grid-cols-1 md:grid-cols-2' : ''}`}>
          {/* Chapters (school only) */}
          {chapters !== undefined && (
            <div className="p-4 border-r border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest">Chapters ({chapters?.length || 0})</p>
                {onAddChapter && <button onClick={onAddChapter} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><ListOrdered size={10} /> Bulk Add</button>}
              </div>
              {chapters === undefined ? <Loader2 size={13} className="animate-spin text-gray-400" /> :
               chapters.length === 0 ? <p className="text-gray-300 text-xs italic">No chapters yet</p> : (
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {chapters.map(ch => (
                    <div key={ch.id} className={`flex items-center gap-2 py-1 group rounded transition-colors ${editingChId === ch.id ? 'bg-indigo-50 px-1.5' : ''}`}>
                      {editingChId === ch.id ? (
                        <>
                          <input type="number" value={editChVal.chapter_number} onChange={e => setEditChVal(p => ({ ...p, chapter_number: e.target.value }))}
                            className="w-10 bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[10px] text-gray-700 font-mono focus:outline-none focus:border-indigo-400" placeholder="#" />
                          <input value={editChVal.title} onChange={e => setEditChVal(p => ({ ...p, title: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') saveEditCh(); if (e.key === 'Escape') setEditingChId(null); }}
                            autoFocus className="flex-1 bg-white border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-400" />
                          <button onClick={saveEditCh} className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"><Check size={10} /></button>
                          <button onClick={() => setEditingChId(null)} className="p-1 rounded bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all"><X size={10} /></button>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-400 font-mono text-[10px] w-5 shrink-0 text-right">{ch.chapter_number || '–'}</span>
                          <span className="text-gray-600 text-xs flex-1 leading-tight">{ch.title}</span>
                          {ch.estimated_study_time_mins && <span className="text-gray-300 text-[9px] flex items-center gap-0.5"><Clock size={9} /> {ch.estimated_study_time_mins}m</span>}
                          {onUpdateChapter && <button onClick={() => startEditCh(ch)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-indigo-50 text-indigo-400 transition-all"><Pencil size={9} /></button>}
                          {onDeleteChapter && <button onClick={() => onDeleteChapter(ch.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 transition-all"><Trash2 size={9} /></button>}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Important Notes */}
          <div className="p-4 bg-amber-50/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <BookMarked size={11} className="text-amber-500" />
                <p className="text-[9px] uppercase font-black text-amber-600 tracking-widest">Important Notes ({uploads?.length || 0})</p>
              </div>
              <button onClick={onUploadFile}
                className="flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-100 transition-all">
                <UploadCloud size={10} /> Add Note
              </button>
            </div>
            {uploads === undefined ? (
              <Loader2 size={13} className="animate-spin text-amber-400" />
            ) : uploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-5 gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                  <BookMarked size={14} className="text-amber-400" />
                </div>
                <p className="text-amber-400 text-[10px] font-medium text-center leading-tight">No notes pinned yet.<br />Upload PDFs, summaries or key sheets.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {uploads.map(up => {
                  const typeColor = {
                    notes: 'bg-amber-100 text-amber-700 border-amber-200',
                    pyq: 'bg-orange-100 text-orange-700 border-orange-200',
                    solutions: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    textbook: 'bg-blue-100 text-blue-700 border-blue-200',
                    reference: 'bg-violet-100 text-violet-700 border-violet-200',
                    supplement: 'bg-gray-100 text-gray-600 border-gray-200',
                  }[up.file_type] || 'bg-gray-100 text-gray-600 border-gray-200';
                  return (
                    <div key={up.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-amber-100 shadow-sm group hover:border-amber-200 transition-all">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                        <FileText size={12} className="text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-xs font-medium truncate leading-tight">{up.file_name || 'Note'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {up.file_type && <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${typeColor}`}>{up.file_type}</span>}
                          {up.file_size_bytes && <span className="text-gray-300 text-[9px]">{(up.file_size_bytes/1024/1024).toFixed(1)} MB</span>}
                        </div>
                      </div>
                      <button onClick={() => onToggleAI(up.id)} title={up.ai_indexed ? 'AI active — click to disable' : 'Enable AI indexing'}
                        className={`p-1.5 rounded-lg transition-all shrink-0 ${up.ai_indexed ? 'bg-violet-100 text-violet-600 shadow-sm shadow-violet-100' : 'bg-gray-50 text-gray-300 hover:text-violet-500 hover:bg-violet-50'}`}>
                        <Brain size={11} />
                      </button>
                      <a href={up.file_url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-gray-50 text-gray-300 hover:text-amber-600 hover:bg-amber-50 transition-all shrink-0">
                        <Eye size={11} />
                      </a>
                      <button onClick={() => onDeleteUpload(up.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all shrink-0">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────

function AddBoardModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', code: '', type: 'national', state: '', country: 'India' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const save = async () => {
    if (!form.name || !form.code) return toast.error('Name and code required');
    setSaving(true);
    try { await onSave(form); } catch (e) { toast.error(e.response?.data?.error || 'Failed'); setSaving(false); }
  };
  return (
    <Modal title="Add School Board" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Full Name *"><input value={form.name} onChange={set('name')} placeholder="Central Board of Secondary Education" className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code *"><input value={form.code} onChange={set('code')} placeholder="CBSE" className={inputCls} /></Field>
          <Field label="Type"><select value={form.type} onChange={set('type')} className={selectCls}><option value="national">National</option><option value="state">State</option><option value="international">International</option></select></Field>
        </div>
        {form.type === 'state' && <Field label="State"><input value={form.state} onChange={set('state')} placeholder="Maharashtra" className={inputCls} /></Field>}
        <div className="flex gap-2 pt-1"><Btn variant="ghost" onClick={onClose} className="flex-1">Cancel</Btn><Btn variant="primary" loading={saving} onClick={save} className="flex-1">Add Board</Btn></div>
      </div>
    </Modal>
  );
}

function AddClassModal({ onClose, onSave, board }) {
  const [form, setForm] = useState({ grade: '', grade_label: '', stream: '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title={`Add Class · ${board?.name || ''}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Grade *"><input value={form.grade} onChange={set('grade')} placeholder="11" className={inputCls} /></Field>
          <Field label="Label"><input value={form.grade_label} onChange={set('grade_label')} placeholder="Class 11" className={inputCls} /></Field>
        </div>
        <Field label="Stream"><input value={form.stream} onChange={set('stream')} placeholder="Science / Arts / Commerce" className={inputCls} /></Field>
        <div className="flex gap-2 pt-1"><Btn variant="ghost" onClick={onClose} className="flex-1">Cancel</Btn><Btn variant="primary" loading={saving} onClick={async () => { if (!form.grade) return toast.error('Grade required'); setSaving(true); try { await onSave(form); } catch (e) { toast.error(e.response?.data?.error || 'Failed'); setSaving(false); }}} className="flex-1">Add Class</Btn></div>
      </div>
    </Modal>
  );
}

function AddSubjectModal({ onClose, onSave, cls }) {
  const [form, setForm] = useState({ name: '', code: '', subject_type: 'core', language_medium: 'English' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title={`Add Subject · Class ${cls?.grade || ''}`} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Subject Name *"><input value={form.name} onChange={set('name')} placeholder="Physics" className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code"><input value={form.code} onChange={set('code')} placeholder="PHY" className={inputCls} /></Field>
          <Field label="Type"><select value={form.subject_type} onChange={set('subject_type')} className={selectCls}><option value="core">Core</option><option value="elective">Elective</option><option value="language">Language</option><option value="vocational">Vocational</option></select></Field>
        </div>
        <div className="flex gap-2 pt-1"><Btn variant="ghost" onClick={onClose} className="flex-1">Cancel</Btn><Btn variant="primary" loading={saving} onClick={async () => { if (!form.name) return toast.error('Name required'); setSaving(true); try { await onSave(form); } catch (e) { toast.error(e.response?.data?.error || 'Failed'); setSaving(false); }}} className="flex-1">Add Subject</Btn></div>
      </div>
    </Modal>
  );
}

function AddBookModal({ onClose, onSave, subject }) {
  const [form, setForm] = useState({ title: '', publisher: '', edition: '', publication_year: new Date().getFullYear(), is_official: false, is_available_free: false, ncert_url: '', priority_rank: 99 });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const save = async () => {
    if (!form.title) return toast.error('Title required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('subject_id', subject?.id);
      if (file) fd.append('file', file);
      await onSave(fd);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); setSaving(false); }
  };
  return (
    <Modal title={`Add Book · ${subject?.name || ''}`} onClose={onClose} wide>
      <div className="space-y-3">
        <Field label="Book Title *"><input value={form.title} onChange={set('title')} placeholder="NCERT Physics Part 1" className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Publisher / Author"><input value={form.publisher} onChange={set('publisher')} placeholder="NCERT" className={inputCls} /></Field>
          <Field label="Edition"><input value={form.edition} onChange={set('edition')} placeholder="2024" className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Year"><input type="number" value={form.publication_year} onChange={set('publication_year')} className={inputCls} /></Field>
          <Field label="Priority (1 = top)"><input type="number" value={form.priority_rank} onChange={set('priority_rank')} className={inputCls} /></Field>
        </div>
        <Field label="Official URL (NCERT / Board)"><input value={form.ncert_url} onChange={set('ncert_url')} placeholder="https://ncert.nic.in/…" className={inputCls} /></Field>
        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_official} onChange={set('is_official')} className="accent-indigo-500" /><span className="text-gray-600 text-xs">Official Textbook</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_available_free} onChange={set('is_available_free')} className="accent-indigo-500" /><span className="text-gray-600 text-xs">Available Free</span></label>
        </div>
        <Field label="Upload PDF (optional)">
          <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 cursor-pointer bg-gray-50">
            <UploadCloud size={18} className={file ? 'text-indigo-500' : 'text-gray-400'} />
            <div><p className="text-gray-600 text-xs">{file ? file.name : 'Click to upload PDF'}</p><p className="text-gray-400 text-[9px]">{file ? `${(file.size/1024/1024).toFixed(1)} MB` : 'Max 50 MB'}</p></div>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setFile(e.target.files[0])} />
          </label>
        </Field>
        <div className="flex gap-2 pt-2 border-t border-gray-100"><Btn variant="ghost" onClick={onClose} className="flex-1">Cancel</Btn><Btn variant="primary" loading={saving} onClick={save} className="flex-1"><BookOpen size={13} /> Add Book</Btn></div>
      </div>
    </Modal>
  );
}

function BulkChapterModal({ onClose, onSave, bookTitle }) {
  const uid = () => Math.random().toString(36).slice(2);
  const emptyRow = () => ({ _id: uid(), chapter_number: '', title: '', description: '', estimated_study_time_mins: '', file: null, fileType: 'textbook' });
  const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // e.g. "Uploading 2/5…"

  const setRow = (idx, key, val) => setRows(p => p.map((r, i) => i === idx ? { ...r, [key]: val } : r));
  const addRow = () => setRows(p => [...p, emptyRow()]);
  const removeRow = (idx) => setRows(p => p.filter((_, i) => i !== idx));

  const handlePaste = (e, idx) => {
    const text = e.clipboardData.getData('text');
    const lines = text.trim().split('\n');
    if (lines.length <= 1) return;
    e.preventDefault();
    const newRows = lines.map((line) => {
      const cols = line.split('\t');
      const maybeNum = parseInt(cols[0]);
      if (!isNaN(maybeNum) && cols.length > 1) {
        return { _id: uid(), chapter_number: String(maybeNum), title: (cols[1] || '').trim(), description: (cols[2] || '').trim(), estimated_study_time_mins: (cols[3] || '').trim(), file: null, fileType: 'textbook' };
      }
      return { _id: uid(), chapter_number: '', title: (cols[0] || '').trim(), description: (cols[1] || '').trim(), estimated_study_time_mins: '', file: null, fileType: 'textbook' };
    });
    setRows(p => { const next = [...p]; next.splice(idx, 1, ...newRows); return next; });
  };

  const validRows = rows.filter(r => r.title.trim());

  const save = async () => {
    if (!validRows.length) return toast.error('Add at least one chapter title');
    setSaving(true);
    try {
      const created = await onSave(validRows.map(r => ({
        chapter_number: r.chapter_number !== '' ? parseInt(r.chapter_number) : null,
        title: r.title.trim(),
        description: r.description.trim() || null,
        estimated_study_time_mins: r.estimated_study_time_mins !== '' ? parseInt(r.estimated_study_time_mins) : null,
      })));

      // Upload files for rows that have one
      const rowsWithFiles = validRows.map((r, i) => ({ ...r, chapterId: created?.[i]?.id })).filter(r => r.file && r.chapterId);
      if (rowsWithFiles.length > 0) {
        for (let i = 0; i < rowsWithFiles.length; i++) {
          const r = rowsWithFiles[i];
          setUploadProgress(`Uploading material ${i + 1}/${rowsWithFiles.length}…`);
          const fd = new FormData();
          fd.append('file', r.file);
          fd.append('entity_type', 'chapter');
          fd.append('entity_id', r.chapterId);
          fd.append('file_type', r.fileType);
          await adminAPI.uploadLibraryFile(fd).catch(() => toast.error(`Upload failed for "${r.title}"`));
        }
        toast.success(`${rowsWithFiles.length} file${rowsWithFiles.length !== 1 ? 's' : ''} uploaded`);
      }
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); setSaving(false); setUploadProgress(null); }
  };

  const FILE_TYPES = ['textbook', 'reference', 'notes', 'pyq', 'solutions', 'supplement'];

  return (
    <Modal title={bookTitle ? `Bulk Add Chapters · ${bookTitle}` : 'Bulk Add Chapters'} onClose={onClose} size="xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
          <Copy size={13} className="text-indigo-500 shrink-0" />
          <p className="text-xs text-indigo-700">Paste from Excel/Sheets — columns: <strong>No. · Title · Description · Mins</strong></p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 text-left text-[10px] uppercase font-black text-gray-400 tracking-wider w-16">#</th>
                <th className="px-3 py-3 text-left text-[10px] uppercase font-black text-gray-400 tracking-wider">Title *</th>
                <th className="px-3 py-3 text-left text-[10px] uppercase font-black text-gray-400 tracking-wider">Description</th>
                <th className="px-3 py-3 text-left text-[10px] uppercase font-black text-gray-400 tracking-wider w-20">Mins</th>
                <th className="px-3 py-3 text-left text-[10px] uppercase font-black text-gray-400 tracking-wider w-44">Material</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={row._id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={row.chapter_number}
                      onChange={e => { if (/^\d*$/.test(e.target.value)) setRow(idx, 'chapter_number', e.target.value); }}
                      placeholder={String(idx + 1)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono text-center focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input value={row.title} onChange={e => setRow(idx, 'title', e.target.value)}
                      onPaste={e => handlePaste(e, idx)}
                      placeholder="e.g. Physical World"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </td>
                  <td className="px-3 py-2.5">
                    <input value={row.description} onChange={e => setRow(idx, 'description', e.target.value)}
                      placeholder="Brief description…"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={row.estimated_study_time_mins}
                      onChange={e => { if (/^\d*$/.test(e.target.value)) setRow(idx, 'estimated_study_time_mins', e.target.value); }}
                      placeholder="60"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 placeholder-gray-300 text-center focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    {row.file ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 text-xs font-medium truncate">{row.file.name}</p>
                          <select value={row.fileType} onChange={e => setRow(idx, 'fileType', e.target.value)}
                            className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-500 focus:outline-none focus:border-indigo-400">
                            {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <button onClick={() => setRow(idx, 'file', null)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all shrink-0"><X size={12} /></button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group/up">
                        <UploadCloud size={14} className="text-gray-300 group-hover/up:text-indigo-500 transition-colors shrink-0" />
                        <span className="text-xs text-gray-400 group-hover/up:text-indigo-600 transition-colors">Upload file</span>
                        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setRow(idx, 'file', e.target.files[0] || null)} />
                      </label>
                    )}
                  </td>
                  <td className="px-2 py-2.5">
                    <button onClick={() => removeRow(idx)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all"><X size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addRow} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors px-1">
          <Plus size={14} /> Add Row
        </button>

        {uploadProgress && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-50 border border-violet-100">
            <Loader2 size={14} className="text-violet-500 animate-spin shrink-0" />
            <p className="text-sm text-violet-700">{uploadProgress}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Btn variant="ghost" onClick={onClose} disabled={saving} className="flex-1">Cancel</Btn>
          <Btn variant="primary" loading={saving} onClick={save} className="flex-1">
            <ListOrdered size={14} /> Save {validRows.length > 0 ? `${validRows.length} Chapter${validRows.length !== 1 ? 's' : ''}` : 'Chapters'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function UploadFileModal({ onClose, onSave, book_id, entity_type = 'book', defaultFileType = 'notes' }) {
  const isNotes = defaultFileType === 'notes';
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(defaultFileType);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!file) return toast.error('Select a file');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('entity_type', entity_type);
      fd.append('entity_id', book_id); fd.append('file_type', fileType); fd.append('description', description);
      await onSave(fd);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); setSaving(false); }
  };
  return (
    <Modal title={isNotes ? 'Add Important Note' : 'Upload Material'} onClose={onClose}>
      <div className="space-y-3">
        {isNotes && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <BookMarked size={13} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">Upload notes, key sheets, summaries, or PYQs for this book.</p>
          </div>
        )}
        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${file ? 'border-amber-300 bg-amber-50' : `border-gray-200 hover:border-${isNotes ? 'amber' : 'indigo'}-400 bg-gray-50`}`}>
          <UploadCloud size={22} className={file ? 'text-amber-500' : isNotes ? 'text-amber-300' : 'text-gray-400'} />
          <div className="flex-1 min-w-0">
            <p className="text-gray-700 text-sm truncate">{file ? file.name : 'Click to select file'}</p>
            <p className="text-gray-400 text-xs">{file ? `${(file.size/1024/1024).toFixed(1)} MB` : 'PDF, DOC, DOCX · Max 50 MB'}</p>
          </div>
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setFile(e.target.files[0])} />
        </label>
        <Field label="Type">
          <select value={fileType} onChange={e => setFileType(e.target.value)} className={selectCls}>
            <option value="notes">Notes / Summary</option>
            <option value="pyq">Previous Year Questions</option>
            <option value="solutions">Solutions Manual</option>
            <option value="reference">Reference Book</option>
            <option value="textbook">Textbook</option>
            <option value="supplement">Supplement</option>
          </select>
        </Field>
        <Field label="Label (optional)">
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder={isNotes ? 'e.g. Chapter-wise Short Notes 2024' : 'e.g. NCERT Solutions 2024–25'}
            className={inputCls} />
        </Field>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-50 border border-violet-200">
          <Brain size={13} className="text-violet-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-violet-700 leading-relaxed">Enable <strong>AI Index</strong> after upload so the AI tutor cites this material when answering students.</p>
        </div>
        <div className="flex gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose} className="flex-1">Cancel</Btn>
          <Btn variant="primary" loading={saving} onClick={save} className={`flex-1 ${isNotes ? '!from-amber-500 !to-orange-500 !shadow-amber-200' : ''}`}>
            {isNotes ? <><BookMarked size={13} /> Pin Note</> : <><UploadCloud size={13} /> Upload</>}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
