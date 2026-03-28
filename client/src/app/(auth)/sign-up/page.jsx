'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Loader2, ArrowRight, Eye, EyeOff,
  GraduationCap, BookOpen, Building2, Briefcase, Building,
  User, Mail, Phone, Lock, Calendar,
} from 'lucide-react';

const PERSONAL_EMAIL_DOMAINS = ['gmail','yahoo','hotmail','outlook','rediffmail','ymail','icloud','live','msn','aol','protonmail'];
const isPersonalEmail = (email) => {
  const domain = email.split('@')[1]?.split('.')[0]?.toLowerCase() || '';
  return PERSONAL_EMAIL_DOMAINS.includes(domain);
};

const USER_TYPES = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'School, college or coaching', color: 'blue' },
  { value: 'teacher', label: 'Teacher', icon: BookOpen, desc: 'Teach & guide learners', color: 'emerald' },
  { value: 'institute', label: 'Institute', icon: Building2, desc: 'School, college or academy', color: 'purple' },
  { value: 'professional_learner', label: 'Professional Learner', icon: Briefcase, desc: 'Upskill your career', color: 'amber' },
  { value: 'organization', label: 'Organization', icon: Building, desc: 'Post jobs & find talent', color: 'rose' },
];

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', ring: 'ring-blue-500/20', dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-500/20', dot: 'bg-emerald-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', ring: 'ring-purple-500/20', dot: 'bg-purple-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', ring: 'ring-amber-500/20', dot: 'bg-amber-500' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-700', ring: 'ring-rose-500/20', dot: 'bg-rose-500' },
};

function InputField({ icon: Icon, label, type = 'text', value, onChange, placeholder, required, autoComplete, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
        />
        {children}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    date_of_birth: '',
    user_type: 'student',
    company_name: '',
    password: '',
    confirmPassword: '',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error('Enter a valid 10-digit Indian mobile number');
      return;
    }
    // Organization: require company work email
    if (form.user_type === 'organization') {
      if (!form.company_name.trim()) {
        toast.error('Company name is required for organization accounts');
        return;
      }
      if (isPersonalEmail(form.email)) {
        toast.error('Organizations must use a work email address (no Gmail, Yahoo, etc.)');
        return;
      }
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        user_type: form.user_type,
        date_of_birth: form.date_of_birth || undefined,
        phone: form.phone || undefined,
        company_name: form.user_type === 'organization' ? form.company_name.trim() : undefined,
      });
      // Redirect to check-email page — pass email via query param
      window.location.href = `/check-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">
          Create your account
        </h1>
        <p className="text-gray-500 text-sm mt-1.5">
          Join India&apos;s complete education ecosystem — free forever
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <InputField
          icon={User}
          label="Full Name"
          value={form.fullName}
          onChange={e => update('fullName', e.target.value)}
          placeholder="Your full name"
          required
          autoComplete="name"
        />

        {/* Email */}
        <div>
          <InputField
            icon={Mail}
            label={form.user_type === 'organization' ? 'Work Email address' : 'Email address'}
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder={form.user_type === 'organization' ? 'you@company.com (no Gmail/Yahoo)' : 'you@example.com'}
            required
            autoComplete="email"
          />
          {form.user_type === 'organization' && (
            <p className="text-[11px] text-amber-600 mt-1 pl-1">Organizations must use a work email — personal email addresses are not accepted.</p>
          )}
        </div>

        {/* Company Name — only for Organization */}
        {form.user_type === 'organization' && (
          <InputField
            icon={Building}
            label="Company Name"
            value={form.company_name}
            onChange={e => update('company_name', e.target.value)}
            placeholder="Official registered company name"
            required
            autoComplete="organization"
          />
        )}

        {/* Phone */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
            {form.user_type === 'organization' ? 'Work Phone' : 'Mobile Number'}{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-[13px] text-gray-500 font-medium pointer-events-none select-none">
              +91
            </div>
            <input
              type="tel"
              value={form.phone}
              onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              autoComplete="tel"
              className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <InputField
          icon={Calendar}
          label="Date of Birth"
          type="date"
          value={form.date_of_birth}
          onChange={e => update('date_of_birth', e.target.value)}
          placeholder=""
          autoComplete="bday"
        />

        {/* User Type */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">I am a</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {USER_TYPES.map(type => {
              const selected = form.user_type === type.value;
              const c = COLOR_MAP[type.color];
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => update('user_type', type.value)}
                  className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 text-center transition-all duration-200 ${
                    selected
                      ? `${c.bg} ${c.border} ring-4 ${c.ring}`
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <type.icon size={20} className={selected ? c.text : 'text-gray-400'} strokeWidth={selected ? 2.5 : 1.5} />
                  <span className={`text-[12px] font-bold leading-tight ${selected ? c.text : 'text-gray-700'}`}>
                    {type.label}
                  </span>
                  <span className={`text-[10px] leading-tight ${selected ? c.text : 'text-gray-400'}`}>
                    {type.desc}
                  </span>
                  {selected && (
                    <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${c.dot} flex items-center justify-center`}>
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => update('password', e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={e => update('confirmPassword', e.target.value)}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border text-[14px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                form.confirmPassword && form.password !== form.confirmPassword
                  ? 'border-red-400 focus:ring-red-500/20 focus:border-red-400'
                  : 'border-gray-200 focus:ring-blue-500/30 focus:border-blue-500'
              }`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p className="text-[11px] text-red-500 mt-1 pl-1">Passwords do not match</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[14px] font-bold shadow-md shadow-blue-200/50 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Creating account...</>
          ) : (
            <>Create Account <ArrowRight size={15} /></>
          )}
        </button>

        {/* Terms checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600 flex-shrink-0"
          />
          <span className="text-[12px] text-gray-500 leading-relaxed">
            I agree to the{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-700">Terms of Service</span>
            {' '}and{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-700">Privacy Policy</span>
            {' '}of Syllabrix<span className="text-red-400 ml-0.5">*</span>
          </span>
        </label>
      </form>

      <p className="text-center text-[13px] text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
