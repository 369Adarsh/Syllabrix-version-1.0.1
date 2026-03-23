'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { parentAPI } from '@/lib/api/parent.api';
import { paymentsAPI } from '@/lib/api/payments.api';
import Link from 'next/link';
import {
  Shield, Users, Loader2, BarChart3, Clock, Target, BookOpen, Brain,
  TrendingUp, Eye, Crown, ArrowRight, Star, Flame, CheckCircle, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childActivity, setChildActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      parentAPI.getChildren().catch(() => ({ data: { data: [] } })),
      paymentsAPI.checkPlan('parent_pro').catch(() => ({ data: { data: { active: false } } })),
    ]).then(([childRes, proRes]) => {
      const kids = childRes.data?.data || [];
      setChildren(Array.isArray(kids) ? kids : []);
      setIsPro(proRes.data?.data?.active || false);
    }).finally(() => setLoading(false));
  }, []);

  const loadChildActivity = async (child) => {
    setSelectedChild(child);
    setActivityLoading(true);
    try {
      const res = await parentAPI.getChildActivity(child.id || child.user_id);
      setChildActivity(res.data?.data || null);
    } catch { setChildActivity(null); }
    finally { setActivityLoading(false); }
  };

  const startProTrial = async () => {
    try {
      await paymentsAPI.startTrial('parent_pro_monthly');
      setIsPro(true);
      toast.success('Parent Pro trial started! 7 days free.');
    } catch (e) { toast.error(e.response?.data?.message || 'Could not start trial'); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0">
            <Shield size={24} className="text-blue-300" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Parent Dashboard {isPro && <span className="text-amber-400 text-sm ml-2">PRO ✨</span>}</h1>
            <p className="text-blue-300/70 text-sm mt-0.5">Monitor your child&apos;s learning journey</p>
          </div>
          {!isPro && (
            <button onClick={startProTrial}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 transition-all">
              <Crown size={14} /> Try Pro Free (7 days)
            </button>
          )}
        </div>
      </div>

      {/* Pro upsell if not subscribed */}
      {!isPro && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Crown size={20} className="text-amber-500" />
            <h3 className="font-bold text-gray-800">Upgrade to Parent Pro — ₹199/month</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 mb-4">
            {['Real-time activity monitoring', 'Detailed learning reports', 'Screen time insights', 'Direct teacher messaging', 'Career counselor access', 'Priority support'].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[12px] text-gray-600"><CheckCircle size={12} className="text-amber-500" />{f}</div>
            ))}
          </div>
          <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700">
            View All Plans <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="flex gap-5">
        {/* Children list */}
        <div className="w-64 flex-shrink-0 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 flex items-center gap-1.5"><Users size={11} /> Your Children</p>
          {children.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
              <Users size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No children linked yet</p>
              <p className="text-[10px] text-gray-300 mt-1">Link your child&apos;s account to start monitoring</p>
            </div>
          ) : (
            children.map((child, i) => (
              <button key={i} onClick={() => loadChildActivity(child)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedChild?.id === child.id ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'
                } shadow-sm`}>
                <p className="text-sm font-bold text-gray-800">{child.username || child.name || child.full_name}</p>
                <p className="text-[10px] text-gray-400">{child.class_name ? `Class ${child.class_name}` : 'Student'} · {child.school || ''}</p>
              </button>
            ))
          )}
        </div>

        {/* Activity panel */}
        <div className="flex-1 min-w-0">
          {!selectedChild ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
              <Eye size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-600">Select a child to view activity</p>
              <p className="text-sm text-gray-400 mt-1">Click on your child&apos;s name in the sidebar</p>
            </div>
          ) : activityLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center"><Loader2 size={28} className="animate-spin text-blue-500 mx-auto" /></div>
          ) : (
            <div className="space-y-4">
              {/* Activity summary */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                <h3 className="font-bold text-gray-800 mb-4">{selectedChild.username || selectedChild.name}&apos;s Activity</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Login Streak', value: childActivity?.streak || '—', icon: Flame, color: 'text-orange-500' },
                    { label: 'Quizzes Taken', value: childActivity?.quizzes_taken || '—', icon: Brain, color: 'text-purple-500' },
                    { label: 'Syllabrix Score', value: childActivity?.syllabrix_score || '—', icon: Star, color: 'text-amber-500' },
                    { label: 'Posts Made', value: childActivity?.posts_count || '—', icon: BookOpen, color: 'text-blue-500' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                      <s.icon size={18} className={`${s.color} mx-auto mb-1`} />
                      <p className="text-xl font-extrabold text-gray-800">{s.value}</p>
                      <p className="text-[10px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro-only features */}
              {isPro ? (
                <>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center gap-1.5"><TrendingUp size={11} className="text-emerald-500" /> Learning Progress</p>
                    <p className="text-sm text-gray-500">Detailed learning analytics, subject-wise performance, and study patterns will appear here as your child uses the platform.</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center gap-1.5"><Clock size={11} className="text-blue-500" /> Screen Time</p>
                    <p className="text-sm text-gray-500">Daily and weekly screen time reports showing time spent on different features — learning vs. social activities.</p>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 text-center">
                  <Lock size={28} className="text-gray-300 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-600 mb-1">Pro Features Locked</h3>
                  <p className="text-sm text-gray-400 mb-4">Upgrade to Parent Pro to unlock detailed analytics, screen time reports, and direct teacher communication.</p>
                  <button onClick={startProTrial}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 transition-all">
                    <Crown size={14} /> Start Free Trial
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
