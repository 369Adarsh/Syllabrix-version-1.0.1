'use client';
import { useState, useEffect, useCallback } from 'react';
import { jeeAPI } from '@/lib/api/jee.api';
import { ALL_CHAPTERS, BOOKS, BOOK_META, SUBJECT_META, getChapterList } from '@/data/jee-neet-chapters';
import {
  BookOpen, Search, Play, X, ChevronRight, ChevronDown,
  Youtube, Loader2, GraduationCap, FlaskConical, Brain,
  Dna, ExternalLink, Clock, BookMarked, Layers, Zap
} from 'lucide-react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const EXAM_CONFIG = {
  jee:  { label: 'JEE',  sublabel: 'Mains & Advanced', color: 'from-blue-600 to-indigo-700',   accent: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-200' },
  neet: { label: 'NEET', sublabel: 'UG Entrance',      color: 'from-emerald-600 to-teal-700',  accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const SUBJECT_ICONS = { physics: Zap, chemistry: FlaskConical, maths: Brain, biology: Dna };

// ─── VIDEO CARD ───────────────────────────────────────────────────────────────

function VideoCard({ video, onPlay, isPlaying }) {
  return (
    <div
      onClick={() => onPlay(video)}
      className={`group flex gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
        isPlaying
          ? 'border-blue-300 bg-blue-50 shadow-sm'
          : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
      }`}
    >
      <div className="relative flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden bg-gray-100">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Youtube size={20} className="text-gray-400" />
          </div>
        )}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
            <Play size={14} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
          {video.title}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 truncate">{video.channel}</p>
      </div>
    </div>
  );
}

// ─── VIDEO PLAYER PANEL ───────────────────────────────────────────────────────

