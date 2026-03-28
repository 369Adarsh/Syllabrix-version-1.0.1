'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'already' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please use the link from your email.');
      return;
    }

    apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => {
        const data = res.data.data;
        if (data?.alreadyVerified) {
          setStatus('already');
        } else {
          setStatus('success');
        }
        setMessage(res.data.message || 'Email verified!');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
      });
  }, [token]);

  return (
    <div className="text-center">
      {status === 'loading' && (
        <>
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <Loader2 size={36} className="text-blue-500 animate-spin" />
          </div>
          <h1 className="text-[24px] font-extrabold text-gray-900 mb-2">Verifying your email…</h1>
          <p className="text-gray-500 text-[14px]">Please wait a moment.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight mb-2">
            Email verified!
          </h1>
          <p className="text-gray-500 text-[14px] leading-relaxed mb-8">
            Your Syllabrix account is now active. Sign in to complete your profile and start learning.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[14px] font-bold shadow-md shadow-blue-200/50 hover:from-blue-700 transition-all"
          >
            Sign In to Syllabrix
          </Link>
        </>
      )}

      {status === 'already' && (
        <>
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-blue-500" />
          </div>
          <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight mb-2">
            Already verified
          </h1>
          <p className="text-gray-500 text-[14px] leading-relaxed mb-8">
            Your email is already verified. Sign in to access your account.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[14px] font-bold shadow-md shadow-blue-200/50 hover:from-blue-700 transition-all"
          >
            Go to Sign In
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight mb-2">
            Verification failed
          </h1>
          <p className="text-gray-500 text-[14px] leading-relaxed mb-2">{message}</p>
          <p className="text-gray-400 text-[13px] mb-8">
            Verification links expire after 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Back to Sign Up
            </Link>
            <Link
              href="/check-email"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[14px] font-bold shadow-md hover:from-blue-700 transition-all"
            >
              Resend Verification
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400 text-sm py-10">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
