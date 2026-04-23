'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { groupsAPI } from '@/lib/api/groups.api';
import { followAPI } from '@/lib/api/follow.api';
import { searchAPI } from '@/lib/api/search.api';
import Link from 'next/link';
import {
  Users, Plus, Loader2, ChevronRight, Shield,
  Search, UserPlus, UserCheck, GraduationCap,
  Briefcase, Heart, Star, BookOpen
} from 'lucide-react';

const TABS = [
  {
    type: 'student',
    label: 'Students',
    shortLabel: 'Students',
    description: 'Connect with fellow students',
    icon: GraduationCap,
    activeColor: 'text-blue-600',
    activeBg: 'bg-blue-600',
    activeBorder: 'border-blue-600',
    pillBg: 'bg-blue-50',
    pillText: 'text-blue-600',
  },
  {
    type: 'mentor',
    label: 'Mentors',
    shortLabel: 'Mentors',
    description: 'Learn from experienced mentors',
    icon: Star,
    activeColor: 'text-amber-600',
    activeBg: 'bg-amber-600',
    activeBorder: 'border-amber-500',
    pillBg: 'bg-amber-50',
    pillText: 'text-amber-600',
  },
  {
    type: 'hr_professional',
    label: 'HR Professionals',
    shortLabel: 'HR',
    description: 'Connect with recruiters & HR teams',
    icon: Briefcase,
    activeColor: 'text-purple-600',
    activeBg: 'bg-purple-600',
    activeBorder: 'border-purple-500',
    pillBg: 'bg-purple-50',
    pillText: 'text-purple-600',
  },
  {
    type: 'professional_learner',
    label: 'Professionals',
    shortLabel: 'Professionals',
    description: 'Network with working professionals',
    icon: BookOpen,
    activeColor: 'text-emerald-600',
    activeBg: 'bg-emerald-600',
    activeBorder: 'border-emerald-500',
    pillBg: 'bg-emerald-50',
    pillText: 'text-emerald-600',
  },
  {
    type: 'parent',
    label: 'Parents',
    shortLabel: 'Parents',
    description: 'Connect with parents in our community',
    icon: Heart,
    activeColor: 'text-rose-600',
    activeBg: 'bg-rose-600',
    activeBorder: 'border-rose-500',
    pillBg: 'bg-rose-50',
    pillText: 'text-rose-600',
  },
  {
    type: '__groups__',
    label: 'My Groups',
    shortLabel: 'Groups',
    description: 'Groups you belong to',
    icon: Users,
    activeColor: 'text-indigo-600',
    activeBg: 'bg-indigo-600',
    activeBorder: 'border-indigo-500',
    pillBg: 'bg-indigo-50',
    pillText: 'text-indigo-600',
  },
];

function SuggestedUser({ person, onConnect }) {
  const [status, setStatus] = useState('idle');

  const handle = async () => {
    setStatus('loading');
    try {
      await followAPI.toggle(person.id);
      setStatus('connected');
      onConnect?.(person.id);
    } catch {
      setStatus('idle');
    }
  };

  const avatar = person.profile_photo_url
    || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.username || 'U')}`;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
      <Link href={`/profile/${person.id}`} className="shrink-0">
        <img
          src={avatar}
          alt=""
          className="w-11 h-11 rounded-full object-cover border border-gray-100"
          onError={e => { e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=U'; }}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${person.id}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors truncate block">
          {person.full_name || person.username}
        </Link>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {person.headline || person.bio?.slice(0, 50) || person.user_type?.replace(/_/g, ' ') || 'Member'}
        </p>
        {person.city && (
          <p className="text-[11px] text-gray-300 truncate">{person.city}{person.state ? `, ${person.state}` : ''}</p>
        )}
      </div>
      <button
        onClick={handle}
        disabled={status !== 'idle'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
          status === 'connected'
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
        } disabled:opacity-60`}
      >
        {status === 'loading' ? <Loader2 size={12} className="animate-spin" /> :
         status === 'connected' ? <><UserCheck size={12} /> Following</> :
         <><UserPlus size={12} /> Connect</>}
      </button>
    </div>
  );
}

