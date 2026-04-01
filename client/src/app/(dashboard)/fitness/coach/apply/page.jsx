'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Shield, Loader2, CheckCircle2 } from 'lucide-react';

export default function CoachApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '', bio: '', specialization: [], certifications: [], years_experience: 0,
    pricing_monthly: '', pricing_session: '', languages: ['English', 'Hindi'],
    mode: 'online', location: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const specs = ['weight_loss', 'muscle_building', 'yoga', 'hiit', 'crossfit', 'pilates', 'nutrition', 'sports_training', 'rehabilitation', 'prenatal', 'senior_fitness', 'flexibility'];

  const toggleSpec = (s) => {
    setForm(prev => ({
      ...prev,
      specialization: prev.specialization.includes(s) ? prev.specialization.filter(v => v !== s) : [...prev.specialization, s]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name) return alert('Please enter your name');
    setSaving(true);
    try {
      await fitnessAPI.applyAsCoach(form);
      setSuccess(true);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit application');
    } finally { setSaving(false); }
  };

  if (success) {
    return (
      <div className="max-w-[500px] mx-auto py-10 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-[20px] font-extrabold text-gray-800 mb-2">Application Submitted! 🎉</h2>
          <p className="text-[13px] text-gray-500 mb-6">Our team will review your application and get back to you soon.</p>
          <button onClick={() => router.push('/fitness/coaches')}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-[13px] font-bold hover:bg-cyan-700">Browse Coaches</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
          <Shield size={22} className="text-violet-500" /> Apply as Fitness Coach
        </h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Join our coach community and help transform lives</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-6 space-y-4">
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Full Name *</label>
          <input type="text" value={form.full_name} onChange={e => updateField('full_name', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Your full name" required />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Bio</label>
          <textarea value={form.bio} onChange={e => updateField('bio', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-violet-500 outline-none resize-none" rows={3} placeholder="Tell us about yourself..." />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Specialization</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {specs.map(s => (
              <button type="button" key={s} onClick={() => toggleSpec(s)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize border transition-all ${
                  form.specialization.includes(s) ? 'bg-violet-500 text-white border-violet-500' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                }`}>{s.replace(/_/g, ' ')}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Years Experience</label>
            <input type="number" value={form.years_experience} onChange={e => updateField('years_experience', parseInt(e.target.value) || 0)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-violet-500 outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Mode</label>
            <select value={form.mode} onChange={e => updateField('mode', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] bg-white outline-none">
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Monthly Price (₹)</label>
            <input type="number" value={form.pricing_monthly} onChange={e => updateField('pricing_monthly', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-violet-500 outline-none" placeholder="e.g. 2999" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Per Session Price (₹)</label>
            <input type="number" value={form.pricing_session} onChange={e => updateField('pricing_session', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-violet-500 outline-none" placeholder="e.g. 499" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Location</label>
          <input type="text" value={form.location} onChange={e => updateField('location', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:ring-2 focus:ring-violet-500 outline-none" placeholder="City, State" />
        </div>
        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[13px] font-bold hover:shadow-lg transition-all disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
          Submit Application
        </button>
      </form>
    </div>
  );
}
