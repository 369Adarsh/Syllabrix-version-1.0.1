'use client';
import { useEffect, useState } from 'react';
import { jeeAPI } from '@/lib/api/jee.api';
import { useJee } from './layout';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  ClipboardList, Flame, Target, TrendingUp,
  CheckCircle2, Circle, ArrowRight, Calendar
} from 'lucide-react';

const SUBJECT_CONFIG = {
  physics:     { color: '#378ADD', bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   icon: '⚛️' },
  chemistry:   { color: '#0F6E56', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: '🧪' },
  mathematics: { color: '#534AB7', bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  icon: '📐' },
};

function SubjectProgressCard({ subject, progress }) {
  const cfg = SUBJECT_CONFIG[subject.slug] || SUBJECT_CONFIG.physics;
  const studied = progress.filter(p => p.subject_slug === subject.slug && p.mastery_level !== 'not_started').length;
  const total = progress.filter(p => p.subject_slug === subject.slug).length;
  const pct = total > 0 ? Math.round((studied / total) * 100) : 0;

  return (
    <Link href={`/jee-command/syllabus?subject=${subject.slug}`}
      className={`block rounded-xl border p-4 hover:shadow-md transition-all ${cfg.bg} ${cfg.border}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xl">{cfg.icon}</span>
          <h3 className={`text-[14px] font-bold mt-1 ${cfg.text}`}>{subject.name}</h3>
        </div>
        <span className={`text-[22px] font-extrabold ${cfg.text}`}>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
      </div>
      <p className="text-[11px] text-gray-500">{studied} / {total} chapters studied</p>
    </Link>
  );
}

function StudyPlanWidget({ plan, onComplete }) {
  if (!plan) return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <Calendar size={22} className="text-gray-300 mx-auto mb-2" />
      <p className="text-[13px] text-gray-500">No study plan yet</p>
      <Link href="/jee-command/study-plan" className="text-[12px] text-blue-500 font-medium">Generate plan →</Link>
    </div>
  );
  const tasks = typeof plan.tasks === 'string' ? JSON.parse(plan.tasks || '[]') : (plan.tasks || []);
  const done = tasks.filter(t => t.completed).length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-blue-500" />
          <p className="text-[13px] font-semibold text-gray-700">Today's Plan</p>
        </div>
        <span className="text-[11px] text-gray-400">{done}/{tasks.length} tasks</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-2">
        {tasks.slice(0, 4).map((task, i) => (
          <div key={i} className="flex items-center gap-2">
            <button onClick={() => onComplete(i)} className="flex-shrink-0">
              {task.completed
                ? <CheckCircle2 size={15} className="text-emerald-500" />
                : <Circle size={15} className="text-gray-300 hover:text-blue-400 transition-colors" />}
            </button>
            <span className={`text-[12px] flex-1 truncate ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              <span className="font-medium">{task.subject}</span> · {task.chapter}
            </span>
            <span className="text-[10px] text-gray-400 flex-shrink-0">{task.duration_min}m</span>
          </div>
        ))}
        {tasks.length > 4 && (
          <Link href="/jee-command/study-plan" className="text-[11px] text-blue-500 font-medium block mt-1">
            +{tasks.length - 4} more tasks →
          </Link>
        )}
      </div>
    </div>
  );
}

