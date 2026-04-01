'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Target, Loader2, CheckCircle2, Plus, Flame, Trophy, Droplets, Moon, Footprints, Apple, Sparkles, Brain } from 'lucide-react';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);

  const loadData = async () => {
    try {
      const [habitsRes, templatesRes] = await Promise.all([
        fitnessAPI.getUserHabits(),
        fitnessAPI.getHabitTemplates(),
      ]);
      setHabits(habitsRes.data?.data || []);
      setTemplates(templatesRes.data?.data || []);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleEnroll = async (templateId) => {
    try {
      await fitnessAPI.enrollHabit({ template_id: templateId });
      loadData();
      setShowTemplates(false);
    } catch (e) { console.error(e); }
  };

  const handleLog = async (habitId) => {
    try {
      await fitnessAPI.logHabit(habitId);
      loadData();
    } catch (e) { console.error(e); }
  };

  const habitIcons = {
    water: Droplets, sleep: Moon, walking: Footprints, stretching: Sparkles,
    meditation: Brain, yoga: Sparkles, no_junk: Apple, sugar_control: Apple,
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-purple-500" /></div>;

  return (
    <div className="max-w-[700px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
            <Target size={22} className="text-purple-500" /> Healthy Habits
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Build lasting habits with streak tracking</p>
        </div>
        <button onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-[12px] font-bold hover:bg-purple-700">
          <Plus size={14} /> Add Habit
        </button>
      </motion.div>

      {/* Add Habit Templates */}
      {showTemplates && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4 mb-4">
          <h3 className="text-[13px] font-bold text-gray-800 mb-3">Choose a Habit</h3>
          <div className="grid grid-cols-2 gap-2">
            {templates.filter(t => !habits.some(h => h.template_id === t.id)).map((t, i) => (
              <button key={t.id} onClick={() => handleEnroll(t.id)}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left">
                <span className="text-[18px]">{t.icon || '🎯'}</span>
                <div>
                  <p className="text-[12px] font-bold text-gray-800">{t.name}</p>
                  <p className="text-[10px] text-gray-500">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Active Habits */}
      {habits.length > 0 ? (
        <div className="space-y-3">
          {habits.map((habit, i) => {
            const Icon = habitIcons[habit.slug] || Target;
            return (
              <motion.div key={habit.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px]"
                      style={{ backgroundColor: (habit.color || '#3B82F6') + '15' }}>
                      {habit.icon || '🎯'}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-gray-800">{habit.name}</p>
                      <p className="text-[11px] text-gray-500">{habit.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Flame size={14} className="text-orange-500" />
                        <span className="text-[14px] font-extrabold text-gray-800">{habit.current_streak}</span>
                      </div>
                      <p className="text-[9px] text-gray-400">Best: {habit.longest_streak}</p>
                    </div>
                    {habit.completed_today ? (
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-green-500" />
                      </div>
                    ) : (
                      <button onClick={() => handleLog(habit.id)}
                        className="w-10 h-10 rounded-xl border-2 border-dashed border-purple-300 flex items-center justify-center hover:bg-purple-50 hover:border-purple-500 transition-all">
                        <Plus size={16} className="text-purple-400" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((habit.current_streak / 30) * 100, 100)}%`,
                      backgroundColor: habit.color || '#3B82F6'
                    }} />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">{habit.total_completed} total completions</p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
            <Target size={28} className="text-purple-400" />
          </div>
          <h2 className="text-[16px] font-bold text-gray-800 mb-1">Start Building Habits</h2>
          <p className="text-[13px] text-gray-500 mb-4">Choose from our habit templates and start tracking today</p>
          <button onClick={() => setShowTemplates(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-[13px] font-bold hover:bg-purple-700">
            <Plus size={14} /> Browse Habits
          </button>
        </motion.div>
      )}

      {/* Stats */}
      {habits.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: Trophy, label: 'Total Streaks', value: habits.reduce((s, h) => s + h.current_streak, 0), color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: CheckCircle2, label: 'Done Today', value: habits.filter(h => h.completed_today).length + '/' + habits.length, color: 'text-green-500', bg: 'bg-green-50' },
            { icon: Flame, label: 'Best Streak', value: Math.max(...habits.map(h => h.longest_streak), 0), color: 'text-red-500', bg: 'bg-red-50' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} rounded-xl p-3 text-center`}>
              <stat.icon size={18} className={`${stat.color} mx-auto mb-1`} />
              <p className="text-[16px] font-extrabold text-gray-800">{stat.value}</p>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
