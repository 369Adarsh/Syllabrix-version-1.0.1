'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { profileAPI } from '@/lib/api/profile.api';
import { followAPI } from '@/lib/api/follow.api';
import Avatar from '@/components/ui/Avatar';
import toast from 'react-hot-toast';
import { TrendingUp, Users } from 'lucide-react';

export default function RightPanel() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileAPI.getSuggestions()
      .then(r => setSuggestions(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (userId, i) => {
    try {
      await followAPI.toggle(userId);
      setSuggestions(p => p.filter((_, idx) => idx !== i));
      toast.success('Following!');
    } catch {}
  };

  return (
    <div className="hidden lg:flex w-[260px] shrink-0 flex-col gap-3 sticky top-[72px] self-start max-h-[calc(100vh-88px)] overflow-y-auto scrollbar-hide pb-4">

      {/* People you may know */}
      <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
        <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-1.5">
          <Users size={13} className="text-blue-500" /> People You May Know
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2.5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-2.5">
            {suggestions.slice(0, 5).map((u, i) => (
              <div key={u.id} className="flex items-center justify-between">
                <Link href={`/profile/${u.id}`} className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={u.profile_photo_url} size="xs" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{u.username}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{u.user_type}</p>
                  </div>
                </Link>
                <button onClick={() => handleFollow(u.id, i)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-gray-400 text-center py-2">No suggestions right now</p>
        )}
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
        <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-1.5">
          <TrendingUp size={13} className="text-emerald-500" /> Trending Topics
        </h3>
        <div className="space-y-1">
          {[
            { tag: '#ExamPrep2026', count: '2.4K', category: 'Education' },
            { tag: '#AILearning', count: '1.8K', category: 'Technology' },
            { tag: '#CareerExplore', count: '1.2K', category: 'Careers' },
            { tag: '#NEP2025', count: '987', category: 'Policy' },
          ].map((item, i) => (
            <Link key={i} href={`/explore?q=${encodeURIComponent(item.tag)}`}
              className="flex items-start justify-between py-1.5 px-1 rounded-lg hover:bg-[#F0F2F5] transition-colors group">
              <div>
                <p className="text-[10px] text-gray-400">{item.category} · Trending</p>
                <p className="text-[12px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{item.tag}</p>
              </div>
              <span className="text-[10px] text-gray-400 mt-1">{item.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-2 py-1">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          <Link href="/pricing" className="hover:text-gray-600">Premium</Link> · <Link href="/settings" className="hover:text-gray-600">Settings</Link> · <Link href="/" className="hover:text-gray-600">About</Link>
        </p>
        <p className="text-[9px] text-gray-300 mt-1">© 2026 Syllabrix</p>
      </div>
    </div>
  );
}
