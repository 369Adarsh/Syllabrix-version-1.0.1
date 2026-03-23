'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';
import { uploadAPI } from '@/lib/api/upload.api';
import Link from 'next/link';
import {
  Play, Pause, Heart, MessageCircle, Share2, Bookmark, ChevronUp,
  ChevronDown, Volume2, VolumeX, Plus, X, Loader2, Send, Video,
  Sparkles, Eye, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

// ═══ SINGLE REEL CARD ═══
function ReelCard({ reel, isActive }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.currentTime = 0;
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      v.pause(); setPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const handleLike = async () => {
    try { await postsAPI.like(reel.id, { reaction_type: 'amazing' }); setLiked(!liked); } catch {}
  };

  const handleSave = async () => {
    try { await postsAPI.toggleSave(reel.id); setSaved(!saved); toast.success(saved ? 'Unsaved' : 'Saved!'); } catch {}
  };

  const handleShare = () => { navigator.clipboard.writeText(window.location.origin + '/post/' + reel.id); toast.success('Link copied!'); };

  const timeAgo = (d) => {
    if (!d) return '';
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 3600) return Math.floor(s / 60) + 'm';
    if (s < 86400) return Math.floor(s / 3600) + 'h';
    return Math.floor(s / 86400) + 'd';
  };

  return (
    <div className="relative w-full bg-black rounded-2xl overflow-hidden" style={{ height: '520px' }}>
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.media_url}
        className="w-full h-full object-cover"
        loop playsInline muted={muted}
        onClick={togglePlay}
      />

      {/* Play/Pause overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20" onClick={togglePlay}>
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play size={28} className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

      {/* Bottom info */}
      <div className="absolute bottom-4 left-4 right-16 z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
            {reel.profile_photo_url && !reel.profile_photo_url.includes('PASTE_') ? (
              <img src={reel.profile_photo_url} alt="" className="w-full h-full object-cover" />
            ) : (reel.username?.charAt(0)?.toUpperCase() || '?')}
          </div>
          <span className="text-white font-semibold text-sm">{reel.username}</span>
          <span className="text-white/50 text-[10px]">{timeAgo(reel.created_at)}</span>
        </div>
        {reel.content && <p className="text-white text-xs leading-relaxed line-clamp-2">{reel.content}</p>}
      </div>

      {/* Right action bar */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-10">
        <button onClick={handleLike} className="flex flex-col items-center gap-0.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${liked ? 'bg-red-500/90' : 'bg-white/10'}`}>
            <Heart size={20} className="text-white" fill={liked ? 'currentColor' : 'none'} />
          </div>
          <span className="text-white/70 text-[10px] font-medium">{reel.likes_count || 0}</span>
        </button>
        <button onClick={() => toast('Comments coming soon!')} className="flex flex-col items-center gap-0.5">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle size={20} className="text-white" />
          </div>
          <span className="text-white/70 text-[10px] font-medium">{reel.comments_count || 0}</span>
        </button>
        <button onClick={handleShare} className="flex flex-col items-center gap-0.5">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Share2 size={20} className="text-white" />
          </div>
        </button>
        <button onClick={handleSave} className="flex flex-col items-center gap-0.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${saved ? 'bg-amber-500/90' : 'bg-white/10'}`}>
            <Bookmark size={20} className="text-white" fill={saved ? 'currentColor' : 'none'} />
          </div>
        </button>
      </div>

      {/* Mute toggle */}
      <button onClick={() => setMuted(!muted)}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
        {muted ? <VolumeX size={14} className="text-white" /> : <Volume2 size={14} className="text-white" />}
      </button>
    </div>
  );
}

