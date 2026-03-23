'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';
import PostCard from '@/components/feed/PostCard';
import { Bookmark, Loader2 } from 'lucide-react';

export default function SavedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { postsAPI.getSaved().then(r => setPosts(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm"><Bookmark size={20} className="text-white" /></div>
        <div><h1 className="font-bold text-lg text-gray-800">Saved Posts</h1><p className="text-[11px] text-gray-400">{posts.length} saved</p></div>
      </div>
      {loading ? <div className="text-center py-16"><Loader2 size={28} className="animate-spin text-amber-500 mx-auto" /></div>
      : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4"><Bookmark size={28} className="text-amber-400" /></div>
          <h2 className="font-bold text-gray-700 mb-2">No Saved Posts</h2>
          <p className="text-sm text-gray-400">Bookmark posts to find them here later.</p>
        </div>
      ) : <div className="space-y-4">{posts.map(p => <PostCard key={p.id} post={p} />)}</div>}
    </div>
  );
}
