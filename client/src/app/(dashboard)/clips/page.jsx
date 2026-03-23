'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';
import { uploadAPI } from '@/lib/api/upload.api';
import Link from 'next/link';
import {
  Heart, MessageCircle, Share2, Bookmark, Send, Plus, X, Loader2,
  Volume2, VolumeX, ChevronUp, ChevronDown, Eye, Music, Sparkles,
  Copy, Download, Flag, UserPlus, Play, Pause, MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

// ═══ CLIPS BRAND IDENTITY ═══
const ClipsLogo = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
    <defs>
      <linearGradient id="clips-grad" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="50%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="12" fill="url(#clips-grad)" />
    <path d="M13 12L13 28L29 20L13 12Z" fill="white" fillOpacity="0.95" />
    <rect x="10" y="10" width="4" height="20" rx="2" fill="white" fillOpacity="0.4" />
  </svg>
);

const CATEGORIES = ['For You', 'Science', 'Maths', 'History', 'Coding', 'Language', 'Art', 'GK', 'Business'];

// ═══ SINGLE CLIP CARD ═══
function ClipCard({ clip, isActive, onLike, onComment }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [doubleTapAnim, setDoubleTapAnim] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const lastTap = useRef(0);

  // Auto play/pause based on active state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.currentTime = 0;
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [isActive]);

  // Progress tracking
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const update = () => {
      if (v.duration) setProgress((v.currentTime / v.duration) * 100);
    };
    v.addEventListener('timeupdate', update);
    v.addEventListener('loadedmetadata', () => setDuration(v.duration));
    return () => { v.removeEventListener('timeupdate', update); };
  }, []);

  // Double tap to like
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap → like
      if (!liked) handleLike();
      setDoubleTapAnim(true);
      setTimeout(() => setDoubleTapAnim(false), 800);
    } else {
      // Single tap → play/pause
      const v = videoRef.current;
      if (v) {
        if (v.paused) { v.play(); setPlaying(true); }
        else { v.pause(); setPlaying(false); }
      }
    }
    lastTap.current = now;
  };

  const handleLike = async () => {
    try { await postsAPI.like(clip.id, { reaction_type: 'amazing' }); setLiked(!liked); } catch {}
  };

  const handleSave = async () => {
    try { await postsAPI.toggleSave(clip.id); setSaved(!saved); toast.success(saved ? 'Unsaved' : 'Saved!'); } catch {}
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: clip.content || 'Syllabrix Clip', url: window.location.origin + '/post/' + clip.id });
    } else {
      navigator.clipboard.writeText(window.location.origin + '/post/' + clip.id);
      toast.success('Link copied!');
    }
    setShowShare(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/post/' + clip.id);
    toast.success('Link copied!');
    setShowShare(false);
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full bg-black rounded-2xl overflow-hidden select-none" style={{ aspectRatio: '9/16', maxHeight: '80vh' }}>
      {/* Video */}
      <video
        ref={videoRef}
        src={clip.media_url}
        className="w-full h-full object-cover"
        loop playsInline muted={muted}
        onClick={handleTap}
      />

      {/* Double-tap heart animation */}
      {doubleTapAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart size={80} className="text-white fill-red-500 animate-ping" style={{ animationDuration: '0.6s' }} />
        </div>
      )}

      {/* Play/Pause overlay (shows briefly) */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Play size={30} className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

      {/* ═══ TOP BAR ═══ */}
      <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <ClipsLogo size={28} />
          <span className="text-white font-extrabold text-sm tracking-tight">Clips</span>
        </div>
        <button onClick={() => setMuted(!muted)}
          className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
          {muted ? <VolumeX size={14} className="text-white" /> : <Volume2 size={14} className="text-white" />}
        </button>
      </div>

      {/* ═══ BOTTOM INFO ═══ */}
      <div className="absolute bottom-14 left-4 right-16 z-20">
        {/* Creator */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-[2px] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              {clip.profile_photo_url && !clip.profile_photo_url.includes('PASTE_') ? (
                <img src={clip.profile_photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">{clip.username?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">{clip.username}</span>
            <span className="text-white/40 text-[10px]">{clip.user_type}</span>
          </div>
        </div>

        {/* Caption */}
        {clip.content && (
          <p className="text-white text-[13px] leading-relaxed line-clamp-2 mb-2">{clip.content}</p>
        )}

        {/* Music/Sound indicator */}
        <div className="flex items-center gap-1.5">
          <Music size={11} className="text-white/50" />
          <div className="overflow-hidden max-w-[200px]">
            <p className="text-white/50 text-[10px] whitespace-nowrap animate-marquee">Original Sound — {clip.username}</p>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT ACTION BAR ═══ */}
      <div className="absolute right-3 bottom-16 flex flex-col items-center gap-5 z-20">
        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-0.5 group">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${liked ? 'bg-red-500 scale-110' : 'bg-white/10 backdrop-blur-md group-hover:bg-white/20'}`}>
            <Heart size={22} className="text-white" fill={liked ? 'currentColor' : 'none'} />
          </div>
          <span className="text-white text-[10px] font-bold">{(clip.likes_count || 0) + (liked ? 1 : 0)}</span>
        </button>

        {/* Comment */}
        <button onClick={() => onComment?.(clip)} className="flex flex-col items-center gap-0.5 group">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
            <MessageCircle size={22} className="text-white" />
          </div>
          <span className="text-white text-[10px] font-bold">{clip.comments_count || 0}</span>
        </button>

        {/* Share */}
        <button onClick={() => setShowShare(!showShare)} className="flex flex-col items-center gap-0.5 group">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
            <Share2 size={20} className="text-white" />
          </div>
          <span className="text-white text-[10px] font-bold">Share</span>
        </button>

        {/* Bookmark */}
        <button onClick={handleSave} className="flex flex-col items-center gap-0.5 group">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${saved ? 'bg-amber-500' : 'bg-white/10 backdrop-blur-md group-hover:bg-white/20'}`}>
            <Bookmark size={20} className="text-white" fill={saved ? 'currentColor' : 'none'} />
          </div>
        </button>

        {/* More */}
        <button onClick={() => setShowShare(!showShare)} className="flex flex-col items-center gap-0.5">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
            <MoreHorizontal size={20} className="text-white" />
          </div>
        </button>

        {/* Creator avatar disc (spinning) */}
        <div className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden animate-spin-slow mt-1">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <ClipsLogo size={16} />
          </div>
        </div>
      </div>

      {/* ═══ PROGRESS BAR ═══ */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div className="h-full bg-white rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>

      {/* ═══ SHARE SHEET ═══ */}
      {showShare && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl rounded-t-3xl p-5 z-40 animate-slide-up">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
          <p className="text-white font-bold text-sm text-center mb-4">Share to</p>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { icon: Copy, label: 'Copy Link', action: handleCopyLink },
              { icon: Download, label: 'Save Clip', action: () => toast('Download coming soon!') },
              { icon: Flag, label: 'Report', action: () => { toast('Reported'); setShowShare(false); } },
              { icon: X, label: 'Close', action: () => setShowShare(false) },
            ].map((a, i) => (
              <button key={i} onClick={a.action} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><a.icon size={20} className="text-white" /></div>
                <span className="text-white/60 text-[10px]">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 8s linear infinite; }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
        @keyframes slide-up { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}

// ═══ COMMENTS PANEL ═══
function CommentsPanel({ clip, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!clip?.id) return;
    postsAPI.getComments(clip.id)
      .then(r => setComments(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clip?.id]);

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await postsAPI.comment(clip.id, { content: text.trim() });
      const nc = res.data?.data || res.data;
      setComments(prev => [{ ...nc, username: user?.username }, ...prev]);
      setText('');
    } catch { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[60vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm">{comments.length} Comments</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {loading ? <div className="text-center py-8"><Loader2 size={20} className="animate-spin text-gray-400 mx-auto" /></div>
          : comments.length === 0 ? <p className="text-center text-gray-400 text-sm py-8">No comments yet. Be the first!</p>
          : comments.map((c, i) => (
            <div key={c.id || i} className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {c.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-gray-700">{c.username}</span>
                <p className="text-[13px] text-gray-600 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment..."
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-purple-400"
            onKeyDown={e => e.key === 'Enter' && submit()} />
          <button onClick={submit} disabled={submitting || !text.trim()}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white disabled:opacity-40">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ CREATE CLIP MODAL ═══
function CreateClipModal({ onClose, onCreated }) {
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
        content: caption.trim() + (category ? ` #${category}` : ''),
        post_type: 'regular', visibility: 'public',
        media_type: 'video', media_url: mediaUrl,
      });
      toast.success('Clip posted!');
      onCreated?.(res.data?.data || res.data);
      onClose();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        {/* Header with Clips branding */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipsLogo size={24} />
            <span className="text-white font-extrabold text-sm">Create Clip</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30"><X size={14} className="text-white" /></button>
        </div>

        <div className="p-5 space-y-4">
          {!preview ? (
            <button onClick={() => fileRef.current?.click()}
              className="w-full h-56 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-purple-400 hover:bg-purple-50/30 transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center">
                <Play size={28} className="text-purple-500 ml-1" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Select a video (max 60s)</p>
              <p className="text-[10px] text-gray-400">MP4, WebM, MOV — up to 100MB</p>
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black" style={{ height: '260px' }}>
              <video src={preview} controls className="w-full h-full object-contain" />
              <button onClick={() => { setVideoFile(null); setPreview(null); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white"><X size={12} /></button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleFile} />

          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {['Science', 'Maths', 'History', 'Coding', 'Language', 'Art', 'GK', 'Business', 'Other'].map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === c ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-purple-50'}`}>{c}</button>
              ))}
            </div>
          </div>

          <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write a caption..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" rows={2} />

          <button onClick={handleSubmit} disabled={loading || !videoFile}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg disabled:opacity-50 transition-all">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><ClipsLogo size={16} /> Post Clip</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ MAIN CLIPS PAGE ═══
export default function ClipsPage() {
  const { user } = useAuth();
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('For You');
  const [showCreate, setShowCreate] = useState(false);
  const [commentClip, setCommentClip] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    postsAPI.getFeed({ page: 1, limit: 30 })
      .then(r => {
        const all = r.data?.data || [];
        const videos = all.filter(p => p.media_type === 'video' && p.media_url && !p.media_url.includes('PASTE_'));
        setClips(videos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const goNext = useCallback(() => setActiveIdx(i => Math.min(i + 1, clips.length - 1)), [clips.length]);
  const goPrev = useCallback(() => setActiveIdx(i => Math.max(i - 1, 0)), []);

  // Keyboard + mouse wheel navigation
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); goPrev(); }
    };
    const wheelHandler = (e) => {
      if (Math.abs(e.deltaY) > 30) {
        if (e.deltaY > 0) goNext(); else goPrev();
      }
    };
    window.addEventListener('keydown', keyHandler);
    const container = containerRef.current;
    container?.addEventListener('wheel', wheelHandler, { passive: true });
    return () => {
      window.removeEventListener('keydown', keyHandler);
      container?.removeEventListener('wheel', wheelHandler);
    };
  }, [goNext, goPrev]);

  return (
    <div className="max-w-lg mx-auto" ref={containerRef}>
      {/* ═══ HEADER with Clips branding ═══ */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <ClipsLogo size={36} />
          <div>
            <h1 className="font-extrabold text-gray-900 text-lg tracking-tight leading-none">Clips</h1>
            <p className="text-[10px] text-gray-400 font-medium">60-second micro-learning</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg shadow-purple-200/40 hover:shadow-xl transition-all">
          <Plus size={14} strokeWidth={3} /> Create
        </button>
      </div>

      {/* ═══ CATEGORY TABS ═══ */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>{cat}</button>
        ))}
      </div>

      {/* ═══ CLIPS FEED ═══ */}
      {loading ? (
        <div className="bg-black rounded-2xl flex items-center justify-center" style={{ aspectRatio: '9/16', maxHeight: '80vh' }}>
          <div className="text-center">
            <ClipsLogo size={48} className="mx-auto mb-3 animate-pulse" />
            <p className="text-white/60 text-sm">Loading Clips...</p>
          </div>
        </div>
      ) : clips.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl flex flex-col items-center justify-center text-center px-8" style={{ aspectRatio: '9/16', maxHeight: '80vh' }}>
          <ClipsLogo size={56} className="mb-4" />
          <h2 className="font-extrabold text-white text-lg mb-2">No Clips Yet</h2>
          <p className="text-white/50 text-sm mb-6">Be the first to create a 60-second educational clip!</p>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg">
            <Plus size={16} strokeWidth={3} /> Create Your First Clip
          </button>
          <div className="mt-8 pt-6 border-t border-white/10 w-full">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">Clip Ideas</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['Explain Pythagoras', '5 GK Facts', 'Chemistry Trick', 'Grammar Tip', 'History in 60s', 'Math Shortcut'].map(t => (
                <span key={t} className="px-3 py-1.5 rounded-full bg-white/5 text-white/40 text-[10px] font-medium border border-white/10">{t}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Navigation */}
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs text-gray-400 font-medium">{activeIdx + 1} of {clips.length}</span>
            <div className="flex gap-1">
              <button onClick={goPrev} disabled={activeIdx === 0}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"><ChevronUp size={16} /></button>
              <button onClick={goNext} disabled={activeIdx >= clips.length - 1}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"><ChevronDown size={16} /></button>
            </div>
          </div>

          {/* Current clip */}
          <ClipCard
            clip={clips[activeIdx]}
            isActive={true}
            onComment={(c) => setCommentClip(c)}
          />

          {/* Dots */}
          <div className="flex justify-center gap-1 mt-3">
            {clips.slice(Math.max(0, activeIdx - 3), activeIdx + 4).map((_, i) => {
              const realIdx = Math.max(0, activeIdx - 3) + i;
              return <div key={realIdx} className={`h-1.5 rounded-full transition-all ${realIdx === activeIdx ? 'bg-gradient-to-r from-pink-500 to-purple-600 w-6' : 'bg-gray-300 w-1.5'}`} />;
            })}
          </div>
        </>
      )}

      {/* Modals */}
      {showCreate && <CreateClipModal onClose={() => setShowCreate(false)} onCreated={(c) => setClips(prev => [c, ...prev])} />}
      {commentClip && <CommentsPanel clip={commentClip} onClose={() => setCommentClip(null)} />}
    </div>
  );
}
