'use client';
import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { jeeAPI } from '@/lib/api/jee.api';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import {
  ArrowLeft, BookOpen, Zap, CheckCircle2, ChevronDown, ChevronRight,
  AlertTriangle, Lightbulb, Star, Loader2, BookmarkPlus
} from 'lucide-react';

const MASTERY_OPTIONS = [
  { value: 'not_started',  label: 'Not started',  color: 'bg-gray-100 text-gray-500'      },
  { value: 'beginner',     label: 'Beginner',      color: 'bg-blue-50 text-blue-600'       },
  { value: 'intermediate', label: 'Intermediate',  color: 'bg-amber-50 text-amber-600'     },
  { value: 'advanced',     label: 'Advanced',      color: 'bg-purple-50 text-purple-600'   },
  { value: 'mastered',     label: 'Mastered',      color: 'bg-emerald-50 text-emerald-700' },
];

function TopicCard({ topic, onGenerate }) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const formulas = typeof topic.key_formulas === 'string' ? JSON.parse(topic.key_formulas || '[]') : (topic.key_formulas || []);
  const concepts = typeof topic.key_concepts === 'string' ? JSON.parse(topic.key_concepts || '[]') : (topic.key_concepts || []);
  const mistakes = typeof topic.common_mistakes === 'string' ? JSON.parse(topic.common_mistakes || '[]') : (topic.common_mistakes || []);
  const hasContent = topic.theory_content || formulas.length > 0 || concepts.length > 0;

  const handleGenerate = async (e) => {
    e.stopPropagation();
    setGenerating(true);
    if (!open) setOpen(true);
    await onGenerate(topic.id);
    setGenerating(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          topic.difficulty === 'hard' ? 'bg-red-400' : topic.difficulty === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
        }`} />
        <span className="text-[13px] font-semibold text-gray-800 flex-1">{topic.name}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!hasContent && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">No notes</span>
          )}
          {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          {(() => {
            const videos = typeof topic.video_lectures === 'string' ? JSON.parse(topic.video_lectures || '[]') : (topic.video_lectures || []);
            if (videos.length === 0) return null;
            return (
              <div className="mb-6">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center">
                    <span className="text-[10px]">▶️</span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Video Lectures</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {videos.map((video, i) => (
                    <div key={i} className="group border border-gray-100 rounded-xl p-2.5 hover:border-red-200 hover:bg-red-50/30 cursor-pointer transition-all flex items-center gap-3"
                         onClick={() => window.open(`https://youtube.com/watch?v=${video.youtube_id}`, '_blank')}>
                      <div className="relative w-28 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
                        <img 
                          src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform">
                            <span className="text-[10px] ml-0.5">▶</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-gray-800 truncate group-hover:text-red-700">{video.title}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <span className="font-medium text-gray-700">{video.channel}</span>
                          <span>•</span>
                          <span>{video.duration_minutes} min</span>
                        </div>
                        <div className="mt-1 flex gap-1">
                          <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold uppercase tracking-tight">
                            {video.type === 'full_chapter' ? 'Full Chapter' : video.type === 'concept' ? 'Concept' : 'PYQ Solving'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {topic.theory_content ? (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen size={13} className="text-blue-500" />
                <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">Theory</p>
              </div>
              <div className="prose prose-sm max-w-none text-[13px] text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{topic.theory_content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 p-4 text-center">
              <Zap size={18} className="text-blue-400 mx-auto mb-2" />
              <p className="text-[12px] text-gray-500 mb-2">No study notes yet.</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {generating ? <><Loader2 size={12} className="animate-spin" /> Generating...</> : <><Zap size={12} /> AI Notes</>}
              </button>
            </div>
          )}

          {formulas.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={13} className="text-amber-500" />
                <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">Key Formulas</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {formulas.map((f, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {f.name && <p className="text-[10px] text-amber-600 mb-0.5">{f.name}</p>}
                    <div className="text-[13px] font-bold text-gray-800">
                      <InlineMath math={f.formula?.replace(/\$/g, '') || ''} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {concepts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Star size={13} className="text-violet-500" />
                <p className="text-[11px] font-semibold text-violet-800 uppercase tracking-wide">Key Concepts</p>
              </div>
              <ul className="space-y-1">
                {concepts.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-gray-700">
                    <CheckCircle2 size={12} className="text-violet-400 flex-shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mistakes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={13} className="text-red-500" />
                <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wide">Common Mistakes</p>
              </div>
              <ul className="space-y-1">
                {mistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-red-700 bg-red-50 rounded-lg px-2.5 py-1.5">
                    <span className="flex-shrink-0 font-bold">✗</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topic.jee_tips && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb size={13} className="text-blue-600" />
                <p className="text-[11px] font-semibold text-blue-800">JEE Tip</p>
              </div>
              <p className="text-[12px] text-blue-700">{topic.jee_tips}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            {hasContent && (
              <button onClick={handleGenerate} disabled={generating}
                className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline disabled:opacity-50">
                {generating ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                Regenerate notes
              </button>
            )}
            <button onClick={() => jeeAPI.addBookmark({ bookmark_type: 'topic', reference_id: topic.id }).catch(()=>{})}
              className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-blue-500 transition-colors ml-auto">
              <BookmarkPlus size={12} /> Bookmark
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterDetailContent() {
  const { subjectSlug, chapterSlug } = useParams();
  const searchParams = useSearchParams();
  const classLevel = searchParams?.get('class') || '11';
  const [chapter, setChapter] = useState(null);
  const [mastery, setMastery] = useState('not_started');
  const [loading, setLoading] = useState(true);
  const [generatingNotes, setGeneratingNotes] = useState(false);

  useEffect(() => {
    jeeAPI.getChapter(subjectSlug, chapterSlug, classLevel)
      .then(r => {
        setChapter(r.data?.data);
        setMastery(r.data?.data?.mastery_level || 'not_started');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subjectSlug, chapterSlug, classLevel]);

  const updateMastery = async (level) => {
    setMastery(level);
    try {
      await jeeAPI.updateProgress(chapter.id, { mastery_level: level, theory_completed: 1 });
    } catch {}
  };

  const generateNotes = async (topicId) => {
    try {
      const r = await jeeAPI.generateTopicNotes(topicId);
      if (r.data?.data) {
        setChapter(prev => ({
          ...prev,
          topics: prev.topics.map(t => t.id === topicId ? { ...t, ...r.data.data } : t),
        }));
      }
    } catch {}
  };

  const generateAllNotes = async () => {
    const topics = chapter?.topics || [];
    const emptyTopics = topics.filter(t => !t.theory_content);
    if (!emptyTopics.length) return;
    setGeneratingNotes(true);
    for (const t of emptyTopics) {
      await generateNotes(t.id);
    }
    setGeneratingNotes(false);
  };

  if (loading) return (
    <div className="space-y-3">
      <div className="h-8 bg-white rounded-xl animate-pulse border w-48" />
      {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border" />)}
    </div>
  );

  if (!chapter) return (
    <div className="text-center py-12">
      <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">Chapter not found</p>
      <Link href="/jee-command/syllabus" className="text-blue-500 text-sm mt-2 block">← Back to syllabus</Link>
    </div>
  );

  const topics = chapter.topics || [];
  const masteryConfig = MASTERY_OPTIONS.find(m => m.value === mastery);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Link href="/jee-command/syllabus"
          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={13} /> Syllabus
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] text-gray-400 capitalize">{subjectSlug}</span>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] text-gray-700 font-medium truncate max-w-[200px]">{chapter.name}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="text-[18px] font-bold text-gray-900 leading-tight">{chapter.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] text-gray-400 capitalize">{subjectSlug} · Class {chapter.class_level}</span>
              {chapter.jee_main_weightage > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {chapter.jee_main_weightage}% weightage
                </span>
              )}
              {chapter.total_topics > 0 && (
                <span className="text-[10px] text-gray-400">{chapter.total_topics} topics</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${masteryConfig?.color || 'bg-gray-100 text-gray-500'}`}>
              {masteryConfig?.label}
            </span>
          </div>
        </div>

        {chapter.description && (
          <p className="text-[12px] text-gray-500 mb-3">{chapter.description}</p>
        )}

        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-1.5">Update mastery level</p>
          <div className="flex flex-wrap gap-1.5">
            {MASTERY_OPTIONS.map(m => (
              <button key={m.value} onClick={() => updateMastery(m.value)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                  mastery === m.value ? m.color + ' ring-2 ring-offset-1 ring-gray-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>{m.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {[
          { label: 'PYQ Questions', href: `/jee-command/pyq?subject=${subjectSlug}` },
          { label: 'Practice Test', href: `/jee-command/mock-tests?type=chapter_test` },
          { label: 'Formula Sheet', href: `/jee-command/formula-sheets` },
          { label: 'AI Tutor', href: `/jee-command/ai-tutor` },
        ].map(l => (
          <Link key={l.href} href={l.href}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors whitespace-nowrap">
            {l.label}
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-bold text-gray-700">Topics ({topics.length})</h2>
          {topics.length > 0 && topics.some(t => !t.theory_content) && (
            <button onClick={generateAllNotes} disabled={generatingNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50">
              {generatingNotes ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
              {generatingNotes ? 'Generating...' : 'Generate All Notes'}
            </button>
          )}
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
            <BookOpen size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-[13px] text-gray-500">No topics yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map(topic => <TopicCard key={topic.id} topic={topic} onGenerate={generateNotes} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChapterDetailPage() {
  return (
    <Suspense fallback={
      <div className="space-y-3">
        <div className="h-8 bg-white rounded-xl animate-pulse border w-48" />
        {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border" />)}
      </div>
    }>
      <ChapterDetailContent />
    </Suspense>
  );
}