function VideoPanel({ chapter, subject, classLevel, onClose }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (!chapter) return;
    setLoading(true);
    setVideos([]);
    setActiveVideo(null);
    jeeAPI.getVideos({ chapter: chapter.name, subject, class: classLevel })
      .then(r => {
        const list = r.data?.data || [];
        setVideos(list);
        if (list.length > 0) setActiveVideo(list[0]);
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [chapter?.name, subject, classLevel]);

  if (!chapter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-[15px]">{chapter.name}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5 capitalize">{subject} · Class {classLevel}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Video Player */}
          <div className="flex-1 flex flex-col bg-black min-w-0">
            {activeVideo ? (
              <iframe
                key={activeVideo.videoId}
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                className="w-full flex-1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeVideo.title}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                {loading ? (
                  <Loader2 size={32} className="text-white/40 animate-spin" />
                ) : (
                  <div className="text-center">
                    <Youtube size={40} className="text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No videos found for this chapter</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Video List Sidebar */}
          <div className="w-72 flex-shrink-0 border-l border-gray-100 flex flex-col bg-gray-50 hidden sm:flex">
            <div className="px-4 py-3 border-b border-gray-100 bg-white">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {loading ? 'Fetching videos…' : `${videos.length} lecture${videos.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-gray-100" />
                ))
              ) : videos.length > 0 ? (
                videos.map(v => (
                  <VideoCard
                    key={v.videoId}
                    video={v}
                    onPlay={setActiveVideo}
                    isPlaying={activeVideo?.videoId === v.videoId}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <Youtube size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No videos available</p>
                </div>
              )}
            </div>

            {/* Topics quick ref */}
            {chapter.topics?.length > 0 && (
              <div className="border-t border-gray-100 p-4 bg-white">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Key Topics</p>
                <div className="flex flex-wrap gap-1">
                  {chapter.topics.map((t, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                      {t}
                    </span>
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

// ─── CHAPTER LIST ─────────────────────────────────────────────────────────────

function ChapterList({ chapters, onSelect, accentColor }) {
  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-10">
        <BookOpen size={24} className="text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-400">No chapters available</p>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {chapters.map((ch, i) => (
        <button
          key={ch.ch}
          onClick={() => onSelect(ch)}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left group"
        >
          <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
            {ch.ch}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-800 group-hover:text-blue-700 transition-colors leading-snug truncate">
              {ch.name}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{ch.topics?.length || 0} topics</p>
          </div>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Play size={11} className="text-blue-500" />
            <span className="text-[10px] text-blue-500 font-medium">Watch</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function JeeNeetStudioPage() {
  const [exam, setExam] = useState('jee');
  const [subject, setSubject] = useState('physics');
  const [book, setBook] = useState('ncert');
  const [classOrVol, setClassOrVol] = useState(11);
  const [search, setSearch] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);

  const examCfg = EXAM_CONFIG[exam];
  const subjects = Object.keys(BOOKS[exam]);
  const books = BOOKS[exam]?.[subject] || [];
  const isHcVerma = book === 'hcverma';

  // Reset book when switching subject/exam
  useEffect(() => {
    const available = BOOKS[exam]?.[subject] || [];
    if (!available.includes(book)) setBook(available[0] || 'ncert');
    setClassOrVol(isHcVerma ? 1 : 11);
  }, [exam, subject]);

  useEffect(() => {
    setClassOrVol(isHcVerma ? 1 : 11);
  }, [book]);

  const rawChapters = getChapterList(exam, subject, book, classOrVol);
  const chapters = search.trim()
    ? rawChapters.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : rawChapters;

  const SubjectIcon = SUBJECT_ICONS[subject] || BookOpen;
  const subjectMeta = SUBJECT_META[subject];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── TOP HEADER ── */}
      <div className={`bg-gradient-to-r ${examCfg.color} rounded-xl overflow-hidden mb-4`}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-extrabold text-[17px] leading-tight">JEE & NEET Study Studio</h1>
                <p className="text-white/60 text-[11px]">NCERT · HC Verma · RD Sharma · OP Tandon · Trueman's</p>
              </div>
            </div>

            {/* Exam toggle */}
            <div className="flex bg-white/15 rounded-full p-1 gap-1">
              {Object.entries(EXAM_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => { setExam(key); setSubject(Object.keys(BOOKS[key])[0]); }}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                    exam === key ? 'bg-white text-gray-800 shadow-sm' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {subjects.map(sub => {
              const meta = SUBJECT_META[sub];
              const Icon = SUBJECT_ICONS[sub] || BookOpen;
              return (
                <button
                  key={sub}
                  onClick={() => setSubject(sub)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                    subject === sub
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'bg-white/15 text-white/70 hover:bg-white/25 hover:text-white'
                  }`}
                >
                  <span>{meta.icon}</span> {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-4 px-0">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-3">

          {/* Book selector */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Book</p>
            <div className="flex flex-col gap-1.5">
              {books.map(b => {
                const meta = BOOK_META[b];
                return (
                  <button
                    key={b}
                    onClick={() => setBook(b)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-semibold transition-all border ${
                      book === b
                        ? `${meta.color} border-current/20`
                        : 'text-gray-600 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BookMarked size={13} />
                      {meta.label}
                    </span>
                    {book === b && <ChevronRight size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class / Volume selector */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
              {isHcVerma ? 'Volume' : 'Class'}
            </p>
            <div className="flex gap-2">
              {(isHcVerma ? [1, 2] : [11, 12]).map(val => (
                <button
                  key={val}
                  onClick={() => setClassOrVol(val)}
                  className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all border ${
                    classOrVol === val
                      ? `${examCfg.bg} ${examCfg.accent} ${examCfg.border}`
                      : 'text-gray-500 border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {isHcVerma ? `Vol ${val}` : `Class ${val}`}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={13} className="text-gray-400" />
              <p className="text-[11px] font-semibold text-gray-600">
                {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-[10px] text-gray-400">
              {BOOK_META[book]?.label} · {isHcVerma ? `Volume ${classOrVol}` : `Class ${classOrVol}`}
            </p>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0">

          {/* Mobile book + class row */}
          <div className="lg:hidden flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {books.map(b => (
              <button
                key={b}
                onClick={() => setBook(b)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-all border ${
                  book === b ? `${BOOK_META[b].color} border-current/20` : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {BOOK_META[b].short}
              </button>
            ))}
            {(isHcVerma ? [1, 2] : [11, 12]).map(val => (
              <button
                key={val}
                onClick={() => setClassOrVol(val)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-all border ${
                  classOrVol === val
                    ? `${examCfg.bg} ${examCfg.accent} ${examCfg.border}`
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                {isHcVerma ? `Vol ${val}` : `Class ${val}`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search chapters in ${BOOK_META[book]?.label}…`}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Section label */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${subjectMeta.color} flex items-center justify-center`}>
              <SubjectIcon size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-gray-800">
                {BOOK_META[book]?.label} — {subjectMeta.label}
              </h2>
              <p className="text-[10px] text-gray-400">
                {isHcVerma ? `Volume ${classOrVol}` : `Class ${classOrVol}`} · Click any chapter to watch lectures
              </p>
            </div>
          </div>

          {/* Chapter list */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <ChapterList
              chapters={chapters}
              onSelect={setSelectedChapter}
              accentColor={examCfg.accent}
            />
          </div>

          {/* Info card at bottom */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Youtube size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-800">Video lectures from NPTEL, Khan Academy & IIT professors</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Click any chapter to open the video player. Lectures are sourced only from academic, non-commercial channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIDEO PLAYER MODAL ── */}
      {selectedChapter && (
        <VideoPanel
          chapter={selectedChapter}
          subject={subject}
          classLevel={classOrVol}
          onClose={() => setSelectedChapter(null)}
        />
      )}
    </div>
  );
}
