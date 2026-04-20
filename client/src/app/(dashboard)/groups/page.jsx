'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { groupsAPI } from '@/lib/api/groups.api';
import { followAPI } from '@/lib/api/follow.api';
import { searchAPI } from '@/lib/api/search.api';
import Link from 'next/link';
import {
  Users, Plus, Loader2, ChevronRight, Shield,
  Search, UserPlus, UserCheck, Sparkles
} from 'lucide-react';

function SuggestedUser({ person, onConnect }) {
  const [status, setStatus] = useState('idle'); // idle | loading | connected

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
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <Link href={`/profile/${person.id}`} className="shrink-0">
        <img
          src={avatar}
          alt=""
          className="w-10 h-10 rounded-full object-cover border border-gray-100"
          onError={e => { e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=U'; }}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${person.id}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors truncate block">
          {person.full_name || person.username}
        </Link>
        <p className="text-xs text-gray-400 truncate capitalize">
          {person.user_type?.replace('_', ' ') || 'Member'}
          {person.mutual_connections > 0 && ` · ${person.mutual_connections} mutual`}
        </p>
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
         status === 'connected' ? <><UserCheck size={12} /> Connected</> :
         <><UserPlus size={12} /> Connect</>}
      </button>
    </div>
  );
}

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [search, setSearch] = useState('');
  const [dismissed, setDismissed] = useState(new Set());

  // Cross-type suggestion targeting:
  // HR professionals  → suggest professional_learner (candidates)
  // Professional learner / organization → suggest hr_professional (recruiters)
  // Others → generic suggestions
  const targetType = user?.user_type === 'hr_professional'
    ? 'professional_learner'
    : (user?.user_type === 'professional_learner' || user?.user_type === 'organization')
      ? 'hr_professional'
      : null;

  const suggestionLabel = targetType === 'professional_learner'
    ? 'Candidates you may want to hire'
    : targetType === 'hr_professional'
      ? 'HR professionals near you'
      : 'People you may know';

  useEffect(() => {
    groupsAPI.getMyGroups()
      .then(r => setGroups(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoadingGroups(false));

    const searchParams = { q: '', type: 'people', limit: 12 };
    if (targetType) searchParams.user_type = targetType;

    searchAPI.search(searchParams)
      .then(r => {
        const people = r.data?.data?.users || r.data?.data || r.data || [];
        setSuggestions(Array.isArray(people) ? people : []);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggestions(false));
  }, [user?.id]);

  const filtered = search
    ? groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups;

  const visibleSuggestions = suggestions.filter(s => s.id !== user?.id && !dismissed.has(s.id));

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-blue-600" /> Connections
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Grow your professional network</p>
        </div>
        <Link
          href="/groups/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> New Group
        </Link>
      </div>

      {/* People you may know */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
          <Sparkles size={14} className="text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900">{suggestionLabel}</h2>
        </div>

        {loadingSuggestions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-blue-400" />
          </div>
        ) : visibleSuggestions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400">No suggestions right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {visibleSuggestions.slice(0, 8).map(person => (
              <SuggestedUser
                key={person.id}
                person={person}
                onConnect={id => setDismissed(prev => new Set([...prev, id]))}
              />
            ))}
          </div>
        )}

        <div className="px-4 py-2.5 border-t border-gray-50 flex items-center justify-between">
          {visibleSuggestions.length > 8 && (
            <button className="text-xs font-semibold text-blue-600 hover:underline">
              Show more
            </button>
          )}
          <Link href="/explore" className="text-xs font-semibold text-blue-600 hover:underline ml-auto">
            {targetType === 'hr_professional' ? 'Browse HR professionals →' :
             targetType === 'professional_learner' ? 'Browse all candidates →' :
             'Explore more →'}
          </Link>
        </div>
      </div>

      {/* Groups */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Users size={14} className="text-gray-400" /> My Groups
        </h2>

        {loadingGroups ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 flex items-center justify-center shadow-sm">
            <Loader2 size={22} className="animate-spin text-blue-500" />
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Users size={20} className="text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 mb-1">No groups yet</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4">Join or create a group to collaborate with peers.</p>
            <Link href="/groups/explore" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Explore Groups <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            {groups.length > 3 && (
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search groups..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
            )}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
              {filtered.map(g => (
                <Link
                  key={g.id}
                  href={`/groups/${g.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-blue-500" />
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
                  <ChevronRight size={15} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
