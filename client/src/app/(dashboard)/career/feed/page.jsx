'use client';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import FeedWidgets from '@/components/career/FeedWidgets';
import PostCard from '@/components/feed/PostCard';
import CreatePostBox from '@/components/feed/CreatePostBox';
import { postsAPI } from '@/lib/api/posts.api';

export default function CareerFeedPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = useCallback(async (p = 1) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await postsAPI.getFeed({ page: p, limit: 10 });
      const data = res.data?.data || res.data || [];
      const pagination = res.data?.pagination;
      if (p === 1) setPosts(data); else setPosts(prev => [...prev, ...data]);
      setHasMore(pagination?.hasNext ?? data.length === 10);
      setPage(p);
    } catch { /* silent */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { loadPosts(1); }, [loadPosts]);

  const handlePostCreated = (newPost) => setPosts(prev => [newPost, ...prev]);
  const handleDelete = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  return (
    <div className="max-w-[1180px] mx-auto px-3 sm:px-4 pt-2 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Main feed */}
        <main className="lg:col-span-8 space-y-3">
          <CreatePostBox onPostCreated={handlePostCreated} />

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-2 bg-gray-100 rounded w-1/5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                    <div className="h-3 bg-gray-100 rounded w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
              <p className="text-sm font-semibold text-gray-700 mb-1">Nothing here yet</p>
              <p className="text-xs text-gray-400">Be the first to share a market insight.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(p => (
                <PostCard key={p.id} post={p} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <button
              onClick={() => loadPosts(page + 1)}
              disabled={loadingMore}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-all mx-auto disabled:opacity-50"
            >
              {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          )}
        </main>

        {/* Right widgets */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-20">
          <FeedWidgets />
        </aside>

      </div>
    </div>
  );
}
