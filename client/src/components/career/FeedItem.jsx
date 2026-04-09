'use client';
import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, Bookmark, 
  MoreHorizontal, Sparkles, User, Globe
} from 'lucide-react';

const FeedItem = ({ post, isAI }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post?.likes_count || 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const name = post?.full_name || post?.username || 'Professional';
  const role = isAI ? 'Strategic Analyst' : post?.role || 'Community Member';
  const time = post?.created_at ? new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2h ago';

  return (
    <div className={`bg-white rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm shadow-gray-100/30 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all hover:shadow-md hover:shadow-gray-200/50 ${isAI ? 'border-l-4 border-l-blue-600' : ''}`}>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[18px] bg-gray-100 overflow-hidden shrink-0 border border-white shadow-sm ring-2 ring-gray-50 ring-offset-2 ${isAI ? 'bg-blue-600' : ''}`}>
              {isAI ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <Sparkles size={20} />
                </div>
              ) : post?.profile_photo_url ? (
                <img src={post.profile_photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User size={24} />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h4 className="text-[15px] font-black text-gray-900 tracking-tight leading-none mb-1 capitalize group-hover:text-blue-600 transition-colors cursor-pointer">{name}</h4>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{role} • {time}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAI && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 shadow-sm shadow-blue-100/50">
                AI Insight
              </span>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {isAI ? (
            <div className="space-y-4">
              <h3 className="text-xl font-black text-gray-900 leading-tight tracking-tight">
                {post?.title || "The Architect's Mindset: Designing Your Career Path for 2025"}
              </h3>
              <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                {post?.content || "Traditional career ladders are becoming obsolete. We are moving toward a 'lattice' structure where lateral moves are just as valuable as vertical ones. My advice for this quarter: Focus on skills that bridge the gap between technical architecture and human-centric design."}
              </p>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 relative group/quote">
                <div className="absolute top-4 left-4 text-blue-200 group-hover/quote:text-blue-400 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.83" />
                  </svg>
                </div>
                <p className="text-[14px] italic text-gray-500 font-bold text-center leading-relaxed">
                  "The most resilient professionals are those who learn to build systems, not just follow them."
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[14px] text-gray-700 leading-relaxed font-medium">
                {post?.content}
              </p>
              {post?.image_url && (
                <div className="relative rounded-[32px] overflow-hidden border border-gray-50 shadow-sm group/media cursor-pointer">
                   <img src={post.image_url} alt="" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500" />
                   <div className="absolute bottom-6 left-6 text-white p-6 bg-gradient-to-t from-black/20 to-transparent rounded-[24px]">
                      <h4 className="text-xl font-black">{post.media_title || 'Mindful Learning'}</h4>
                      <p className="text-[12px] font-bold opacity-80 uppercase tracking-widest leading-none mt-1">{post.media_desc || 'Mindful Learning Series'}</p>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 group transition-all text-gray-400 hover:text-blue-600`}
            >
              <div className={`p-2 rounded-xl transition-all ${liked ? 'bg-blue-50 text-blue-600' : 'hover:bg-blue-50'}`}>
                <Heart size={18} className={liked ? 'fill-blue-600' : ''} />
              </div>
              <span className={`text-[12px] font-black ${liked ? 'text-blue-600' : ''}`}>{likes || '1.2k'}</span>
            </button>

            <button className="flex items-center gap-2 group transition-all text-gray-400 hover:text-blue-600">
              <div className="p-2 rounded-xl hover:bg-blue-50 transition-all">
                <MessageCircle size={18} />
              </div>
              <span className="text-[12px] font-black">{post?.comments_count || '45'}</span>
            </button>

            <button className="flex items-center gap-2 group transition-all text-gray-400 hover:text-blue-600">
              <div className="p-2 rounded-xl hover:bg-blue-50 transition-all">
                <Share2 size={18} />
              </div>
              <span className="text-[12px] font-black">{post?.shares_count || '12'}</span>
            </button>
          </div>

          <button className="p-2 rounded-xl text-gray-400 hover:text-gray-900 transition-all">
            <Bookmark size={20} />
          </button>
        </div>

        {isAI && (
          <div className="flex gap-2 pt-2">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 py-1 bg-gray-50 rounded italic">#STRATEGY</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 py-1 bg-gray-50 rounded italic">#FUTUREOFWORK</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedItem;
