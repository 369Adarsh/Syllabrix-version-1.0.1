'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { searchAPI } from '@/lib/api/search.api';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';
import { Search, Loader2, Users, TrendingUp, Hash } from 'lucide-react';

export default function ExplorePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState(null);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { searchAPI.getTrending().then(r => setTrending(r.data?.data || [])).catch(() => {}); }, []);
  useEffect(() => { if (query) doSearch(query); }, []);

  const doSearch = async (q) => {
    if (!q || q.length < 2) return;
    setLoading(true);
    try { const res = await searchAPI.search({ q, type: 'user' }); setResults(res.data?.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-700 p-6">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-xl font-extrabold text-white mb-3">Explore</h1>
          <form onSubmit={e => { e.preventDefault(); doSearch(query); }}>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search users, topics, hashtags..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm" />
            </div>
          </form>
        </div>
      </div>

      {loading && <div className="text-center py-12"><Loader2 size={28} className="animate-spin text-blue-500 mx-auto" /></div>}

      {results?.users?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden divide-y divide-gray-50">
          {results.users.map(u => (
            <Link key={u.id} href={`/profile/${u.id}`}
              className="flex items-center gap-3 p-4 hover:bg-blue-50/30 transition-colors">
              <Avatar src={u.profile_photo_url} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{u.username}</p>
                {u.bio && <p className="text-xs text-gray-400 truncate">{u.bio}</p>}
              </div>
              <span className="text-[11px] text-gray-400 font-medium capitalize bg-gray-50 px-2.5 py-1 rounded-full">{u.user_type}</span>
            </Link>
          ))}
        </div>
      )}

      {!loading && !results && trending.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center gap-1.5"><TrendingUp size={11} className="text-blue-500" /> Trending</p>
          <div className="space-y-2">
            {trending.map((t, i) => (
              <button key={i} onClick={() => { setQuery(t.term || t); doSearch(t.term || t); }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-all text-left">
                <Hash size={14} className="text-blue-400" />
                <span className="text-sm font-medium text-gray-700">{t.term || t}</span>
                {t.count && <span className="text-[10px] text-gray-400 ml-auto">{t.count} posts</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {query && !loading && (!results || (results.users?.length === 0 && results.posts?.length === 0)) && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Search size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-600">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-gray-400 mt-1">Try different keywords or check spelling</p>
        </div>
      )}
    </div>
  );
}
