'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api/auth.api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true); toast.success('Reset link sent!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div className="text-center">
      <h1 className="font-heading text-2xl font-bold mb-2">Check Your Email</h1>
      <p className="text-dark-400 mb-6">We sent a password reset link to {email}</p>
      <Link href="/sign-in" className="link">Back to Sign In</Link>
    </div>
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-1">Forgot Password</h1>
      <p className="text-dark-400 mb-6">Enter your email to reset</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
      </form>
      <p className="text-center text-dark-400 text-sm mt-6"><Link href="/sign-in" className="link">Back to Sign In</Link></p>
    </div>
  );
}
