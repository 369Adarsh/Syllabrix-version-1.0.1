'use client';
import { useEffect, useState } from 'react';
import { jeeAPI } from '@/lib/api/jee.api';
import { useJee } from '../layout';
import Link from 'next/link';
import { 
  BookOpen, ChevronRight, CheckCircle2, FlaskConical, 
  Calculator, Atom, Loader2, Sparkles, Book
} from 'lucide-react';

const SUBJECT_CONFIG = {
  physics:     { label: 'Physics',     icon: <Atom size={18} />,     color: 'blue'   },
  chemistry:   { label: 'Chemistry',   icon: <FlaskConical size={18} />, color: 'emerald'},
  mathematics: { label: 'Mathematics', icon: <Calculator size={18} />,   color: 'violet' },
};

const CLASSES = [11, 12];
const BOOK_TYPES = [
  { id: 'textbook', label: 'NCERT Textbook', icon: <Book size={14} /> },
  { id: 'exemplar', label: 'NCERT Exemplar', icon: <Sparkles size={14} /> }
];

export default function NcertPage() {
  const { selectedClass } = useJee();
  const [subject, setSubject] = useState('physics');
  const [bookType, setBookType] = useState('textbook');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  const loadChapters = () => {
    setLoading(true);
    jeeAPI.getNCERTChapters({ subject, class: selectedClass, type: bookType })
      .then(r => setChapters(r.data?.data || []))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChapters();
  }, [subject, selectedClass, bookType]);

  const handleGenerate = async (chNum, chName) => {
    setGenerating(chNum);
    try {
      await jeeAPI.generateNCERTChapter({ subject, class: selectedClass, chapter: chNum, chapter_name: chName, type: bookType });
      loadChapters();
    } catch {}
    finally { setGenerating(null); }
  };

  const subjectConfig = SUBJECT_CONFIG[subject];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900">NCERT Solutions</h1>
        <p className="text-gray-500 text-[13px]">Master the fundamentals with step-by-step solutions for NCERT and Exemplar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-5">
          {/* Subjects */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Select Subject</p>
            <div className="space-y-1">
              {Object.entries(SUBJECT_CONFIG).map(([slug, cfg]) => (
                <button
                  key={slug}
                  onClick={() => setSubject(slug)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    subject === slug 
                      ? `bg-${cfg.color}-600 text-white shadow-md shadow-${cfg.color}-100` 
                      : 'bg-white border border-gray-100 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  <span className={subject === slug ? 'text-white' : `text-${cfg.color}-500`}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Book Type */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Book Type</p>
            <div className="bg-gray-100 p-1 rounded-xl flex flex-col gap-1">
              {BOOK_TYPES.map(bt => (
                <button
                  key={bt.id}
                  onClick={() => setBookType(bt.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                    bookType === bt.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {bt.icon} {bt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-[12px] mb-1">
              <span>💡</span> Pro Tip
            </div>
            <p className="text-[11px] text-blue-600 leading-relaxed">
              NCERT forms the backbone of JEE Main Chemistry. Read every line and solve all Exemplar problems.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 min-h-[400px] overflow-hidden">
            <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${subjectConfig.color}-50 flex items-center justify-center text-${subjectConfig.color}-600`}>
                  {subjectConfig.icon}
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-gray-800 capitalize">{subject} Class {selectedClass}</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{bookType === 'textbook' ? 'NCERT Textbook' : 'NCERT Exemplar'}</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="p-3">
                <div className="space-y-1.5">
                  {chapters.length > 0 ? (
                    chapters.map((ch, idx) => (
                      <Link 
                        key={idx}
                        href={`/jee-command/ncert/${subject}/${selectedClass}/${ch.chapter_number}?type=${bookType}`}
                        className="flex items-center gap-3 p-3.5 hover:bg-gray-50 rounded-xl group transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                          {ch.chapter_number}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[13px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{ch.chapter_name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-gray-400">Step-by-step solutions available</span>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium whitespace-nowrap">
                              <CheckCircle2 size={10} /> Verified
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-20">
                      <BookOpen size={40} className="text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium text-[15px]">Need NCERT Solutions?</p>
                      <p className="text-[12px] text-gray-400 mt-1 mb-6 max-w-xs mx-auto">
                        We can generate detailed solutions for this {subject} chapter instantly using AI.
                      </p>
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => handleGenerate(1, 'General Concepts')}
                          disabled={generating !== null}
                          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                        >
                          {generating === 1 ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                          {generating === 1 ? 'Generating Solutions...' : 'Generate AI Solutions'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
