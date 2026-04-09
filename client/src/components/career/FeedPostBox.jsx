'use client';
import React, { useState } from 'react';
import { 
  Image as ImageIcon, Video, Smile,
  Send, Plus, X, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const FeedPostBox = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      if (onPostCreated) {
        onPostCreated({
          id: Date.now(),
          user_id: user?.id,
          username: user?.username,
          full_name: user?.full_name || user?.username,
          profile_photo_url: user?.profile_photo_url,
          content,
          created_at: new Date().toISOString(),
          likes_count: 0,
          comments_count: 0,
          shares_count: 0
        });
      }
      setContent('');
    } catch { /* Silent */ }
    finally { setLoading(false); }
  };

  const ActionBtn = ({ icon: Icon, label, color }) => (
    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all group">
      <Icon size={18} className={`${color} group-hover:scale-110 transition-transform`} />
      <span className="text-[12px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-3xl md:rounded-[32px] border border-gray-100 p-6 shadow-sm shadow-gray-100/50 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden shrink-0 border border-gray-100 shadow-sm shadow-transparent hover:shadow-blue-100/50 transition-all">
          <img 
            src={user?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-1 bg-gray-50 rounded-2xl p-4 text-[13px] text-gray-900 border border-transparent focus:border-blue-100 focus:bg-white focus:outline-none placeholder-gray-400 font-medium resize-none min-h-[100px] transition-all"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1">
          <ActionBtn icon={ImageIcon} label="Photo" color="text-blue-500" />
          <ActionBtn icon={Video} label="Video" color="text-purple-500" />
          <ActionBtn icon={Smile} label="Feeling" color="text-amber-500" />
        </div>
        <button 
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[13px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default FeedPostBox;
