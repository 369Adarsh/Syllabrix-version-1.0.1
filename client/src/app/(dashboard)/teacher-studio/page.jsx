'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/Animate';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import {
  Video, CalendarPlus, Users, Link2, Clock, Calendar as CalIcon, Loader2, Play,
  BookOpen, FileText, Bell, Sparkles, CheckCircle, Plus, Copy, Eye, Lock, Globe, X, Settings
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api-client';
import RoleGuard from '@/components/auth/RoleGuard';
import toast from 'react-hot-toast';
import LottieAnimation from '@/components/ui/LottieAnimation';

export default function TeacherStudioPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeClass, setActiveClass] = useState(null);
  const [tab, setTab] = useState('overview');

  // Schedule Form
  const [showScheduler, setShowScheduler] = useState(false);
  const [formData, setFormData] = useState({
    title: '', subject: '', scheduled_at: '', duration_minutes: 60, max_students: 100, class_type: 'free', description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Syllabus
  const [syllabus, setSyllabus] = useState(null);
  const [syllabusLoading, setSyllabusLoading] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/live-classes/my-classes');
      setClasses(res.data?.data || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    setIsSubmitting(true);
    try {
      await apiClient.post('/live-classes', formData);
      setFormData({ title: '', subject: '', scheduled_at: '', duration_minutes: 60, max_students: 100, class_type: 'free', description: '' });
      setShowScheduler(false);
      fetchClasses();
      toast.success('Class scheduled!');
    } catch (err) { toast.error('Failed to schedule. Check fields.'); }
    finally { setIsSubmitting(false); }
  };

  const generateSyllabus = async () => {
    if (!activeClass) return;
    setSyllabusLoading(true);
    try {
      const prompt = `Generate a complete syllabus for a class titled "${activeClass.title}" (Subject: ${activeClass.subject || 'General'}). Return JSON:
{
  "title": "${activeClass.title} Syllabus",
  "duration": "3 months",
  "modules": [
    { "week": "Week 1-2", "topic": "Topic Name", "subtopics": ["Sub 1", "Sub 2"], "assignment": "Practice task" }
  ],
  "assessment": "How students will be tested",
  "prerequisites": "What students need before joining"
}
ONLY valid JSON.`;
      const res = await aiAPI.buddyChat(prompt, null, {});
      const reply = res.data?.data?.reply || res.data?.data;
      try { setSyllabus(JSON.parse(typeof reply === 'string' ? reply.replace(/```json|```/g, '').trim() : JSON.stringify(reply))); }
      catch { setSyllabus({ raw: reply }); }
    } catch { toast.error('Could not generate syllabus'); }
    finally { setSyllabusLoading(false); }
  };

  const openClassDetail = (cls) => { setActiveClass(cls); setTab('overview'); setSyllabus(null); };
  const backToList = () => { setActiveClass(null); };

  // ═══════════════ CLASS DETAIL VIEW ═══════════════
  if (activeClass) return (
    <RoleGuard allowedRoles={['teacher', 'institute']} fallback={<div className="flex items-center justify-center h-[50vh]"><h2 className="text-xl font-bold text-slate-500">Access Denied</h2></div>}>
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 p-5 overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'16px 16px'}} />
          <div className="relative z-10 flex items-center gap-3">
            <button onClick={backToList} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">←</button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${activeClass.status === 'live' ? 'bg-red-500 text-white animate-pulse' : activeClass.status === 'scheduled' ? 'bg-amber-400 text-amber-900' : 'bg-white/20 text-white'}`}>{activeClass.status}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${activeClass.class_type === 'paid' ? 'bg-purple-400/30 text-purple-100' : 'bg-emerald-400/30 text-emerald-100'}`}>{activeClass.class_type === 'paid' ? 'Private' : 'Public'}</span>
              </div>
              <h1 className="text-xl font-extrabold text-white">{activeClass.title}</h1>
              <p className="text-white/60 text-xs mt-0.5">{activeClass.subject} · {activeClass.duration_minutes}min · Room: <strong>{activeClass.room_id}</strong></p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/live-classes/room/' + activeClass.room_id); toast.success('Invite link copied!'); }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><Copy size={14} className="text-white" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm overflow-x-auto">
          {[
            { k: 'overview', l: 'Overview', icon: Eye },
            { k: 'syllabus', l: 'AI Syllabus', icon: BookOpen },
            { k: 'students', l: 'Students', icon: Users },
            { k: 'assignments', l: 'Assignments', icon: FileText },
            { k: 'announcements', l: 'Announce', icon: Bell },
            { k: 'live', l: 'Go Live', icon: Video },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                tab === t.k ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}><t.icon size={12} /> {t.l}</button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Enrolled', value: activeClass.attendee_count || 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
              { label: 'Max Capacity', value: activeClass.max_students, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Duration', value: `${activeClass.duration_minutes}m`, icon: Clock, color: 'text-purple-600 bg-purple-50' },
              { label: 'Scheduled', value: new Date(activeClass.scheduled_at).toLocaleDateString(), icon: CalIcon, color: 'text-amber-600 bg-amber-50' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}><s.icon size={16} /></div>
                <p className="text-xl font-extrabold text-gray-800">{s.value}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── AI Syllabus ── */}
        {tab === 'syllabus' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            {!syllabus ? (
              <div className="text-center py-8">
                <BookOpen size={28} className="text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-gray-600 mb-2">No syllabus yet</p>
                <p className="text-xs text-gray-400 mb-4">Let AI generate a structured curriculum for this class</p>
                <button onClick={generateSyllabus} disabled={syllabusLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md mx-auto disabled:opacity-50">
                  {syllabusLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI Generate Syllabus
                </button>
              </div>
            ) : syllabus.raw ? (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{syllabus.raw}</p>
            ) : (
              <div className="space-y-3">
                <h2 className="font-bold text-gray-800">{syllabus.title}</h2>
                <p className="text-xs text-gray-400">Duration: {syllabus.duration}</p>
                {syllabus.prerequisites && <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-3">⚡ Prerequisites: {syllabus.prerequisites}</p>}
                {syllabus.modules?.map((m, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold">{m.week}</span>
                      <h3 className="font-bold text-sm text-gray-800">{m.topic}</h3>
                    </div>
                    <div className="space-y-1 ml-3">{m.subtopics?.map((s, j) => (
                      <p key={j} className="text-[12px] text-gray-600 flex items-start gap-1.5"><CheckCircle size={11} className="text-emerald-400 mt-0.5 flex-shrink-0" />{s}</p>
                    ))}</div>
                    {m.assignment && <p className="text-[11px] text-purple-600 mt-2 ml-3">📝 {m.assignment}</p>}
                  </div>
                ))}
                {syllabus.assessment && <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">📊 Assessment: {syllabus.assessment}</p>}
              </div>
            )}
          </div>
        )}

        {/* ── Students ── */}
        {tab === 'students' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-sm">Enrolled Students</h2>
              <span className="text-xs text-gray-400">Share Room ID: <strong>{activeClass.room_id}</strong></span>
            </div>
            <p className="text-sm text-gray-500 text-center py-8">Student enrollment data will appear here once students join via the room link or schedule widget.</p>
          </div>
        )}

        {/* ── Assignments ── */}
        {tab === 'assignments' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center py-12">
            <FileText size={28} className="text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-600">Create assignments for your students</p>
            <button className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"><Plus size={12} className="inline mr-1" /> Create Assignment</button>
          </div>
        )}

        {/* ── Announcements ── */}
        {tab === 'announcements' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <textarea placeholder="Write an announcement for your class..." rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 mb-3" />
            <button className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">Post Announcement</button>
          </div>
        )}

        {/* ── Go Live ── */}
        {tab === 'live' && (
          <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl p-8 text-center">
            <Video size={36} className="text-red-400 mx-auto mb-3" />
            <h2 className="text-white font-bold text-lg mb-2">Enter Broadcast Studio</h2>
            <p className="text-gray-400 text-sm mb-5">Students will join via the schedule widget on their homepage</p>
            <Link href={`/live-classes/room/${activeClass.room_id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" /> Go Live Now
            </Link>
          </div>
        )}
      </div>
    </RoleGuard>
  );

  // ═══════════════ CLASS LIST VIEW ═══════════════
  return (
    <RoleGuard
      allowedRoles={['teacher', 'institute']}
      fallback={<div className="flex items-center justify-center h-[50vh]"><h2 className="text-xl font-bold text-slate-500">Access Denied. Connect a Teacher Profile.</h2></div>}
    >
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Hero Header */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 p-6">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <LottieAnimation src="/animations/teacher-presenting.json" className="w-20 h-20 hidden sm:block" />
                <div>
                  <h1 className="text-xl font-extrabold text-white tracking-tight">Teacher Studio</h1>
                  <p className="text-blue-200/70 text-sm mt-0.5">Schedule classes, generate curricula, broadcast live — all in one place</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/images/illustrations/teacher.png" alt="Teacher" width={80} height={80} className="w-20 h-20 rounded-xl object-cover ring-2 ring-white/10 hidden lg:block" />
                <button onClick={() => setShowScheduler(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/20 border border-white/20 text-white hover:bg-white/30 transition-all flex-shrink-0">
                  <CalendarPlus size={14} strokeWidth={3} /> Schedule Class
                </button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Classes', value: classes.length, icon: Video, color: 'text-blue-600 bg-blue-50' },
            { label: 'Upcoming', value: classes.filter(c => c.status === 'scheduled').length, icon: CalIcon, color: 'text-amber-600 bg-amber-50' },
            { label: 'Live Now', value: classes.filter(c => c.status === 'live').length, icon: Play, color: 'text-red-600 bg-red-50' },
            { label: 'Completed', value: classes.filter(c => c.status === 'ended' || c.status === 'completed').length, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}><s.icon size={14} /></div>
              <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Class Cards */}
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex mx-auto items-center justify-center mb-4 text-blue-400"><Video size={24} /></div>
            <h3 className="font-bold text-slate-700 text-lg">No Classes Yet</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">Click "Schedule Class" above to create your first live broadcast.</p>
          </div>
        ) : (
          <StaggerChildren className="space-y-3">
            {classes.map(cls => (
              <StaggerItem key={cls.id}>
                <button onClick={() => openClassDetail(cls)}
                  className="w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 p-5 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex flex-col items-center justify-center text-white shrink-0">
                      <span className="text-[10px] uppercase font-black opacity-80 leading-none">{new Date(cls.scheduled_at).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-black leading-none mt-0.5">{new Date(cls.scheduled_at).getDate()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cls.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : cls.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>{cls.status}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cls.class_type === 'paid' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>{cls.class_type === 'paid' ? 'Private' : 'Public'}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">{cls.title}</h3>
                      <p className="text-[13px] text-slate-500 mt-1 flex gap-3">
                        <span className="flex items-center gap-1"><CalIcon size={12}/> {new Date(cls.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {cls.duration_minutes}m</span>
                        <span className="flex items-center gap-1"><Users size={12}/> {cls.attendee_count || 0}/{cls.max_students}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {cls.status !== 'completed' && cls.status !== 'cancelled' && (
                      <Link href={`/live-classes/room/${cls.room_id}`} onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-[13px] font-bold rounded-lg transition-colors">
                        Enter Studio <Play size={14} />
                      </Link>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.origin + '/live-classes/room/' + cls.room_id); toast.success('Link copied!'); }}
                      className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                      <Link2 size={15} />
                    </button>
                  </div>
                </button>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}

        {/* ═══ Schedule Class Modal ═══ */}
        {showScheduler && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowScheduler(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-800 text-lg">Schedule a Class</h2>
                <button onClick={() => setShowScheduler(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
              </div>

              <form onSubmit={handleSchedule} className="space-y-4 text-[13px]">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Title *</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Advanced Calculus Ch. 4" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                    <input value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200" placeholder="Mathematics" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Access Level</label>
                    <select value={formData.class_type} onChange={e => setFormData({...formData, class_type: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white">
                      <option value="free">Public (Free)</option>
                      <option value="paid">Private (Invite Only)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input type="datetime-local" required value={formData.scheduled_at} onChange={e => setFormData({...formData, scheduled_at: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Duration (Min)</label>
                    <input type="number" min="15" max="180" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Students</label>
                    <input type="number" min="1" max="500" value={formData.max_students} onChange={e => setFormData({...formData, max_students: Number(e.target.value)})}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200" />
                  </div>
                </div>
                <button disabled={isSubmitting} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Video size={16} /> Schedule Broadcast</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
