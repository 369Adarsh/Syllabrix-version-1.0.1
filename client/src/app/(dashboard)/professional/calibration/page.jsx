'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { careerAPI } from '@/lib/api/career.api';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { 
  Sparkles, ShieldCheck, Zap, Heart, Target, 
  ArrowRight, ChevronLeft, Loader2, Award, 
  Brain, Star, CheckCircle2, TrendingUp,
  Briefcase, Activity, Rocket
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── UI Primitives ────────────────────────────────────────────────────────────

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm ${className}`}>
    {children}
  </div>
);

const Progress = ({ step, total }) => (
  <div className="mb-10">
    <div className="flex items-center justify-between mb-3 px-1">
      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
        Phase {step} of {total}
      </span>
      <span className="text-[10px] font-bold text-gray-400">
        {Math.round((step / total) * 100)}% Synchronized
      </span>
    </div>
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(step / total) * 100}%` }}
        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
      />
    </div>
  </div>
);

// ── Steps ────────────────────────────────────────────────────────────────────

const Step1Career = ({ data, update }) => {
  const industries = ['IT / Software', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Consulting'];
  const goals = [
    { label: 'Promotion', value: 'promotion' },
    { label: 'Switch Career', value: 'switch_career' },
    { label: 'Start Business', value: 'freelance' },
    { label: 'Learn Technology', value: 'upskill' },
    { label: 'Leadership', value: 'upskill' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
          <Briefcase size={22} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Intelligence Profile</h2>
          <p className="text-xs text-gray-500 font-medium">Calibrating your market trajectory</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Primary Industry</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {industries.map(i => (
              <button 
                key={i} onClick={() => update('industry', i)}
                className={`py-2.5 px-3 rounded-xl text-[12px] font-bold border-2 transition-all ${
                  data.industry === i ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Primary Career Goal</label>
          <div className="space-y-2">
            {goals.map(g => (
              <button 
                key={g.value} onClick={() => update('career_goal', g.value)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  data.career_goal === g.value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                <span className="text-[13px] font-bold">{g.label}</span>
                {data.career_goal === g.value && <CheckCircle2 size={16} className="text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Step2Vitality = ({ data, update }) => {
  const fitnessGoals = [
    { id: 'fat_loss', label: 'Fat Loss', icon: '🔥' },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
    { id: 'recovery', label: 'Active Recovery', icon: '⚓' },
    { id: 'stress_management', label: 'Stress Relief', icon: '✨' }
  ];

  const activityLevels = [
    { id: 'sedentary', label: 'Office/Desk', desc: 'Little to no exercise' },
    { id: 'lightly_active', label: 'Light', desc: '1-3 days/week' },
    { id: 'moderately_active', label: 'Moderate', desc: '3-5 days/week' },
    { id: 'high_performance', label: 'Elite', desc: 'Daily intense training' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
          <Activity size={22} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Professional Vitality</h2>
          <p className="text-xs text-gray-500 font-medium">Calibrating health for peak focus</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Core Goal */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Primary Focus</label>
          <div className="grid grid-cols-2 gap-2">
            {fitnessGoals.map(g => (
              <button 
                key={g.id} onClick={() => update('fitness_goal', g.id)}
                className={`py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                  data.fitness_goal === g.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                <span className="text-lg">{g.icon}</span>
                <span className="text-[11px] font-bold">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Physical Vitals */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 block">Physical Vitals (Optional for Accuracy)</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-gray-500 ml-1">Age</span>
              <input 
                type="number" placeholder="30" value={data.age || ''} 
                onChange={e => update('age', parseInt(e.target.value))}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-gray-500 ml-1">Gender</span>
              <select 
                value={data.gender || 'prefer_not_to_say'} 
                onChange={e => update('gender', e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer_not_to_say">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-gray-500 ml-1">Height (cm)</span>
              <input 
                type="number" placeholder="175" value={data.height_cm || ''} 
                onChange={e => update('height_cm', parseInt(e.target.value))}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-gray-500 ml-1">Weight (kg)</span>
              <input 
                type="number" placeholder="70" value={data.weight_kg || ''} 
                onChange={e => update('weight_kg', parseInt(e.target.value))}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Daily Activity</label>
          <div className="grid grid-cols-2 gap-2">
            {activityLevels.map(a => (
              <button 
                key={a.id} onClick={() => update('activity_level', a.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  data.activity_level === a.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                <p className="text-[11px] font-bold">{a.label}</p>
                <p className="text-[9px] opacity-60 font-medium">{a.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Avg. Sleep Duration</label>
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <input 
              type="range" min="4" max="12" step="0.5" value={data.sleep_hours || 7} 
              onChange={e => update('sleep_hours', parseFloat(e.target.value))}
              className="flex-1 accent-emerald-500"
            />
            <span className="text-sm font-black text-gray-900 w-12 text-right">{data.sleep_hours || 7}h</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Step3Growth = ({ data, update }) => {
  const mentoringOptions = [
    { id: 'expert', label: 'Industry Expert', desc: 'Guidance from top-level veterans' },
    { id: 'peer', label: 'Peer Network', desc: 'Collaborative growth with active learners' },
    { id: 'ai', label: 'AI Coach Only', desc: '24/7 intelligent career assistant' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
          <Rocket size={22} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Growth Catalyst</h2>
          <p className="text-xs text-gray-500 font-medium">Accelerating your professional reach</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Mentorship Alignment</label>
          <div className="space-y-2">
            {mentoringOptions.map(m => (
              <button 
                key={m.id} onClick={() => update('mentorship_preference', m.id)}
                className={`w-full flex flex-col items-start p-4 rounded-2xl border-2 transition-all ${
                  data.mentorship_preference === m.id ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                <span className="text-[13px] font-bold">{m.label}</span>
                <span className="text-[10px] font-medium opacity-60 text-left">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
          <h4 className="text-[11px] font-black text-purple-900 flex items-center gap-2 mb-1">
            <Zap size={14} /> AI-Tutor Enhancement
          </h4>
          <p className="text-[10px] text-purple-600 leading-relaxed">
            By completing this, your AI Study Table will prioritize real-world case studies matched to your career path.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Root Page ─────────────────────────────────────────────────────────────────

export default function CalibrationPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    industry: '',
    career_goal: '',
    fitness_goal: 'general_fitness',
    age: 30,
    gender: 'prefer_not_to_say',
    height_cm: 175,
    weight_kg: 70,
    activity_level: 'sedentary',
    sleep_hours: 7,
    mentorship_preference: 'expert',
    onboarding_complete: true
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // 1. Save career profile
      await careerAPI.saveProfile({
        industry: form.industry,
        career_goal: form.career_goal,
        mentorship_preference: form.mentorship_preference,
        onboarding_completed: 1
      });

      // 2. Save fitness profile
      await fitnessAPI.saveProfile({
        goal: form.fitness_goal,
        age: form.age,
        gender: form.gender,
        height_cm: form.height_cm,
        weight_kg: form.weight_kg,
        activity_level: form.activity_level,
        sleep_hours: form.sleep_hours,
        onboarding_complete: true
      });

      // 3. Mark career onboarding as complete
      await careerAPI.completeOnboarding();

      toast.success('Calibration Complete! 🚀');
      await refreshUser();
      router.push('/home');
    } catch (e) {
      toast.error('Sync failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10 md:py-20 p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-y-auto">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 shadow-xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Sparkles size={32} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight" id="calibration-title">Trajectory Calibration</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Synchronizing your professional intelligence</p>
        </div>

        <Card>
          <Progress step={step} total={3} />
          
          <div className="min-h-[360px]">
            <AnimatePresence mode="wait">
              {step === 1 && <Step1Career key="c" data={form} update={update} />}
              {step === 2 && <Step2Vitality key="v" data={form} update={update} />}
              {step === 3 && <Step3Growth key="g" data={form} update={update} />}
            </AnimatePresence>
          </div>

          <div className="mt-10 flex gap-4">
            {step > 1 && (
              <button 
                id="back-button"
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-4 rounded-2xl bg-gray-50 text-gray-500 font-black text-xs hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button 
              id="next-button"
              onClick={handleNext} disabled={saving}
              className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Synchronizing...</> : step === 3 ? 'Finish Calibration' : 'Next Phase'}
              {!saving && step < 3 && <ArrowRight size={16} />}
              {!saving && step === 3 && <Rocket size={16} />}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
