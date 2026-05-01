'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useJee } from '../layout';
import { jeeAPI } from '@/lib/api/jee.api';
import { BOOKS, SUBJECT_META } from '@/data/jee-neet-chapters';
import {
  BookOpen, ChevronRight, Clock, Tag, AlertCircle, CheckCircle, Layers
} from 'lucide-react';

export default function TextbookPage() {
  const { examType, selectedClass } = useJee();
  const examKey = examType === 'neet' ? 'neet' : 'jee';
  const subjects = Object.keys(BOOKS[examKey]);

  const [subject, setSubject] = useState(subjects[0]);
  const [classOrVol, setClassOrVol] = useState(selectedClass ?? 11);
  const [chapters, setChapters] = useState([]);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setClassOrVol(selectedClass ?? 11); }, [selectedClass]);
  useEffect(() => {
    const subs = Object.keys(BOOKS[examKey]);
    if (!subs.includes(subject)) setSubject(subs[0]);
  }, [examType]);

  useEffect(() => {
    setLoading(true);
    setError('');
    setChapters([]);
    setBook(null);
    jeeAPI.getLibraryChapters({ subject, class: classOrVol })
      .then(r => {
        if (r.data?.data?.length) {
          setChapters(r.data.data);
          setBook(r.data.book || null);
        } else {
          setError('No NCERT chapters found in the library for this subject. Ask your administrator to upload the book content.');
        }
      })
      .catch(() => setError('Failed to load chapters. Please try again.'))
      .finally(() => setLoading(false));
  }, [subject, classOrVol]);

  const isNeet = examType === 'neet';
  const accentBg  = isNeet ? 'bg-emerald-600' : 'bg-blue-600';
  const accentText= isNeet ? 'text-emerald-600' : 'text-blue-600';
  const accentBg2 = isNeet ? 'bg-emerald-50'  : 'bg-blue-50';

  return (
    <div>
      {/* Subject tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {subjects.map(sub => {
          const m = SUBJECT_META[sub];
          return (
            <button key={sub} onClick={() => setSubject(sub)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                subject === sub ? `${accentBg} text-white shadow-sm` : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{m.icon}</span> {m.label}
            </button>
          );
        })}
      </div>

      {/* Class + book info */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex bg-white border border-gray-200 rounded-full p-0.5">
          {[11, 12].map(v => (
            <button key={v} onClick={() => setClassOrVol(v)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                classOrVol === v ? `${accentBg} text-white` : 'text-gray-500 hover:text-gray-700'
              }`}
            >Class {v}</button>
          ))}
        </div>
        {book && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-100 rounded-full">
            <BookOpen size={12} className={accentText} />
            <span className="text-[11px] font-semibold text-gray-700">{book.title}</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full font-bold">Library</span>
          </div>
        )}
      </div>

      {/* Chapter grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 p-5 bg-amber-50 rounded-xl border border-amber-100">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {chapters.map((ch, idx) => (
            <Link
              key={ch.id}
              href={`/jee-command/textbook/${ch.id}`}
              className="group bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`w-10 h-10 rounded-xl ${accentBg2} flex items-center justify-center text-[13px] font-extrabold ${accentText} flex-shrink-0 group-hover:${accentBg} group-hover:text-white transition-colors`}>
                  {ch.chapter_number || idx + 1}
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors mt-1 flex-shrink-0" />
              </div>

              <p className="text-[13px] font-bold text-gray-800 leading-snug group-hover:text-blue-700 transition-colors flex-1">
                {ch.title}
              </p>

              {ch.description && (
                <p className="mt-1.5 text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{ch.description}</p>
              )}

              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-3 text-[10px] text-gray-400">
                {ch.topic_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Layers size={9} /> {ch.topic_count} sections
                  </span>
                )}
                {ch.estimated_study_time_mins && (
                  <span className="flex items-center gap-1">
                    <Clock size={9} /> ~{ch.estimated_study_time_mins} min
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
