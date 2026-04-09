'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, Building2, MailWarning } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function CorporateSignInPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/corporate/dashboard');
    }
  }, [user, authLoading, router]);

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.post('/auth/resend-verification', { email: unverifiedEmail });
      toast.success('Verification email resent!');
    } catch {
      toast.error('Could not resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnverifiedEmail(null);
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to Syllabrix L&D!');
      router.push('/corporate/dashboard');
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
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight text-gray-900">
              Enterprise Sign In
            </h1>
          </div>
        </div>
        <p className="text-gray-500 text-sm">
          Access your organization&apos;s L&D workspace
        </p>
      </div>

      {/* Unverified email banner */}
      {unverifiedEmail && (
        <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
          <MailWarning size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-amber-800">Email not verified</p>
            <p className="text-[12px] text-amber-700 mt-0.5">Please verify your email before signing in.</p>
            <button type="button" onClick={handleResend} disabled={resending} className="mt-2 text-[12px] font-bold text-amber-700 underline underline-offset-2 disabled:opacity-60">
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Work Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all" />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[13px] font-semibold text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-[12px] font-medium text-amber-600 hover:text-amber-700 transition-colors">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[14px] font-bold shadow-md shadow-orange-200/50 hover:from-amber-600 hover:to-orange-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Signing in...</>
          ) : (
            <>Sign In <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      {/* SSO placeholder */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-[11px]"><span className="bg-white px-3 text-gray-400 font-medium uppercase tracking-wider">Or</span></div>
        </div>
        <button disabled className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[13px] font-semibold text-gray-500 hover:bg-gray-100 transition-all cursor-not-allowed opacity-60">
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google SSO (Coming Soon)
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-[13px] text-gray-500 mt-8">
        Don&apos;t have an enterprise account?{' '}
        <Link href="/corporate/sign-up" className="font-semibold text-amber-600 hover:text-amber-700 transition-colors">
          Create one
        </Link>
      </p>

      {/* Trust indicators */}
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
