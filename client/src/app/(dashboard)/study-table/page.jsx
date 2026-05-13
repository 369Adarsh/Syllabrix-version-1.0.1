'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { libraryAPI } from '@/lib/api/library.api';
import Link from 'next/link';
import {
  BookOpen, Play, Pause, Square, Volume2,
  Loader2, ExternalLink, Clock, AlertCircle,
  RefreshCw, ChevronDown, ChevronUp, Download,
} from 'lucide-react';

// ─── Subject colour map ───────────────────────────────────────────────────────

const SMAP = {
  mathematics:        { c: '#3b82f6', bg: '#eff6ff', abbr: 'MA' },
  maths:              { c: '#3b82f6', bg: '#eff6ff', abbr: 'MA' },
  science:            { c: '#22c55e', bg: '#f0fdf4', abbr: 'SC' },
  physics:            { c: '#8b5cf6', bg: '#f5f3ff', abbr: 'PH' },
  chemistry:          { c: '#f97316', bg: '#fff7ed', abbr: 'CH' },
  biology:            { c: '#10b981', bg: '#ecfdf5', abbr: 'BI' },
  english:            { c: '#f43f5e', bg: '#fff1f2', abbr: 'EN' },
  hindi:              { c: '#f59e0b', bg: '#fffbeb', abbr: 'HI' },
  'social science':   { c: '#06b6d4', bg: '#ecfeff', abbr: 'SS' },
  'social studies':   { c: '#06b6d4', bg: '#ecfeff', abbr: 'SS' },
  history:            { c: '#d97706', bg: '#fffbeb', abbr: 'HS' },
  geography:          { c: '#14b8a6', bg: '#f0fdfa', abbr: 'GE' },
  'computer science': { c: '#6366f1', bg: '#eef2ff', abbr: 'CS' },
  sanskrit:           { c: '#ec4899', bg: '#fdf2f8', abbr: 'SA' },
  urdu:               { c: '#84cc16', bg: '#f7fee7', abbr: 'UR' },
};

function subjStyle(name = '') {
  const key = Object.keys(SMAP).find(k => name.toLowerCase().includes(k));
  return key ? SMAP[key] : { c: '#6b7280', bg: '#f9fafb', abbr: name.slice(0, 2).toUpperCase() };
}

// ─── TTS hook ─────────────────────────────────────────────────────────────────

function useTTS() {
  const [playing, setPlaying] = useState(false);
  const [paused,  setPaused]  = useState(false);
  const [speed,   setSpeed]   = useState(1);
  const [voices,  setVoices]  = useState([]);
  const [vi,      setVi]      = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices().filter(v => /^en|^hi/.test(v.lang));
      if (v.length) setVoices(v);
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate  = speed;
    if (voices[vi]) utt.voice = voices[vi];
    utt.onstart = () => { setPlaying(true);  setPaused(false); };
    utt.onend   = () => { setPlaying(false); setPaused(false); };
    utt.onerror = () => { setPlaying(false); setPaused(false); };
    window.speechSynthesis.speak(utt);
  }, [speed, voices, vi]);

  const pause  = () => { window.speechSynthesis?.pause();  setPlaying(false); setPaused(true);  };
  const resume = () => { window.speechSynthesis?.resume(); setPlaying(true);  setPaused(false); };
  const stop   = useCallback(() => {
    window.speechSynthesis?.cancel(); setPlaying(false); setPaused(false);
  }, []);

  return { playing, paused, speed, setSpeed, voices, vi, setVi, speak, pause, resume, stop };
}

// ─── Build readable TTS script from chapter metadata ─────────────────────────

function buildScript(ch) {
  return [
    `Chapter ${ch.chapter_number || ''}: ${ch.title}.`,
    ch.description || '',
    ch.key_concepts?.length
      ? `Key topics in this chapter: ${ch.key_concepts.join(', ')}.`
      : '',
    ch.learning_outcomes?.length
      ? `After studying this chapter you will be able to: ${ch.learning_outcomes.join('. ')}.`
      : '',
  ].filter(Boolean).join(' ');
}

// ─── TTS Controls Panel ───────────────────────────────────────────────────────

