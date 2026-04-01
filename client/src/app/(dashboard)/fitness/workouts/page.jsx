'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Dumbbell, Loader2, ChevronDown, ChevronRight, CheckCircle2, Clock, Sparkles, Plus, ArrowRight, Zap } from 'lucide-react';

export default function WorkoutsPage() {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);

  const loadData = async () => {
    try {
      const res = await fitnessAPI.getWorkouts();
      const data = res.data?.data || [];
      setPlans(data);
      const active = data.find(p => p.status === 'active');
      if (active) {
        const detail = await fitnessAPI.getWorkoutDetail(active.id);
        setActivePlan(detail.data?.data);
      }
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fitnessAPI.generateWorkout();
      setActivePlan(res.data?.data);
      loadData();
    } catch (e) {
      alert('Failed to generate workout. Make sure your profile is complete.');
    } finally { setGenerating(false); }
  };

  const handleComplete = async (dayId) => {
    try {
      await fitnessAPI.completeWorkout(dayId);
      loadData();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-orange-500" /></div>;

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
            <Dumbbell size={22} className="text-orange-500" /> Workout Planner
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">AI-powered workout plans tailored to your goals</p>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-[12px] font-bold hover:shadow-lg transition-all disabled:opacity-50">
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {generating ? 'Generating...' : 'Generate New Plan'}
        </button>
      </motion.div>

      {/* Active Plan */}
      {activePlan ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 overflow-hidden mb-5">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
            <h2 className="text-[16px] font-extrabold">{activePlan.title || 'Your Workout Plan'}</h2>
            <p className="text-[12px] text-orange-100 mt-0.5">{activePlan.description || 'Custom AI-generated plan'}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-[11px] bg-white/20 rounded-full px-2 py-0.5">{activePlan.difficulty}</span>
              <span className="text-[11px] bg-white/20 rounded-full px-2 py-0.5">{activePlan.days_per_week} days/week</span>
              <span className="text-[11px] bg-white/20 rounded-full px-2 py-0.5">{activePlan.duration_weeks} weeks</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {activePlan.days?.map((day, i) => (
              <div key={day.id || i}>
                <button
                  onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-bold ${
                      day.is_completed ? 'bg-green-100 text-green-600' :
                      day.day_type === 'rest' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {day.is_completed ? <CheckCircle2 size={18} /> : `D${day.day_number}`}
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-bold text-gray-800">{day.day_name || `Day ${day.day_number}`}</p>
                      <p className="text-[11px] text-gray-500">{day.focus || day.day_type} • {day.est_duration_min} min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!day.is_completed && day.day_type === 'workout' && (
                      <button onClick={(e) => { e.stopPropagation(); handleComplete(day.id); }}
                        className="px-3 py-1 rounded-lg bg-green-500 text-white text-[10px] font-bold hover:bg-green-600">Done</button>
                    )}
                    {expandedDay === day.id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  </div>
                </button>
                {expandedDay === day.id && day.exercises && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="bg-gray-50 px-4 pb-4">
                    <div className="space-y-2">
                      {day.exercises.map((ex, j) => (
                        <div key={j} className={`bg-white rounded-lg p-3 border ${
                          ex.phase === 'warmup' ? 'border-yellow-200' : ex.phase === 'cooldown' ? 'border-blue-200' : 'border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                ex.phase === 'warmup' ? 'text-yellow-600' : ex.phase === 'cooldown' ? 'text-blue-600' : 'text-orange-600'
                              }`}>{ex.phase}</span>
                              <p className="text-[13px] font-bold text-gray-800">{ex.exercise_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[12px] font-bold text-gray-700">
                                {ex.duration_sec ? `${ex.duration_sec}s` : `${ex.sets} × ${ex.reps}`}
                              </p>
                              <p className="text-[10px] text-gray-400">Rest: {ex.rest_sec}s</p>
                            </div>
                          </div>
                          {ex.target_muscles && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(typeof ex.target_muscles === 'string' ? JSON.parse(ex.target_muscles) : ex.target_muscles)?.map((m, k) => (
                                <span key={k} className="px-2 py-0.5 rounded-full bg-gray-100 text-[9px] font-medium text-gray-600 capitalize">{m}</span>
                              ))}
                            </div>
                          )}
                          {ex.precautions && <p className="text-[10px] text-red-400 mt-1">⚠️ {ex.precautions}</p>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
            <Dumbbell size={28} className="text-orange-400" />
          </div>
          <h2 className="text-[16px] font-bold text-gray-800 mb-1">No Workout Plans Yet</h2>
          <p className="text-[13px] text-gray-500 mb-4">Generate an AI-powered workout plan based on your profile</p>
          <button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-[13px] font-bold hover:bg-orange-600 disabled:opacity-50">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? 'Generating...' : 'Generate My Plan'}
          </button>
        </motion.div>
      )}

      {/* Past Plans */}
      {plans.length > 1 && (
        <div className="mt-5">
          <h3 className="text-[14px] font-bold text-gray-800 mb-3">Previous Plans</h3>
          <div className="space-y-2">
            {plans.filter(p => p.status !== 'active').slice(0, 5).map((plan, i) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200/60 p-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-gray-700">{plan.title}</p>
                  <p className="text-[11px] text-gray-400">{plan.difficulty} • {plan.status}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  plan.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>{plan.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
