'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Loader2, ArrowRight, Eye, EyeOff,
  GraduationCap, BookOpen, Building2, Briefcase, Building,
  User, Mail, Phone, Lock, Calendar, CheckCircle2, XCircle, UserCog,
} from 'lucide-react';

const PERSONAL_EMAIL_DOMAINS = ['gmail','yahoo','hotmail','outlook','rediffmail','ymail','icloud','live','msn','aol','protonmail'];
const isPersonalEmail = (email) => {
  const domain = email.split('@')[1]?.split('.')[0]?.toLowerCase() || '';
  return PERSONAL_EMAIL_DOMAINS.includes(domain);
};

const USER_TYPES = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'School, college or coaching', color: 'blue' },
  { value: 'parent', label: 'Parent', icon: User, desc: 'Manage child accounts', color: 'indigo' },
  { value: 'teacher', label: 'Teacher', icon: BookOpen, desc: 'Teach & guide learners', color: 'emerald' },
  { value: 'institute', label: 'Institute', icon: Building2, desc: 'School, college or academy', color: 'purple' },
  { value: 'professional_learner', label: 'Professional Learner', icon: Briefcase, desc: 'Upskill your career', color: 'amber' },
  { value: 'organization', label: 'Organization', icon: Building, desc: 'Post jobs & find talent', color: 'rose' },
  { value: 'hr_professional', label: 'HR Professional', icon: UserCog, desc: 'Recruit & connect talent', color: 'teal' },
];


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