function PeopleTab({ tab, currentUserId }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());
  const [searchQ, setSearchQ] = useState('');
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    searchAPI.search({ q: '', type: 'user', limit: 20, user_type: tab.type })
      .then(r => {
        const raw = r.data?.data?.users || r.data?.data || r.data || [];
        setPeople(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setPeople([]))
      .finally(() => setLoading(false));
  }, [tab.type]);

  const visible = people.filter(p =>
    p.id !== currentUserId &&
    !dismissed.has(p.id) &&
    (!searchQ || (p.full_name || p.username || '').toLowerCase().includes(searchQ.toLowerCase()))
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Tab content header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">{tab.description}</p>
          </div>
          {!loading && visible.length > 0 && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tab.pillBg} ${tab.pillText} shrink-0`}>
              {visible.length} {visible.length === 1 ? 'person' : 'people'}
            </span>
          )}
        </div>
        <div className="relative mt-3">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder={`Search ${tab.label.toLowerCase()}...`}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Loader2 size={22} className={`animate-spin ${tab.activeColor}`} />
          <p className="text-xs text-gray-400">Loading {tab.label.toLowerCase()}...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="py-16 text-center">
          <div className={`w-12 h-12 rounded-2xl ${tab.pillBg} flex items-center justify-center mx-auto mb-3`}>
            <tab.icon size={22} className={tab.activeColor} />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">
            {searchQ ? 'No results found' : `No ${tab.label.toLowerCase()} yet`}
          </p>
          <p className="text-xs text-gray-400">
            {searchQ ? 'Try a different search term' : 'Check back later for suggestions'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {visible.map(person => (
            <SuggestedUser
              key={person.id}
              person={person}
              onConnect={id => setDismissed(prev => new Set([...prev, id]))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupsTab() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    groupsAPI.getMyGroups()
      .then(r => setGroups(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups;

  if (loading) return (
    <div className="bg-white border border-gray-100 rounded-2xl p-10 flex items-center justify-center shadow-sm">
      <Loader2 size={22} className="animate-spin text-indigo-500" />
    </div>
  );

  if (groups.length === 0) return (
    <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
        <Users size={22} className="text-indigo-400" />
      </div>
      <h3 className="text-sm font-bold text-gray-700 mb-1">No groups yet</h3>
      <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4">Join or create a group to collaborate with peers.</p>
      <Link href="/groups/explore" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
        Explore Groups <ChevronRight size={14} />
      </Link>
    </div>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">Groups you belong to</p>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
            {groups.length} group{groups.length !== 1 ? 's' : ''}
          </span>
        </div>
        {groups.length > 3 && (
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all bg-gray-50"
            />
          </div>
        )}
      </div>
      <div className="divide-y divide-gray-50">
        {filtered.map(g => (
          <Link
            key={g.id}
            href={`/groups/${g.id}`}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Users size={18} className="text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{g.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{g.member_count} members · {g.group_type}</p>
            </div>
            {g.my_role === 'admin' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold shrink-0">
                <Shield size={9} /> Admin
              </span>
            )}
            <ChevronRight size={15} className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('student');

  const activeTabDef = TABS.find(t => t.type === activeTab) || TABS[0];

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-blue-600" /> Connections
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Grow your network across all communities</p>
        </div>
        <Link
          href="/groups/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> New Group
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max">
            {TABS.map(tab => {
              const isActive = activeTab === tab.type;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type)}
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? `${tab.activeColor} ${tab.activeBorder} bg-gray-50`
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} />
                  {tab.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === '__groups__' ? (
        <GroupsTab />
      ) : (
        <PeopleTab
          key={activeTab}
          tab={activeTabDef}
          currentUserId={user?.id}
        />
      )}

    </div>
  );
}
