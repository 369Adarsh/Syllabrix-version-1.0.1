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
  FolderTree, Star, Clock, ChevronUp, UploadCloud, Layers3
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

const inputCls = 'w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all';
const selectCls = `${inputCls} appearance-none`;

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative z-10 bg-[#0d0d1a] border border-white/[0.1] rounded-2xl shadow-2xl w-full ${wide ? 'max-w-lg' : 'max-w-md'} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
          <h3 className="text-white font-bold text-sm">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-all"><X size={14} /></button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[9px] uppercase font-black text-white/25 tracking-widest block">{label}</label>}
      {children}
    </div>
  );
}

function Btn({ variant = 'primary', loading, disabled, onClick, children, className = '', size = 'md' }) {
  const sz = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const vars = {
    primary: 'bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-500 hover:to-violet-600 shadow-lg shadow-violet-900/30',
    ghost:   'bg-white/[0.04] text-white/50 hover:bg-white/[0.07] border border-white/[0.08] hover:text-white/70',
    danger:  'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
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
    violet: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    blue:   'bg-blue-500/15 text-blue-300 border-blue-500/25',
    emerald:'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    orange: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
    amber:  'bg-amber-500/15 text-amber-300 border-amber-500/25',
    rose:   'bg-rose-500/15 text-rose-300 border-rose-500/25',
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

  const realmMeta = REALMS.find(r => r.id === realm);

  return (
    <div className="flex flex-col md:flex-row -m-4 md:-m-6 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ════ LEFT TREE PANEL ════ */}
      <div className={`w-full md:w-[275px] shrink-0 bg-[#08080f] border-b md:border-b-0 md:border-r border-white/[0.07] flex-col ${(schoolSel || examSel || univSel) ? 'hidden md:flex' : 'flex'}`}>

        {/* Realm switcher tabs */}
        <div className="p-2.5 border-b border-white/[0.06] flex gap-1.5">
          {REALMS.map(r => (
            <button key={r.id} onClick={() => { setRealm(r.id); setSchoolSel(null); setExamSel(null); setUnivSel(null); }}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${realm === r.id ? `bg-gradient-to-r ${r.grad} text-white shadow-lg` : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'}`}>
              {r.id === 'school' ? 'School' : r.id === 'competitive' ? 'Exams' : 'Univ.'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg text-white/70 placeholder-white/20 focus:outline-none focus:border-violet-500/40 transition-all" />
            {search && <button onClick={() => { setSearch(''); setSearchResults(null); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25"><X size={10} /></button>}
          </div>
        </div>

        {/* Search Results */}
        {searchResults ? (
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 custom-scrollbar">
            {['books', 'subjects', 'chapters'].map(key => (
              searchResults[key]?.length > 0 && (
                <div key={key}>
                  <p className="text-[8px] uppercase font-black text-white/20 tracking-widest mb-1.5">{key}</p>
                  {searchResults[key].map(item => (
                    <div key={item.id} className="px-2 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer">
                      <p className="text-white/65 text-xs truncate">{item.title || item.name}</p>
                      <p className="text-white/25 text-[9px]">{item.board_code} · Class {item.grade}</p>
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
              <div className="flex flex-col items-center justify-center h-full px-4 text-center space-y-2 opacity-30">
                <FolderTree size={32} />
                <p className="text-white/50 text-xs">Select a realm above to browse the library tree</p>
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
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.03] transition-all">
                        {openExamGroups[type] ? <ChevronDown size={10} className="text-white/20 shrink-0" /> : <ChevronRight size={10} className="text-white/20 shrink-0" />}
                        <Icon size={12} className={`text-${meta.color}-400 shrink-0`} />
                        <span className="text-white/60 text-[11px] font-bold flex-1 truncate">{meta.label}</span>
                        <span className="text-white/20 text-[9px]">{group.exams.length}</span>
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
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.03] transition-all">
                        {openUnivCats[cat.id] ? <ChevronDown size={10} className="text-white/20 shrink-0" /> : <ChevronRight size={10} className="text-white/20 shrink-0" />}
                        <Icon size={12} className="text-emerald-400 shrink-0" />
                        <span className="text-white/60 text-[11px] font-bold flex-1 truncate">{cat.name}</span>
                        <span className="text-white/20 text-[9px]">{cat.course_count}</span>
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
          <div className="p-3 border-t border-white/[0.06]">
            <button onClick={() => setModal({ type: 'board' })}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-all border border-blue-500/20">
              <Plus size={12} /> Add Board
            </button>
          </div>
        )}
      </div>

      {/* ════ MAIN PANEL ════ */}
      <div className={`flex-1 flex-col overflow-hidden ${!(schoolSel || examSel || univSel) ? 'hidden md:flex' : 'flex'}`}>

        {/* Topbar */}
        <div className="px-4 md:px-6 py-3 border-b border-white/[0.06] bg-white/[0.01] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile: back to tree */}
            <button
              onClick={() => { setSchoolSel(null); setExamSel(null); setUnivSel(null); }}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.07] text-white/30 hover:text-white/70 transition-all shrink-0"
            >
              <ArrowLeft size={14} />
            </button>
            {realm && (
              <button onClick={() => { setRealm(null); setSchoolSel(null); setExamSel(null); setUnivSel(null); }}
                className="hidden md:flex p-1.5 rounded-lg hover:bg-white/[0.07] text-white/30 hover:text-white/70 transition-all shrink-0">
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
              onAddChapter={(bid) => setModal({ type: 'chapter', book_id: bid })}
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
      {modal?.type === 'chapter' && <AddChapterModal onClose={() => setModal(null)} onSave={(d) => handleAddChapter(d, modal.book_id)} />}
      {modal?.type === 'upload'  && <UploadFileModal onClose={() => setModal(null)} onSave={handleUpload} book_id={modal.book_id} entity_type={modal.entity_type} />}
    </div>
  );
}

// ── Tree helpers ──────────────────────────────────────────────────────────────

function TreeRow({ icon: Icon, label, badge, badgeColor = 'blue', isOpen, isActive, onClick, depth = 0, count }) {
  const pl = [' px-3', ' pl-7', ' pl-12', ' pl-16'][depth] || ' px-3';
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2${pl} pr-3 py-1.5 text-left transition-all ${isActive ? 'bg-violet-500/10 border-r-2 border-violet-500' : 'hover:bg-white/[0.03]'}`}>
      {isOpen !== undefined ? (isOpen ? <ChevronDown size={10} className="text-white/20 shrink-0" /> : <ChevronRight size={10} className="text-white/20 shrink-0" />) : <span className="w-2.5 shrink-0" />}
      {Icon && <Icon size={11} className={`shrink-0 ${isActive ? 'text-violet-400' : 'text-white/25'}`} />}
      <span className={`text-[11px] font-semibold flex-1 truncate ${isActive ? 'text-violet-300' : 'text-white/50'}`}>{label}</span>
      {badge && <Badge color={badgeColor}>{badge}</Badge>}
      {count > 0 && <span className="text-white/15 text-[9px] shrink-0">{count}</span>}
    </button>
  );
}

function TreeLoader() {
  return <div className="flex justify-center py-10"><Loader2 size={18} className="animate-spin text-violet-500/50" /></div>;
}
function EmptyTree({ text }) {
  return <p className="text-white/15 text-xs text-center py-8">{text}</p>;
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
          <ChevronRight size={10} className="text-white/15 shrink-0" />
          <span className={`text-xs font-semibold truncate ${i === parts.length - 1 ? 'text-white/70' : 'text-white/30'}`}>{p}</span>
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
        <h1 className="text-white font-black text-2xl tracking-tight">Academic Knowledge Repository</h1>
        <p className="text-white/35 text-sm mt-2 leading-relaxed">
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
            <div key={s.l} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <p className="text-2xl font-black text-white">{(s.v || 0).toLocaleString()}</p>
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

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex items-start gap-3">
        <Brain size={16} className="text-violet-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-white/60 text-sm font-bold">How AI Indexing works</p>
          <p className="text-white/30 text-xs leading-relaxed">
            Upload any PDF or document to a book. Click the <strong className="text-violet-400">Brain</strong> icon to mark it as AI-indexed.
            The AI tutor will then pull context from that file when students ask related questions — giving accurate, source-cited answers.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── School Content ────────────────────────────────────────────────────────────

function SchoolContent({ sel, content, openBooks, bookChapters, bookUploads, onNav, onToggleBook, onAddChapter, onDeleteChapter, onUploadFile, onDeleteBook, onToggleAI, onDeleteUpload }) {
  if (!sel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white/20 space-y-2">
          <School size={48} className="mx-auto opacity-20" />
          <p className="text-sm">Select a board from the left tree</p>
        </div>
      </div>
    );
  }

  if (sel.type === 'board' || sel.type === 'class') {
    const isBoard = sel.type === 'board';
    return (
      <div className="p-6 space-y-4">
        <p className="text-white/30 text-xs">{content.length} {isBoard ? 'classes' : 'subjects'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {content.map(item => {
            const Icon = isBoard ? Layers : (SUBJECT_ICONS[item.name] || BookOpen);
            return (
              <button key={item.id} onClick={() => onNav(isBoard ? 'class' : 'subject', item, isBoard ? { board: sel } : { board: sel.board, cls: sel })}
                className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl text-left hover:bg-white/[0.06] hover:border-blue-500/25 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
                <div className={`w-10 h-10 rounded-xl ${isBoard ? 'bg-blue-500/15' : 'bg-indigo-500/15'} flex items-center justify-center mb-3`}>
                  {isBoard ? <span className="text-blue-400 font-black text-xl">{item.grade}</span> : <Icon size={18} className="text-indigo-400" />}
                </div>
                <p className="text-white/80 font-bold text-sm leading-tight">{isBoard ? (item.grade_label || `Class ${item.grade}`) : item.name}</p>
                {item.stream && <p className="text-white/25 text-xs mt-0.5">{item.stream}</p>}
                {item.subject_type && <p className="text-white/25 text-xs capitalize">{item.subject_type}</p>}
                <p className="text-white/20 text-xs mt-2">{item.subject_count || item.book_count || 0} {isBoard ? 'subjects' : 'books'}</p>
              </button>
            );
          })}
          {content.length === 0 && <p className="col-span-full text-white/20 text-sm text-center py-12">Nothing here yet</p>}
        </div>
      </div>
    );
  }

  // Subject → Books
  return (
    <div className="p-6 space-y-3">
      <p className="text-white/30 text-xs">{content.length} books</p>
      {content.length === 0 && <EmptyBooks />}
      {content.map(book => (
        <BookCard key={book.id} book={book} isOpen={openBooks[book.id]}
          chapters={bookChapters[book.id]} uploads={bookUploads[book.id]}
          entityType="book"
          onToggle={() => onToggleBook(book.id)} onDelete={() => onDeleteBook(book.id)}
          onAddChapter={() => onAddChapter(book.id)}
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
        <div className="text-center text-white/20 space-y-2">
          <Trophy size={48} className="mx-auto opacity-20" />
          <p className="text-sm">Select an exam from the left tree</p>
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
      <div className="w-56 shrink-0 border-r border-white/[0.06] overflow-y-auto custom-scrollbar py-3">
        <p className="text-[9px] uppercase font-black text-white/20 tracking-widest px-4 mb-2">Subjects & Papers</p>
        {Object.entries(grouped).map(([group, subjects]) => (
          <div key={group}>
            <p className="text-[9px] font-bold text-white/20 px-4 py-1 uppercase tracking-wide">{group}</p>
            {subjects.map(s => (
              <button key={s.id} onClick={() => { setActiveSub(s); onLoadBooks(s.id); }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-all text-xs ${activeSub?.id === s.id ? 'bg-orange-500/10 border-r-2 border-orange-500 text-orange-300' : 'text-white/45 hover:text-white/70 hover:bg-white/[0.03]'}`}>
                <BookOpen size={10} className="shrink-0 opacity-60" />
                <span className="truncate font-medium">{s.name}</span>
                {s.book_count > 0 && <span className="text-white/20 text-[9px] ml-auto shrink-0">{s.book_count}</span>}
              </button>
            ))}
          </div>
        ))}
        {examSubjects.length === 0 && <p className="text-white/20 text-xs text-center py-8">No subjects</p>}
      </div>
      {/* Books */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {!activeSub ? (
          <ExamOverview exam={examSel} subjects={examSubjects} />
        ) : (
          <>
            <p className="text-white/30 text-xs">{examBooks.length} books · {activeSub.name}</p>
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
      <p className="text-white/30 text-xs">Select a subject from the left to see books and upload materials.</p>
    </div>
  );
}

// ── University Content ────────────────────────────────────────────────────────

function UniversityContent({ univSel, univSubjects, univBooks, openBooks, bookUploads, onLoadBooks, onToggleBook, onUploadFile, onToggleAI, onDeleteUpload }) {
  const [activeSub, setActiveSub] = useState(null);

  if (!univSel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white/20 space-y-2">
          <Building2 size={48} className="mx-auto opacity-20" />
          <p className="text-sm">Select a course from the left tree</p>
        </div>
      </div>
    );
  }

  const semesters = Object.entries(univSubjects || {});

  return (
    <div className="flex h-full">
      {/* Semester → Subject list */}
      <div className="w-56 shrink-0 border-r border-white/[0.06] overflow-y-auto custom-scrollbar py-3">
        <p className="text-[9px] uppercase font-black text-white/20 tracking-widest px-4 mb-2">
          {univSel.short_name || univSel.name}
        </p>
        {semesters.map(([sem, subjects]) => (
          <div key={sem}>
            <p className="text-[9px] font-bold text-white/20 px-4 py-1 uppercase">{sem}</p>
            {subjects.map(s => (
              <button key={s.id} onClick={() => { setActiveSub(s); onLoadBooks(s.id); }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-all text-xs ${activeSub?.id === s.id ? 'bg-emerald-500/10 border-r-2 border-emerald-500 text-emerald-300' : 'text-white/45 hover:text-white/70 hover:bg-white/[0.03]'}`}>
                <BookOpen size={10} className="shrink-0 opacity-60" />
                <span className="flex-1 truncate font-medium">{s.name}</span>
                {s.credits && <span className="text-white/20 text-[9px] shrink-0">{s.credits}cr</span>}
              </button>
            ))}
          </div>
        ))}
        {semesters.length === 0 && <p className="text-white/20 text-xs text-center py-8">No subjects</p>}
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
            <p className="text-white/30 text-xs">Select a subject from the left to manage books and materials.</p>
          </div>
        ) : (
          <>
            <p className="text-white/30 text-xs">{univBooks.length} books · {activeSub.name} ({activeSub.subject_code})</p>
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
    <div className="text-center text-white/15 py-16 space-y-2">
      <BookOpen size={40} className="mx-auto opacity-20" />
      <p className="text-sm">No books yet</p>
      <p className="text-xs">Upload materials using the button above</p>
    </div>
  );
}

// ── BookCard ──────────────────────────────────────────────────────────────────

function BookCard({ book, isOpen, chapters, uploads, entityType, onToggle, onDelete, onAddChapter, onDeleteChapter, onUploadFile, onToggleAI, onDeleteUpload, isPrescribed }) {
  const aiCount = uploads?.filter(u => u.ai_indexed).length || 0;

  return (
    <div className="bg-white/[0.025] border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/[0.1] transition-all">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onToggle}>
        {book.cover_image_url ? (
          <img src={book.cover_image_url} alt="" className="w-10 h-12 object-cover rounded-lg shrink-0 border border-white/10" />
        ) : (
          <div className="w-10 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/[0.07] flex items-center justify-center shrink-0">
            <FileText size={16} className="text-violet-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/85 font-bold text-sm">{book.title}</span>
            {(book.is_official || isPrescribed) && <Badge color="emerald">{book.is_official ? 'Official' : 'Prescribed'}</Badge>}
            {book.is_available_free && <Badge color="blue">Free</Badge>}
            {book.priority_rank === 1 && <Badge color="amber">Must Read</Badge>}
            {aiCount > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                <Brain size={9} /> {aiCount} AI
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {book.publisher_name && <span className="text-white/30 text-xs">{book.publisher_name}</span>}
            {book.author && <span className="text-white/25 text-xs">· {book.author}</span>}
            {book.edition && <span className="text-white/20 text-xs">· {book.edition}</span>}
            {book.publication_year && <span className="text-white/15 text-xs">· {book.publication_year}</span>}
            {chapters !== undefined && <span className="text-white/20 text-xs">· {chapters?.length || book.chapter_count || 0} chapters</span>}
            {uploads?.length > 0 && <span className="text-violet-400/60 text-xs">· {uploads.length} file{uploads.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {book.google_books_preview_url && (
            <a href={book.google_books_preview_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
               className="p-1.5 rounded-lg bg-white/[0.04] text-white/25 hover:text-white/60 transition-all"><ExternalLink size={12} /></a>
          )}
          {onDelete && (
            <button onClick={e => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg bg-white/[0.04] text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={12} /></button>
          )}
          {isOpen ? <ChevronUp size={14} className="text-white/25" /> : <ChevronDown size={14} className="text-white/25" />}
        </div>
      </div>

      {isOpen && (
        <div className={`border-t border-white/[0.06] ${chapters !== undefined ? 'grid grid-cols-1 md:grid-cols-2' : ''}`}>
          {/* Chapters (school only) */}
          {chapters !== undefined && (
            <div className="p-4 border-r border-white/[0.05]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">Chapters ({chapters?.length || 0})</p>
                {onAddChapter && <button onClick={onAddChapter} className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"><Plus size={10} /> Add</button>}
              </div>
              {chapters === undefined ? <Loader2 size={13} className="animate-spin text-white/20" /> :
               chapters.length === 0 ? <p className="text-white/15 text-xs italic">No chapters yet</p> : (
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {chapters.map(ch => (
                    <div key={ch.id} className="flex items-center gap-2 py-1 group">
                      <span className="text-white/20 font-mono text-[10px] w-5 shrink-0 text-right">{ch.chapter_number || '–'}</span>
                      <span className="text-white/55 text-xs flex-1 leading-tight">{ch.title}</span>
                      {ch.estimated_study_time_mins && <span className="text-white/15 text-[9px] flex items-center gap-0.5"><Clock size={9} /> {ch.estimated_study_time_mins}m</span>}
                      {onDeleteChapter && <button onClick={() => onDeleteChapter(ch.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-red-400/60 transition-all"><Trash2 size={9} /></button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">Files ({uploads?.length || 0})</p>
              <button onClick={onUploadFile} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><UploadCloud size={10} /> Upload</button>
            </div>
            {uploads === undefined ? <Loader2 size={13} className="animate-spin text-white/20" /> :
             uploads.length === 0 ? <p className="text-white/15 text-xs italic">No files uploaded yet</p> : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {uploads.map(up => (
                  <div key={up.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] group">
                    <FileText size={11} className="text-white/25 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-xs truncate">{up.file_name || 'File'}</p>
                      <p className="text-white/20 text-[9px]">{up.file_size_bytes ? `${(up.file_size_bytes/1024/1024).toFixed(1)} MB` : ''}{up.file_type ? ` · ${up.file_type}` : ''}</p>
                    </div>
                    <button onClick={() => onToggleAI(up.id)} title={up.ai_indexed ? 'AI active — click to disable' : 'Enable AI indexing'}
                      className={`p-1.5 rounded-lg transition-all shrink-0 ${up.ai_indexed ? 'bg-violet-500/20 text-violet-400 shadow-sm shadow-violet-500/20' : 'bg-white/[0.04] text-white/20 hover:text-white/50'}`}>
                      <Brain size={11} />
                    </button>
                    <a href={up.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/[0.04] text-white/25 hover:text-white/60 transition-all shrink-0"><Eye size={11} /></a>
                    <button onClick={() => onDeleteUpload(up.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/50 transition-all shrink-0"><Trash2 size={10} /></button>
                  </div>
                ))}
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
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_official} onChange={set('is_official')} className="accent-violet-500" /><span className="text-white/50 text-xs">Official Textbook</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_available_free} onChange={set('is_available_free')} className="accent-violet-500" /><span className="text-white/50 text-xs">Available Free</span></label>
        </div>
        <Field label="Upload PDF (optional)">
          <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-white/[0.1] hover:border-violet-500/35 cursor-pointer bg-white/[0.02]">
            <UploadCloud size={18} className={file ? 'text-violet-400' : 'text-white/20'} />
            <div><p className="text-white/50 text-xs">{file ? file.name : 'Click to upload PDF'}</p><p className="text-white/20 text-[9px]">{file ? `${(file.size/1024/1024).toFixed(1)} MB` : 'Max 50 MB'}</p></div>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setFile(e.target.files[0])} />
          </label>
        </Field>
        <div className="flex gap-2 pt-2 border-t border-white/[0.06]"><Btn variant="ghost" onClick={onClose} className="flex-1">Cancel</Btn><Btn variant="primary" loading={saving} onClick={save} className="flex-1"><BookOpen size={13} /> Add Book</Btn></div>
      </div>
    </Modal>
  );
}

function AddChapterModal({ onClose, onSave }) {
  const [form, setForm] = useState({ chapter_number: '', title: '', description: '', estimated_study_time_mins: '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Add Chapter" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Field label="No."><input type="number" value={form.chapter_number} onChange={set('chapter_number')} placeholder="1" className={inputCls} /></Field>
          <div className="col-span-2"><Field label="Title *"><input value={form.title} onChange={set('title')} placeholder="Physical World" className={inputCls} /></Field></div>
        </div>
        <Field label="Description"><textarea value={form.description} onChange={set('description')} placeholder="What this chapter covers…" rows={3} className={`${inputCls} resize-none`} /></Field>
        <Field label="Study Time (mins)"><input type="number" value={form.estimated_study_time_mins} onChange={set('estimated_study_time_mins')} placeholder="60" className={inputCls} /></Field>
        <div className="flex gap-2 pt-1"><Btn variant="ghost" onClick={onClose} className="flex-1">Cancel</Btn><Btn variant="primary" loading={saving} onClick={async () => { if (!form.title) return toast.error('Title required'); setSaving(true); try { await onSave(form); } catch (e) { toast.error(e.response?.data?.error || 'Failed'); setSaving(false); }}} className="flex-1">Add Chapter</Btn></div>
      </div>
    </Modal>
  );
}

function UploadFileModal({ onClose, onSave, book_id, entity_type = 'book' }) {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('textbook');
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
    <Modal title="Upload Material" onClose={onClose}>
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-white/[0.1] hover:border-violet-500/35 cursor-pointer bg-white/[0.02]">
          <UploadCloud size={22} className={file ? 'text-violet-400' : 'text-white/20'} />
          <div className="flex-1 min-w-0"><p className="text-white/55 text-sm truncate">{file ? file.name : 'Click to select file'}</p><p className="text-white/20 text-xs">{file ? `${(file.size/1024/1024).toFixed(1)} MB` : 'PDF, DOC, DOCX · Max 50 MB'}</p></div>
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setFile(e.target.files[0])} />
        </label>
        <Field label="Material Type"><select value={fileType} onChange={e => setFileType(e.target.value)} className={selectCls}><option value="textbook">Textbook</option><option value="reference">Reference Book</option><option value="notes">Notes / Summary</option><option value="pyq">Previous Year Questions</option><option value="solutions">Solutions Manual</option><option value="supplement">Supplement</option></select></Field>
        <Field label="Description (optional)"><input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. NCERT Solutions 2024–25" className={inputCls} /></Field>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-500/5 border border-violet-500/15">
          <Brain size={13} className="text-violet-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-violet-300/60 leading-relaxed">After upload, enable <strong className="text-violet-300">AI Index</strong> so the AI tutor cites this material when answering students.</p>
        </div>
        <div className="flex gap-2 pt-1"><Btn variant="ghost" onClick={onClose} className="flex-1">Cancel</Btn><Btn variant="primary" loading={saving} onClick={save} className="flex-1"><UploadCloud size={13} /> Upload</Btn></div>
      </div>
    </Modal>
  );
}
