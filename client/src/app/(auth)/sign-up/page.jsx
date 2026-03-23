'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, ArrowRight, Eye, EyeOff, GraduationCap, BookOpen, Building2, Users } from 'lucide-react';

const USER_TYPES = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Learn & explore', color: 'blue' },
  { value: 'teacher', label: 'Teacher', icon: BookOpen, desc: 'Teach & earn', color: 'emerald' },
  { value: 'institute', label: 'Institute', icon: Building2, desc: 'Manage & grow', color: 'purple' },
  { value: 'parent', label: 'Parent', icon: Users, desc: 'Guide & protect', color: 'amber' },
];

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', ring: 'ring-blue-500/20' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-500/20' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', ring: 'ring-purple-500/20' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', ring: 'ring-amber-500/20' },
};

export default function SignUpPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    user_type: 'student', date_of_birth: '',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        user_type: form.user_type,
        date_of_birth: form.date_of_birth || undefined,
      });
      toast.success('Account created!');
      window.location.href = '/complete-profile'; // Force full reload for AuthContext
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h1>
      <p className="text-gray-400 mt-2 mb-8">Join the education revolution</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
          <input type="text" value={form.username} onChange={e => update('username', e.target.value)}
            placeholder="Choose a username" required className="input-premium" />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
            placeholder="your@email.com" required className="input-premium" />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
          <input type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)}
            className="input-premium" />
        </div>

        {/* User Type — premium selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {USER_TYPES.map(type => {
              const selected = form.user_type === type.value;
              const c = COLOR_MAP[type.color];
              return (
                <button key={type.value} type="button" onClick={() => update('user_type', type.value)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selected
                      ? `${c.bg} ${c.border} ${c.text} ring-4 ${c.ring} shadow-sm`
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                  }`}>
                  <type.icon size={22} strokeWidth={selected ? 2.5 : 1.5} />
                  <span className={`text-sm font-bold ${selected ? c.text : 'text-gray-700'}`}>{type.label}</span>
                  <span className={`text-[11px] ${selected ? c.text : 'text-gray-400'}`}>{type.desc}</span>
                  {selected && (
                    <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full ${c.border.replace('border-', 'bg-')} flex items-center justify-center`}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)}
              placeholder="Create a strong password" required className="input-premium pr-12" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
          <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
            placeholder="Repeat your password" required className="input-premium" />
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="btn-premium w-full flex items-center justify-center gap-2 !py-4 text-base">
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? 'Creating account...' : 'Create Account'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-8">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign In</Link>
      </p>
    </div>
  );
}
