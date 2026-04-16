'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Bell, MessageSquare, User, 
  Menu, Sparkles, Filter, RefreshCw
} from 'lucide-react';
import FeedSidebar from '@/components/career/FeedSidebar';
import FeedWidgets from '@/components/career/FeedWidgets';
import FeedPostBox from '@/components/career/FeedPostBox';
import FeedItem from '@/components/career/FeedItem';
import { useAuth } from '@/contexts/AuthContext';

const MOCK_POSTS = [
  {
    id: 'ai-1',
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
    shares_count: 12
  },
  {
    id: 'ai-2',
    isAI: true,
    full_name: 'Marcus Chen',
    role: 'CTO @ NovaSystems',
    created_at: '2026-04-08T07:00:00Z',
    title: "The Architect's Mindset: Designing Your Career Path for 2025",
    content: "Traditional career ladders are becoming obsolete. We are moving toward a 'lattice' structure where lateral moves are just as valuable as vertical ones. My advice for this quarter: Focus on skills that bridge the gap between technical architecture and human-centric design.",
    likes_count: 842,
    comments_count: 128,
    shares_count: 34
  }
];

const MainLayout = ({ children }) => (
  <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
      {/* Left Sidebar - 3 cols, hidden on mobile */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-120px)]">
        <FeedSidebar />
      </aside>

      {/* Main Feed - 6 cols */}
      <main className="lg:col-span-6 space-y-6 sm:space-y-8 min-h-screen pb-20">
        {children}
      </main>

      {/* Right Sidebar - 3 cols, hidden on mobile */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 no-scrollbar">
        <FeedWidgets />
      </aside>
    </div>
  </div>
);

export default function CareerFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [loading, setLoading] = useState(false);

  const handleCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <div className="bg-[#FBFCFD] min-h-screen">
      {/* Search Header - Integration with Career Dashboard */}
      <div className="sticky top-[0px] z-[40] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between shadow-sm shadow-gray-100/20">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
           <h2 className="text-base sm:text-xl font-black text-gray-900 tracking-tighter shrink-0">CareerIntel</h2>
           <nav className="hidden sm:flex items-center gap-4 md:gap-8 ml-4 md:ml-10">
             <button className="text-[11px] font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-2 transition-all">Feed</button>
             <button className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors pb-2">Communities</button>
             <button className="hidden md:block text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors pb-2">Mentors</button>
           </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
           <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={16} />
              <input
                placeholder="Search insights..."
                className="bg-gray-50 border border-transparent focus:border-blue-100 focus:bg-white rounded-2xl py-2.5 pl-12 pr-4 text-[13px] font-medium w-56 lg:w-72 outline-none transition-all shadow-sm shadow-transparent focus:shadow-blue-50"
              />
           </div>

           <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-4 border-r border-gray-100">
             <button className="p-2 sm:p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative group">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white group-hover:scale-125 transition-transform" />
             </button>
             <button className="hidden sm:flex p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <MessageSquare size={18} />
             </button>
           </div>

           <div className="flex items-center cursor-pointer">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 border border-blue-100 overflow-hidden shadow-sm">
                <img src={user?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`} alt="" />
              </div>
           </div>
        </div>
      </div>

      <MainLayout>
        {/* Dynamic Post Input */}
        <FeedPostBox onPostCreated={handleCreated} />

        {/* Post Filters */}
        <div className="flex items-center justify-between px-2 py-4">
           <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Sparkles size={14} className="text-blue-600" />
              </div>
              <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Recommended Intelligence</span>
           </div>
           <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 hover:border-gray-200 transition-all shadow-sm">
              <Filter size={12} /> Sort: Trending
           </button>
        </div>

        {/* The Feed */}
        <div className="space-y-12">
          {posts.map((p) => (
            <FeedItem key={p.id || p.title} post={p} isAI={p.isAI} />
          ))}
        </div>

        {/* Load More */}
        <div className="py-20 text-center">
           <button className="px-10 py-5 bg-white border border-gray-100 rounded-[32px] text-[13px] font-black text-gray-900 uppercase tracking-widest hover:shadow-xl hover:shadow-blue-50 hover:border-blue-200 transition-all active:scale-95 flex items-center justify-center gap-4 mx-auto group shadow-sm">
              <RefreshCw size={20} className="text-blue-600 group-hover:rotate-180 transition-transform duration-700" />
              Analyze more insights
           </button>
        </div>
      </MainLayout>
    </div>
  );
}
