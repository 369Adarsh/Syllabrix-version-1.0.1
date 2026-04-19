'use client';
import { useState, useEffect, useCallback } from 'react';
import { careerAPI } from '@/lib/api/career.api';
import {
  Target, Plus, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, Play, BookOpen, Calendar,
  ExternalLink, Zap, Award, Globe, FileText,
  Clock, ArrowUpRight, Sparkles, Loader2, Bot,
  TrendingUp, ChevronLeft, X, Code, Terminal, ListChecks,
  Cpu, Lightbulb, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

const STATUS_STYLES = {
  not_started: { bg: 'bg-gray-100',    text: 'text-gray-500',  label: 'Ready' },
  in_progress: { bg: 'bg-blue-600',    text: 'text-white',     label: 'In Progress' },
  paused:      { bg: 'bg-slate-100',   text: 'text-slate-600', label: 'On Hold' },
  completed:   { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Done' },
};

const TABS = [
  { id: 'lesson',    label: 'Lesson' },
  { id: 'practice', label: 'Practice' },
  { id: 'video',    label: 'Video' },
  { id: 'resources',label: 'Resources' },
];

function PathDetail({ path, onBack, onUpdate }) {
  const [completing, setCompleting]         = useState(null);
  const [activeDayIdx, setActiveDayIdx]     = useState(0);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [contentError, setContentError]     = useState(null);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const [activeTab, setActiveTab]           = useState('lesson');
  const [videos, setVideos]                 = useState([]);
  const [videosLoading, setVideosLoading]   = useState(false);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);

  const daily        = path.daily_plan     ? (typeof path.daily_plan     === 'string' ? JSON.parse(path.daily_plan)     : path.daily_plan)     : [];
  const completedDays = path.completed_days ? (typeof path.completed_days === 'string' ? JSON.parse(path.completed_days) : path.completed_days) : [];
  const activeDay    = daily[activeDayIdx] || null;

  const handleComplete = async (day) => {
    setCompleting(day);
    try {
      await careerAPI.completeDay(path.id, day);
      onUpdate();
    } finally {
      setCompleting(null);
    }
  };

  const fetchDayDetail = useCallback(async (dayIdx, force = false) => {
    const rawDaily = path.daily_plan ? (typeof path.daily_plan === 'string' ? JSON.parse(path.daily_plan) : path.daily_plan) : [];
    const dayItem  = rawDaily[dayIdx];
    if (!dayItem || (!force && dayItem.conceptual_theory)) return;

    setGeneratingContent(true);
    setContentError(null);
    try {
      const res = await careerAPI.generateDayContent(path.id, dayItem.day);
      if (res.data?.success) onUpdate();
    } catch {
      setContentError('Could not load the lesson right now. Please try again.');
    } finally {
      setGeneratingContent(false);
    }
  }, [path.id, path.daily_plan, onUpdate]);

  useEffect(() => {
    fetchDayDetail(activeDayIdx);
  }, [activeDayIdx, fetchDayDetail]);

  useEffect(() => {
    if (activeTab !== 'video' || !activeDay) return;
    setVideos([]);
    setActiveVideoIdx(0);
    setVideosLoading(true);
    const query = `${path.skill_name} ${activeDay.title} tutorial`;
    careerAPI.searchYouTube(query)
      .then(res => setVideos(res.data?.data || []))
      .catch(() => setVideos([]))
      .finally(() => setVideosLoading(false));
  }, [activeTab, activeDayIdx]);

  if (!activeDay) return null;

  const isDayCompleted = completedDays.includes(activeDay.day);
  const totalDays      = daily.length;
  const progressPct    = totalDays > 0 ? Math.round((completedDays.length / totalDays) * 100) : 0;

  const SidebarList = ({ onSelect }) => (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      {daily.map((day, idx) => {
        const isComp   = completedDays.includes(day.day);
        const isActive = activeDayIdx === idx;
        return (
          <button
            key={idx}
            onClick={() => { setActiveDayIdx(idx); setActiveTab('lesson'); setActiveExerciseIdx(null); onSelect?.(); }}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
              isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              isComp ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {isComp ? '✓' : idx + 1}
            </span>
            <span className="text-xs font-medium truncate">{day.title}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">

      {/* Header */}
      <header className="h-14 border-b border-gray-100 px-4 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100"
          >
            <ListChecks size={16} />
          </button>
          <div className="ml-1">
            <h1 className="text-sm font-bold text-gray-900 leading-tight">{path.skill_name}</h1>
            <p className="text-[11px] text-gray-400">Day {activeDayIdx + 1} of {totalDays} &middot; {progressPct}% complete</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
          <button
            onClick={() => handleComplete(activeDay.day)}
            disabled={isDayCompleted || completing === activeDay.day}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 ${
              isDayCompleted
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            {completing === activeDay.day ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isDayCompleted ? (
              <><CheckCircle2 size={14} /> Done</>
            ) : (
              'Mark as Done'
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-60 border-r border-gray-100 bg-white shrink-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-600">All Sessions</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{totalDays} sessions &middot; {path.difficulty}</p>
          </div>
          <SidebarList />
        </aside>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <>
            <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setIsSidebarOpen(false)} />
            <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-xl">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">All Sessions</p>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-900">
                  <X size={16} />
                </button>
              </div>
              <SidebarList onSelect={() => setIsSidebarOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">

          {/* Day title + tab bar */}
          <div className="bg-white border-b border-gray-100 px-4 md:px-8 pt-5 pb-0 sticky top-0 z-10">
            <h2 className="text-base md:text-xl font-bold text-gray-900 mb-0.5">{activeDay.title}</h2>
            {path.career_alignment && (
              <p className="text-xs text-gray-400 mb-3">{path.career_alignment}</p>
            )}
            <div className="flex gap-0.5 -mb-px">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-4 md:p-8 max-w-3xl mx-auto">

            {/* ── LESSON ── */}
            {activeTab === 'lesson' && (
              <div className="space-y-5">
                {generatingContent ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
                    <Loader2 size={32} className="animate-spin text-blue-500 mx-auto" />
                    <p className="text-sm font-medium text-gray-700">Loading your lesson...</p>
                    <p className="text-xs text-gray-400">This usually takes about 30 seconds</p>
                  </div>
                ) : !activeDay.conceptual_theory ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                      <BookOpen size={24} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">Ready to learn?</h3>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Click below to load today&apos;s lesson. The AI will prepare your theory, exercises, and tips.
                      </p>
                    </div>
                    {contentError && (
                      <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{contentError}</p>
                    )}
                    <button
                      onClick={() => fetchDayDetail(activeDayIdx, true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Load Today&apos;s Lesson
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-extrabold text-gray-900 mt-2 mb-4 pb-2 border-b border-gray-100 leading-tight">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-bold text-gray-800 mt-7 mb-3 leading-tight">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-bold text-gray-800 mt-5 mb-2">{children}</h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-sm font-bold text-gray-700 mt-4 mb-1.5 uppercase tracking-wide">{children}</h4>
                          ),
                          p: ({ children }) => (
                            <p className="text-[15px] text-gray-700 leading-[1.85] mb-4">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-gray-900">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-gray-600">{children}</em>
                          ),
                          ul: ({ children }) => (
                            <ul className="my-3 space-y-2 pl-1">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="my-3 space-y-2 list-decimal pl-5 marker:text-blue-600 marker:font-bold">{children}</ol>
                          ),
                          li: ({ children, ordered }) => (
                            ordered ? (
                              <li className="text-[14px] text-gray-700 leading-relaxed pl-1">{children}</li>
                            ) : (
                              <li className="flex items-start gap-2.5 text-[14px] text-gray-700 leading-relaxed">
                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span className="flex-1">{children}</span>
                              </li>
                            )
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="my-4 pl-4 border-l-4 border-blue-400 bg-blue-50 rounded-r-xl py-3 pr-4 text-sm text-blue-800 italic">{children}</blockquote>
                          ),
                          pre: ({ children }) => (
                            <pre className="my-4 bg-gray-900 rounded-xl p-4 overflow-x-auto">{children}</pre>
                          ),
                          code: ({ children, className }) =>
                            className ? (
                              <code className="text-[13px] text-emerald-300 font-mono leading-relaxed whitespace-pre-wrap">{children}</code>
                            ) : (
                              <code className="px-1.5 py-0.5 bg-gray-100 text-blue-700 rounded text-[13px] font-mono">{children}</code>
                            ),
                          hr: () => <hr className="my-6 border-gray-100" />,
                          table: ({ children }) => (
                            <div className="my-4 overflow-x-auto rounded-xl border border-gray-100">
                              <table className="w-full text-sm">{children}</table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="px-4 py-2.5 bg-gray-50 text-left text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-100">{children}</th>
                          ),
                          td: ({ children }) => (
                            <td className="px-4 py-2.5 text-sm text-gray-700 border-b border-gray-50">{children}</td>
                          ),
                        }}
                      >
                        {activeDay.conceptual_theory}
                      </ReactMarkdown>
                    </div>

                    {activeDay.ai_assistant?.tip && (
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3">
                        <Lightbulb size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">AI Tip</p>
                          <p className="text-sm text-blue-700 leading-relaxed">{activeDay.ai_assistant.tip}</p>
                        </div>
                      </div>
                    )}

                    {activeDay.challenge_lab?.title && (
                      <div className="bg-gray-900 rounded-2xl p-5 text-white">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Today&apos;s Challenge</p>
                        <p className="text-sm font-semibold">{activeDay.challenge_lab.title}</p>
                        {activeDay.challenge_lab.problem_statement && (
                          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                            {activeDay.challenge_lab.problem_statement.slice(0, 200)}...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── PRACTICE ── */}
            {activeTab === 'practice' && (
              <div className="space-y-4">
                {generatingContent ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
                    <Loader2 size={32} className="animate-spin text-blue-500 mx-auto" />
                    <p className="text-sm text-gray-500">Loading practice questions...</p>
                  </div>
                ) : (activeDay.exercise_bank || []).length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-4">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
                      <Target size={24} className="text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">No exercises yet</h3>
                      <p className="text-sm text-gray-500">Load the lesson first to unlock practice questions.</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab('lesson'); fetchDayDetail(activeDayIdx, true); }}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Load Lesson &amp; Exercises
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400">{activeDay.exercise_bank.length} practice questions</p>
                    {activeDay.exercise_bank.map((ex, idx) => (
                      <div
                        key={idx}
                        className={`bg-white rounded-2xl border transition-all ${activeExerciseIdx === idx ? 'border-blue-200 shadow-sm' : 'border-gray-100'}`}
                      >
                        <button
                          className="w-full text-left p-4 flex items-center gap-3"
                          onClick={() => setActiveExerciseIdx(activeExerciseIdx === idx ? null : idx)}
                        >
                          <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-800 flex-1 text-left">{ex.title}</span>
                          <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{ex.difficulty}</span>
                          {activeExerciseIdx === idx
                            ? <ChevronUp size={14} className="text-gray-400 shrink-0" />
                            : <ChevronDown size={14} className="text-gray-400 shrink-0" />
                          }
                        </button>
                        {activeExerciseIdx === idx && (
                          <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
                            <p className="text-sm text-gray-600 leading-relaxed">{ex.description}</p>
                            {ex.blueprint && (
                              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                <code className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">{ex.blueprint}</code>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── VIDEO ── */}
            {activeTab === 'video' && (
              <div className="space-y-4">
                {videosLoading ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
                    <Loader2 size={32} className="animate-spin text-red-500 mx-auto" />
                    <p className="text-sm text-gray-500">Finding the best videos for this topic...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <Play size={28} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No videos found for this topic.</p>
                  </div>
                ) : (
                  <>
                    {/* Main player */}
                    <div className="aspect-video w-full bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
                      <iframe
                        key={videos[activeVideoIdx]?.videoId}
                        width="100%"
                        height="100%"
                        src={videos[activeVideoIdx]?.embedUrl}
                        title={videos[activeVideoIdx]?.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>

                    {/* Now playing info */}
                    <div className="px-1">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{videos[activeVideoIdx]?.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{videos[activeVideoIdx]?.channel}</p>
                    </div>

                    {/* Video selector thumbnails */}
                    {videos.length > 1 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">More videos on this topic</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {videos.map((v, i) => (
                            <button
                              key={v.videoId}
                              onClick={() => setActiveVideoIdx(i)}
                              className={`rounded-xl overflow-hidden border-2 transition-all text-left ${
                                activeVideoIdx === i ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-gray-200'
                              }`}
                            >
                              <img src={v.thumbnail} alt={v.title} className="w-full aspect-video object-cover" />
                              <div className="p-2">
                                <p className="text-[11px] text-gray-700 font-medium leading-tight line-clamp-2">{v.title}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{v.channel}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── RESOURCES ── */}
            {activeTab === 'resources' && (
              <div className="space-y-3">
                {(activeDay.study_materials || []).length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <BookOpen size={28} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No resources yet. Load the lesson to get reading materials.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-400">{activeDay.study_materials.length} resources for this session</p>
                    {activeDay.study_materials.map((m, i) => (
                      <a
                        key={i}
                        href={m.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                          <FileText size={14} className="text-gray-400 group-hover:text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-700 font-medium flex-1 group-hover:text-blue-700 truncate">{m.title}</p>
                        <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 shrink-0" />
                      </a>
                    ))}
                  </>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default function LearningPage() {
  const [paths, setPaths]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [generating, setGenerating]     = useState(false);
  const [error, setError]               = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [showForm, setShowForm]         = useState(false);
  const [skillProfile, setSkillProfile] = useState(null);

  const [skillName, setSkillName]       = useState('');
  const [totalDays, setTotalDays]       = useState(10);
  const [learningMode, setLearningMode] = useState('polish');
  const [focus, setFocus]               = useState('project');

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [pathsRes, profileRes] = await Promise.all([
        careerAPI.listLearningPaths(),
        careerAPI.getSkillProfile()
      ]);
      setPaths(pathsRes.data?.data || []);
      setSkillProfile(profileRes.data?.data || null);
    } catch {
      setPaths([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const refreshSelected = useCallback(async () => {
    if (!selectedPath) return;
    try {
      const res = await careerAPI.getLearningPath(selectedPath.id);
      setSelectedPath(res.data?.data || null);
      const pathsRes = await careerAPI.listLearningPaths();
      setPaths(pathsRes.data?.data || []);
    } catch { /* ignore */ }
  }, [selectedPath]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!skillName.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await careerAPI.generateLearningPath({
        skill_name: skillName,
        total_days: totalDays,
        mode: learningMode,
        focus,
      });
      const newPath = res.data?.data;
      await loadInitialData();
      if (newPath?.id) {
        const fullRes = await careerAPI.getLearningPath(newPath.id);
        setSelectedPath(fullRes.data?.data || newPath);
      }
      setShowForm(false);
      setSkillName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all learning paths? This cannot be undone.')) return;
    try {
      await careerAPI.clearLearningPaths();
      loadInitialData();
    } catch {
      alert('Failed to delete learning paths.');
    }
  };

  if (selectedPath) {
    return (
      <PathDetail
        path={selectedPath}
        onBack={() => setSelectedPath(null)}
        onUpdate={refreshSelected}
      />
    );
  }

  // ── Live stats ──────────────────────────────────────────────────────
  const parseDays = (raw) => Array.isArray(raw) ? raw : (raw ? JSON.parse(raw) : []);
  const totalCompletedSessions = paths.reduce((a, p) => a + parseDays(p.completed_days).length, 0);
  const totalSessions          = paths.reduce((a, p) => a + (p.total_days || 0), 0);
  const completedPathsCount    = paths.filter(p => p.status === 'completed').length;
  const avgProgress            = paths.length > 0
    ? Math.round(paths.reduce((a, p) => {
        const cd = parseDays(p.completed_days);
        return a + (p.total_days > 0 ? (cd.length / p.total_days) * 100 : 0);
      }, 0) / paths.length)
    : 0;

  // ── Personalised skill chips ────────────────────────────────────────
  const POPULAR_SKILLS = [
    { name: 'Python',             mode: 'polish' },
    { name: 'SAP BTP',            mode: 'polish' },
    { name: 'Generative AI',      mode: 'polish' },
    { name: 'Cloud Architecture', mode: 'polish' },
    { name: 'Data Science',       mode: 'polish' },
    { name: 'React',              mode: 'polish' },
    { name: 'SAP ABAP',           mode: 'polish' },
    { name: 'DevOps',             mode: 'polish' },
    { name: 'Power BI',           mode: 'polish' },
    { name: 'Prompt Engineering', mode: 'polish' },
    { name: 'Node.js',            mode: 'polish' },
    { name: 'Machine Learning',   mode: 'polish' },
    { name: 'TypeScript',         mode: 'polish' },
    { name: 'Kubernetes',         mode: 'polish' },
  ];
  const gapChips     = (skillProfile?.skillGaps      || []).slice(0, 5).map(g => ({ name: g.name, type: 'gap',     mode: 'bridge' }));
  const primaryChips = (skillProfile?.skillsDetected || []).filter(s => s.type === 'primary').slice(0, 4).map(s => ({ name: s.name, type: 'primary', mode: 'polish' }));
  const usedNames    = new Set([...gapChips, ...primaryChips].map(s => s.name.toLowerCase()));
  const fillChips    = POPULAR_SKILLS.filter(s => !usedNames.has(s.name.toLowerCase())).slice(0, Math.max(0, 14 - gapChips.length - primaryChips.length));
  const skillChips   = [...gapChips, ...primaryChips, ...fillChips].slice(0, 14);

  const FOCUS_OPTIONS = [
    { value: 'project',  label: 'Build Projects' },
    { value: 'academic', label: 'Study & Exams' },
    { value: 'speed',    label: 'Quick Overview' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-3 sm:px-4 md:px-0 pb-20">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Learning Paths</h1>
          <p className="text-sm text-gray-500">Pick a skill, get a step-by-step plan, and start learning today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowForm(o => !o)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'New Path'}
          </button>
          {paths.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* ── Create path form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">Create a Learning Path</h3>
            <p className="text-sm text-gray-500 mb-6">Tell us what you want to learn and we&apos;ll build a day-by-day plan for you.</p>

            <form onSubmit={handleGenerate} className="space-y-6">

              {/* Skill selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">What do you want to learn?</label>

                {skillProfile && (
                  <div className="space-y-4 mb-4">
                    {skillProfile.skillsDetected?.filter(s => s.type === 'primary').length > 0 && (
                      <div>
                        <p className="text-xs text-blue-600 font-semibold mb-2">Your skills — improve these</p>
                        <div className="flex flex-wrap gap-2">
                          {skillProfile.skillsDetected.filter(s => s.type === 'primary').slice(0, 8).map(s => (
                            <button
                              key={s.name}
                              type="button"
                              onClick={() => { setSkillName(s.name); setLearningMode('polish'); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                skillName === s.name ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-white'
                              }`}
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {skillProfile.skillGaps?.length > 0 && (
                      <div>
                        <p className="text-xs text-emerald-600 font-semibold mb-2">Gaps in your resume — learn these</p>
                        <div className="flex flex-wrap gap-2">
                          {skillProfile.skillGaps.slice(0, 6).map(g => (
                            <button
                              key={g.name}
                              type="button"
                              onClick={() => { setSkillName(g.name); setLearningMode('bridge'); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                skillName === g.name ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-white'
                              }`}
                            >
                              {g.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {skillProfile.skillsDetected?.filter(s => !s.type || s.type === 'secondary').length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 font-semibold mb-2">Other skills</p>
                        <div className="flex flex-wrap gap-2">
                          {skillProfile.skillsDetected.filter(s => !s.type || s.type === 'secondary').slice(0, 10).map(s => (
                            <button
                              key={s.name}
                              type="button"
                              onClick={() => { setSkillName(s.name); setLearningMode('polish'); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                skillName === s.name ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                              }`}
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  placeholder="e.g. Python, SAP BTP, Machine Learning"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">How many days?</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[7, 10, 14, 21, 30].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTotalDays(d)}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          totalDays === d ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">What&apos;s your goal?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FOCUS_OPTIONS.map(f => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFocus(f.value)}
                        className={`py-2.5 rounded-xl border text-[11px] font-semibold transition-all leading-tight px-1 ${
                          focus === f.value ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">
                  <AlertCircle size={14} className="shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={generating || !skillName.trim()}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <><Loader2 size={16} className="animate-spin" /> Building your path...</>
                ) : (
                  <><Sparkles size={16} /> Create Learning Path</>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Path list ── */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-700">Your Learning Paths</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : paths.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layout size={24} className="text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">No paths yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
              Create your first learning path and start building your skills today.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
            >
              Create Your First Path
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paths.map(path => {
              const cd     = path.completed_days ? (typeof path.completed_days === 'string' ? JSON.parse(path.completed_days) : path.completed_days) : [];
              const pct    = path.total_days > 0 ? Math.round((cd.length / path.total_days) * 100) : 0;
              const status = STATUS_STYLES[path.status] || STATUS_STYLES.not_started;
              const hasStarted = cd.length > 0;

              return (
                <button
                  key={path.id}
                  onClick={async () => {
                    const res = await careerAPI.getLearningPath(path.id);
                    setSelectedPath(res.data?.data || path);
                  }}
                  className="group bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-blue-200 hover:shadow-md transition-all flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {path.skill_name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                        <Clock size={11} />
                        {path.total_days} days &middot; {path.difficulty}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>{cd.length} of {path.total_days} sessions done</span>
                      <span className="font-semibold text-gray-700">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                      {hasStarted ? 'Continue →' : 'Start →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
           MASTER ANY SKILL — FULLY FUNCTIONAL LAUNCH PAD
          ══════════════════════════════════════════════════════ */}
      <div className="relative rounded-[40px] sm:rounded-[56px] overflow-hidden border border-white/5 bg-[#080C14]">

        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-600/25 blur-[130px]" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[130px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '48px 48px' }}
          />
        </div>

        <div className="relative z-10 p-8 sm:p-12 md:p-16 space-y-10 md:space-y-14">

          {/* Row 1: Badge + Headline + CTA */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <Award size={14} className="text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">The Syllabrix Professional Standard</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] mb-5 text-white">
                Master Any Skill.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-400">
                  Build Any Industry.
                </span>
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed text-base max-w-xl">
                Every adaptive path is uniquely engineered for its domain — deep AI theory, SAP architecture, Cloud systems, Data Science, and beyond. Your personal mastery engine.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl shadow-blue-600/40 active:scale-[0.97] whitespace-nowrap"
              >
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                Generate Your Path
              </button>
              {paths.length === 0 && (
                <button
                  onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
                >
                  <Plus size={14} /> Start From Scratch
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Live stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: paths.length > 0 ? paths.length : '∞', label: 'Active Paths', sub: paths.length > 0 ? `${completedPathsCount} completed` : 'Unlimited skills', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', text: 'text-blue-400' },
              { value: totalSessions > 0 ? totalSessions : '—', label: 'Total Sessions', sub: totalSessions > 0 ? `${totalCompletedSessions} done` : 'Across all paths', color: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/20', text: 'text-violet-400' },
              { value: totalCompletedSessions > 0 ? totalCompletedSessions : '0', label: 'Sessions Done', sub: totalCompletedSessions > 0 ? `${avgProgress}% avg completion` : 'Complete sessions to track', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
              { value: skillChips.length, label: 'Skills Available', sub: gapChips.length > 0 ? `${gapChips.length} skill gaps found` : 'Scan resume for gaps', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', text: 'text-amber-400' },
            ].map(({ value, label, sub, color, border, text }) => (
              <div key={label} className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${color} border ${border} p-4 sm:p-6`}>
                <p className={`text-3xl sm:text-4xl font-black ${text} leading-none mb-1`}>{value}</p>
                <p className="text-[11px] font-black text-white/70 uppercase tracking-widest">{label}</p>
                <p className="text-[10px] text-white/30 mt-1 font-medium hidden sm:block">{sub}</p>
              </div>
            ))}
          </div>

          {/* Row 3: Skill chips */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] shrink-0">
                {gapChips.length > 0 ? 'Your Skill Gaps & Recommended Paths' : 'Quick-Launch · Click any skill to start'}
              </p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            {(gapChips.length > 0 || primaryChips.length > 0) && (
              <div className="flex items-center gap-4 mb-4">
                {gapChips.length > 0    && <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Skill gap</span>}
                {primaryChips.length > 0 && <span className="flex items-center gap-1.5 text-[9px] font-black text-blue-400 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Your skill</span>}
                <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" /> Popular</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {skillChips.map(chip => {
                const isGap     = chip.type === 'gap';
                const isPrimary = chip.type === 'primary';
                return (
                  <motion.button
                    key={chip.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSkillName(chip.name);
                      setLearningMode(chip.mode);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors ${
                      isGap
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-400'
                        : isPrimary
                        ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-600 hover:text-white hover:border-blue-500'
                        : 'bg-white/[0.05] border border-white/10 text-slate-400 hover:bg-white/[0.12] hover:text-white hover:border-white/20'
                    }`}
                  >
                    {isGap && <Zap size={10} className="shrink-0" />}
                    {isPrimary && <CheckCircle2 size={10} className="shrink-0" />}
                    {chip.name}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Feature pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10 border-t border-white/[0.06]">
            {[
              { icon: Cpu,      color: 'text-blue-400',    glow: 'bg-blue-500/10 border-blue-500/20',    label: 'Adaptive Intelligence', sub: 'AI tailors every session to your skill level and career goals.' },
              { icon: Terminal, color: 'text-emerald-400', glow: 'bg-emerald-500/10 border-emerald-500/20', label: 'Hands-On Practice',   sub: '15 real exercises per session with step-by-step walkthroughs.' },
              { icon: Globe,    color: 'text-purple-400',  glow: 'bg-purple-500/10 border-purple-500/20', label: 'Any Industry',         sub: 'SAP · AI · Cloud · Data Science · Full-Stack · DevOps.' },
              { icon: Zap,      color: 'text-amber-400',   glow: 'bg-amber-500/10 border-amber-500/20',  label: 'Real-World Focus',     sub: 'Project-driven learning. No theory without practice.' },
            ].map(({ icon: Icon, color, glow, label, sub }) => (
              <div key={label} className="flex flex-col items-start gap-3 p-5 rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${glow}`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className={`text-[11px] font-black uppercase tracking-wider ${color} mb-1`}>{label}</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-snug hidden sm:block">{sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