// ═══ CREATE REEL MODAL ═══
function CreateReelModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 100 * 1024 * 1024) { toast.error('Max 100MB'); return; }
    if (!file.type.startsWith('video/')) { toast.error('Only video files'); return; }
    setVideoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!videoFile) { toast.error('Select a video'); return; }
    setLoading(true);
    try {
      const uploadRes = await uploadAPI.single(videoFile);
      const mediaUrl = uploadRes.data?.data?.url || uploadRes.data?.url;
      const res = await postsAPI.create({
        content: caption.trim(), post_type: 'regular', visibility: 'public',
        media_type: 'video', media_url: mediaUrl,
      });
      toast.success('Reel posted!');
      onCreated?.(res.data?.data || res.data);
      onClose();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to post reel'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">Create Reel</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} className="text-gray-400" /></button>
        </div>
        <div className="p-4 space-y-4">
          {!preview ? (
            <button onClick={() => fileRef.current?.click()}
              className="w-full h-52 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50/30 transition-all">
              <Video size={32} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Tap to select a video</p>
              <p className="text-[10px] text-gray-400">Max 60 seconds, up to 100MB</p>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black" style={{ height: '240px' }}>
              <video src={preview} controls className="w-full h-full object-contain" />
              <button onClick={() => { setVideoFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"><X size={12} /></button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleFile} />
          <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write a caption..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" rows={2} />
          <button onClick={handleSubmit} disabled={loading || !videoFile}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md disabled:opacity-50 transition-all">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? 'Uploading...' : 'Post Reel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ MAIN REELS PAGE ═══
export default function ReelsPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Load video posts as reels
    postsAPI.getFeed({ page: 1, limit: 20 })
      .then(r => {
        const all = r.data?.data || [];
        const videos = all.filter(p => p.media_type === 'video' && p.media_url && !p.media_url.includes('PASTE_'));
        setReels(videos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const goNext = () => setActiveIdx(i => Math.min(i + 1, reels.length - 1));
  const goPrev = () => setActiveIdx(i => Math.max(i - 1, 0));

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') goNext();
      if (e.key === 'ArrowUp' || e.key === 'k') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [reels.length]);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-sm">
            <Video size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-gray-900 text-lg">Reels</h1>
            <p className="text-[10px] text-gray-400">60-second micro-learning</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md hover:from-purple-700 transition-all">
          <Plus size={14} /> Create
        </button>
      </div>

      {/* Reels feed */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <Loader2 size={24} className="animate-spin text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Loading reels...</p>
        </div>
      ) : reels.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Video size={28} className="text-purple-400" />
          </div>
          <h2 className="font-bold text-gray-700 mb-2">No Reels Yet</h2>
          <p className="text-sm text-gray-400 mb-5">Be the first to create a 60-second educational reel!</p>
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md">
            <Plus size={16} /> Create a Reel
          </button>

          {/* AI Suggested Topics */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center justify-center gap-1"><Sparkles size={10} /> Reel Ideas</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['Explain Pythagoras Theorem', '5 GK Facts', 'Quick Chemistry Trick', 'English Grammar Tip', 'Indian History in 60s', 'Math Shortcut', 'Science Experiment'].map(t => (
                <span key={t} className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-semibold border border-purple-100">{t}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-medium">{activeIdx + 1} of {reels.length}</span>
            <div className="flex gap-1">
              <button onClick={goPrev} disabled={activeIdx === 0}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"><ChevronUp size={16} /></button>
              <button onClick={goNext} disabled={activeIdx >= reels.length - 1}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"><ChevronDown size={16} /></button>
            </div>
          </div>

          {/* Current reel */}
          <ReelCard reel={reels[activeIdx]} isActive={true} />

          {/* Dots indicator */}
          <div className="flex justify-center gap-1 mt-3">
            {reels.slice(Math.max(0, activeIdx - 2), activeIdx + 3).map((_, i) => {
              const realIdx = Math.max(0, activeIdx - 2) + i;
              return <div key={realIdx} className={`w-1.5 h-1.5 rounded-full transition-all ${realIdx === activeIdx ? 'bg-purple-600 w-4' : 'bg-gray-300'}`} />;
            })}
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateReelModal
          onClose={() => setShowCreate(false)}
          onCreated={(reel) => setReels(prev => [reel, ...prev])}
        />
      )}
    </div>
  );
}
