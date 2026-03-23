'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentsAPI } from '@/lib/api/payments.api';
import Link from 'next/link';
import {
  Crown, CheckCircle, Sparkles, Shield, GraduationCap, Zap,
  ArrowRight, Loader2, Star, Heart, Brain, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const PLAN_CARDS = [
  {
    key: 'premium_student', name: 'Premium Student', price: '₹99', period: '/month', color: 'from-indigo-600 to-purple-600',
    icon: Sparkles, tagline: 'Supercharge your learning', popular: false,
    features: ['Unlimited AI Buddy chats', 'Priority AI responses', 'Advanced mind maps & flowcharts', 'Topic quiz generator', 'Ad-free experience', 'Early access to new features'],
  },
  {
    key: 'parent_pro_monthly', name: 'Parent Pro', price: '₹199', period: '/month', color: 'from-blue-600 to-cyan-600',
    icon: Shield, tagline: '7-day free trial', popular: true, trial: true,
    features: ['Real-time activity monitoring', 'Detailed learning reports', 'Screen time insights', 'Direct teacher messaging', 'Goal setting & tracking', 'Priority support', 'Career counselor access'],
  },
  {
    key: 'certificate_unlimited', name: 'Unlimited Certs', price: '₹399', period: '/year', color: 'from-amber-500 to-orange-600',
    icon: Award, tagline: 'Skills Passport included', popular: false,
    features: ['Unlimited certificate downloads', 'QR-verified PDF certificates', 'Skills Passport PDF export', 'Auto-generated from achievements', 'Shareable verification links', 'Syllabrix verified badge'],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    paymentsAPI.getMySubscriptions().then(r => setSubscriptions(r.data?.data || [])).catch(() => {});
  }, []);

  const isActive = (planType) => subscriptions.some(s => s.plan_type === planType && ['active', 'trial'].includes(s.status));

  const handleSubscribe = async (planKey, hasTrial) => {
    setProcessingPlan(planKey);
    try {
      if (hasTrial) {
        const res = await paymentsAPI.startTrial(planKey);
        toast.success(`Trial started! Expires ${new Date(res.data?.data?.trial_ends_at).toLocaleDateString()}`);
        const subs = await paymentsAPI.getMySubscriptions();
        setSubscriptions(subs.data?.data || []);
      } else {
        const res = await paymentsAPI.createOrder(planKey);
        const order = res.data?.data;
        // In production: open Razorpay checkout
        // For now: auto-verify (demo mode)
        await paymentsAPI.verifyPayment(order.payment_id, null, null);
        toast.success('Subscription activated!');
        const subs = await paymentsAPI.getMySubscriptions();
        setSubscriptions(subs.data?.data || []);
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Payment failed'); }
    finally { setProcessingPlan(null); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200/40">
          <Crown size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Upgrade Your Learning</h1>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto">Choose the plan that fits your goals. All plans include a money-back guarantee.</p>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLAN_CARDS.map((plan, i) => {
          const active = isActive(plan.key.includes('parent') ? 'parent_pro' : plan.key.includes('cert') ? 'certificate_unlimited' : 'premium_student');
          return (
            <div key={i} className={`relative bg-white rounded-xl border shadow-sm p-6 flex flex-col transition-all hover:shadow-lg ${plan.popular ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-sm`}>
                <plan.icon size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">{plan.name}</h3>
              <p className="text-[11px] text-gray-400 mb-3">{plan.tagline}</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-400">{plan.period}</span>
              </div>
              <div className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              {active ? (
                <div className="py-3 rounded-xl text-center text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
                  ✓ Active
                </div>
              ) : (
                <button onClick={() => handleSubscribe(plan.key, plan.trial)} disabled={processingPlan === plan.key}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 bg-gradient-to-r ${plan.color} hover:shadow-xl`}>
                  {processingPlan === plan.key ? <Loader2 size={16} className="animate-spin mx-auto" /> : plan.trial ? 'Start 7-Day Free Trial' : 'Subscribe Now'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Single certificate */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm"><Award size={24} className="text-white" /></div>
          <div>
            <h3 className="font-bold text-gray-800">Single Certificate</h3>
            <p className="text-sm text-gray-500">Need just one? Download a single QR-verified certificate.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold text-gray-900">₹149</span>
          <Link href="/certificates" className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-md transition-all">View Certificates</Link>
        </div>
      </div>

      {/* Doubt solving */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm"><Brain size={24} className="text-white" /></div>
          <div>
            <h3 className="font-bold text-gray-800">Instant Doubt Solving</h3>
            <p className="text-sm text-gray-500">Free AI answers or ₹20 for a live teacher session</p>
          </div>
        </div>
        <Link href="/doubt-marketplace" className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-500 text-white hover:bg-purple-600 shadow-md transition-all">Ask a Doubt</Link>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-6">
        <h3 className="font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
        {[
          { q: 'Can I cancel anytime?', a: 'Yes! Cancel your subscription at any time. You will retain access until the end of your billing period.' },
          { q: 'Is the 7-day trial really free?', a: 'Absolutely. No card required to start the trial. You only pay if you choose to continue after 7 days.' },
          { q: 'How does certificate verification work?', a: 'Each certificate has a unique QR code. Anyone scanning it reaches a verification page on syllabrix.com confirming the certificate is genuine.' },
          { q: 'What payment methods do you accept?', a: 'We use Razorpay — UPI, credit/debit cards, net banking, wallets, and EMI options are all supported.' },
        ].map((faq, i) => (
          <div key={i} className="py-3 border-t border-gray-100 first:border-0 first:pt-0">
            <p className="text-sm font-semibold text-gray-700">{faq.q}</p>
            <p className="text-[12.5px] text-gray-500 mt-1">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
