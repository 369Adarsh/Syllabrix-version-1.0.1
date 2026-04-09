'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/Animate';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { Video, Loader2, Users, Clock, Calendar, Play, Search, ChevronRight } from 'lucide-react';
import LottieAnimation from '@/components/ui/LottieAnimation';

export default function BrowseLiveClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/live-classes?${filter === 'upcoming' ? 'upcoming=true' : 'status=' + filter}&limit=20`)
      .then(r => setClasses(r.data?.data?.classes || r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const isTeacher = user?.user_type === 'teacher' || user?.user_type === 'institute';

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Hero */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 p-6">
          <div className="absolute top-0 right-0 w-72 h-72 bg-fuchsia-400/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <LottieAnimation src="/animations/live-broadcast.json" className="w-16 h-16 hidden sm:block" />
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">Live Classes</h1>
                <p className="text-purple-200/70 text-sm mt-0.5">Join live sessions hosted by teachers and mentors</p>
              </div>
            </div>
            {isTeacher && (
              <Link href="/teacher-studio" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/20 border border-white/20 text-white hover:bg-white/30 transition-all flex-shrink-0">
                Manage Classes <ChevronRight size={12} />
              </Link>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Filters */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {[
          { k: 'upcoming', l: 'Upcoming' },
          { k: 'live', l: '🔴 Live Now' },
          { k: 'ended', l: 'Past' },
        ].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f.k ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
            }`}>{f.l}</button>
        ))}
      </div>

      {/* Class List */}
      {loading ? (
        <div className="text-center py-16"><Loader2 size={28} className="animate-spin text-purple-500 mx-auto" /></div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Video size={28} className="text-purple-400" />
          </div>
          <h2 className="font-bold text-gray-700 mb-2">No Classes Found</h2>
          <p className="text-sm text-gray-400">{filter === 'upcoming' ? 'No upcoming classes scheduled yet. Check back later!' : 'No classes match this filter.'}</p>
        </div>
      ) : (
        <StaggerChildren className="space-y-3">
          {classes.map((cls) => (
            <StaggerItem key={cls.id}>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center text-white shrink-0">
                    <span className="text-[10px] uppercase font-black opacity-80 leading-none">{new Date(cls.scheduled_at).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-black leading-none mt-0.5">{new Date(cls.scheduled_at).getDate()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cls.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' : cls.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{cls.status}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cls.class_type === 'paid' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>{cls.class_type === 'paid' ? 'Private' : 'Public'}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{cls.title}</h3>
                    <p className="text-[12px] text-gray-500 mt-1 flex flex-wrap gap-3">
                      <span className="flex items-center gap-1"><Users size={11} /> {cls.host_username || 'Teacher'}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(cls.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {cls.duration_minutes}m</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {cls.attendee_count || 0}/{cls.max_students}</span>
                    </p>
                  </div>
                </div>
                {(cls.status === 'live' || cls.status === 'scheduled') && (
                  <Link href={`/live-classes/room/${cls.room_id}`}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-bold rounded-lg transition-colors shrink-0">
                    {cls.status === 'live' ? 'Join Now' : 'Enter Room'} <Play size={14} />
                  </Link>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
