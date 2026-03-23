'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { prepAPI } from '@/lib/api/prep.api';
import {
  Calendar, BookOpen, CheckCircle, ArrowLeft, Loader2, GraduationCap,
  Star, Clock, Building2, ExternalLink, ChevronDown, ChevronRight
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ExamDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});

  useEffect(() => {
    Promise.all([
      prepAPI.getExamBySlug(slug).catch(() => ({ data: { data: null } })),
      prepAPI.getExamSyllabus(slug).catch(() => ({ data: { data: [] } })),
      prepAPI.getExamDates(slug).catch(() => ({ data: { data: [] } })),
    ]).then(([eRes, sRes, dRes]) => {
      setExam(eRes.data?.data);
      setSyllabus(sRes.data?.data || []);
      setDates(dRes.data?.data || []);
    }).finally(() => setLoading(false));
  }, [slug]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      await prepAPI.subscribeExam(slug, {});
      toast.success('Subscribed! This exam is now in your dashboard.');
    } catch (e) { toast.error(e.response?.data?.message || 'Already subscribed or failed'); }
    finally { setSubscribing(false); }
  };

  const toggleTopic = (id) => setExpandedTopics(p => ({ ...p, [id]: !p[id] }));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-blue-500" /></div>;
  if (!exam) return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-100 p-12 text-center">
      <p className="text-gray-400">Exam not found</p>
      <Link href="/prep" className="text-sm text-blue-500 hover:text-blue-600 mt-4 inline-block">← Back to PrepSmart</Link>
    </div>
  );

  const LEVEL_COLORS = { national: 'bg-blue-100 text-blue-700', state: 'bg-emerald-100 text-emerald-700', international: 'bg-purple-100 text-purple-700', university: 'bg-amber-100 text-amber-700' };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 via-indigo-800 to-blue-700 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/prep" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowLeft size={16} className="text-white" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <GraduationCap size={20} className="text-blue-200" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">{exam.name}</h1>
          {exam.conducting_body && (
            <p className="text-blue-300/70 text-sm flex items-center gap-1.5 mb-3">
              <Building2 size={13} /> {exam.conducting_body}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {exam.exam_level && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${LEVEL_COLORS[exam.exam_level] || 'bg-gray-100 text-gray-600'}`}>
                {exam.exam_level}
              </span>
            )}
            {exam.frequency && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-blue-200">
                <Clock size={11} className="mr-1" /> {exam.frequency}
              </span>
            )}
          </div>
          <button onClick={handleSubscribe} disabled={subscribing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white text-blue-700 hover:bg-blue-50 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50">
            {subscribing ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
            Subscribe to this Exam
          </button>
        </div>
      </div>

      {/* Description */}
      {exam.description && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <p className="text-sm text-gray-700 leading-relaxed">{exam.description}</p>
        </div>
      )}

      {/* Important Dates */}
      {dates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 flex items-center gap-1.5">
            <Calendar size={11} className="text-red-500" /> Important Dates
          </p>
          <div className="space-y-2">
            {dates.map(d => {
              const dateObj = new Date(d.event_date);
              const isPast = dateObj < new Date();
              return (
                <div key={d.id} className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${isPast ? 'border-gray-100 bg-gray-50/50' : 'border-blue-100 bg-blue-50/30'}`}>
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isPast ? 'bg-gray-100' : 'bg-blue-100'}`}>
                    <span className={`text-lg font-extrabold ${isPast ? 'text-gray-400' : 'text-blue-600'}`}>{dateObj.getDate()}</span>
                    <span className="text-[9px] font-bold uppercase text-gray-400">{dateObj.toLocaleString('en', { month: 'short' })}</span>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isPast ? 'text-gray-400' : 'text-gray-800'}`}>{d.event_name}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(d.event_date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Syllabus */}
      {syllabus.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 flex items-center gap-1.5">
            <BookOpen size={11} className="text-blue-500" /> Syllabus
          </p>
          <div className="space-y-2">
            {syllabus.map(s => (
              <div key={s.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => s.children?.length && toggleTopic(s.id)}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors text-left">
                  {s.children?.length > 0 ? (
                    expandedTopics[s.id]
                      ? <ChevronDown size={16} className="text-blue-500 flex-shrink-0" />
                      : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <BookOpen size={16} className="text-blue-400 flex-shrink-0" />
                  )}
                  <p className="font-semibold text-gray-800 text-sm flex-1">{s.topic_name}</p>
                  {s.children?.length > 0 && (
                    <span className="text-[10px] text-gray-400 font-medium">{s.children.length} topics</span>
                  )}
                </button>
                {expandedTopics[s.id] && s.children?.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2 space-y-1.5">
                    {s.children.map(c => (
                      <div key={c.id} className="flex items-center gap-2.5 py-1.5">
                        <CheckCircle size={14} className="text-gray-300 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{c.topic_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
