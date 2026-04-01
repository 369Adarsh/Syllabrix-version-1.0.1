'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import Link from 'next/link';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Loader2, Star, MapPin, Globe, Award, Clock, Users, ArrowLeft, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function CoachDetailPage() {
  const { id } = useParams();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      fitnessAPI.getCoachById(id).then(r => setCoach(r.data?.data))
        .catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await fitnessAPI.enrollWithCoach(id, { plan_type: 'monthly' });
      alert('Enrollment request sent! The coach will review and accept.');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to enroll');
    } finally { setEnrolling(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-cyan-500" /></div>;
  if (!coach) return <div className="text-center py-20"><p className="text-gray-500">Coach not found</p></div>;

  const specializations = typeof coach.specialization === 'string' ? JSON.parse(coach.specialization || '[]') : (coach.specialization || []);
  const certifications = typeof coach.certifications === 'string' ? JSON.parse(coach.certifications || '[]') : (coach.certifications || []);
  const languages = typeof coach.languages === 'string' ? JSON.parse(coach.languages || '[]') : (coach.languages || []);

  return (
    <div className="max-w-[700px] mx-auto">
      <Link href="/fitness/coaches" className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 mb-4 font-medium">
        <ArrowLeft size={16} /> Back to Coaches
      </Link>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-[28px] font-extrabold flex-shrink-0">
              {coach.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-[22px] font-extrabold">{coach.full_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-0.5"><Star size={14} className="text-amber-300 fill-amber-300" /><span className="font-bold">{coach.rating || '—'}</span></div>
                <span className="text-cyan-200">•</span>
                <span className="text-[12px] text-cyan-100">{coach.years_experience} years experience</span>
                <span className="text-cyan-200">•</span>
                <span className="text-[12px] text-cyan-100">{coach.total_clients} clients</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {coach.bio && (
            <div>
              <h3 className="text-[12px] font-bold text-gray-500 uppercase mb-1">About</h3>
              <p className="text-[13px] text-gray-700 leading-relaxed">{coach.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-[12px] font-bold text-gray-500 uppercase mb-2">Specialization</h3>
              <div className="flex flex-wrap gap-1">
                {specializations.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-medium capitalize">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[12px] font-bold text-gray-500 uppercase mb-2">Languages</h3>
              <div className="flex flex-wrap gap-1">
                {languages.map((l, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-medium">{l}</span>
                ))}
              </div>
            </div>
          </div>

          {certifications.length > 0 && (
            <div>
              <h3 className="text-[12px] font-bold text-gray-500 uppercase mb-2">Certifications</h3>
              <div className="space-y-1">
                {certifications.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Award size={14} className="text-amber-500" />
                    <span className="text-[12px] text-gray-700">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <Globe size={16} className="text-gray-400 mx-auto mb-1" />
              <p className="text-[12px] font-bold text-gray-700 capitalize">{coach.mode}</p>
              <p className="text-[9px] text-gray-400">Mode</p>
            </div>
            {coach.location && (
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <MapPin size={16} className="text-gray-400 mx-auto mb-1" />
                <p className="text-[12px] font-bold text-gray-700">{coach.location}</p>
                <p className="text-[9px] text-gray-400">Location</p>
              </div>
            )}
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <Users size={16} className="text-gray-400 mx-auto mb-1" />
              <p className="text-[12px] font-bold text-gray-700">{coach.total_plans || 0}</p>
              <p className="text-[9px] text-gray-400">Plans Created</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200/50">
            <h3 className="text-[12px] font-bold text-emerald-700 uppercase mb-2">Pricing</h3>
            <div className="flex gap-4">
              {coach.pricing_monthly && (
                <div>
                  <p className="text-[22px] font-extrabold text-emerald-600">₹{coach.pricing_monthly}</p>
                  <p className="text-[10px] text-gray-500">per month</p>
                </div>
              )}
              {coach.pricing_session && (
                <div>
                  <p className="text-[22px] font-extrabold text-emerald-600">₹{coach.pricing_session}</p>
                  <p className="text-[10px] text-gray-500">per session</p>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <button onClick={handleEnroll} disabled={enrolling}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[13px] font-bold hover:shadow-lg transition-all disabled:opacity-50">
              {enrolling ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
              Enroll with {coach.full_name?.split(' ')[0]}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
