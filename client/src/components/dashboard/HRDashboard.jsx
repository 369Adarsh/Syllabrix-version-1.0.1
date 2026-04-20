'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI } from '@/lib/api/jobs.api';
import { searchAPI } from '@/lib/api/search.api';
import Link from 'next/link';
import {
  Briefcase, Plus, Users, FileText, TrendingUp, Building2,
  ChevronRight, Loader2, Eye, MapPin, Clock, Sparkles,
  UserCheck, Search, BarChart3, Target, Star, Zap,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, href }) {
  const card = (
    <div className={`bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-all ${href ? 'cursor-pointer hover:border-blue-100' : ''}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function JobCard({ job }) {
  return (
    <Link href={`/jobs/${job.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
        <Briefcase size={16} className="text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{job.title || job.job_title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {job.location && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <MapPin size={9} /> {job.location}
            </span>
          )}
          {job.applications_count > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-blue-500 font-medium">
              <Users size={9} /> {job.applications_count} applied
            </span>
          )}
        </div>
      </div>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
        job.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
        job.status === 'closed' ? 'bg-gray-100 text-gray-500' :
        'bg-amber-50 text-amber-600'
      }`}>{job.status || 'active'}</span>
      <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
    </Link>
  );
}

function QuickAction({ href, icon: Icon, label, desc, color }) {
  return (
    <Link href={href}
      className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-blue-100 transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="text-[11px] text-gray-400 truncate">{desc}</p>
      </div>
      <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
    </Link>
  );
}

export default function HRDashboard() {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [candidates, setCandidates] = useState([]);

  const company = user?.profile?.company_name || user?.company_name || 'Your Company';
  const hrRole = user?.profile?.hr_role || 'HR Professional';

  useEffect(() => {
    jobsAPI.getMyPosts()
      .then(r => setMyJobs(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoadingJobs(false));

    searchAPI.search({ q: '', type: 'people', user_type: 'professional_learner', limit: 6 })
      .then(r => {
        const people = r.data?.data?.users || r.data?.data || r.data || [];
        setCandidates(Array.isArray(people) ? people.filter(p => p.id !== user?.id).slice(0, 4) : []);
      })
      .catch(() => {});
  }, [user?.id]);

  const activeJobs = myJobs.filter(j => j.status === 'active' || !j.status);
  const totalApplications = myJobs.reduce((s, j) => s + (j.applications_count || 0), 0);

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-5">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-200 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute right-12 bottom-0 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-teal-100 text-xs font-semibold uppercase tracking-widest mb-1">{hrRole}</p>
            <h1 className="text-2xl font-black leading-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || user?.username}
            </h1>
            <p className="text-teal-100 text-sm mt-1 flex items-center gap-1.5">
              <Building2 size={13} /> {company}
            </p>
          </div>
          <Link href="/jobs/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-teal-700 text-sm font-black rounded-xl hover:bg-teal-50 transition-all shadow-sm shrink-0">
            <Plus size={15} /> Post a Job
          </Link>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Active Jobs', value: activeJobs.length },
            { label: 'Total Applications', value: totalApplications },
            { label: 'Connections', value: '—' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-teal-100 text-[11px] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Briefcase}   label="Active Jobs"      value={activeJobs.length}      color="bg-emerald-500" href="/jobs/my-posts" />
        <StatCard icon={Users}       label="Applications"     value={totalApplications}       color="bg-blue-500"    href="/jobs/my-posts" />
        <StatCard icon={Search}      label="Candidates Found" value="—"                        color="bg-violet-500"  href="/explore" />
        <StatCard icon={UserCheck}   label="Connections"      value="—"                        color="bg-teal-500"    href="/groups" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* My Job Posts */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900">My Job Posts</h2>
            </div>
            <Link href="/jobs/my-posts" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {loadingJobs ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-emerald-400" />
            </div>
          ) : myJobs.length === 0 ? (
            <div className="py-12 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <Briefcase size={22} className="text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">No jobs posted yet</p>
              <p className="text-xs text-gray-400 mb-4">Post your first job to start receiving applications.</p>
              <Link href="/jobs/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                <Plus size={14} /> Post a Job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {myJobs.slice(0, 5).map(job => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-3 space-y-1.5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 py-1">Quick Actions</p>
            <QuickAction href="/jobs/create"  icon={Plus}       label="Post a Job"           desc="Create a new opening"            color="bg-emerald-500" />
            <QuickAction href="/jobs/my-posts" icon={FileText}  label="Manage Jobs"          desc="Edit, close, or review posts"    color="bg-blue-500" />
            <QuickAction href="/explore"       icon={Search}    label="Find Candidates"      desc="Browse professional learners"    color="bg-violet-500" />
            <QuickAction href="/groups"        icon={Users}     label="My Connections"       desc="Grow your talent network"        color="bg-teal-500" />
          </div>

          {/* Candidate Suggestions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
              <Sparkles size={13} className="text-violet-500" />
              <h3 className="text-sm font-bold text-gray-900">Talent Pool</h3>
            </div>
            {candidates.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-gray-400">Loading candidates...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {candidates.map(c => {
                  const avatar = c.profile_photo_url
                    || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.username || 'U')}`;
                  return (
                    <Link key={c.id} href={`/profile/${c.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                      <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-100 shrink-0"
                        onError={e => { e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=U'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{c.full_name || c.username}</p>
                        <p className="text-[11px] text-gray-400 capitalize truncate">{c.user_type?.replace('_', ' ')}</p>
                      </div>
                      <ChevronRight size={12} className="text-gray-300 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
            <div className="px-4 py-2.5 border-t border-gray-50">
              <Link href="/explore" className="text-xs font-semibold text-teal-600 hover:underline">
                Browse all candidates →
              </Link>
            </div>
          </div>

          {/* Upgrade card */}
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl p-4 text-white shadow-lg shadow-teal-200 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={12} className="text-yellow-300" />
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-100">Pro Access</p>
            </div>
            <p className="text-sm font-black leading-tight mb-3">Unlock AI Candidate Matching</p>
            <button className="w-full py-2 bg-white text-teal-700 text-xs font-black rounded-xl hover:bg-teal-50 transition-all shadow-sm">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
