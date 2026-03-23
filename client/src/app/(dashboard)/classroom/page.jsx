'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/lib/api/ai.api';
import Link from 'next/link';
import {
  BookOpen, Users, Video, FileText, Bell, MessageCircle, BarChart3,
  Plus, Settings, Loader2, Sparkles, Calendar, CheckCircle, Clock,
  Upload, Copy, Eye, Lock, Globe, ChevronRight, Star, Zap, X, Edit
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_CLASSROOMS = [
  { id: 1, name: 'Class 10 Mathematics', subject: 'Mathematics', students: 28, banner: 'from-blue-600 to-indigo-700', type: 'School Tuition', code: 'MATH10A' },
  { id: 2, name: 'Bharatanatyam Beginners', subject: 'Dance', students: 12, banner: 'from-pink-600 to-rose-700', type: 'Dance Class', code: 'DANCE01' },
  { id: 3, name: 'Guitar Workshop', subject: 'Music', students: 8, banner: 'from-amber-600 to-orange-700', type: 'Music Class', code: 'GUITAR1' },
];

const CLASS_TYPES = ['School Tuition', 'Dance Class', 'Music Class', 'Gym/Fitness', 'Pilates/Yoga', 'Art Class', 'Coding Class', 'Language Class', 'Coaching Center', 'Other'];

export default function ClassroomPage() {
  const { user } = useAuth();
  const [view, setView] = useState('list'); // list | create | room | syllabus | students | assignments
  const [classrooms, setClassrooms] = useState(DEMO_CLASSROOMS);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', subject: '', type: 'School Tuition', description: '', private: true });
  const [tab, setTab] = useState('overview'); // overview | syllabus | students | assignments | announcements | live
  const [syllabus, setSyllabus] = useState(null);
  const [syllabusLoading, setSyllabusLoading] = useState(false);

  const isTeacher = user?.user_type === 'teacher' || user?.user_type === 'institute';

  const createClassroom = () => {
    if (!createForm.name.trim()) { toast.error('Classroom name required'); return; }
    const code = createForm.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() + Math.floor(10 + Math.random() * 90);
    const newRoom = {
      id: Date.now(), name: createForm.name, subject: createForm.subject, type: createForm.type,
      students: 0, banner: 'from-emerald-600 to-teal-700', code,
    };
    setClassrooms(prev => [newRoom, ...prev]);
    toast.success(`Classroom created! Code: ${code}`);
    setShowCreate(false);
    setCreateForm({ name: '', subject: '', type: 'School Tuition', description: '', private: true });
  };

  const generateSyllabus = async () => {
    if (!activeRoom) return;
    setSyllabusLoading(true);
    try {
      const prompt = `Generate a complete syllabus for a "${activeRoom.type}" class named "${activeRoom.name}" (Subject: ${activeRoom.subject || 'General'}). Return JSON:
{
  "title": "${activeRoom.name} Syllabus",
  "duration": "3 months",
  "modules": [
    { "week": "Week 1-2", "topic": "Topic Name", "subtopics": ["Sub 1", "Sub 2"], "assignment": "Practice task", "resources": ["Resource 1"] }
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

  const openRoom = (room) => { setActiveRoom(room); setView('room'); setTab('overview'); setSyllabus(null); };

  // ═══ CLASSROOM LIST ═══
  if (view === 'list') return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-emerald-700 to-green-700 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-5 right-10 text-3xl">🏫</div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0"><BookOpen size={24} className="text-emerald-200" /></div>
          <div className="flex-1"><h1 className="text-xl font-extrabold text-white tracking-tight">My Classrooms</h1>
          <p className="text-emerald-200/70 text-sm mt-0.5">Host classes, manage syllabus, take live sessions — for any subject</p></div>
          {isTeacher && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/20 border border-white/20 text-white hover:bg-white/30 transition-all"><Plus size={14} strokeWidth={3} /> Create</button>
          )}
        </div>
      </div>

      {/* Join classroom */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-4 flex items-center gap-3">
        <Lock size={16} className="text-gray-400" />
        <input placeholder="Enter classroom code to join..." className="flex-1 text-sm focus:outline-none" />
        <button className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700">Join</button>
      </div>

      {classrooms.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-12 text-center">
          <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-600">No classrooms yet</p>
          <p className="text-xs text-gray-400 mt-1">{isTeacher ? 'Create your first classroom' : 'Join a classroom using a code'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map(room => (
            <button key={room.id} onClick={() => openRoom(room)}
              className="text-left bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <div className={`bg-gradient-to-r ${room.banner} p-4 relative`}>
                <h3 className="font-bold text-white text-sm">{room.name}</h3>
                <p className="text-white/60 text-[10px] mt-0.5">{room.type}</p>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-bold">{room.code}</div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1"><Users size={11} /> {room.students} students</span>
                  <span className="flex items-center gap-1"><BookOpen size={11} /> {room.subject || 'General'}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create Classroom Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
            <div className="flex items-center justify-between"><h2 className="font-bold text-gray-800 text-lg">Create Classroom</h2><button onClick={() => setShowCreate(false)}><X size={16} /></button></div>
            <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Classroom Name *</label>
            <input value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} placeholder="e.g. Class 10 Science, Dance Beginners"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
            <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Subject</label>
            <input value={createForm.subject} onChange={e => setCreateForm({...createForm, subject: e.target.value})} placeholder="e.g. Mathematics, Bharatanatyam, Guitar"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
            <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Class Type</label>
            <select value={createForm.type} onChange={e => setCreateForm({...createForm, type: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
              {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select></div>
            <div><label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Description</label>
            <textarea value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} placeholder="Brief description..." rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none" /></div>
            <div className="flex items-center gap-3">
              <button onClick={() => setCreateForm({...createForm, private: !createForm.private})}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${createForm.private ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                {createForm.private ? <><Lock size={12} /> Private (code only)</> : <><Globe size={12} /> Public</>}
              </button>
            </div>
            <button onClick={createClassroom} className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md">Create Classroom</button>
          </div>
        </div>
      )}
    </div>
  );

  // ═══ CLASSROOM ROOM VIEW ═══
  if (view === 'room' && activeRoom) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Banner */}
      <div className={`relative rounded-2xl bg-gradient-to-r ${activeRoom.banner} p-5 overflow-hidden`}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'16px 16px'}} />
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => setView('list')} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white">←</button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-white">{activeRoom.name}</h1>
            <p className="text-white/60 text-xs">{activeRoom.type} · {activeRoom.students} students · Code: <strong>{activeRoom.code}</strong></p>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(activeRoom.code); toast.success('Code copied!'); }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><Copy size={14} className="text-white" /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm overflow-x-auto">
        {[
          { k: 'overview', l: 'Overview', icon: Eye },
          { k: 'syllabus', l: 'Syllabus', icon: BookOpen },
          { k: 'students', l: 'Students', icon: Users },
          { k: 'assignments', l: 'Assignments', icon: FileText },
          { k: 'announcements', l: 'Announce', icon: Bell },
          { k: 'live', l: 'Live Class', icon: Video },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              tab === t.k ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
            }`}><t.icon size={12} /> {t.l}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Students', value: activeRoom.students, icon: Users, color: 'text-blue-600 bg-blue-50' },
            { label: 'Assignments', value: 3, icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Classes Held', value: 12, icon: Video, color: 'text-purple-600 bg-purple-50' },
            { label: 'Completion', value: '67%', icon: BarChart3, color: 'text-amber-600 bg-amber-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}><s.icon size={16} /></div>
              <p className="text-xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'syllabus' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          {!syllabus ? (
            <div className="text-center py-8">
              <BookOpen size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-600 mb-2">No syllabus yet</p>
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
            </div>
          )}
        </div>
      )}

      {tab === 'students' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-sm">{activeRoom.students} Students</h2>
            <span className="text-xs text-gray-400">Share code: <strong>{activeRoom.code}</strong></span>
          </div>
          <div className="space-y-2">
            {['Aarav Sharma', 'Priya Patel', 'Rohan Kumar', 'Meera Singh', 'Arjun Reddy'].map((name, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">{name.charAt(0)}</div>
                <div className="flex-1"><p className="text-sm font-semibold text-gray-700">{name}</p><p className="text-[10px] text-gray-400">Joined 2 weeks ago</p></div>
                <span className="text-[10px] text-emerald-500 font-semibold">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'assignments' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5 text-center py-12">
          <FileText size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-600">Create assignments for your students</p>
          <button className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white"><Plus size={12} className="inline mr-1" /> Create Assignment</button>
        </div>
      )}

      {tab === 'announcements' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <textarea placeholder="Write an announcement for your class..." rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-3" />
          <button className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white">Post Announcement</button>
        </div>
      )}

      {tab === 'live' && (
        <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl p-8 text-center">
          <Video size={36} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-white font-bold text-lg mb-2">Start Live Class</h2>
          <p className="text-gray-400 text-sm mb-5">Your students will be notified when you go live</p>
          <button className="px-6 py-3 rounded-xl font-bold text-sm bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all flex items-center gap-2 mx-auto">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" /> Go Live Now
          </button>
        </div>
      )}
    </div>
  );

  return null;
}
