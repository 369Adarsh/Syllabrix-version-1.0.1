'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { groupsAPI } from '@/lib/api/groups.api';
import Link from 'next/link';
import { Users, Plus, Loader2, ChevronRight, Shield } from 'lucide-react';

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { groupsAPI.getMyGroups().then(r => setGroups(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm"><Users size={20} className="text-white" /></div>
          <div><h1 className="font-bold text-lg text-gray-800">My Groups</h1><p className="text-[11px] text-gray-400">Collaborate and learn together</p></div>
        </div>
      </div>

      {loading ? <div className="text-center py-16"><Loader2 size={28} className="animate-spin text-blue-500 mx-auto" /></div>
      : groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4"><Users size={28} className="text-blue-400" /></div>
          <h2 className="font-bold text-gray-700 mb-2">No Groups Yet</h2>
          <p className="text-sm text-gray-400">Join or create a study group to collaborate with peers.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(g => (
            <Link key={g.id} href={`/groups/${g.id}`}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                <Users size={22} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{g.name}</p>
                <p className="text-[11px] text-gray-400">{g.member_count} members · {g.group_type}</p>
              </div>
              {g.my_role === 'admin' && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold"><Shield size={10} /> Admin</span>
              )}
              <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
