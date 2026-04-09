'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api/auth.api';
import toast from 'react-hot-toast';
import { Loader2, Shield, Mail, Lock, User, KeyRound, ArrowRight } from 'lucide-react';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    admin_role: 'moderator',
    secret_key: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.registerAdmin(formData);
      toast.success('Admin Account Created! Please Sign In.');
      router.push('/admin-sign-in');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
          <Shield className="text-violet-600" /> Admin Registration
        </h1>
        <p className="text-gray-500 text-sm mt-1.5">
          Authorized personnel only. Requires master secret key.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name & Username */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold pointer-events-none">@</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@syllabrix.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Secure password"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        {/* Role & Secret Key */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">System Role</label>
            <select
              name="admin_role"
              value={formData.admin_role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 focus:bg-white transition-all"
            >
              <option value="moderator">Content Moderator</option>
              <option value="support">Customer Support</option>
              <option value="finance">Finance Ops</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-red-600 mb-1.5 flex items-center gap-1">
              <KeyRound size={14} /> Master Key
            </label>
            <input
              type="password"
              name="secret_key"
              value={formData.secret_key}
              onChange={handleChange}
              placeholder="Required to bypass"
              className="w-full px-4 py-3 rounded-xl border-2 border-red-100 bg-red-50 text-[14px] focus:ring-2 focus:ring-red-500/30 focus:border-red-500 focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[14px] font-bold shadow-md shadow-violet-200/50 hover:from-violet-700 hover:to-fuchsia-700 active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Provisioning Account...</> : <>Register Authorized Account <ArrowRight size={15} /></>}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-[13px] text-gray-500 font-medium">
          Already have an admin account?{' '}
          <Link href="/admin-sign-in" className="font-bold text-violet-600 hover:text-violet-700 transition-colors">
            Sign In here
          </Link>
        </p>
        
        <div className="w-full h-px bg-gray-100 my-2" />
        
        <p className="text-[12px] text-gray-400">
          Not an administrator?{' '}
          <Link href="/sign-in" className="font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            Return to User Login
          </Link>
        </p>
      </div>
    </div>
  );
}
