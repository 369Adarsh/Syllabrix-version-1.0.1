'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, MailWarning } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function SignInPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.post('/auth/resend-verification', { email: unverifiedEmail });
      toast.success('Verification email resent! Check your inbox.');
    } catch {
      toast.error('Could not resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnverifiedEmail(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      if (!user.is_profile_complete) window.location.href = '/complete-profile';
      else window.location.href = '/home';
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      if (msg.toLowerCase().includes('verify your email')) {
        setUnverifiedEmail(email);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">
          Welcome back
        </h1>
        <p className="text-gray-500 text-sm mt-1.5">
          Sign in to continue your learning journey
        </p>
      </div>

      {/* Email not verified banner */}
      {unverifiedEmail && (
        <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
          <MailWarning size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-amber-800">Email not verified</p>
            <p className="text-[12px] text-amber-700 mt-0.5">
              Please verify your email before signing in. Didn&apos;t get it?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-2 text-[12px] font-bold text-amber-700 underline underline-offset-2 disabled:opacity-60"
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[13px] font-semibold text-gray-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[14px] font-bold shadow-md shadow-blue-200/50 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Signing in...</>
          ) : (
            <>Sign In <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-[13px] text-gray-500 mt-8">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          Create one free
        </Link>
      </p>

      {/* Trust indicators */}
      <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-6">
        {['Safe for ages 5+', 'Free forever', 'India-built'].map(item => (
          <span key={item} className="text-[11px] text-gray-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
