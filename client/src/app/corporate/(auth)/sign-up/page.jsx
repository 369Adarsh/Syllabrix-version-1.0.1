'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Loader2, ArrowRight, Eye, EyeOff, Building2, Building,
  User, Mail, Phone, Lock, Briefcase
} from 'lucide-react';

const INDUSTRIES = [
  'Technology', 'Banking & Finance', 'Healthcare & Pharma',
  'Manufacturing', 'Retail & FMCG', 'Infrastructure',
  'Education', 'Consulting', 'Government', 'Other'
];

const SIZE_BANDS = [
  { value: '1-50', label: '1 – 50 employees' },
  { value: '51-200', label: '51 – 200 employees' },
  { value: '201-500', label: '201 – 500 employees' },
  { value: '501-1000', label: '501 – 1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
];

function InputField({ icon: Icon, label, type = 'text', value, onChange, placeholder, required, autoComplete, children, note }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all" />
        {children}
      </div>
      {note && <p className="text-[11px] text-amber-600 mt-1 pl-1">{note}</p>}
    </div>
  );
}

export default function CorporateSignUpPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', company_name: '',
    job_title: '', industry: '', size_band: '51-200',
    password: '', confirmPassword: '',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const PERSONAL_DOMAINS = ['gmail','yahoo','hotmail','outlook','rediffmail','ymail','icloud','live','msn','aol','protonmail'];
  const isPersonalEmail = (email) => {
    const domain = email.split('@')[1]?.split('.')[0]?.toLowerCase() || '';
    return PERSONAL_DOMAINS.includes(domain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!form.company_name.trim()) { toast.error('Company name is required'); return; }
    if (isPersonalEmail(form.email)) { toast.error('Please use a work email address (no Gmail, Yahoo, etc.)'); return; }
    if (!agreedToTerms) { toast.error('Please agree to the Terms of Service'); return; }

    setLoading(true);
    try {
      await register({
        username: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        user_type: 'organization',
        company_name: form.company_name.trim(),
        phone: form.phone || undefined,
      });
      window.location.href = `/check-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}&corporate=true`;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
            <Building2 size={18} className="text-white" />
          </div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-gray-900">Create Enterprise Account</h1>
        </div>
        <p className="text-gray-500 text-sm">Set up your organization&apos;s L&D workspace — free to start</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <InputField icon={User} label="Full Name" value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Your full name" required autoComplete="name" />

        {/* Work Email */}
        <InputField icon={Mail} label="Work Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@company.com" required autoComplete="email"
          note="Must be a work email — personal email addresses (Gmail, Yahoo, etc.) are not accepted." />

        {/* Company Name */}
        <InputField icon={Building} label="Company / Organization Name" value={form.company_name} onChange={e => update('company_name', e.target.value)} placeholder="Acme Corporation Pvt. Ltd." required autoComplete="organization" />

        {/* Job Title */}
        <InputField icon={Briefcase} label="Job Title" value={form.job_title} onChange={e => update('job_title', e.target.value)} placeholder="Head of L&D / HR Director / CTO" autoComplete="organization-title" />

        {/* Industry & Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Industry</label>
            <select value={form.industry} onChange={e => update('industry', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all appearance-none">
              <option value="">Select</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Team Size</label>
            <select value={form.size_band} onChange={e => update('size_band', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all appearance-none">
              {SIZE_BANDS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Work Phone <span className="text-gray-400 font-normal">(optional)</span></label>
          <div className="relative">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-[13px] text-gray-500 font-medium pointer-events-none select-none">+91</div>
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" autoComplete="tel"
              className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="At least 8 characters" required autoComplete="new-password"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Repeat your password" required autoComplete="new-password"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border text-[14px] text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                form.confirmPassword && form.password !== form.confirmPassword
                  ? 'border-red-400 focus:ring-red-500/20 focus:border-red-400'
                  : 'border-gray-200 focus:ring-amber-500/30 focus:border-amber-500'
              }`} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p className="text-[11px] text-red-500 mt-1 pl-1">Passwords do not match</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-amber-600 accent-amber-600 flex-shrink-0" />
          <span className="text-[12px] text-gray-500 leading-relaxed">
            I agree to the <span className="text-amber-600 font-medium">Enterprise Terms of Service</span>, <span className="text-amber-600 font-medium">Data Processing Agreement</span>, and <span className="text-amber-600 font-medium">Privacy Policy</span><span className="text-red-400 ml-0.5">*</span>
          </span>
        </label>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[14px] font-bold shadow-md shadow-orange-200/50 hover:from-amber-600 hover:to-orange-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Creating workspace...</>
          ) : (
            <>Create Enterprise Account <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      <p className="text-center text-[13px] text-gray-500 mt-6">
        Already have an enterprise account?{' '}
        <Link href="/corporate/sign-in" className="font-semibold text-amber-600 hover:text-amber-700 transition-colors">Sign In</Link>
      </p>

      {/* Trust */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-5">
        {['SOC 2 Compliant', 'Enterprise SSO', 'GDPR Ready'].map(item => (
          <span key={item} className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
