'use client';
import React, { useState, useCallback } from 'react';
import { Sparkles, Filter, RefreshCw } from 'lucide-react';
import FeedSidebar from '@/components/career/FeedSidebar';
import FeedWidgets from '@/components/career/FeedWidgets';
import FeedPostBox from '@/components/career/FeedPostBox';
import FeedItem from '@/components/career/FeedItem';
import { useAuth } from '@/contexts/AuthContext';

const MOCK_POSTS = [
  {
    id: 'p-1',
    isAI: false,
    full_name: 'Elena Rodriguez',
    role: 'Learning Experience Designer',
    created_at: '2026-04-08T10:00:00Z',
    content: "Taking a moment this afternoon to reset and recharge. Deep focus requires mental clarity, and sometimes that means a visual break. Wishing everyone a productive and bright Tuesday! 🌴✨",
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
    media_title: 'Good Afternoon',
    media_desc: 'Mindful Learning Series',
    likes_count: 1212,
    comments_count: 45,
    shares_count: 12,
  },
  {
    id: 'p-2',
    isAI: true,
    full_name: 'Marcus Chen',
    role: 'CTO @ NovaSystems',
    created_at: '2026-04-08T07:00:00Z',
    title: "The Architect's Mindset: Designing Your Career Path for 2025",
    content: "Traditional career ladders are becoming obsolete. We are moving toward a 'lattice' structure where lateral moves are just as valuable as vertical ones. My advice: Focus on skills that bridge technical architecture and human-centric design.",
    likes_count: 842,
    comments_count: 128,
    shares_count: 34,
  },
];

export default function CareerFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(MOCK_POSTS);

  const handleCreated = useCallback((newPost) => {
    setPosts(prev => [newPost, ...prev]);
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">

        {/* Left sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20">
          <FeedSidebar />
        </aside>

        {/* Main feed */}
        <main className="lg:col-span-6 space-y-4 pb-20">
          {/* Page header */}
          <div className="flex items-center justify-between py-1">
            <h1 className="text-lg font-bold text-gray-900">My Feed</h1>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all shadow-sm">
              <Filter size={12} /> Trending
            </button>
          </div>

          {/* Post box */}
          <FeedPostBox onPostCreated={handleCreated} />

          {/* Posts */}
          <div className="space-y-4">
            {posts.map(p => (
              <FeedItem key={p.id || p.title} post={p} isAI={p.isAI} />
            ))}
          </div>

          {/* Load more */}
          <div className="pt-4 text-center">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm mx-auto group">
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              Load more
            </button>
          </div>
        </main>

        {/* Right widgets */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 overflow-y-auto max-h-[calc(100vh-100px)] no-scrollbar">
          <FeedWidgets />
        </aside>

      </div>
    </div>
  );
}