function TTSPanel({ tts, chapter, generating }) {
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const { playing, paused, speed, setSpeed, voices, vi, setVi, speak, pause, resume, stop } = tts;

  return (
    <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-b from-blue-50/70 to-white p-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Volume2 size={13} className="text-blue-500" />
        <span className="text-[11px] font-bold text-gray-700">Text-to-Speech</span>
        {generating && (
          <span className="ml-auto flex items-center gap-1 text-[9px] text-blue-500 font-semibold">
            <Loader2 size={9} className="animate-spin" /> Generating…
          </span>
        )}
      </div>

      {chapter && (
        <div className="bg-white border border-blue-100 rounded-xl px-2.5 py-1.5 mb-2.5">
          <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">Now Reading</p>
          <p className="text-[11px] text-gray-700 font-semibold truncate">
            Ch.{chapter.chapter_number}: {chapter.title}
          </p>
        </div>
      )}

      {/* Play / Pause / Stop */}
      <div className="flex items-center gap-1.5 mb-2.5">
        {paused ? (
          <button onClick={resume} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold">
            <Play size={10} /> Resume
          </button>
        ) : playing ? (
          <button onClick={pause} className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 text-white rounded-lg text-[11px] font-bold">
            <Pause size={10} /> Pause
          </button>
        ) : (
          <button
            onClick={() => chapter && speak(buildScript(chapter))}
            disabled={!chapter || generating}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={10} /> {chapter ? 'Play Chapter' : 'Select chapter'}
          </button>
        )}
        {(playing || paused) && (
          <button onClick={stop} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            <Square size={11} />
          </button>
        )}
      </div>

      {/* Speed */}
      <div className="mb-2.5">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Speed</p>
        <div className="flex gap-1 flex-wrap">
          {SPEEDS.map(s => (
            <button
              key={s} onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors ${
                speed === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >{s}x</button>
          ))}
        </div>
      </div>

      {/* Voice */}
      {voices.length > 0 && (
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Voice</p>
          <select
            value={vi} onChange={e => setVi(+e.target.value)}
            className="w-full text-[10px] bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700"
          >
            {voices.map((v, i) => (
              <option key={i} value={i}>
                {v.name.replace('Google ', '').replace('Microsoft ', '').trim()} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

// ─── Chapter row (shared desktop + mobile) ────────────────────────────────────

function ChapterRow({ ch, active, playing, onPick }) {
  const hasContent = ch.description || ch.key_concepts?.length || ch.learning_outcomes?.length;
  return (
    <button
      onClick={onPick}
      className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left border-b border-gray-50 transition-colors ${
        active ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black mt-0.5 ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
      }`}>
        {ch.chapter_number ?? '—'}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-semibold leading-tight ${active ? 'text-blue-700' : 'text-gray-700'}`}>
          {ch.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {ch.estimated_study_time_mins && (
            <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
              <Clock size={8} /> {ch.estimated_study_time_mins}m
            </span>
          )}
          {!hasContent && (
            <span className="text-[9px] text-blue-400 font-medium flex items-center gap-0.5">
              <RefreshCw size={8} /> AI generates
            </span>
          )}
        </div>
      </div>
      {active && playing && (
        <div className="flex items-end gap-0.5 mt-1.5">
          {[0, 80, 160].map(d => (
            <div
              key={d}
              className="w-0.5 rounded-full bg-blue-500 animate-bounce"
              style={{ height: `${8 + (d / 80) * 4}px`, animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      )}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudyTablePage() {
  const { user } = useAuth();
  const grade = parseInt(user?.profile?.class_name, 10) || null;
  const board = (user?.profile?.board || 'CBSE').toUpperCase();

  const [subjects,   setSubjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selSub,     setSelSub]     = useState(null);
  const [selBook,    setSelBook]    = useState(null);
  const [chapters,   setChapters]   = useState([]);
  const [chLoad,     setChLoad]     = useState(false);
  const [selCh,      setSelCh]      = useState(null);
  const [generating, setGenerating] = useState(false);
  const [chapOpen,   setChapOpen]   = useState(true);
  const tts = useTTS();

  // Load subjects + books
  useEffect(() => {
    if (!grade) { setLoading(false); return; }
    libraryAPI.getStudentTextbooks(board, grade)
      .then(r => {
        const data = r.data?.data || [];
        setSubjects(data);
        if (data.length) {
          setSelSub(data[0]);
          const b = data[0].books?.find(b => b.pdf_url || b.ncert_url) || data[0].books?.[0] || null;
          setSelBook(b);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [grade, board]);

  // Load chapters when book changes
  useEffect(() => {
    if (!selBook) { setChapters([]); return; }
    setChLoad(true); setSelCh(null); tts.stop();
    libraryAPI.getChapters(selBook.id)
      .then(r => setChapters(r.data?.data || []))
      .catch(() => setChapters([]))
      .finally(() => setChLoad(false));
  }, [selBook?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickSubject = (sub) => {
    tts.stop(); setSelCh(null); setSelSub(sub);
    const b = sub.books?.find(b => b.pdf_url || b.ncert_url) || sub.books?.[0] || null;
    setSelBook(b);
  };

  const pickChapter = async (ch) => {
    tts.stop(); setSelCh(ch);
    const hasContent = ch.description || ch.key_concepts?.length || ch.learning_outcomes?.length;
    if (hasContent) {
      tts.speak(buildScript(ch));
      return;
    }
    // No stored content — generate via AI then speak
    setGenerating(true);
    try {
      const r = await libraryAPI.generateChapter({
        board, grade, subject: selSub?.name,
        chapterName: ch.title, chapterNumber: ch.chapter_number, topics: [],
      });
      const d = r.data?.data;
      const script = [
        `Chapter ${ch.chapter_number}: ${ch.title}.`,
        d?.overview || '',
        d?.keyTopics?.length ? `Key topics: ${d.keyTopics.join(', ')}.` : '',
        d?.keyPoints?.length ? d.keyPoints.join('. ') : '',
      ].filter(Boolean).join(' ');
      tts.speak(script || buildScript(ch));
    } catch {
      tts.speak(buildScript(ch));
    } finally {
      setGenerating(false);
    }
  };

  const pdfUrl = selBook?.pdf_url || selBook?.ncert_url || null;
  const viewer = pdfUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
    : null;

  // ── No class set ──
  if (!grade) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <BookOpen size={28} className="text-blue-500" />
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-1.5">Set Your Class First</h2>
        <p className="text-[13px] text-gray-500 mb-4">
          Update your profile with your class and board to access textbooks.
        </p>
        <Link href="/settings/profile" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-[13px] font-semibold">
          Complete Profile
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Tab bar ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 flex items-center justify-between h-11">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold bg-blue-600 text-white">
            <BookOpen size={12} /> Textbook
          </button>
        </div>
        <p className="text-[11px] text-gray-400 font-medium hidden sm:block">{board} · Class {grade}</p>
      </div>

      {/* ── Mobile: horizontal subject pills ── */}
      <div
        className="md:hidden flex-shrink-0 bg-white border-b border-gray-100 px-3 py-2 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {loading ? (
          <Loader2 size={14} className="text-blue-400 animate-spin my-1" />
        ) : subjects.map(sub => {
          const s = subjStyle(sub.name);
          const active = selSub?.id === sub.id;
          return (
            <button
              key={sub.id} onClick={() => pickSubject(sub)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors"
              style={active ? { background: s.c, borderColor: s.c, color: '#fff' } : { background: '#fff', borderColor: '#e5e7eb', color: '#374151' }}
            >
              {sub.name}
            </button>
          );
        })}
      </div>

      {/* ── Main 3-column body ── */}
      <div className="flex-1 flex min-h-0">

        {/* Left: Subject + Book picker (desktop only) */}
        <aside className="hidden md:flex w-[220px] flex-shrink-0 bg-white border-r border-gray-200 flex-col">
          <p className="px-3 pt-2.5 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
            Subjects
          </p>
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {loading ? (
              <div className="flex justify-center pt-8">
                <Loader2 size={18} className="text-blue-400 animate-spin" />
              </div>
            ) : subjects.length === 0 ? (
              <p className="px-3 py-5 text-[11px] text-gray-400 text-center leading-relaxed">
                No textbooks in the library yet for Class {grade}
              </p>
            ) : subjects.map(sub => {
              const s  = subjStyle(sub.name);
              const active = selSub?.id === sub.id;
              return (
                <button
                  key={sub.id} onClick={() => pickSubject(sub)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors border-r-2 ${
                    active ? 'bg-blue-50 border-blue-500' : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black"
                    style={{ background: s.bg, color: s.c }}
                  >
                    {s.abbr}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-semibold truncate ${active ? 'text-blue-700' : 'text-gray-700'}`}>
                      {sub.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {sub.books?.length || 0} book{sub.books?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Book picker */}
          {(selSub?.books?.length || 0) > 0 && (
            <>
              <p className="px-3 pt-2.5 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100">
                Books
              </p>
              <div className="overflow-y-auto max-h-48 flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
                {selSub.books.map(book => {
                  const active = selBook?.id === book.id;
                  return (
                    <button
                      key={book.id}
                      onClick={() => { tts.stop(); setSelBook(book); setSelCh(null); }}
                      className={`w-full flex items-start gap-2 px-3 py-2 text-left transition-colors ${
                        active ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-7 h-9 rounded bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {book.cover_image_url
                          ? <img src={book.cover_image_url} alt="" className="w-full h-full object-cover" />
                          : <BookOpen size={12} className="text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-semibold leading-tight ${active ? 'text-blue-700' : 'text-gray-700'}`}>
                          {book.title}
                        </p>
                        {book.publisher && (
                          <p className="text-[9px] text-gray-400 mt-0.5">{book.publisher}</p>
                        )}
                        {(book.pdf_url || book.ncert_url) && (
                          <p className="text-[9px] font-bold text-green-600 mt-0.5">PDF available</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </aside>

        {/* Center: PDF Viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-100">

          {/* Mobile book tabs (when multiple books) */}
          {(selSub?.books?.length || 0) > 1 && (
            <div
              className="md:hidden flex-shrink-0 bg-white border-b border-gray-100 px-3 py-1.5 flex gap-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {selSub.books.map(book => (
                <button
                  key={book.id}
                  onClick={() => { tts.stop(); setSelBook(book); setSelCh(null); }}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                    selBook?.id === book.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {book.title}
                </button>
              ))}
            </div>
          )}

          {viewer ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* PDF toolbar */}
              <div className="flex-shrink-0 flex items-center gap-2 bg-gray-800 px-3 py-1.5">
                <BookOpen size={11} className="text-gray-400 flex-shrink-0" />
                <span className="text-[11px] text-gray-300 flex-1 min-w-0 truncate">
                  {selBook?.title}{selSub ? ` — ${selSub.name}` : ''}
                </span>
                <a
                  href={pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <ExternalLink size={10} /> Open
                </a>
                <a
                  href={pdfUrl} download
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <Download size={10} /> Save
                </a>
              </div>
              <iframe
                key={viewer}
                src={viewer}
                className="flex-1 border-0 w-full"
                title={selBook?.title || 'Textbook'}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              {loading ? (
                <Loader2 size={24} className="text-blue-400 animate-spin" />
              ) : selBook ? (
                /* Book found but no PDF */
                <div className="text-center max-w-xs">
                  <div className="w-24 h-32 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-4 shadow-sm overflow-hidden">
                    {selBook.cover_image_url
                      ? <img src={selBook.cover_image_url} alt="" className="w-full h-full object-cover" />
                      : <BookOpen size={32} className="text-gray-300" />}
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-800 mb-0.5">{selBook.title}</h3>
                  {selBook.publisher && <p className="text-[12px] text-gray-400 mb-3">{selBook.publisher}</p>}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] text-amber-700 font-semibold">
                    <AlertCircle size={11} /> PDF not uploaded yet
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                    Use the chapter list to listen via Text-to-Speech
                  </p>
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center">
                  <BookOpen size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-[14px] font-semibold text-gray-500">Library is being set up</p>
                  <p className="text-[12px] text-gray-400 mt-1">
                    Your admin is adding books for Class {grade}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <BookOpen size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-[14px] font-semibold text-gray-500">Select a subject to begin</p>
                </div>
              )}
            </div>
          )}

          {/* Mobile: collapsible Chapters + TTS */}
          <div className="md:hidden flex-shrink-0 bg-white border-t border-gray-200 max-h-[45vh] flex flex-col">
            <button
              onClick={() => setChapOpen(p => !p)}
              className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
            >
              <span className="text-[12px] font-bold text-gray-700">
                Chapters {chapters.length ? `(${chapters.length})` : ''}
              </span>
              {chapOpen
                ? <ChevronDown size={14} className="text-gray-400" />
                : <ChevronUp   size={14} className="text-gray-400" />}
            </button>
            {chapOpen && (
              <div className="border-t border-gray-100 flex-1 overflow-y-auto">
                <TTSPanel tts={tts} chapter={selCh} generating={generating} />
                {chLoad ? (
                  <div className="flex justify-center py-4">
                    <Loader2 size={16} className="text-blue-400 animate-spin" />
                  </div>
                ) : chapters.map(ch => (
                  <ChapterRow key={ch.id} ch={ch} active={selCh?.id === ch.id} playing={tts.playing} onPick={() => pickChapter(ch)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Chapter list + TTS (desktop only) */}
        <aside className="hidden md:flex w-[264px] flex-shrink-0 bg-white border-l border-gray-200 flex-col">
          <TTSPanel tts={tts} chapter={selCh} generating={generating} />

          <div className="px-3 pt-2.5 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 flex-shrink-0">
            Chapters {chapters.length ? `(${chapters.length})` : ''}
          </div>
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            {chLoad ? (
              <div className="flex justify-center pt-6">
                <Loader2 size={16} className="text-blue-400 animate-spin" />
              </div>
            ) : chapters.length === 0 ? (
              <p className="px-3 py-5 text-[11px] text-gray-400 text-center leading-relaxed">
                {selBook ? 'No chapters added yet' : 'Select a book to see chapters'}
              </p>
            ) : chapters.map(ch => (
              <ChapterRow
                key={ch.id} ch={ch}
                active={selCh?.id === ch.id}
                playing={tts.playing}
                onPick={() => pickChapter(ch)}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