export default function JeeCommandDashboard() {
  const { user } = useAuth();
  const { selectedClass, examType } = useJee();
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState([]);
  const [overview, setOverview] = useState(null);
  const [mocks, setMocks] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    Promise.allSettled([
      jeeAPI.getSubjects(),
      jeeAPI.getProgressOverview(),
      jeeAPI.getAnalyticsOverview(),
      jeeAPI.getMocks({ type: 'full_mock', exam: examType, limit: 3 }),
      jeeAPI.getTodayPlan(),
    ]).then(([subR, progR, ovR, mockR, planR]) => {
      if (subR.status === 'fulfilled' && subR.value.data?.success) {
        setSubjects(subR.value.data.data || []);
      }
      if (progR.status === 'fulfilled' && progR.value.data?.success) {
        setProgress(progR.value.data.data || []);
      }
      if (ovR.status === 'fulfilled' && ovR.value.data?.success) {
        setOverview(ovR.value.data.data);
      }
      if (mockR.status === 'fulfilled' && mockR.value.data?.success) {
        setMocks(mockR.value.data.data || []);
      }
      if (planR.status === 'fulfilled' && planR.value.data?.success) {
        setPlan(planR.value.data.data);
      }
    }).catch(err => {
      console.error('[JEE] Failed to load dashboard data:', err);
    }).finally(() => setLoading(false));
  }, [examType, user]);

  const handleCompleteTask = async (taskIndex) => {
    if (!plan) return;
    try {
      await jeeAPI.completeTask(plan.id, taskIndex);
      const tasks = typeof plan.tasks === 'string' ? JSON.parse(plan.tasks || '[]') : (plan.tasks || []);
      tasks[taskIndex] = { ...tasks[taskIndex], completed: true };
      setPlan({ ...plan, tasks: JSON.stringify(tasks) });
    } catch {}
  };

  const firstName = user?.profile?.full_name?.split(' ')[0] || user?.username || 'JEE Warrior';

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #042C53, #185FA5)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-bold leading-tight">Ready to crack JEE, {firstName}? 🚀</h1>
            {overview && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <span className="flex items-center gap-1 text-[12px] text-blue-200">
                  <Target size={12} /> {overview.syllabus_percent}% syllabus covered
                </span>
                <span className="flex items-center gap-1 text-[12px] text-blue-200">
                  <ClipboardList size={12} /> {overview.mock_tests_taken} mocks taken
                </span>
                {overview.mock_avg_score > 0 && (
                  <span className="flex items-center gap-1 text-[12px] text-blue-200">
                    <TrendingUp size={12} /> Avg: {overview.mock_avg_score}%
                  </span>
                )}
                {overview.streak > 0 && (
                  <span className="flex items-center gap-1 text-[12px] text-yellow-300 font-semibold">
                    <Flame size={12} className="text-orange-400" /> {overview.streak}-day streak
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: 'PYQ Practice', href: '/jee-command/pyq', color: 'bg-white/10 hover:bg-white/20' },
            { label: 'Take Mock Test', href: '/jee-command/mock-tests', color: 'bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-200' },
            { label: 'AI Doubt Solver', href: '/jee-command/ai-tutor', color: 'bg-white/10 hover:bg-white/20' },
            { label: 'Formula Sheets', href: '/jee-command/formula-sheets', color: 'bg-white/10 hover:bg-white/20' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium text-white transition-colors ${a.color}`}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Subject Progress */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[13px] font-bold text-gray-700">Subject Progress</h2>
          <Link href="/jee-command/analytics" className="text-[11px] text-blue-500 font-medium">Full analytics →</Link>
        </div>
        {subjects.length === 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {['Physics','Chemistry','Mathematics'].map(s => (
              <div key={s} className="bg-gray-50 rounded-xl border border-gray-100 p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {subjects.map(s => <SubjectProgressCard key={s.id} subject={s} progress={progress} />)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Study Plan */}
        <StudyPlanWidget plan={plan} onComplete={handleCompleteTask} />

        {/* Recent Mock Tests */}
        <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList size={14} className="text-indigo-500" />
              <p className="text-[13px] font-semibold text-gray-700">Mock Tests</p>
            </div>
            <Link href="/jee-command/mock-tests" className="text-[11px] text-blue-500 font-medium">See all →</Link>
          </div>
          {mocks.length === 0 ? (
            <div className="text-center py-4">
              <ClipboardList size={22} className="text-gray-300 mx-auto mb-2" />
              <p className="text-[12px] text-gray-400">No mock tests yet</p>
              <Link href="/jee-command/mock-tests" className="text-[12px] text-blue-500 font-medium">Browse tests →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {mocks.slice(0, 3).map(m => (
                <Link key={m.id} href={`/jee-command/mock-tests/${m.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-700 truncate">{m.title}</p>
                    <p className="text-[10px] text-gray-400">{m.total_questions}Q · {m.duration_minutes}min · {m.difficulty_label}</p>
                  </div>
                  {m.last_score !== null ? (
                    <span className="text-[12px] font-bold text-emerald-600 flex-shrink-0 ml-2">{m.last_score}/{m.total_marks}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-blue-600 font-medium flex-shrink-0 ml-2">
                      Start <ArrowRight size={11} />
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
