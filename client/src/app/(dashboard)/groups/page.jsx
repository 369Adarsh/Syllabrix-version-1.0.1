'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { groupsAPI } from '@/lib/api/groups.api';
import Link from 'next/link';
import { Users, Plus, Loader2, ChevronRight, Shield, Search } from 'lucide-react';

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    groupsAPI.getMyGroups()
      .then(r => setGroups(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-blue-600" /> My Groups
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Collaborate and learn with your peers</p>
        </div>
        <Link
          href="/groups/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> New Group
        </Link>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 flex items-center justify-center shadow-sm">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <Users size={22} className="text-blue-400" />
          </div>
          <h2 className="text-sm font-bold text-gray-700 mb-1">No groups yet</h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">Join or create a study group to collaborate with peers.</p>
          <Link href="/groups/explore" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Explore Groups <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          {groups.length > 3 && (
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
  );
}
