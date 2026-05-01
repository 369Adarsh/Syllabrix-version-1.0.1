'use client';
import { useState, useEffect } from 'react';
import { useJee } from '../layout';
import { jeeAPI } from '@/lib/api/jee.api';
import { BOOKS, SUBJECT_META, getChapterList } from '@/data/jee-neet-chapters';
import {
  Search, X, Play, Youtube, Loader2,
  ChevronDown, ChevronRight, Tag, Sparkles, BookOpen
} from 'lucide-react';

function ChannelBadge({ channel, preferred }) {
  const lower = channel?.toLowerCase() || '';
  const isNptel = lower.includes('nptel') || lower.includes('iit ') || lower.includes(' iit');
  if (isNptel) return (
    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">NPTEL/IIT</span>
  );
  if (preferred) return (
    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">★ Indian Edu</span>
  );
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
      {channel?.split(' ').slice(0, 2).join(' ')}
    </span>
  );
}

// ─── DESKTOP VIDEO PANEL ─────────────────────────────────────────────────────

function VideoPanel({ topic, chapter, subject, classLevel, isNeet }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!topic) return;
    setLoading(true);
    setVideos([]);
    setActive(null);
    jeeAPI.getVideos({
      topic,
      chapter: chapter?.name,
      chapter_num: chapter?.ch,
      subject,
      class: classLevel,
      source: 'ncert',
    })
      .then(r => {
        const list = r.data?.data || [];
        setVideos(list);
        if (list.length) setActive(list[0]);
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [topic, chapter?.name, subject, classLevel]);

  if (!topic) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 min-h-[440px] gap-4 text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <Youtube size={26} className="text-red-400" />
        </div>
        <div>
          <p className="font-bold text-gray-800 text-sm">Select a topic to watch</p>
          <p className="text-xs text-gray-400 mt-1">
            Videos matched to your NCERT chapter &amp; topic
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {['NPTEL / IIT', 'Namo Kaul', 'Arvind Academy', 'ExamFear', 'Pradeep Kshetrapal'].map(t => (
            <span key={t} className="text-[10px] px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">{t}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
        <Tag size={13} className="text-blue-500 flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-[13px] truncate">{topic}</p>
          <p className="text-[10px] text-gray-400">
            NCERT Ch.{chapter?.ch} — {chapter?.name} · Class {classLevel}
          </p>
        </div>
      </div>

      <div className="w-full aspect-video bg-black flex-shrink-0 flex items-center justify-center">
        {active ? (
          <iframe
            key={active.videoId}
            src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={active.title}
          />
        ) : loading ? (
          <Loader2 size={28} className="text-white/30 animate-spin" />
        ) : (
          <div className="text-center">
            <Youtube size={28} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/30 text-xs">No videos found for this topic</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {loading
          ? Array(3).fill(0).map((_, i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)
          : videos.map(v => (
            <button
              key={v.videoId}
              onClick={() => setActive(v)}
              className={`w-full flex gap-2 p-2 rounded-xl text-left transition-all border ${
                active?.videoId === v.videoId
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {v.thumbnail
                  ? <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Youtube size={12} className="text-gray-300" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug">{v.title}</p>
                <div className="mt-0.5"><ChannelBadge channel={v.channel} preferred={v.preferred} /></div>
              </div>
            </button>
          ))
        }
      </div>
    </div>
  );
}

// ─── MOBILE MODAL ────────────────────────────────────────────────────────────

function VideoModal({ topic, chapter, subject, classLevel, onClose }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!topic) return;
    setLoading(true);
    jeeAPI.getVideos({
      topic,
      chapter: chapter?.name,
      chapter_num: chapter?.ch,
      subject,
      class: classLevel,
      source: 'ncert',
    })
      .then(r => {
        const list = r.data?.data || [];
        setVideos(list);
        if (list.length) setActive(list[0]);
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [topic]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <X size={15} className="text-gray-600" />
        </button>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-[13px] truncate">{topic}</p>
          <p className="text-[10px] text-gray-400">NCERT Ch.{chapter?.ch} — {chapter?.name} · Class {classLevel}</p>
        </div>
      </div>

      <div className="w-full aspect-video bg-black flex-shrink-0 flex items-center justify-center">
        {active ? (
          <iframe
            key={active.videoId}
            src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={active.title}
          />
        ) : loading ? (
          <Loader2 size={28} className="text-white/30 animate-spin" />
        ) : (
          <div className="text-center">
            <Youtube size={28} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/30 text-xs">No videos found</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading
          ? Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)
          : videos.map(v => (
            <button
              key={v.videoId}
              onClick={() => setActive(v)}
              className={`w-full flex gap-2.5 p-2.5 rounded-xl text-left transition-all border ${
                active?.videoId === v.videoId ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {v.thumbnail ? <img src={v.thumbnail} alt="" className="w-full h-full object-cover" /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-800 line-clamp-2 leading-snug">{v.title}</p>
                <div className="mt-1"><ChannelBadge channel={v.channel} preferred={v.preferred} /></div>
              </div>
            </button>
          ))
        }
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function VideosPage() {
  const { examType, selectedClass } = useJee();

  const examKey = examType === 'neet' ? 'neet' : 'jee';
  const subjects = Object.keys(BOOKS[examKey]);

  const [subject, setSubject] = useState(subjects[0]);
  const [classOrVol, setClassOrVol] = useState(selectedClass ?? 11);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [mobileModal, setMobileModal] = useState(null);

  // Library data (from admin library database — the real NCERT books)
  const [libraryChapters, setLibraryChapters] = useState(null); // null = loading, [] = empty/fallback
  const [libraryBook, setLibraryBook] = useState(null);
  const [libraryLoading, setLibraryLoading] = useState(false);

  useEffect(() => { setClassOrVol(selectedClass ?? 11); }, [selectedClass]);

  useEffect(() => {
    const subs = Object.keys(BOOKS[examKey]);
    if (!subs.includes(subject)) setSubject(subs[0]);
    setExpanded(null);
    setSelectedTopic(null);
  }, [examType]);

  // Fetch real NCERT chapters from library whenever subject or class changes
  useEffect(() => {
    setLibraryChapters(null);
    setLibraryBook(null);
    setLibraryLoading(true);
    setExpanded(null);
    setSelectedTopic(null);

    jeeAPI.getLibraryNCERT({ subject, class: classOrVol })
      .then(r => {
        if (r.data?.source === 'library' && r.data.data?.length) {
          setLibraryChapters(r.data.data);
          setLibraryBook(r.data.book || null);
        } else {
          setLibraryChapters([]); // signal: use local fallback
        }
      })
      .catch(() => setLibraryChapters([])) // fallback on error
      .finally(() => setLibraryLoading(false));
  }, [subject, classOrVol]);

  const isNeet = examType === 'neet';
  const accentBg = isNeet ? 'bg-emerald-600' : 'bg-blue-600';

  // Use library data if available, otherwise fall back to local hardcoded data
  const localChapters = getChapterList(examKey, subject, 'ncert', classOrVol);
  const chapters = (libraryChapters && libraryChapters.length > 0) ? libraryChapters : localChapters;
  const usingLibrary = !!(libraryChapters && libraryChapters.length > 0);

  const filtered = search.trim()
    ? chapters.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.topics?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : chapters;

  function handleTopicClick(topic, chapter) {
    const sel = { topic, chapter };
    setSelectedTopic(sel);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileModal(sel);
    }
  }

  return (
    <div>
      {/* Subject tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {subjects.map(sub => {
          const m = SUBJECT_META[sub];
          return (
            <button key={sub}
              onClick={() => { setSubject(sub); setExpanded(null); setSelectedTopic(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                subject === sub ? `${accentBg} text-white shadow-sm` : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{m.icon}</span> {m.label}
            </button>
          );
        })}
      </div>

      {/* Class + search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex bg-white border border-gray-200 rounded-full p-0.5">
          {[11, 12].map(v => (
            <button key={v}
              onClick={() => { setClassOrVol(v); setExpanded(null); setSelectedTopic(null); }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                classOrVol === v
                  ? isNeet ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >{`Class ${v}`}</button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chapters or topics…"
            className="w-full pl-8 pr-8 py-2 rounded-full text-[12px] bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={12} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-4 items-start">
        {/* Left: Chapter accordion */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Book header */}
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
              {libraryLoading ? (
                <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <BookOpen size={11} className={usingLibrary ? 'text-blue-500' : 'text-gray-400'} />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate">
                    {usingLibrary && libraryBook
                      ? libraryBook.title
                      : `NCERT ${SUBJECT_META[subject]?.label} — Class ${classOrVol}`
                    }
                  </p>
                  {usingLibrary && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold whitespace-nowrap">
                      Library
                    </span>
                  )}
                </div>
              )}
              {!libraryLoading && (
                <p className="text-[9px] text-gray-400 mt-0.5">{filtered.length} chapters · click to expand topics</p>
              )}
            </div>

            <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
              {libraryLoading ? (
                <div className="p-4 space-y-2">
                  {Array(5).fill(0).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">No chapters found</div>
              ) : (
                filtered.map(ch => {
                  const isExpanded = expanded === ch.ch;
                  return (
                    <div key={ch.ch}>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : ch.ch)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group text-left"
                      >
                        <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          {ch.ch}
                        </span>
                        <p className="flex-1 text-[12px] font-semibold text-gray-700 group-hover:text-gray-900 leading-snug min-w-0">
                          {ch.name}
                        </p>
                        {isExpanded
                          ? <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
                          : <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
                        }
                      </button>

                      {isExpanded && ch.topics?.length > 0 && (
                        <div className="bg-gray-50/80 border-t border-gray-100 px-3 py-2 space-y-1">
                          {ch.topics.map((topic, ti) => {
                            const isSelected = selectedTopic?.topic === topic && selectedTopic?.chapter?.ch === ch.ch;
                            return (
                              <button
                                key={ti}
                                onClick={() => handleTopicClick(topic, ch)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all border ${
                                  isSelected
                                    ? isNeet
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                      : 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'text-gray-600 hover:bg-white hover:shadow-sm border-transparent'
                                }`}
                              >
                                <Play
                                  size={9}
                                  className="flex-shrink-0"
                                  fill={isSelected ? 'currentColor' : 'none'}
                                  stroke={isSelected ? 'none' : 'currentColor'}
                                />
                                <span className="text-[11px] font-medium">{topic}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <Sparkles size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-600 leading-relaxed">
              Videos from <span className="font-bold text-gray-800">NPTEL, IIT faculty, Namo Kaul, Arvind Academy, ExamFear</span> &amp; verified Indian educators only. No Shorts.
            </p>
          </div>
        </div>

        {/* Right: Video panel (desktop only) */}
        <div className="hidden lg:flex flex-1 min-w-0">
          <VideoPanel
            topic={selectedTopic?.topic}
            chapter={selectedTopic?.chapter}
            subject={subject}
            classLevel={classOrVol}
            isNeet={isNeet}
          />
        </div>
      </div>

      {mobileModal && (
        <VideoModal
          topic={mobileModal.topic}
          chapter={mobileModal.chapter}
          subject={subject}
          classLevel={classOrVol}
          onClose={() => setMobileModal(null)}
        />
      )}
    </div>
  );
}
