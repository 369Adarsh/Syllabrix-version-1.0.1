'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import { prepAPI } from '@/lib/api/prep.api';
import Link from 'next/link';
import {
  Newspaper, Calendar, Loader2, Sparkles, Flame, ArrowLeft, Brain, BookOpen,
  ChevronDown, ChevronRight, Download, X, Tag, Target, Lightbulb, ArrowRight, Filter
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const CAT_STYLES = {
  national: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', emoji: '🇮🇳' },
  international: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', emoji: '🌍' },
  economy: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', emoji: '💹' },
  science_tech: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', emoji: '🔬' },
  sports: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', emoji: '🏏' },
  environment: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', emoji: '🌱' },
  defence: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', emoji: '🛡️' },
  awards: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', emoji: '🏆' },
  appointments: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', emoji: '👔' },
  legal: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100', emoji: '⚖️' },
  education: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100', emoji: '📚' },
};
const getCS = (cat) => CAT_STYLES[cat] || { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', emoji: '📰' };
const IMP = { critical: 'bg-red-100 text-red-700', high: 'bg-amber-100 text-amber-700', medium: 'bg-blue-100 text-blue-700' };

export default function CurrentAffairsPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [days, setDays] = useState(1);
  const [catFilter, setCatFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandData, setExpandData] = useState(null);
  const [expandLoading, setExpandLoading] = useState(false);

  useEffect(() => { loadArticles(); }, [days, catFilter]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      // Use newsroom API for richer data, fallback to prep API
      const res = await aiAPI.getNewsroom({ days, category: catFilter || undefined, limit: 30 });
      const data = res.data?.data || res.data;
      if (data.articles?.length > 0) {
        setArticles(data.articles);
      } else {
        // Fallback to traditional current affairs
        let fallback;
        if (days === 1) fallback = await prepAPI.getTodayAffairs();
        else fallback = await prepAPI.getWeeklyAffairs();
        const fbData = fallback.data?.data || [];
        setArticles(fbData.map(a => ({
          headline: a.title,
          category: a.category,
          importance: a.importance_level,
          bullet_points: typeof a.content_points === 'string' ? JSON.parse(a.content_points) : a.content_points,
          date: a.date ? new Date(a.date).toISOString().slice(0, 10) : undefined,
          source_type: a.source_hint,
          exam_tags: a.exam_relevance ? (typeof a.exam_relevance === 'string' ? JSON.parse(a.exam_relevance) : a.exam_relevance) : [],
        })));
      }
    } catch { setArticles([]); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await aiAPI.generateNewsroom(new Date().toISOString().slice(0, 10));
      toast.success('Generated! Refreshing...');
      loadArticles();
    } catch { toast.error('Could not generate'); }
    finally { setGenerating(false); }
  };

  const handleExpand = async (article, idx) => {
    if (expandedId === idx) { setExpandedId(null); return; }
    setExpandedId(idx);
    setExpandData(null);
    setExpandLoading(true);
    try {
      const res = await aiAPI.expandArticle(article.headline, article.category);
      setExpandData(res.data?.data || res.data);
    } catch { toast.error('Could not expand'); }
    finally { setExpandLoading(false); }
  };

  const handleExportPDF = (article, expanded) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const e = expanded || {};
    const a = article;
    win.document.write(`<!DOCTYPE html><html><head><title>${a.headline} — Syllabrix</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',system-ui;padding:40px 50px;color:#1e293b;max-width:800px;margin:0 auto}
    h1{font-size:20px;color:#1e40af;margin-bottom:8px}h2{font-size:12px;color:#6366F1;margin:16px 0 8px;text-transform:uppercase;letter-spacing:0.05em}
    .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;margin-right:6px}
    .summary{background:#EEF2FF;padding:14px 16px;border-radius:12px;font-size:13px;line-height:1.7;margin-bottom:14px}
    .fact{display:flex;gap:8px;padding:6px 10px;background:#f8fafc;border-radius:8px;margin-bottom:4px;font-size:12px;line-height:1.5}
    .term{background:#EFF6FF;padding:8px 12px;border-radius:8px;margin-bottom:4px;font-size:12px}
    .term b{color:#2563EB}
    .qa{background:#FFFBEB;padding:10px 12px;border-radius:8px;margin-bottom:4px;font-size:12px}
    .qa b{color:#D97706;font-size:11px}
    .oneliner{background:#FAF5FF;padding:12px;border-radius:10px;font-style:italic;font-size:13px;color:#7C3AED;margin-top:14px}
    .footer{margin-top:28px;border-top:1px solid #e2e8f0;padding-top:14px;font-size:10px;color:#94a3b8;text-align:center}</style></head><body>
    <h1>${a.headline}</h1>
    <div style="margin-bottom:12px"><span class="badge" style="background:#EEF2FF;color:#4F46E5">${a.category || ''}</span><span class="badge" style="background:#FEF3C7;color:#D97706">${a.importance || ''}</span>${(a.exam_tags||[]).map(t=>`<span class="badge" style="background:#ECFDF5;color:#059669">${t}</span>`).join('')}</div>
    ${a.summary ? `<div class="summary">${a.summary}</div>` : ''}
    ${a.bullet_points?.length ? `<h2>Key Points</h2>${a.bullet_points.map((p,i)=>`<div class="fact"><b>${i+1}.</b> ${p}</div>`).join('')}` : ''}
    ${e.detailed_summary ? `<h2>Deep Dive</h2><div class="summary">${e.detailed_summary}</div>` : ''}
    ${e.background ? `<h2>Background</h2><p style="font-size:12px;line-height:1.6;margin-bottom:12px">${e.background}</p>` : ''}
    ${e.key_facts?.length ? `<h2>Key Facts</h2>${e.key_facts.map((f,i)=>`<div class="fact"><b>${i+1}.</b> ${f}</div>`).join('')}` : ''}
    ${(a.key_terms||e.key_terms||[]).length ? `<h2>Key Terms</h2>${(a.key_terms||e.key_terms||[]).map(t=>`<div class="term"><b>${t.term}</b> — ${t.meaning||t.definition||''}</div>`).join('')}` : ''}
    ${e.exam_questions?.length ? `<h2>Exam Questions</h2>${e.exam_questions.map(q=>`<div class="qa"><b>[${q.exam}] ${q.question}</b><br/>${q.answer}</div>`).join('')}` : ''}
    ${a.one_liner || e.revision_one_liner ? `<div class="oneliner">💡 ${a.one_liner || e.revision_one_liner}</div>` : ''}
    <div class="footer">Syllabrix — India's Education Ecosystem · syllabrix.com</div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const allCats = [...new Set(articles.map(a => a.category).filter(Boolean))];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 p-5">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/prep" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><ArrowLeft size={16} className="text-white" /></Link>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Newspaper size={20} className="text-orange-200" /></div>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-white">Current Affairs</h1>
            <p className="text-orange-200/70 text-xs">AI-curated from 54 verified sources — with mind maps &amp; exam questions</p>
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all disabled:opacity-50 backdrop-blur-sm">
            {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Generate
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1"><Calendar size={10} /> Period:</span>
          {[{ v: 1, l: 'Today' }, { v: 3, l: '3 Days' }, { v: 7, l: 'Week' }, { v: 10, l: '10 Days' }, { v: 30, l: 'Month' }].map(f => (
            <button key={f.v} onClick={() => setDays(f.v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${days === f.v ? 'bg-orange-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>{f.l}</button>
          ))}
          <div className="flex-1" />
          <Link href="/newsroom" className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
            Full Newsroom <ArrowRight size={11} />
          </Link>
        </div>
        {allCats.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setCatFilter('')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${!catFilter ? 'bg-orange-600 text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>All</button>
            {allCats.map(c => {
              const s = getCS(c);
              return (
                <button key={c} onClick={() => setCatFilter(catFilter === c ? '' : c)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${catFilter === c ? `${s.bg} ${s.text} border ${s.border}` : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>
                  {s.emoji} {c.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <Loader2 size={28} className="animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading current affairs...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4"><Calendar size={28} className="text-orange-400" /></div>
          <h2 className="font-bold text-gray-700 mb-2">No current affairs for this period</h2>
          <p className="text-sm text-gray-400 mb-5">Click Generate to create today&apos;s edition using AI.</p>
          <button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md transition-all disabled:opacity-50">
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a, idx) => {
            const cs = getCS(a.category);
            const isExpanded = expandedId === idx;
            return (
              <div key={idx} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 text-[15px] leading-snug flex-1 pr-3">{a.headline}</h3>
                    {a.importance && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${IMP[a.importance] || IMP.medium}`}>
                        {a.importance === 'critical' && <Flame size={10} className="mr-0.5" />}{a.importance}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${cs.bg} ${cs.text} border ${cs.border}`}>
                      {cs.emoji} {(a.category || '').replace('_', ' ')}
                    </span>
                    {a.source_type && <span className="text-[10px] text-gray-400">{a.source_type}</span>}
                    {a.date && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Calendar size={9} /> {a.date}</span>}
                  </div>

                  {a.summary && <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{a.summary}</p>}

                  {a.bullet_points?.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {a.bullet_points.map((pt, i) => (
                        <div key={i} className="flex gap-2 text-[12.5px] text-gray-600"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />{pt}</div>
                      ))}
                    </div>
                  )}

                  {/* Key terms inline */}
                  {a.key_terms?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {a.key_terms.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold border border-indigo-100" title={t.meaning}>
                          {t.term}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex flex-wrap gap-1">
                      {(a.exam_tags || []).slice(0, 4).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-100">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {a.mind_map_hint && <span className="text-[10px] text-purple-500 font-medium flex items-center gap-0.5"><Brain size={10} /> Map</span>}
                      <button onClick={() => handleExpand(a, idx)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                        {isExpanded ? 'Collapse' : 'Deep Dive'} {isExpanded ? <ChevronDown size={11} /> : <ArrowRight size={11} />}
                      </button>
                      <button onClick={() => handleExportPDF(a, isExpanded ? expandData : null)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Export PDF">
                        <Download size={13} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {a.one_liner && (
                    <p className="text-[11px] text-purple-600 font-medium mt-2 flex items-center gap-1"><Lightbulb size={11} /> <em>{a.one_liner}</em></p>
                  )}
                </div>

                {/* Expanded section */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gradient-to-b from-indigo-50/30 to-white px-5 py-4 space-y-3 animate-fade-in">
                    {expandLoading ? (
                      <div className="text-center py-6"><Loader2 size={20} className="animate-spin text-indigo-400 mx-auto" /><p className="text-xs text-gray-400 mt-2">AI is expanding...</p></div>
                    ) : expandData ? (
                      <>
                        {expandData.detailed_summary && (
                          <div className="bg-white rounded-xl p-4 border border-indigo-100/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1.5">Deep Dive</p>
                            <p className="text-[13px] text-gray-700 leading-relaxed">{expandData.detailed_summary}</p>
                          </div>
                        )}
                        {expandData.background && (
                          <div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Background</p>
                          <p className="text-[12.5px] text-gray-600 leading-relaxed">{expandData.background}</p></div>
                        )}
                        {expandData.key_facts?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Key Facts</p>
                            <div className="space-y-1.5">{expandData.key_facts.map((f, i) => (
                              <div key={i} className="flex gap-2 bg-gray-50 rounded-lg p-2.5 text-[12px] text-gray-700">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>{f}
                              </div>
                            ))}</div>
                          </div>
                        )}
                        {expandData.exam_questions?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Likely Exam Questions</p>
                            <div className="space-y-2">{expandData.exam_questions.map((q, i) => (
                              <div key={i} className="bg-amber-50/60 rounded-lg p-3 border border-amber-100/40">
                                <div className="flex items-start gap-2 mb-1">
                                  <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 text-[9px] font-bold shrink-0">{q.exam}</span>
                                  <p className="text-[12px] font-semibold text-gray-800">{q.question}</p>
                                </div>
                                <p className="text-[11px] text-gray-600 ml-10">{q.answer}</p>
                              </div>
                            ))}</div>
                          </div>
                        )}
                        {expandData.revision_one_liner && (
                          <div className="bg-purple-50/60 rounded-lg p-3 border border-purple-100/40">
                            <p className="text-[11px] text-purple-600 font-medium italic flex items-center gap-1"><Sparkles size={11} /> {expandData.revision_one_liner}</p>
                          </div>
                        )}
                        {/* Mini mind map from expand data */}
                        {expandData.mind_map?.children && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1"><Brain size={10} className="text-purple-500" /> Mind Map</p>
                            <div className="bg-white rounded-xl border border-purple-100/40 p-4">
                              <div className="text-center mb-3">
                                <span className="inline-block px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold">{expandData.mind_map.title}</span>
                              </div>
                              <div className="flex flex-wrap justify-center gap-2">
                                {expandData.mind_map.children.map((branch, i) => (
                                  <div key={i} className="text-center">
                                    <div className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white" style={{ backgroundColor: branch.color || '#6366F1' }}>{branch.title}</div>
                                    {branch.children?.map((sub, j) => (
                                      <div key={j} className="text-[10px] text-gray-500 mt-1">{sub.title}</div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : <p className="text-sm text-gray-400 text-center py-4">Could not load details.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom links */}
      <div className="flex justify-center gap-4 pb-4">
        <Link href="/newsroom" className="text-xs text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-1"><Newspaper size={12} /> Full Newsroom</Link>
        <Link href="/prep/daily-quiz" className="text-xs text-purple-500 hover:text-purple-600 font-semibold flex items-center gap-1"><Brain size={12} /> Daily Quiz</Link>
        <Link href="/prep/stream-navigator" className="text-xs text-emerald-500 hover:text-emerald-600 font-semibold flex items-center gap-1"><Target size={12} /> Stream Navigator</Link>
      </div>
    </div>
  );
}
