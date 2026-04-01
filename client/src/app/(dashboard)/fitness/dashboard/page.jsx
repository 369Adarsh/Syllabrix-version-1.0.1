'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { fitnessAPI } from '@/lib/api/fitness.api';
import {
  Droplets, Moon, Footprints, Smile, Zap, Dumbbell, Utensils,
  Target, Flame, TrendingUp, ChevronRight, Sparkles, Loader2,
  ArrowRight, Heart, CheckCircle2, Plus, Brain
} from 'lucide-react';

// ─── Onboarding Modal ────────────────────────────────────────
const OnboardingWizard = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    age: '', gender: 'male', height_cm: '', weight_kg: '',
    goal: 'general_fitness', fitness_level: 'beginner', activity_level: 'sedentary',
    dietary_preference: 'non_veg', allergies: '', injuries: '',
    available_time_min: 30, available_equipment: ['bodyweight'],
    preferred_styles: [], sleep_hours: 7, water_intake_goal_ml: 2500,
    target_weight_kg: '',
  });
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fitnessAPI.saveProfile(form);
      onComplete();
    } catch (e) {
      console.error(e);
    } finally { setSaving(false); }
  };

  const goals = [
    { value: 'fat_loss', label: '🔥 Fat Loss', desc: 'Burn fat, get lean' },
    { value: 'muscle_gain', label: '💪 Muscle Gain', desc: 'Build strength & size' },
    { value: 'general_fitness', label: '🏃 General Fitness', desc: 'Stay fit & healthy' },
    { value: 'flexibility', label: '🧘 Flexibility', desc: 'Improve mobility' },
    { value: 'yoga', label: '🧘‍♀️ Yoga', desc: 'Mind-body harmony' },
    { value: 'stamina', label: '⚡ Stamina', desc: 'Build endurance' },
    { value: 'recovery', label: '🩹 Recovery', desc: 'Heal & restore' },
  ];

  const equipmentOptions = ['bodyweight', 'dumbbells', 'barbell', 'resistance_bands', 'pull_up_bar', 'kettlebell', 'yoga_mat', 'treadmill', 'gym_full'];
  const styleOptions = ['strength', 'cardio', 'yoga', 'hiit', 'pilates', 'calisthenics', 'mobility', 'stretching'];

  const toggleArrayField = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const steps = [
    // Step 0: Basic Info
    <div key="basic" className="space-y-4">
      <h2 className="text-[18px] font-extrabold text-gray-800">Let&apos;s get to know you</h2>
      <p className="text-[13px] text-gray-500">This helps us personalize your fitness journey</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Age</label>
          <input type="number" value={form.age} onChange={e => updateField('age', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="25" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Gender</label>
          <select value={form.gender} onChange={e => updateField('gender', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Height (cm)</label>
          <input type="number" value={form.height_cm} onChange={e => updateField('height_cm', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="170" />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Weight (kg)</label>
          <input type="number" value={form.weight_kg} onChange={e => updateField('weight_kg', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="70" />
        </div>
      </div>
    </div>,

    // Step 1: Goal
    <div key="goal" className="space-y-4">
      <h2 className="text-[18px] font-extrabold text-gray-800">What&apos;s your fitness goal?</h2>
      <div className="grid grid-cols-1 gap-2">
        {goals.map(g => (
          <button key={g.value} onClick={() => updateField('goal', g.value)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
              form.goal === g.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <span className="text-[20px]">{g.label.split(' ')[0]}</span>
            <div>
              <p className="text-[13px] font-bold text-gray-800">{g.label.split(' ').slice(1).join(' ')}</p>
              <p className="text-[11px] text-gray-500">{g.desc}</p>
            </div>
            {form.goal === g.value && <CheckCircle2 size={18} className="ml-auto text-emerald-500" />}
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Fitness Level & Activity
    <div key="level" className="space-y-4">
      <h2 className="text-[18px] font-extrabold text-gray-800">Your current fitness level</h2>
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Fitness Level</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {['beginner', 'intermediate', 'advanced'].map(l => (
              <button key={l} onClick={() => updateField('fitness_level', l)}
                className={`py-2 px-3 rounded-lg text-[12px] font-semibold capitalize border-2 transition-all ${
                  form.fitness_level === l ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Activity Level</label>
          <select value={form.activity_level} onChange={e => updateField('activity_level', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
            <option value="sedentary">Sedentary (desk job)</option>
            <option value="lightly_active">Lightly Active (1-2 days/week)</option>
            <option value="moderately_active">Moderately Active (3-5 days/week)</option>
            <option value="very_active">Very Active (6-7 days/week)</option>
            <option value="extremely_active">Extremely Active (athlete)</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Dietary Preference</label>
          <select value={form.dietary_preference} onChange={e => updateField('dietary_preference', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
            <option value="non_veg">Non-Vegetarian</option>
            <option value="veg">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Workout Time (min/day)</label>
            <input type="number" value={form.available_time_min} onChange={e => updateField('available_time_min', parseInt(e.target.value) || 30)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Sleep (hrs/night)</label>
            <input type="number" step="0.5" value={form.sleep_hours} onChange={e => updateField('sleep_hours', parseFloat(e.target.value) || 7)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>
      </div>
    </div>,

    // Step 3: Equipment & Health
    <div key="equipment" className="space-y-4">
      <h2 className="text-[18px] font-extrabold text-gray-800">Equipment & Health Info</h2>
      <div>
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Available Equipment</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {equipmentOptions.map(eq => (
            <button key={eq} onClick={() => toggleArrayField('available_equipment', eq)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize border transition-all ${
                form.available_equipment.includes(eq) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}>{eq.replace(/_/g, ' ')}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Preferred Workout Styles</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {styleOptions.map(s => (
            <button key={s} onClick={() => toggleArrayField('preferred_styles', s)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize border transition-all ${
                form.preferred_styles.includes(s) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Allergies (if any)</label>
        <input type="text" value={form.allergies} onChange={e => updateField('allergies', e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. peanut, lactose" />
      </div>
      <div>
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Injuries / Medical Notes</label>
        <textarea value={form.injuries} onChange={e => updateField('injuries', e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-emerald-500 outline-none resize-none" rows={2} placeholder="e.g. knee pain, back issue" />
      </div>
    </div>,
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 p-6 max-w-[520px] mx-auto">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
        ))}
      </div>
      {steps[step]}
      <div className="flex justify-between mt-6">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Back</button>
        )}
        <div className="ml-auto">
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-5 py-2 rounded-lg text-[13px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              Next <ChevronRight size={14} className="inline ml-1" />
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 rounded-lg text-[13px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────

export default function FitnessDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkinForm, setCheckinForm] = useState({ water_ml: 0, sleep_hours: 7, steps: 0, mood: 'okay', energy_level: 5 });

  const loadDashboard = async () => {
    try {
      const profile = await fitnessAPI.getProfile();
      if (!profile.data?.data?.onboarding_complete) {
        setShowOnboarding(true);
        setLoading(false);
        return;
      }
      const res = await fitnessAPI.getDashboard();
      setData(res.data?.data);
    } catch (e) {
      setShowOnboarding(true);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleCheckin = async () => {
    try {
      await fitnessAPI.checkIn(checkinForm);
      loadDashboard();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-emerald-500" />
    </div>
  );

  if (showOnboarding) return (
    <div className="py-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
          <Heart size={28} className="text-white" />
        </div>
        <h1 className="text-[20px] font-extrabold text-gray-800">Setup Your Fitness Profile</h1>
        <p className="text-[13px] text-gray-500 mt-1">This takes 2 minutes and helps us build your perfect plan</p>
      </div>
      <OnboardingWizard onComplete={() => { setShowOnboarding(false); loadDashboard(); }} />
    </div>
  );

  const d = data || {};
  const profile = d.profile || {};
  const checkin = d.checkin;
  const motivation = d.motivation;
  const todayWorkout = d.todayWorkout;
  const dietPlan = d.dietPlan;
  const habits = d.habits || [];
  const stats = d.stats || {};

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Greeting + Motivation */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[18px] font-extrabold mb-1">
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {user?.username}! 💪
            </h1>
            <p className="text-[13px] text-emerald-100">{motivation?.message || 'Ready to crush your fitness goals today?'}</p>
            {motivation?.tip && <p className="text-[12px] text-emerald-200 mt-1">💡 {motivation.tip}</p>}
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
            <Flame size={16} className="text-orange-300" />
            <span className="text-[14px] font-extrabold">{stats.totalHabitStreak || 0}</span>
            <span className="text-[10px] text-emerald-200">streak</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Check-in */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
            <h3 className="text-[14px] font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500" /> Daily Check-in
            </h3>
            {checkin ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { icon: Droplets, label: 'Water', value: `${checkin.water_ml || 0}ml`, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: Moon, label: 'Sleep', value: `${checkin.sleep_hours || 0}h`, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { icon: Footprints, label: 'Steps', value: checkin.steps || 0, color: 'text-green-500', bg: 'bg-green-50' },
                  { icon: Smile, label: 'Mood', value: checkin.mood || 'okay', color: 'text-amber-500', bg: 'bg-amber-50' },
                  { icon: Zap, label: 'Energy', value: `${checkin.energy_level || 5}/10`, color: 'text-orange-500', bg: 'bg-orange-50' },
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} rounded-lg p-2.5 text-center`}>
                    <item.icon size={16} className={`${item.color} mx-auto mb-1`} />
                    <p className="text-[13px] font-bold text-gray-800 capitalize">{item.value}</p>
                    <p className="text-[10px] text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Water (ml)</label>
                    <input type="number" value={checkinForm.water_ml} onChange={e => setCheckinForm(f => ({ ...f, water_ml: parseInt(e.target.value) || 0 }))}
                      className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-gray-200 text-[12px]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Sleep (hrs)</label>
                    <input type="number" step="0.5" value={checkinForm.sleep_hours} onChange={e => setCheckinForm(f => ({ ...f, sleep_hours: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-gray-200 text-[12px]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Steps</label>
                    <input type="number" value={checkinForm.steps} onChange={e => setCheckinForm(f => ({ ...f, steps: parseInt(e.target.value) || 0 }))}
                      className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-gray-200 text-[12px]" />
                  </div>
                </div>
                <button onClick={handleCheckin} className="w-full py-2 rounded-lg bg-emerald-600 text-white text-[12px] font-bold hover:bg-emerald-700 transition-colors">
                  Save Check-in
                </button>
              </div>
            )}
          </motion.div>

          {/* Today's Workout */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                <Dumbbell size={16} className="text-orange-500" /> Today&apos;s Workout
              </h3>
              <Link href="/fitness/workouts" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            {todayWorkout ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-orange-50 rounded-lg p-3">
                  <div>
                    <p className="text-[13px] font-bold text-gray-800">{todayWorkout.focus || todayWorkout.day_name || 'Workout Day'}</p>
                    <p className="text-[11px] text-gray-500">{todayWorkout.day_type} • ~{todayWorkout.est_duration_min || 45} min</p>
                  </div>
                  {todayWorkout.is_completed ? (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">✅ Done</span>
                  ) : (
                    <Link href="/fitness/workouts" className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[11px] font-bold hover:bg-orange-600 transition-colors">
                      Start
                    </Link>
                  )}
                </div>
                {todayWorkout.exercises?.slice(0, 3).map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 px-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">{i + 1}</div>
                    <span className="text-[12px] text-gray-700 flex-1">{ex.exercise_name}</span>
                    <span className="text-[10px] text-gray-400">{ex.sets}×{ex.reps}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Dumbbell size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-[12px] text-gray-500 mb-3">No workout plan yet</p>
                <Link href="/fitness/workouts" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-500 text-white text-[12px] font-bold hover:bg-orange-600">
                  Generate Plan <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </motion.div>

          {/* Today's Diet */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                <Utensils size={16} className="text-green-500" /> Today&apos;s Diet
              </h3>
              <Link href="/fitness/diet" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">View Full Plan</Link>
            </div>
            {dietPlan ? (
              <div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'Calories', value: dietPlan.total_calories, color: 'text-red-500' },
                    { label: 'Protein', value: `${dietPlan.protein_g || 0}g`, color: 'text-blue-500' },
                    { label: 'Carbs', value: `${dietPlan.carbs_g || 0}g`, color: 'text-amber-500' },
                    { label: 'Fats', value: `${dietPlan.fats_g || 0}g`, color: 'text-purple-500' },
                  ].map((m, i) => (
                    <div key={i} className="text-center bg-gray-50 rounded-lg p-2">
                      <p className={`text-[14px] font-extrabold ${m.color}`}>{m.value}</p>
                      <p className="text-[9px] text-gray-400 font-medium">{m.label}</p>
                    </div>
                  ))}
                </div>
                {dietPlan.meals?.slice(0, 4).map((meal, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-t border-gray-100 first:border-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase w-16">{meal.meal_type.replace(/_/g, ' ')}</span>
                    <span className="text-[12px] text-gray-700 flex-1">{meal.meal_name}</span>
                    <span className="text-[10px] text-gray-400">{meal.calories} cal</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Utensils size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-[12px] text-gray-500 mb-3">No diet plan for today</p>
                <Link href="/fitness/diet" className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-green-500 text-white text-[12px] font-bold hover:bg-green-600">
                  Generate Plan <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Profile Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
            <h3 className="text-[13px] font-bold text-gray-800 mb-3">Your Stats</h3>
            <div className="space-y-2">
              {[
                { label: 'BMI', value: profile.bmi || '—' },
                { label: 'Goal', value: (profile.goal || '').replace(/_/g, ' ') },
                { label: 'Level', value: profile.fitness_level || '—' },
                { label: 'TDEE', value: profile.tdee ? `${profile.tdee} cal` : '—' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                  <span className="text-[11px] text-gray-500">{s.label}</span>
                  <span className="text-[12px] font-bold text-gray-700 capitalize">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Habits */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
                <Target size={14} className="text-purple-500" /> Habits
              </h3>
              <Link href="/fitness/habits" className="text-[10px] font-semibold text-blue-600">Manage</Link>
            </div>
            {habits.length > 0 ? (
              <div className="space-y-2">
                {habits.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[14px]">{h.icon || '🎯'}</span>
                    <span className="text-[12px] text-gray-700 flex-1">{h.name}</span>
                    {h.completed_today ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className="text-[10px] text-gray-400">{h.current_streak}🔥</span>
                  </div>
                ))}
              </div>
            ) : (
              <Link href="/fitness/habits" className="block text-center py-3">
                <Plus size={16} className="text-gray-400 mx-auto mb-1" />
                <p className="text-[11px] text-gray-500">Add habits to track</p>
              </Link>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
            <h3 className="text-[13px] font-bold text-gray-800 mb-3">Quick Access</h3>
            <div className="space-y-1">
              {[
                { href: '/fitness/ai-coach', icon: Brain, label: 'AI Coach', color: 'text-emerald-500' },
                { href: '/fitness/exercises', icon: Zap, label: 'Exercises', color: 'text-amber-500' },
                { href: '/fitness/articles', icon: TrendingUp, label: 'Articles', color: 'text-blue-500' },
                { href: '/fitness/coaches', icon: Heart, label: 'Coaches', color: 'text-rose-500' },
              ].map((link, i) => (
                <Link key={i} href={link.href}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#F0F2F5] transition-colors group">
                  <link.icon size={15} className={link.color} />
                  <span className="text-[12px] font-medium text-gray-700 group-hover:text-gray-900">{link.label}</span>
                  <ChevronRight size={12} className="ml-auto text-gray-300" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
