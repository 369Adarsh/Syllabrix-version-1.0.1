'use client';
import { useState, useEffect } from 'react';
import { useJee } from '../layout';
import { jeeAPI } from '@/lib/api/jee.api';
import { ALL_CHAPTERS, BOOKS, BOOK_META, SUBJECT_META, getChapterList } from '@/data/jee-neet-chapters';
import {
  Search, X, Play, Youtube, Loader2, BookMarked,
  Layers, BookOpen, ChevronRight
} from 'lucide-react';

// ─── SAFE CHANNEL BADGE ───────────────────────────────────────────────────────

function ChannelBadge({ channel }) {
  const lower = channel?.toLowerCase() || '';
  const isNptel = lower.includes('nptel') || lower.includes('iit') || lower.includes('nit ');
  const isKhan  = lower.includes('khan');
  if (isNptel) return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold">NPTEL</span>;
  if (isKhan)  return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 font-bold">Khan</span>;
  return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{channel?.split(' ').slice(0, 2).join(' ')}</span>;
}

// ─── VIDEO PLAYER MODAL ───────────────────────────────────────────────────────

function VideoModal({ chapter, subject, classLevel, onClose }) {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState(null);

  useEffect(() => {
    if (!chapter) return;
    setLoading(true);
    setVideos([]);
    setActive(null);
    jeeAPI.getVideos({ chapter: chapter.name, subject, class: classLevel })
      .then(r => {
        const list = r.data?.data || [];
        setVideos(list);
        if (list.length) setActive(list[0]);
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [chapter?.name, subject, classLevel]);

  if (!chapter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-gray-900 text-[14px]">{chapter.name}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{subject} · Class {classLevel}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={15} className="text-gray-600" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Player */}
          <div className="flex-1 bg-black min-w-0 flex flex-col">
            {active ? (
              <iframe
                key={active.videoId}
                src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1&rel=0`}
                className="w-full flex-1 min-h-[220px]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={active.title}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                {loading
                  ? <Loader2 size={30} className="text-white/30 animate-spin" />
                  : <div className="text-center"><Youtube size={36} className="text-white/20 mx-auto mb-2" /><p className="text-white/30 text-xs">No videos found</p></div>
                }
              </div>
            )}
          </div>

          {/* Sidebar list */}
          <div className="hidden sm:flex w-68 flex-shrink-0 flex-col border-l border-gray-100 bg-gray-50">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-white flex-shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {loading ? 'Loading lectures…' : `${videos.length} lecture${videos.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {loading
                ? Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-gray-100" />)
                : videos.map(v => (
                  <button
                    key={v.videoId}
                    onClick={() => setActive(v)}
                    className={`w-full flex gap-2.5 p-2.5 rounded-xl text-left transition-all border group ${
                      active?.videoId === v.videoId
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-transparent bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-gray-100">
                      {v.thumbnail
                        ? <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Youtube size={16} className="text-gray-400" /></div>
                      }
                      {active?.videoId !== v.videoId && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
                            <Play size={11} className="text-white ml-0.5" fill="white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug">{v.title}</p>
                      <div className="mt-1"><ChannelBadge channel={v.channel} /></div>
                    </div>
                  </button>
                ))
              }
            </div>

            {/* Topics */}
            {chapter.topics?.length > 0 && (
              <div className="border-t border-gray-100 p-3 bg-white flex-shrink-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Key Topics</p>
                <div className="flex flex-wrap gap-1">
                  {chapter.topics.map((t, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function VideosPage() {
  const { examType, selectedClass } = useJee();

  // Determine subjects for current exam
  const examKey = examType === 'neet' ? 'neet' : 'jee';
  const subjects = Object.keys(BOOKS[examKey]);

  const [subject,    setSubject]    = useState(subjects[0]);
  const [book,       setBook]       = useState('ncert');
  const [classOrVol, setClassOrVol] = useState(selectedClass ?? 11);
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState(null);

  // Sync class with layout when it changes
  useEffect(() => { setClassOrVol(book === 'hcverma' ? 1 : (selectedClass ?? 11)); }, [selectedClass, book]);

  // Reset subject when exam changes
  useEffect(() => {
    const subs = Object.keys(BOOKS[examKey]);
    if (!subs.includes(subject)) setSubject(subs[0]);
  }, [examType]);

  // Reset book when subject changes
  useEffect(() => {
    const available = BOOKS[examKey]?.[subject] || [];
    if (!available.includes(book)) setBook(available[0] || 'ncert');
  }, [subject, examType]);

  const isHcVerma   = book === 'hcverma';
  const books       = BOOKS[examKey]?.[subject] || [];
  const rawChapters = getChapterList(examKey, subject, book, classOrVol);
  const chapters    = search.trim()
    ? rawChapters.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : rawChapters;

  const subMeta   = SUBJECT_META[subject];
  const isNeet    = examType === 'neet';
  const accentBg  = isNeet ? 'bg-emerald-600' : 'bg-blue-600';

  return (
    <div>
      {/* Subject tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {subjects.map(sub => {
          const m = SUBJECT_META[sub];
          return (
            <button
              key={sub}
              onClick={() => setSubject(sub)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                subject === sub
                  ? `${accentBg} text-white shadow-sm`
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{m.icon}</span> {m.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        {/* Left sidebar — book + class selector */}
        <div className="hidden lg:flex w-56 flex-shrink-0 flex-col gap-3">
          {/* Book selector */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Book</p>
            <div className="flex flex-col gap-1.5">
              {books.map(b => {
                const m = BOOK_META[b];
                return (
                  <button
                    key={b}
                    onClick={() => setBook(b)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-semibold transition-all border ${
                      book === b ? `${m.color} border-current/20` : 'text-gray-600 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2"><BookMarked size={12} />{m.label}</span>
                    {book === b && <ChevronRight size={11} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class / Volume */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
              {isHcVerma ? 'Volume' : 'Class'}
            </p>
            <div className="flex gap-2">
              {(isHcVerma ? [1, 2] : [11, 12]).map(v => (
                <button
                  key={v}
                  onClick={() => setClassOrVol(v)}
                  className={`flex-1 py-2 rounded-lg text-[12px] font-bold border transition-all ${
                    classOrVol === v
                      ? isNeet ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'text-gray-500 border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {isHcVerma ? `Vol ${v}` : `Class ${v}`}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2">
            <Layers size={13} className="text-gray-400" />
            <p className="text-[11px] text-gray-600 font-medium">
              {chapters.length} chapters · {BOOK_META[book]?.label}
            </p>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Mobile book + class pills */}
          <div className="lg:hidden flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {books.map(b => (
              <button key={b} onClick={() => setBook(b)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 border ${
                  book === b ? `${BOOK_META[b].color} border-current/20` : 'bg-white border-gray-200 text-gray-600'
                }`}
              >{BOOK_META[b].short}</button>
            ))}
            {(isHcVerma ? [1, 2] : [11, 12]).map(v => (
              <button key={v} onClick={() => setClassOrVol(v)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 border ${
                  classOrVol === v
                    ? isNeet ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >{isHcVerma ? `Vol ${v}` : `Class ${v}`}</button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search chapters in ${BOOK_META[book]?.label}…`}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-[13px] bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Section label */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{subMeta?.icon}</span>
            <div>
              <p className="text-[13px] font-bold text-gray-800">
                {BOOK_META[book]?.label} — {subMeta?.label}
              </p>
              <p className="text-[10px] text-gray-400">
                {isHcVerma ? `Volume ${classOrVol}` : `Class ${classOrVol}`} · Click any chapter to watch free lectures
              </p>
            </div>
          </div>

          {/* Chapter list */}
          <div className="bg-white rounded-xl border border-gray-100">
            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No chapters found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {chapters.map(ch => (
                  <button
                    key={ch.ch}
                    onClick={() => setSelected(ch)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-all group text-left"
                  >
                    <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500 flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {ch.ch}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 group-hover:text-blue-700 transition-colors leading-snug">
                        {ch.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {ch.topics?.slice(0, 3).join(' · ')}
                        {ch.topics?.length > 3 ? ` +${ch.topics.length - 3} more` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Youtube size={13} className="text-red-500" />
                      <span className="text-[11px] text-blue-600 font-semibold">Watch</span>
                      <ChevronRight size={12} className="text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info strip */}
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Youtube size={16} className="text-blue-600 flex-shrink-0" />
            <p className="text-[11px] text-gray-600">
              Lectures sourced from <span className="font-bold text-gray-800">NPTEL, Khan Academy & IIT professors</span> only.
              No competitor channels. Results cached 48h.
            </p>
          </div>
        </div>
      </div>

      {/* Video modal */}
      {selected && (
        <VideoModal
          chapter={selected}
          subject={subject}
          classLevel={classOrVol}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
