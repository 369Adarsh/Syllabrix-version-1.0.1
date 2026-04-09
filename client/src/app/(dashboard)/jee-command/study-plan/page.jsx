'use client';
import { useEffect, useState } from 'react';
import { jeeAPI } from '@/lib/api/jee.api';
import { useJee } from '../layout';
import {
  Calendar, CheckCircle2, Circle, Clock, Loader2, Sparkles,
  BookOpen, ClipboardList, RotateCcw, Flame, ChevronLeft, ChevronRight,
  AlertCircle, Zap
} from 'lucide-react';

const TYPE_CONFIG = {
  theory:   { icon: BookOpen,      color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'Theory'   },
  practice: { icon: ClipboardList, color: 'text-violet-600', bg: 'bg-violet-50', label: 'Practice' },
  revision: { icon: RotateCcw,     color: 'text-amber-600',  bg: 'bg-amber-50',  label: 'Revision' },
  test:     { icon: Zap,           color: 'text-red-600',    bg: 'bg-red-50',    label: 'Test'     },
};

const SUBJECT_COLORS = {
  Physics:     'text-blue-700 bg-blue-50',
  Chemistry:   'text-emerald-700 bg-emerald-50',
  Mathematics: 'text-violet-700 bg-violet-50',
};

function TaskRow({ task, index, onToggle }) {
  const tc = TYPE_CONFIG[task.type] || TYPE_CONFIG.theory;
  const TypeIcon = tc.icon;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      task.completed ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
    }`}>
      <button onClick={() => onToggle(index)} className="flex-shrink-0">
        {task.completed
          ? <CheckCircle2 size={20} className="text-emerald-500" />
          : <Circle size={20} className="text-gray-300 hover:text-blue-400 transition-colors" />}
      </button>

      <div className={`w-7 h-7 rounded-lg ${tc.bg} flex items-center justify-center flex-shrink-0`}>
        <TypeIcon size={13} className={tc.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SUBJECT_COLORS[task.subject] || 'text-gray-600 bg-gray-100'}`}>
            {task.subject}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tc.bg} ${tc.color}`}>{tc.label}</span>
        </div>
        <p className={`text-[13px] font-medium mt-0.5 truncate ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
          {task.chapter}
        </p>
        {task.topic && <p className="text-[11px] text-gray-400 truncate">{task.topic}</p>}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 flex-shrink-0">
        <Clock size={11} />
        {task.duration_min}m
      </div>
    </div>
  );
}

function ProgressRing({ pct, size = 60, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#3b82f6';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  );
}

export default function StudyPlanPage() {
  const { selectedClass, examType } = useJee();
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadPlan();
    jeeAPI.getStudyPlanHistory()
      .then(r => setHistory(r.data?.data || []))
      .catch(() => {});
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const r = await jeeAPI.getTodayPlan();
      setPlan(r.data?.data);
    } catch {}
    finally { setLoading(false); }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const r = await jeeAPI.generateStudyPlan({ date: viewDate, class_level: selectedClass, exam_type: examType });
      setPlan(r.data?.data);
    } catch {}
    finally { setGenerating(false); }
  };

  const toggleTask = async (index) => {
    if (!plan) return;
    try {
      await jeeAPI.completeTask(plan.id, index);
      const tasks = typeof plan.tasks === 'string' ? JSON.parse(plan.tasks) : [...plan.tasks];
      tasks[index] = { ...tasks[index], completed: !tasks[index].completed };
      setPlan({ ...plan, tasks: JSON.stringify(tasks) });
    } catch {}
  };

  const tasks = plan ? (typeof plan.tasks === 'string' ? JSON.parse(plan.tasks || '[]') : plan.tasks || []) : [];
  const done = tasks.filter(t => t.completed).length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  const totalMinutes = tasks.reduce((s, t) => s + (t.duration_min || 0), 0);
  const doneMinutes = tasks.filter(t => t.completed).reduce((s, t) => s + (t.duration_min || 0), 0);

  const bySubject = tasks.reduce((acc, t) => {
    if (!acc[t.subject]) acc[t.subject] = { total: 0, done: 0 };
    acc[t.subject].total++;
    if (t.completed) acc[t.subject].done++;
    return acc;
  }, {});

  const isToday = viewDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Date navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <button onClick={() => {
          const d = new Date(viewDate);
          d.setDate(d.getDate() - 1);
          setViewDate(d.toISOString().split('T')[0]);
        }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-blue-500" />
          <span className="text-[13px] font-semibold text-gray-700">
            {isToday ? "Today's Plan" : new Date(viewDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
          {isToday && <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">Today</span>}
        </div>
        <button onClick={() => {
          const d = new Date(viewDate);
          const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
          if (d < tomorrow) { d.setDate(d.getDate() + 1); setViewDate(d.toISOString().split('T')[0]); }
        }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border" />)}</div>
      ) : !plan ? (
        /* No plan state */
        <div className="text-center py-14 bg-white rounded-xl border border-gray-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-blue-600" />
          </div>
          <h3 className="text-[15px] font-bold text-gray-700 mb-1">No plan for today</h3>
          <p className="text-[12px] text-gray-400 mb-5 max-w-xs mx-auto">
            Generate an AI-personalized study plan based on your weak areas and JEE syllabus coverage.
          </p>
          <button onClick={generate} disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-60">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generate AI Study Plan
          </button>
        </div>
      ) : (
        <>
          {/* Progress overview */}
          <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <ProgressRing pct={pct} size={72} stroke={7} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[14px] font-extrabold text-gray-800">{pct}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-gray-800">{done}/{tasks.length} tasks done</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{doneMinutes}/{totalMinutes} minutes completed</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(bySubject).map(([subj, s]) => (
                    <span key={subj} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${SUBJECT_COLORS[subj] || 'text-gray-600 bg-gray-100'}`}>
                      {subj}: {s.done}/{s.total}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={generate} disabled={generating}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-medium hover:bg-gray-200 transition-colors disabled:opacity-60">
                {generating ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                Regenerate
              </button>
            </div>

            {pct === 100 && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                <Flame size={15} className="text-orange-500" />
                <p className="text-[12px] text-emerald-700 font-medium">All tasks complete! Great work today 🎉</p>
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <TaskRow key={i} task={task} index={i} onToggle={toggleTask} />
            ))}
          </div>
        </>
      )}

      {/* Past plans / history */}
      {history.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-[12px] font-semibold text-gray-700 mb-3">Past Study Plans</p>
          <div className="space-y-2">
            {history.slice(0, 7).map(h => {
              const hTasks = typeof h.tasks === 'string' ? JSON.parse(h.tasks || '[]') : h.tasks || [];
              const hDone = hTasks.filter(t => t.completed).length;
              const hPct = hTasks.length > 0 ? Math.round((hDone / hTasks.length) * 100) : 0;
              return (
                <div key={h.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                  <span className="text-[12px] text-gray-600 flex-1">
                    {new Date(h.plan_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${hPct}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-500">{hDone}/{hTasks.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={14} className="text-indigo-600" />
          <p className="text-[12px] font-semibold text-indigo-800">Study tips</p>
        </div>
        <ul className="space-y-1">
          {[
            'Use Pomodoro: 45 min study + 15 min break',
            'Theory first, then practice immediately',
            'Mark difficult questions for mock test practice',
            'Revise previous day\'s topics before starting new ones',
          ].map((tip, i) => (
            <li key={i} className="text-[11px] text-indigo-700 flex items-start gap-1.5">
              <span className="text-indigo-400 flex-shrink-0 mt-0.5">•</span> {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
