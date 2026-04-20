'use client';
import { useState } from 'react';
import { Image as ImageIcon, BarChart2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';

export default function FeedPostBox({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const avatar = user?.profile_photo_url
    || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'U')}`;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await postsAPI.create({ content: content.trim() });
      const newPost = res.data?.data || res.data;
      if (onPostCreated && newPost) onPostCreated(newPost);
      setContent('');
      setFocused(false);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <img
          src={avatar}
          alt=""
          className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0"
          onError={e => { e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=U'; }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Share a market insight or career update..."
          rows={focused ? 3 : 1}
          className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-800 border border-transparent focus:border-blue-200 focus:bg-white focus:outline-none placeholder-gray-400 resize-none transition-all"
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-all">
            <ImageIcon size={14} className="text-blue-500" /> Media
          </button>
          <span className="w-px h-4 bg-gray-200" />
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-all">
            <BarChart2 size={14} className="text-blue-500" /> Poll
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-200"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : null}
          Post Intel
        </button>
      </div>
    </div>
  );
}
