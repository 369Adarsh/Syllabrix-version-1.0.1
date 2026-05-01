'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, Shield, KeyRound, Wifi } from 'lucide-react';

export default function AdminSignInPage() {
  const { login, logout, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const [retryCountdown, setRetryCountdown] = useState(null);

  // 2FA challenge state
  const [requires2FA, setRequires2FA] = useState(false);
  const [pre2FAToken, setPre2FAToken] = useState(null);
  const [totpCode, setTotpCode] = useState('');

  // Detect cold start
  useEffect(() => {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
    let t = setTimeout(() => setServerStatus('warming'), 2000);
    fetch(`${base}/api/health`)
      .then(() => { clearTimeout(t); setServerStatus('ready'); })
      .catch(() => { clearTimeout(t); setServerStatus('warming'); });
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss "ready" banner
  useEffect(() => {
    if (serverStatus !== 'ready') return;
    const t = setTimeout(() => setServerStatus(null), 3000);
    return () => clearTimeout(t);
  }, [serverStatus]);

  // Auto-retry countdown
  useEffect(() => {
    if (retryCountdown === null) return;
    if (retryCountdown === 0) {
      setRetryCountdown(null);
      document.getElementById('admin-signin-form')?.requestSubmit();
      return;
    }
    const t = setTimeout(() => setRetryCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [retryCountdown]);

  // Redirect already-authenticated admins to dash
  useEffect(() => {
    if (!authLoading && user) {
      const isAdmin = user.user_type === 'syllabrix_admin' || user.admin_role;
      if (isAdmin) {
        router.push('/admin');
      }
    }
  }, [user, authLoading, router]);

  const handleResend = async () => {
    setResending(true);
    try {
      const api = (await import('@/lib/api-client')).default;
      await api.post('/auth/resend-verification', { email: unverifiedEmail });
      toast.success('Verification email resent!');
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
      const result = await login(email, password, true);

      if (result.requires_2fa) {
        setPre2FAToken(result.pre_2fa_token);
        setRequires2FA(true);
        return;
      }

      toast.success('Admin portal access granted.', { icon: '🛡️' });
      router.push('/admin');
    } catch (err) {
      const isNetworkError = !err.response && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message?.includes('timeout'));
      if (isNetworkError) {
        setServerStatus('warming');
        setRetryCountdown(15);
      } else {
        const msg = err.response?.data?.message || 'Invalid administrative credentials';
        if (msg.toLowerCase().includes('verify your email')) {
          setUnverifiedEmail(email);
        } else {
          toast.error(msg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const api = (await import('@/lib/api-client')).default;
      const res = await api.post(
        '/admin/2fa/verify',
        { token: totpCode },
        { headers: { Authorization: `Bearer ${pre2FAToken}` } }
      );
      const { token } = res.data;
      localStorage.setItem('syllabrix_token', token);
      toast.success('2FA verified. Access granted.', { icon: '🛡️' });
      router.push('/admin');
    } catch {
      toast.error('Invalid authentication code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2FA verification step
  if (requires2FA) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-200">
            <KeyRound className="text-white" size={24} />
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">Two-Factor Auth</h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>
        <form onSubmit={handle2FASubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Authentication Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={totpCode}
              onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[18px] font-mono text-center tracking-[0.4em] text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || totpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[14px] font-bold shadow-md shadow-violet-200/50 hover:from-violet-700 hover:to-fuchsia-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : <>Verify & Enter <ArrowRight size={15} /></>}
          </button>
          <button
            type="button"
            onClick={() => { setRequires2FA(false); setPre2FAToken(null); setTotpCode(''); }}
            className="w-full text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back to login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-200">
          <Shield className="text-white" size={24} />
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">
          Admin Portal
        </h1>
        <p className="text-gray-500 text-sm mt-1.5 font-medium">
          Authorized personnel only. Please sign in to access management tools.
        </p>
      </div>

      {/* Server cold-start banner */}
      {serverStatus === 'warming' && (
        <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <Loader2 size={15} className="animate-spin text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-amber-800">Server is waking up&hellip;</p>
            <p className="text-[11.5px] text-amber-600 mt-0.5">
              {retryCountdown !== null
                ? `Auto-retrying in ${retryCountdown}s — your credentials are saved`
                : 'This takes ~30 seconds on first load.'}
            </p>
          </div>
          {retryCountdown !== null && (
            <span className="text-[13px] font-bold text-amber-700 tabular-nums shrink-0">{retryCountdown}s</span>
          )}
        </div>
      )}
      {serverStatus === 'ready' && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <Wifi size={14} className="text-emerald-500 shrink-0" />
          <p className="text-[12px] font-medium text-emerald-700">Server is ready</p>
        </div>
      )}

      {/* Email not verified banner */}
      {unverifiedEmail && (
        <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 animate-in fade-in zoom-in duration-300">
          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Mail size={12} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-amber-800">Verify your identity</p>
            <p className="text-[12px] text-amber-700 mt-0.5">
              Please verify your email before accessing the portal.
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-2 text-[12px] font-bold text-amber-900 underline underline-offset-2 hover:text-amber-950 disabled:opacity-60"
            >
              {resending ? 'Sending link…' : 'Resend verification email'}
            </button>
          </div>
        </div>
      )}

      <form id="admin-signin-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
            Admin Email
          </label>
          <div className="relative group">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@syllabrix.com"
              required
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[13px] font-semibold text-gray-700">
              Secret Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              Forgot secret key?
            </Link>
          </div>
          <div className="relative group">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your secret password"
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[14px] font-bold shadow-md shadow-violet-200/50 hover:from-violet-700 hover:to-fuchsia-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Verifying Credentials...</>
          ) : (
            <>Secure Login <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-[13px] text-gray-500 font-medium">
          New administrator?{' '}
          <Link href="/admin-register" className="font-bold text-violet-600 hover:text-violet-700 transition-colors">
            Register here
          </Link>
        </p>
        
        <div className="w-full h-px bg-gray-100 my-2" />
        
        <p className="text-[12px] text-gray-400">
          Not an administrator?{' '}
          <Link href="/sign-in" className="font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            Return to User Login
          </Link>
        </p>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Shield size={14} className="text-emerald-500" />
          <span className="text-[11px] font-medium uppercase tracking-wider">End-to-End Encrypted Portal</span>
        </div>
      </div>
    </div>
  );
}
