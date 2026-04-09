'use client';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import ProfessionalDashboard from './ProfessionalDashboard';
import ParentDashboard from './ParentDashboard';
import { Loader2, ShieldAlert, Users } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { postsAPI } from '@/lib/api/posts.api';
import CreatePostBox from '@/components/feed/CreatePostBox';
import PostCard from '@/components/feed/PostCard';

export default function DashboardRouter() {
  const { user, loading } = useAuth();

  // Feed state for redirect views
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedPage, setFeedPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFeed = useCallback(async (p = 1) => {
    if (p === 1) setFeedLoading(true); else setLoadingMore(true);
    try {
      const res = await postsAPI.getFeed({ page: p, limit: 10 });
      const d = res.data?.data || res.data || [];
      const pagination = res.data?.pagination;
      if (p === 1) setPosts(d); else setPosts(prev => [...prev, ...d]);
      setHasMore(pagination?.hasNext ?? d.length === 10);
      setFeedPage(p);
    } catch { /* silent */ }
    finally { setFeedLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => {
    if (user && (user.user_type === 'teacher' || user.user_type === 'institute' || user.user_type === 'mentor')) {
      loadFeed(1);
    }
  }, [user, loadFeed]);

  const handlePostCreated = (p) => setPosts(prev => [p, ...prev]);
  const handleDeletePost = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-400 font-bold text-sm animate-pulse tracking-widest uppercase">Initializing Persona Intelligence...</p>
      </div>
    );
  }

  if (!user) return null;

  // ═══ PERSONA ROUTING ═══
  
  if (user.user_type === 'professional_learner' || user.user_type === 'organization') {
    return (
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
        </div>
      }>
        <ProfessionalDashboard />
      </Suspense>
    );
  }

  if (user.user_type === 'parent') {
    return (
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <ParentDashboard />
      </Suspense>
    );
  }

  if (user.user_type === 'teacher' || user.user_type === 'institute' || user.user_type === 'mentor') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-[32px] p-10 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
             <Link href="/teacher-studio"><ShieldAlert size={40} /></Link>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Educator Studio</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Manage your classroom, students and teaching portfolio from your specialized studio.</p>
          <Link href="/teacher-studio" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 inline-block">
             Enter Teacher Studio
          </Link>
        </div>

        {/* ── Community Feed for Educators ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Users size={18} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Community Activity</h3>
          </div>

          <CreatePostBox onPostCreated={handlePostCreated} />

          {feedLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-[24px] border border-gray-100 p-6 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/6" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-gray-100 p-12 text-center">
              <Users size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">Your community feed is quiet.</p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
              ))}
              {hasMore && (
                <button
                  onClick={() => loadFeed(feedPage + 1)}
                  disabled={loadingMore}
                  className="w-full py-3 rounded-2xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loadingMore ? <><Loader2 size={16} className="animate-spin" /> Loading...</> : 'Load more updates'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Default: Student/General Learner
  return (
    <Suspense fallback={<Loader2 className="animate-spin" />}>
      <StudentDashboard />
    </Suspense>
  );
}
