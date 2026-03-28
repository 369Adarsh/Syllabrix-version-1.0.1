'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { Mail, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || resending || countdown > 0) return;
    setResending(true);
    try {
      await apiClient.post('/auth/resend-verification', { email });
      setResent(true);
      setCountdown(60);
      toast.success('Verification email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Mask email for display: a****@domain.com
  const maskedEmail = email
    ? email.replace(/^(.{1,3})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
    : '';

  return (
    <div className="text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
        <Mail size={36} className="text-blue-600" />
      </div>

      <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight mb-2">
        Check your inbox
      </h1>
      <p className="text-gray-500 text-[14px] leading-relaxed mb-1">
        We&apos;ve sent a verification link to
      </p>
      {maskedEmail && (
        <p className="text-gray-800 font-semibold text-[15px] mb-6">{maskedEmail}</p>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left space-y-2">
        {[
          'Open your email app',
          'Click the "Verify My Email" button in the email',
          'You\'ll be redirected back to sign in',
        ].map((step, i) => (
          <p key={i} className="text-[13px] text-gray-600 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            {step}
          </p>
        ))}
      </div>

      {/* Resend */}
      <p className="text-[13px] text-gray-500 mb-3">Didn&apos;t get the email?</p>
      <button
        onClick={handleResend}
        disabled={resending || countdown > 0}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {resending ? (
          <><Loader2 size={14} className="animate-spin" /> Sending...</>
        ) : countdown > 0 ? (
          <><RefreshCw size={14} /> Resend in {countdown}s</>
        ) : (
          <><RefreshCw size={14} /> {resent ? 'Resend again' : 'Resend email'}</>
        )}
      </button>

      <p className="text-[12px] text-gray-400 mt-4">
        Check your spam/junk folder if you don&apos;t see it.
      </p>

      <div className="mt-10 pt-6 border-t border-gray-100">
        <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400 text-sm py-10">Loading...</div>}>
      <CheckEmailContent />
    </Suspense>
  );
}
