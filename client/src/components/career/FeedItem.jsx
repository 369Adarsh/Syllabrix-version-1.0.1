'use client';
import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Sparkles, Trash2 } from 'lucide-react';
import { postsAPI } from '@/lib/api/posts.api';
import { useAuth } from '@/contexts/AuthContext';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function fmtCount(n) {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function PollOption({ label, pct, color = 'bg-blue-500' }) {
  return (
    <div className="flex-1 relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center cursor-pointer hover:border-blue-200 transition-all">
      <div
        className={`absolute inset-0 ${color} opacity-10 rounded-xl`}
        style={{ width: `${pct}%` }}
      />
      <p className="text-xs font-bold text-gray-800 relative z-10">{label}</p>
      <p className="text-[11px] text-gray-500 relative z-10 mt-0.5">{pct}%</p>
    </div>
  );
}

// Fake reaction avatars
const REACTION_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
];

export default function FeedItem({ post, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post?.user_liked || false);
  const [likes, setLikes] = useState(post?.likes_count || 0);
  const [saved, setSaved] = useState(post?.user_saved || false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwn = user?.id && post?.user_id === user.id;
  const isAI = post?.isAI || post?.type === 'news';

  const name = post?.full_name || post?.username || 'Community Member';
  const role = post?.role || post?.user_type?.replace('_', ' ') || 'Member';
  const time = formatTime(post?.created_at);

  const avatar = post?.profile_photo_url
    || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes(prev => next ? prev + 1 : Math.max(0, prev - 1));
    try { await postsAPI.like(post.id); } catch {
      setLiked(!next);
      setLikes(prev => next ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  const handleSave = async () => {
    setSaved(s => !s);
    try { await postsAPI.toggleSave(post.id); } catch { setSaved(s => !s); }
  };

  const handleDelete = async () => {
    try { await postsAPI.delete(post.id); onDelete?.(post.id); } catch { }
  };

  // Parse poll data if present
  const poll = post?.poll || null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">

      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            {isAI ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                <Sparkles size={16} className="text-white" />
              </div>
            ) : (
              <img
                src={avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0"
                onError={e => { e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=U'; }}
              />
            )}
            {isAI && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-900 leading-none">{name}</p>
              {post?.badge && (
                <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {post.badge}
                </span>
              )}
              {isAI && (
                <span className="px-2 py-0.5 bg-violet-50 border border-violet-100 text-violet-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Strategy Insight
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 capitalize">
              {role}{time && ` · ${time}`}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 min-w-[120px]">
              {isOwn && (
                <button
                  onClick={() => { setMenuOpen(false); handleDelete(); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
              <button onClick={() => setMenuOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-3 space-y-3">
        {post?.title && (
          <h3 className="text-sm font-bold text-gray-900 leading-snug">{post.title}</h3>
        )}
        {post?.content && (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</p>
        )}

        {/* Image */}
        {post?.image_url && (
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <img src={post.image_url} alt="" className="w-full object-cover max-h-72" />
          </div>
        )}

        {/* Poll */}
        {poll && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {poll.options?.map((opt, i) => (
                <PollOption
                  key={i}
                  label={opt.label}
                  pct={opt.pct}
                  color={i === 0 ? 'bg-blue-500' : 'bg-indigo-500'}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400">
              {poll.total_votes ? `${(poll.total_votes / 1000).toFixed(1)}k votes · ` : ''}
              {poll.ends_in || ''}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${liked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <Heart size={15} className={liked ? 'fill-blue-600' : ''} />
            {fmtCount(likes)}
          </button>

          <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-blue-500 transition-all">
            <MessageCircle size={15} />
            {fmtCount(post?.comments_count)}
          </button>

          <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-blue-500 transition-all">
            <Share2 size={14} /> Share
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Reaction avatars */}
          <div className="flex -space-x-1.5">
            {REACTION_AVATARS.slice(0, 3).map((src, i) => (
              <img key={i} src={src} alt="" className="w-5 h-5 rounded-full border border-white object-cover" />
            ))}
          </div>
          <button
            onClick={handleSave}
            className={`transition-all ${saved ? 'text-blue-600' : 'text-gray-300 hover:text-gray-500'}`}
          >
            <Bookmark size={15} className={saved ? 'fill-blue-600' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}