const PASSWORD_RULES = [
  { label: 'At least 8 characters',          test: p => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)',      test: p => /[A-Z]/.test(p) },
  { label: 'One number (0–9)',                test: p => /[0-9]/.test(p) },
  { label: 'One special character (!@#$…)',   test: p => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  const strength = passed <= 1 ? 'Weak' : passed === 2 ? 'Fair' : passed === 3 ? 'Good' : 'Strong';
  const barColor = passed <= 1 ? 'bg-red-400' : passed === 2 ? 'bg-amber-400' : passed === 3 ? 'bg-blue-400' : 'bg-emerald-500';
  const textColor = passed <= 1 ? 'text-red-500' : passed === 2 ? 'text-amber-500' : passed === 3 ? 'text-blue-500' : 'text-emerald-600';

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i < passed ? barColor : 'bg-gray-200'}`} />
          ))}
        </div>
        <span className={`text-[11px] font-bold ${textColor}`}>{strength}</span>
      </div>
      {/* Requirement checklist */}
      <ul className="space-y-1">
        {PASSWORD_RULES.map(rule => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className={`flex items-center gap-1.5 text-[12px] transition-colors ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>
              {ok
                ? <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
                : <XCircle size={13} className="shrink-0 text-gray-300" />}
              {rule.label}
            </li>
          );
        })}
      </ul>
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
    hr_role: '',
    guardian_id: '',
    password: '',
    confirmPassword: '',
    password_hint: '',
  });

  const [addChild, setAddChild] = useState(false);
  const [childForm, setChildForm] = useState({
    fullName: '',
    email: '',
    date_of_birth: '',
    gender: 'male',
    password: '',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const failedRules = PASSWORD_RULES.filter(r => !r.test(form.password));
    if (failedRules.length > 0) {
      toast.error(failedRules[0].label.replace(/^O/, 'Password needs at least o').replace(/^A/, 'Password needs a'));
      return;
    }

    if (form.user_type === 'organization') {
      if (!form.company_name.trim()) {
        toast.error('Company name is required for organization accounts');
        return;
      }
      if (isPersonalEmail(form.email)) {
        toast.error('Organizations must use a work email address');
        return;
      }
    }

    if (form.user_type === 'hr_professional') {
      if (!form.company_name.trim()) {
        toast.error('Company name is required for HR professional accounts');
        return;
      }
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        password_hint: form.password_hint.trim() || undefined,
        user_type: form.user_type,
        date_of_birth: form.date_of_birth || undefined,
        phone: form.phone || undefined,
        guardian_id: form.user_type === 'student' ? form.guardian_id.trim().toUpperCase() : undefined,
        company_name: ['organization', 'hr_professional'].includes(form.user_type) ? form.company_name.trim() : undefined,
        hr_role: form.user_type === 'hr_professional' ? (form.hr_role.trim() || 'HR Professional') : undefined,
        children: (form.user_type === 'parent' && addChild) ? [{
          fullName: childForm.fullName.trim(),
          email: childForm.email.trim().toLowerCase(),
          date_of_birth: childForm.date_of_birth,
          gender: childForm.gender,
          password: childForm.password,
        }] : undefined
      });
      window.location.href = `/check-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const mainAge = calculateAge(form.date_of_birth);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">Create account</h1>
        <p className="text-gray-500 text-sm mt-1.5">Join the Syllabrix ecosystem</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={User}
          label="Full Name"
          value={form.fullName}
          onChange={e => update('fullName', e.target.value)}
          placeholder="Your full name"
          required
        />

        <InputField
          icon={Mail}
          label="Email address"
          type="email"
          value={form.email}
          onChange={e => update('email', e.target.value)}
          placeholder="you@example.com"
          required
        />

        {form.user_type === 'organization' && (
          <InputField
            icon={Building}
            label="Company Name"
            value={form.company_name}
            onChange={e => update('company_name', e.target.value)}
            placeholder="Official company name"
            required
          />
        )}

        {form.user_type === 'hr_professional' && (
          <>
            <InputField
              icon={Building2}
              label="Company / Organisation"
              value={form.company_name}
              onChange={e => update('company_name', e.target.value)}
              placeholder="Company you represent"
              required
            />
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">HR Role</label>
              <div className="relative">
                <UserCog size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={form.hr_role}
                  onChange={e => update('hr_role', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 focus:bg-white transition-all appearance-none"
                >
                  <option value="">Select your role</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Talent Acquisition">Talent Acquisition</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Technical Recruiter">Technical Recruiter</option>
                  <option value="HRBP">HR Business Partner (HRBP)</option>
                  <option value="Hiring Manager">Hiring Manager</option>
                  <option value="People Lead">People Lead</option>
                  <option value="HR Director">HR Director</option>
                  <option value="HR Professional">Other HR Professional</option>
                </select>
              </div>
            </div>
          </>
        )}

        <InputField
          icon={Calendar}
          label="Date of Birth"
          type="date"
          value={form.date_of_birth}
          onChange={e => update('date_of_birth', e.target.value)}
          required
        />

        {form.user_type === 'student' && form.date_of_birth && (
          <InputField
            icon={User}
            label={mainAge <= 13 ? 'Guardian ID (Mandatory for age <= 13)' : 'Guardian ID (Optional)'}
            value={form.guardian_id}
            onChange={e => update('guardian_id', e.target.value)}
            placeholder="G-XXXXXXXXXX"
            required={mainAge <= 13}
          />
        )}

        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">I am a</label>
          <select
            value={form.user_type}
            onChange={e => update('user_type', e.target.value)}
            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all appearance-none"
          >
            {USER_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label} — {type.desc}</option>
            ))}
          </select>
        </div>

        {form.user_type === 'parent' && (
          <div className="mt-4 p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/30 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={addChild}
                onChange={e => setAddChild(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span className="text-[14px] font-bold text-indigo-900">Create account for my child too</span>
            </label>
            
            {addChild && (
              <div className="space-y-4 pt-4 border-t border-indigo-100">
                <InputField
                  icon={User}
                  label="Child's Full Name"
                  value={childForm.fullName}
                  onChange={e => setChildForm({ ...childForm, fullName: e.target.value })}
                  placeholder="Child's name"
                  required={addChild}
                />
                <InputField
                  icon={Mail}
                  label="Child's Email Address"
                  type="email"
                  value={childForm.email}
                  onChange={e => setChildForm({ ...childForm, email: e.target.value })}
                  placeholder="child@example.com"
                  required={addChild}
                />
                <InputField
                  icon={Calendar}
                  label="Child's DOB (Upto 13)"
                  type="date"
                  value={childForm.date_of_birth}
                  onChange={e => {
                    const age = calculateAge(e.target.value);
                    if (age > 13) {
                      toast.error("Unified registration is only for children age 13 and under.");
                      return;
                    }
                    setChildForm({ ...childForm, date_of_birth: e.target.value });
                  }}
                  required={addChild}
                />
                <InputField
                  icon={Lock}
                  label="Child's Password"
                  type="password"
                  value={childForm.password}
                  onChange={e => setChildForm({ ...childForm, password: e.target.value })}
                  placeholder="Min 8 characters"
                  required={addChild}
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <InputField
            icon={Lock}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={e => update('password', e.target.value)}
            placeholder="Min 8 characters"
            required
          >
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </InputField>
          <PasswordStrength password={form.password} />

          <InputField
            icon={Lock}
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={e => update('confirmPassword', e.target.value)}
            placeholder="Repeat password"
            required
          >
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </InputField>

          <div className="pt-2">
            <InputField
              icon={BookOpen}
              label="Password Hint (Optional)"
              type="text"
              value={form.password_hint}
              onChange={e => update('password_hint', e.target.value)}
              placeholder="A word or phrase to help you remember your password"
            />
            <p className="text-[11px] text-gray-500 mt-1.5 ml-1 flex items-start gap-1">
              <span className="text-blue-500 font-bold">ℹ</span>
              Make sure your hint does not contain your actual password.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="mt-1" />
          <span className="text-[12px] text-gray-500">I agree to the Terms and Privacy Policy</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create Account <ArrowRight size={15} /></>}
        </button>
      </form>

      <p className="text-center text-[13px] text-gray-500 mt-6">
        Already have an account? <Link href="/sign-in" className="font-semibold text-blue-600">Sign In</Link>
      </p>
    </div>
  );
}
