'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  Newspaper, Loader2, Calendar, ChevronDown, ChevronRight, Sparkles,
  Filter, Tag, Brain, BookOpen, ArrowRight, X, Download, Clock,
  Flame, Star, Search, RefreshCw, FileText, Target, Lightbulb, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const CAT_LABELS = {
  national: { emoji: '🇮🇳', label: 'National' }, international: { emoji: '🌍', label: 'International' },
  economy: { emoji: '💹', label: 'Economy' }, science_tech: { emoji: '🔬', label: 'Sci & Tech' },
  sports: { emoji: '🏏', label: 'Sports' }, environment: { emoji: '🌱', label: 'Environment' },
  defence: { emoji: '🛡️', label: 'Defence' }, awards: { emoji: '🏆', label: 'Awards' },
  appointments: { emoji: '👔', label: 'Appointments' }, legal: { emoji: '⚖️', label: 'Legal' },
  art_culture: { emoji: '🎭', label: 'Arts & Culture' }, education: { emoji: '📚', label: 'Education' },
};

const IMP_COLORS = { critical: 'bg-red-100 text-red-700', high: 'bg-amber-100 text-amber-700', medium: 'bg-blue-100 text-blue-700' };

// ═══ ARTICLE CARD ═══
function ArticleCard({ article, onExpand }) {
  const cat = CAT_LABELS[article.category] || { emoji: '📰', label: article.category };
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-gray-800 text-[15px] leading-snug flex-1 pr-3">{article.headline}</h3>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${IMP_COLORS[article.importance] || IMP_COLORS.medium}`}>
          {article.importance === 'critical' && <Flame size={10} className="mr-0.5" />}
          {article.importance}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-[10px] font-semibold text-gray-600">
          {cat.emoji} {cat.label}
        </span>
        {article.source_type && <span className="text-[10px] text-gray-400">{article.source_type}</span>}
        {article.date && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Calendar size={9} /> {article.date}</span>}
      </div>

      {article.summary && <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{article.summary}</p>}

      {article.bullet_points?.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {article.bullet_points.map((pt, i) => (
            <div key={i} className="flex gap-2 text-[12.5px] text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
              <span>{pt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Key Terms toggle */}
      {article.key_terms?.length > 0 && (
        <div className="mb-3">
          <button onClick={() => setShowTerms(!showTerms)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            <BookOpen size={12} /> {showTerms ? 'Hide' : 'Show'} Key Terms ({article.key_terms.length})
            {showTerms ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {showTerms && (
            <div className="mt-2 space-y-1.5 animate-fade-in">
              {article.key_terms.map((t, i) => (
                <div key={i} className="bg-indigo-50/60 rounded-lg px-3 py-2 border border-indigo-100/40">
                  <span className="text-xs font-bold text-indigo-700">{t.term}</span>
                  <span className="text-[11px] text-gray-600 ml-1.5">— {t.meaning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exam tags + Mind map hint */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {(article.exam_tags || []).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-100">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {article.mind_map_hint && (
            <span className="text-[10px] text-purple-500 font-medium flex items-center gap-0.5"><Brain size={10} /> Map</span>
          )}
          <button onClick={() => onExpand(article)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
            Deep Dive <ArrowRight size={11} />
          </button>
        </div>
      </div>

      {article.one_liner && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[11px] text-purple-600 font-medium flex items-center gap-1.5">
            <Lightbulb size={11} /> <span className="italic">{article.one_liner}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ═══ EXPANDED ARTICLE PANEL ═══
function ExpandedArticle({ article, expanded, onClose }) {
  if (!expanded) return null;

  const handleExportPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const e = expanded;
    win.document.write(`<!DOCTYPE html><html><head><title>${e.title} — Syllabrix Newsroom</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',system-ui;padding:40px 50px;color:#1e293b;max-width:800px;margin:0 auto}
    h1{font-size:20px;color:#1e40af;margin-bottom:8px}h2{font-size:13px;color:#6366F1;margin:18px 0 8px;text-transform:uppercase;letter-spacing:0.05em}
    .summary{background:#EEF2FF;padding:16px;border-radius:12px;font-size:14px;line-height:1.7;margin-bottom:16px}
    .fact{display:flex;gap:10px;padding:8px 12px;background:#f8fafc;border-radius:10px;margin-bottom:6px;font-size:13px;line-height:1.5}
    .fact-num{width:22px;height:22px;border-radius:50%;background:#E0E7FF;color:#4F46E5;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .term{background:#EFF6FF;padding:10px 14px;border-radius:10px;margin-bottom:6px}
    .term b{font-size:12px;color:#2563EB}.term span{font-size:12px;color:#475569}
    .qa{background:#FFFBEB;padding:12px 14px;border-radius:10px;margin-bottom:6px}
    .qa b{font-size:12px;color:#D97706}.qa p{font-size:12px;color:#475569;margin-top:4px}
    .oneliner{background:#FAF5FF;padding:14px;border-radius:12px;font-size:13px;font-style:italic;color:#7C3AED}
    .footer{margin-top:30px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:11px;color:#94a3b8;text-align:center}</style></head><body>
    <h1>${e.title}</h1>
    <div class="summary">${e.detailed_summary || ''}</div>
    ${e.background ? `<h2>Background</h2><p style="font-size:13px;line-height:1.6;margin-bottom:16px">${e.background}</p>` : ''}
    ${e.key_facts?.length ? `<h2>Key Facts</h2>${e.key_facts.map((f,i) => `<div class="fact"><div class="fact-num">${i+1}</div><div>${f}</div></div>`).join('')}` : ''}
    ${e.key_terms?.length ? `<h2>Key Terms</h2>${e.key_terms.map(t => `<div class="term"><b>${t.term}</b> <span>— ${t.meaning}</span></div>`).join('')}` : ''}
    ${e.exam_questions?.length ? `<h2>Likely Exam Questions</h2>${e.exam_questions.map(q => `<div class="qa"><b>[${q.exam}] ${q.question}</b><p>${q.answer}</p></div>`).join('')}` : ''}
    ${e.revision_one_liner ? `<h2>Quick Revision</h2><div class="oneliner">${e.revision_one_liner}</div>` : ''}
    <div class="footer">Syllabrix Newsroom — India's Education Ecosystem · syllabrix.com</div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[80vh] overflow-y-auto z-10 animate-scale-in">
        <div className="sticky top-0 flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm rounded-t-2xl">
          <h2 className="font-bold text-gray-800 text-sm truncate pr-4">{expanded.title}</h2>
          <div className="flex items-center gap-1">
            <button onClick={handleExportPDF} className="p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Export PDF">
              <Download size={16} className="text-blue-500" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><X size={16} className="text-gray-400" /></button>
          </div>
        </div>
        <div className="px-5 py-5 space-y-4">
          {expanded.detailed_summary && (
            <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100/40">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-2">Detailed Summary</p>
              <p className="text-sm text-gray-700 leading-relaxed">{expanded.detailed_summary}</p>
            </div>
          )}
          {expanded.background && (
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Background</p>
            <p className="text-sm text-gray-600 leading-relaxed">{expanded.background}</p></div>
          )}
          {expanded.key_facts?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Key Facts</p>
              <div className="space-y-1.5">{expanded.key_facts.map((f, i) => (
                <div key={i} className="flex gap-2.5 bg-gray-50 rounded-xl p-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                  <p className="text-[13px] text-gray-700">{f}</p>
                </div>
              ))}</div>
            </div>
          )}
          {expanded.key_terms?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Key Terms</p>
              <div className="space-y-1.5">{expanded.key_terms.map((t, i) => (
                <div key={i} className="bg-blue-50/60 rounded-xl p-3 border border-blue-100/40">
                  <span className="text-xs font-bold text-blue-700">{t.term}</span>
                  <span className="text-[12px] text-gray-600 ml-1.5">— {t.meaning}</span>
                  {t.related_to && <span className="text-[10px] text-gray-400 ml-1">({t.related_to})</span>}
                </div>
              ))}</div>
            </div>
          )}
          {expanded.exam_questions?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Likely Exam Questions</p>
              <div className="space-y-2">{expanded.exam_questions.map((q, i) => (
                <div key={i} className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-100/40">
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 text-[9px] font-bold">{q.exam}</span>
                    <p className="text-[13px] font-semibold text-gray-800">{q.question}</p>
                  </div>
                  <p className="text-[12px] text-gray-600 ml-8">{q.answer}</p>
                </div>
              ))}</div>
            </div>
          )}
          {expanded.related_topics?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Related:</span>
              {expanded.related_topics.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-semibold border border-purple-100">{t}</span>
              ))}
            </div>
          )}
          {expanded.revision_one_liner && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100/40">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-500 mb-1">Quick Revision</p>
              <p className="text-sm text-gray-700 italic">{expanded.revision_one_liner}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══ MAIN PAGE ═══
export default function NewsroomPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [days, setDays] = useState(1);
  const [category, setCategory] = useState('');
  const [importance, setImportance] = useState('');
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [expandLoading, setExpandLoading] = useState(false);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { loadArticles(); }, [days, category, importance]);

  const loadArticles = async (page = 1) => {
    setLoading(true);
    try {
      const res = await aiAPI.getNewsroom({
        days, category: category || undefined, importance: importance || undefined, page, limit: 20,
      });
      const data = res.data?.data || res.data;
      setArticles(data.articles || []);
      setPagination(data.pagination || null);
    } catch { setArticles([]); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await aiAPI.generateNewsroom(new Date().toISOString().slice(0, 10), category || undefined);
      toast.success('Newsroom edition generated!');
      loadArticles();
    } catch { toast.error('Generation failed'); }
    finally { setGenerating(false); }
  };

  const handleExpand = async (article) => {
    setExpandLoading(true);
    setExpandedArticle(null);
    try {
      const res = await aiAPI.expandArticle(article.headline, article.category);
      setExpandedArticle(res.data?.data || res.data);
    } catch { toast.error('Could not expand article'); }
    finally { setExpandLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full translate-y-1/2" />
        <div className="absolute top-4 right-8 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
            <Newspaper size={24} className="text-blue-300" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Syllabrix Newsroom</h1>
            <p className="text-blue-300/70 text-sm mt-0.5">AI-powered news digest — 54 verified sources, updated daily for exam prep</p>
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all disabled:opacity-50 backdrop-blur-sm">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generate Today
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1"><Clock size={10} /> Period:</span>
          {[{ v: 1, l: 'Today' }, { v: 3, l: '3 Days' }, { v: 7, l: 'This Week' }, { v: 10, l: '10 Days' }, { v: 30, l: 'Month' }].map(f => (
            <button key={f.v} onClick={() => setDays(f.v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${days === f.v ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>{f.l}</button>
          ))}
          <div className="flex-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1"><Flame size={10} /> Importance:</span>
          {['', 'critical', 'high', 'medium'].map(v => (
            <button key={v} onClick={() => setImportance(v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${importance === v ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>
              {v || 'All'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCategory('')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${!category ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>All Categories</button>
          {Object.entries(CAT_LABELS).map(([k, v]) => (
            <button key={k} onClick={() => setCategory(k)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${category === k ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <Loader2 size={28} className="animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading newsroom...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4"><Newspaper size={28} className="text-blue-400" /></div>
          <h2 className="font-bold text-gray-700 mb-2">No articles for this period</h2>
          <p className="text-sm text-gray-400 mb-5">Click &ldquo;Generate Today&rdquo; to create today&apos;s newsroom edition.</p>
          <button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50">
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate Now
          </button>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-gray-400 font-medium">{articles.length} articles {pagination?.total > articles.length ? `of ${pagination.total}` : ''}</p>
          <div className="space-y-3">
            {articles.map((a, i) => <ArticleCard key={i} article={a} onExpand={handleExpand} />)}
          </div>
          {pagination && pagination.page < pagination.totalPages && (
            <button onClick={() => loadArticles(pagination.page + 1)}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
              Load more articles
            </button>
          )}
        </>
      )}

      {/* Loading expand */}
      {expandLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <Loader2 size={28} className="animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">AI is expanding this article...</p>
          </div>
        </div>
      )}

      {/* Expanded Article Modal */}
      {expandedArticle && <ExpandedArticle expanded={expandedArticle} onClose={() => setExpandedArticle(null)} />}

      {/* Quick links */}
      <div className="flex justify-center gap-4 pb-4">
        <Link href="/prep/current-affairs" className="text-xs text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1"><Calendar size={12} /> Current Affairs</Link>
        <Link href="/prep/daily-quiz" className="text-xs text-purple-500 hover:text-purple-600 font-semibold flex items-center gap-1"><Brain size={12} /> Daily Quiz</Link>
        <Link href="/prep/stream-navigator" className="text-xs text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-1"><Target size={12} /> Stream Navigator</Link>
      </div>
    </div>
  );
}
