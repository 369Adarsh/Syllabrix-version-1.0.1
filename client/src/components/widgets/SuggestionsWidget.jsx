'use client';
import { useEffect, useState } from 'react';
import { followAPI } from '@/lib/api/follow.api';
import apiClient from '@/lib/api-client';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function SuggestionsWidget() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState({});

  useEffect(() => {
    apiClient.get('/follow/suggestions')
      .then(r => setSuggestions((r.data?.data || r.data || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (userId) => {
    try {
      await followAPI.toggle(userId);
      setFollowed(prev => ({ ...prev, [userId]: true }));
    } catch {}
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Suggestions</p>
        <Link href="/explore" className="text-[11px] font-semibold text-[#378ADD] hover:underline">See all</Link>
      </div>
      {loading ? (
        <div className="space-y-2.5 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg" />)}
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-[12px] text-gray-400">No suggestions right now</p>
      ) : (
        <div className="space-y-2">
          {suggestions.map(u => (
            <div key={u.id} className="flex items-center gap-2">
              <Link href={`/profile/${u.username}`} className="flex-1 flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#378ADD] to-[#534AB7] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {u.profile_photo_url ? (
                    <Image src={u.profile_photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-[10px]">{u.username?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{u.profile?.full_name || u.username}</p>
                  <p className="text-[10px] text-gray-400 truncate capitalize">{u.user_type}</p>
                </div>
              </Link>
              <button
                onClick={() => handleFollow(u.id)}
                disabled={followed[u.id]}
                className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  followed[u.id]
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : 'bg-blue-50 text-[#378ADD] hover:bg-blue-100'
                }`}
              >
                {followed[u.id] ? 'Following' : <><UserPlus size={10} /> Follow</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
