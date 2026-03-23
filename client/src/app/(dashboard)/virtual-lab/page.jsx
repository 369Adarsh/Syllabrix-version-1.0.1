'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  FlaskConical, Loader2, Sparkles, ArrowLeft, Play, CheckCircle,
  Beaker, Zap, BookOpen, AlertTriangle, Download, ChevronRight, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const SUB_META = {
  chemistry: { emoji: '🧪', color: 'from-violet-600 to-purple-700', bg: 'bg-violet-50 border-violet-200' },
  physics: { emoji: '⚡', color: 'from-blue-600 to-indigo-700', bg: 'bg-blue-50 border-blue-200' },
  biology: { emoji: '🧬', color: 'from-emerald-600 to-teal-700', bg: 'bg-emerald-50 border-emerald-200' },
  math: { emoji: '📐', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 border-amber-200' },
};
const DIFF_C = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

export default function VirtualLabPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expLoading, setExpLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [sliderValues, setSliderValues] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});

  useEffect(() => {
    aiAPI.getLabSubjects().then(r => setSubjects(r.data?.data)).catch(() => {});
  }, []);

  const loadExperiments = async (subj) => {
    setSelectedSubject(subj); setLoading(true); setExperiment(null);
    try {
      const cls = user?.class_name?.toString().replace(/\D/g, '');
      const res = await aiAPI.getLabExperiments(subj, cls);
      setExperiments(res.data?.data || []);
    } catch { toast.error('Could not load experiments'); setExperiments([]); }
    finally { setLoading(false); }
  };

  const startExperiment = async (exp) => {
    setExpLoading(true); setCurrentStep(0); setCompletedSteps(new Set()); setSliderValues({});
    try {
      const cls = user?.class_name?.toString().replace(/\D/g, '');
      const res = await aiAPI.generateExperiment(selectedSubject, exp.name || exp, { class_level: cls, difficulty: exp.difficulty });
      setExperiment(res.data?.data || res.data);
    } catch { toast.error('Could not generate experiment'); }
    finally { setExpLoading(false); }
  };

  const completeStep = (idx) => { setCompletedSteps(prev => new Set([...prev, idx])); if (idx < (experiment?.steps?.length || 0) - 1) setCurrentStep(idx + 1); };

  const handleExportPDF = () => {
    if (!experiment) return;
    const e = experiment;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${e.title} — Syllabrix Lab</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',system-ui;padding:40px;color:#1e293b;max-width:800px;margin:0 auto}
    h1{font-size:20px;color:#4F46E5;margin-bottom:8px}h2{font-size:12px;color:#6366F1;margin:16px 0 8px;text-transform:uppercase;letter-spacing:0.05em}
    .obj{background:#EEF2FF;padding:14px;border-radius:12px;font-size:13px;margin-bottom:14px}
    .step{background:#f8fafc;padding:12px 14px;border-radius:10px;margin-bottom:6px;font-size:12px}
    .step b{color:#4F46E5}.footer{margin-top:28px;border-top:1px solid #e2e8f0;padding-top:14px;font-size:10px;color:#94a3b8;text-align:center}</style></head><body>
    <h1>${e.title}</h1>
    <div class="obj"><b>Objective:</b> ${e.objective || ''}</div>
    <h2>Theory</h2><p style="font-size:13px;line-height:1.6;margin-bottom:14px">${e.theory || ''}</p>
    ${e.materials?.length ? `<h2>Materials</h2><p style="font-size:12px">${e.materials.join(', ')}</p>` : ''}
    ${e.safety_notes?.length ? `<h2>Safety Notes</h2>${e.safety_notes.map(n=>`<p style="font-size:12px;color:#D97706">⚠ ${n}</p>`).join('')}` : ''}
    <h2>Procedure</h2>${(e.steps||[]).map((s,i)=>`<div class="step"><b>Step ${s.step_number||i+1}:</b> ${s.instruction}<br/><em>Observation:</em> ${s.observation||''}<br/><em>Why:</em> ${s.explanation||''}</div>`).join('')}
    ${e.expected_results ? `<h2>Expected Results</h2><p style="font-size:12px">${e.expected_results.observation} ${e.expected_results.conclusion}</p>` : ''}
    ${e.formula ? `<h2>Formula</h2><p style="font-size:14px;font-weight:700;color:#4F46E5">${e.formula}</p>` : ''}
    <div class="footer">Syllabrix Virtual Lab · syllabrix.com</div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const meta = SUB_META[selectedSubject] || SUB_META.chemistry;

  // ═══ SUBJECT SELECTION ═══
  if (!selectedSubject) return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500/15 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-6 right-12 text-3xl animate-bounce">🔬</div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0"><FlaskConical size={24} className="text-purple-200" /></div>
          <div><h1 className="text-xl font-extrabold text-white tracking-tight">Virtual Science & Math Lab</h1>
          <p className="text-purple-300/70 text-sm mt-0.5">AI-powered experiments — no chemicals needed, 100% safe</p></div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects && Object.entries(subjects).map(([key, sub]) => {
          const m = SUB_META[key] || SUB_META.chemistry;
          return (
            <button key={key} onClick={() => loadExperiments(key)}
              className={`text-left ${m.bg} border-2 rounded-2xl p-6 hover:shadow-lg transition-all group active:scale-[0.98]`}>
              <span className="text-4xl block mb-3">{m.emoji}</span>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600">{sub.name}</h3>
              <p className="text-[11px] text-gray-500 mt-1">{(sub.categories||[]).slice(0,3).join(', ')}</p>
              <div className="flex items-center gap-1 mt-3 text-purple-600 text-sm font-medium">Enter Lab <ChevronRight size={14} /></div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ═══ EXPERIMENT LIST ═══
  if (!experiment && !expLoading) return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${meta.color} p-5`}>
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => setSelectedSubject(null)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><ArrowLeft size={16} className="text-white" /></button>
          <span className="text-2xl">{meta.emoji}</span>
          <div><h1 className="text-lg font-extrabold text-white">{subjects?.[selectedSubject]?.name || selectedSubject} Lab</h1>
          <p className="text-white/60 text-xs">Select an experiment to begin</p></div>
        </div>
      </div>
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center"><Loader2 size={28} className="animate-spin text-purple-500 mx-auto" /></div>
      ) : experiments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <FlaskConical size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-600">No experiments loaded</p>
          <button onClick={() => loadExperiments(selectedSubject)} className="mt-3 text-sm text-purple-600 font-semibold">Try Again</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {experiments.map((exp, i) => (
            <button key={i} onClick={() => startExperiment(exp)}
              className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-sm group-hover:text-purple-600 transition-colors">{exp.name}</h3>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${DIFF_C[exp.difficulty] || DIFF_C.medium}`}>{exp.difficulty}</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-2">{exp.description}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                {exp.category && <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200">{exp.category}</span>}
                {exp.estimated_minutes && <span>~{exp.estimated_minutes} min</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ═══ LOADING EXPERIMENT ═══
  if (expLoading) return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse"><FlaskConical size={28} className="text-white" /></div>
      <p className="font-bold text-gray-700">Preparing your virtual experiment...</p>
      <p className="text-sm text-gray-400 mt-1">AI is setting up the lab</p>
    </div>
  );

  // ═══ EXPERIMENT VIEW ═══
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className={`rounded-2xl bg-gradient-to-r ${meta.color} p-5`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setExperiment(null)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><ArrowLeft size={16} className="text-white" /></button>
          <span className="text-2xl">{meta.emoji}</span>
          <div className="flex-1"><h1 className="text-lg font-extrabold text-white">{experiment.title}</h1>
          <p className="text-white/60 text-xs">{experiment.subject} · {experiment.difficulty} · ~{experiment.estimated_time_minutes || 10} min</p></div>
          <button onClick={handleExportPDF} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Export PDF"><Download size={16} className="text-white" /></button>
        </div>
      </div>

      {/* Objective + Theory */}
      <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100/50">
        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1.5">Objective</p>
        <p className="text-sm text-gray-700">{experiment.objective}</p>
      </div>
      {experiment.theory && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Theory</p>
          <p className="text-[13px] text-gray-600 leading-relaxed">{experiment.theory}</p>
          {experiment.formula && <p className="text-sm font-bold text-indigo-600 mt-2 bg-indigo-50 rounded-lg px-3 py-2 inline-block">{experiment.formula}</p>}
        </div>
      )}

      {/* Safety + Materials */}
      <div className="grid grid-cols-2 gap-3">
        {experiment.materials?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Materials</p>
            <div className="space-y-1">{experiment.materials.map((m, i) => (
              <p key={i} className="text-[12px] text-gray-600 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" />{m}</p>
            ))}</div>
          </div>
        )}
        {experiment.safety_notes?.length > 0 && (
          <div className="bg-amber-50/60 rounded-xl border border-amber-100/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1"><AlertTriangle size={10} /> Safety</p>
            <div className="space-y-1">{experiment.safety_notes.map((n, i) => (
              <p key={i} className="text-[12px] text-amber-700">{n}</p>
            ))}</div>
          </div>
        )}
      </div>

      {/* Interactive Controls */}
      {experiment.interactive_elements?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1"><Zap size={10} className="text-blue-500" /> Controls</p>
          <div className="space-y-3">{experiment.interactive_elements.map((el, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700">{el.label}</span>
                <span className="text-xs font-bold text-indigo-600">{sliderValues[i] ?? el.default} {el.unit || ''}</span>
              </div>
              {el.type === 'slider' ? (
                <input type="range" min={el.min || 0} max={el.max || 100} value={sliderValues[i] ?? el.default}
                  onChange={e => setSliderValues(prev => ({ ...prev, [i]: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              ) : null}
              <p className="text-[10px] text-gray-400 mt-1">{el.effect}</p>
            </div>
          ))}</div>
        </div>
      )}

      {/* Steps */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5"><Play size={10} className="text-emerald-500" /> Procedure</p>
        <div className="space-y-3">{(experiment.steps || []).map((step, i) => {
          const done = completedSteps.has(i);
          const active = currentStep === i;
          return (
            <div key={i} className={`rounded-xl p-4 border transition-all ${active ? 'border-indigo-300 bg-indigo-50/30 shadow-sm' : done ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => completeStep(i)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? <CheckCircle size={14} /> : step.step_number || i + 1}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-1">{step.instruction}</p>
                  {active && (
                    <div className="mt-2 space-y-2 animate-fade-in">
                      {step.action && <p className="text-[11px] text-blue-600 bg-blue-50 rounded-lg px-3 py-2">🔬 {step.action}</p>}
                      {step.observation && <p className="text-[11px] text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">👁️ {step.observation}</p>}
                      {step.explanation && <p className="text-[11px] text-purple-600 bg-purple-50 rounded-lg px-3 py-2">💡 {step.explanation}</p>}
                      {!done && <button onClick={() => completeStep(i)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"><CheckCircle size={12} /> Mark Complete</button>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}</div>
      </div>

      {/* Results + Quiz */}
      {experiment.expected_results && completedSteps.size >= (experiment.steps?.length || 1) && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50 p-5 animate-fade-in">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">🎉 Experiment Complete!</p>
          <p className="text-sm text-gray-700 mb-2"><strong>Result:</strong> {experiment.expected_results.observation}</p>
          <p className="text-sm text-gray-700"><strong>Conclusion:</strong> {experiment.expected_results.conclusion}</p>
          {experiment.real_world_application && <p className="text-xs text-teal-600 mt-3 bg-teal-50 rounded-lg px-3 py-2">🌍 Real-world: {experiment.real_world_application}</p>}
          {experiment.ncert_reference && <p className="text-[10px] text-gray-400 mt-2">📖 NCERT: {experiment.ncert_reference}</p>}
        </div>
      )}

      {/* Mini quiz */}
      {experiment.quiz_questions?.length > 0 && completedSteps.size >= (experiment.steps?.length || 1) && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">Test Your Understanding</p>
          {experiment.quiz_questions.map((q, qi) => (
            <div key={qi} className="mb-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">{q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {(q.options || []).map((opt, oi) => {
                  const answered = quizAnswers[qi] !== undefined;
                  const selected = quizAnswers[qi] === oi;
                  const correct = oi === q.correct;
                  let style = 'bg-gray-50 border-gray-200 text-gray-700 hover:border-indigo-300';
                  if (answered && correct) style = 'bg-emerald-100 border-emerald-400 text-emerald-800';
                  else if (answered && selected && !correct) style = 'bg-red-100 border-red-400 text-red-800';
                  return <button key={oi} onClick={() => !answered && setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${style}`}>{opt}</button>;
                })}
              </div>
              {quizAnswers[qi] !== undefined && <p className="text-[11px] text-blue-600 mt-2">{q.explanation}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
