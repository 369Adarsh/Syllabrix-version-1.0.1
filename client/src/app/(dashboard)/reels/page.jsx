'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';
import { uploadAPI } from '@/lib/api/upload.api';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Play, Heart, MessageCircle, Share2, Bookmark, ChevronUp,
  ChevronDown, Volume2, VolumeX, Plus, X, Loader2, Send, Video,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

// ═══ SINGLE REEL CARD — High Intensity ═══
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
    <div className="relative w-full bg-black md:rounded-[40px] overflow-hidden shadow-2xl transition-all" style={{ height: 'calc(100dvh - 130px)', maxHeight: '850px' }}>
      {/* Video Stream */}
      <video
        ref={videoRef}
        src={reel.media_url}
        className="w-full h-full object-cover"
        loop playsInline muted={muted}
        onClick={togglePlay}
      />

      {/* Logic Overlays */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]" onClick={togglePlay}>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl">
            <Play size={40} className="text-white fill-white ml-2" />
          </motion.div>
        </div>
      )}

      {/* Strategic Gradient Shell */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      {/* Branding Header Overlay */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10 pointer-events-none">
         <Sparkles size={16} className="text-amber-400" strokeWidth={3} />
         <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] opacity-80 italic">Precision Reel • Phase Alpha</span>
      </div>

      {/* Specialist Attribution & Intelligence Overlay */}
      <div className="absolute bottom-6 left-6 right-20 z-10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white text-sm font-black overflow-hidden flex-shrink-0 ring-2 ring-white/20 shadow-xl">
            {reel.profile_photo_url && !reel.profile_photo_url.includes('PASTE_') ? (
              <img src={reel.profile_photo_url} alt="" className="w-full h-full object-cover" />
            ) : (reel.username?.charAt(0)?.toUpperCase() || '?')}
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-white font-black text-sm uppercase tracking-tight">{reel.username}</span>
               <div className="w-1 h-1 rounded-full bg-white/30" />
               <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{timeAgo(reel.created_at)}</span>
            </div>
            <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Verified Specialist</p>
          </div>
        </div>
        {reel.content && (
          <p className="text-white text-[13px] font-medium leading-relaxed line-clamp-2 max-w-[90%] drop-shadow-md">
            {reel.content}
          </p>
        )}
      </div>

      {/* Right Strategic Action Bar */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike} className="flex flex-col items-center gap-1.5 group">
          <div className={`w-12 h-12 rounded-[22px] flex items-center justify-center backdrop-blur-md border transition-all ${liked ? 'bg-red-500 border-red-400 shadow-lg shadow-red-900/40' : 'bg-white/10 border-white/20 group-hover:bg-white/20'}`}>
            <Heart size={22} className="text-white" fill={liked ? 'currentColor' : 'none'} strokeWidth={2.5} />
          </div>
          <span className="text-white font-black text-[10px] uppercase tracking-widest drop-shadow-md">{reel.likes_count || 0}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={() => toast('Comment stream locking...')} className="flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 rounded-[22px] bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
            <MessageCircle size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-black text-[10px] uppercase tracking-widest drop-shadow-md">{reel.comments_count || 0}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="group">
          <div className="w-12 h-12 rounded-[22px] bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all">
            <Share2 size={22} className="text-white" strokeWidth={2.5} />
          </div>
        </motion.button>

        <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave} className="group">
          <div className={`w-12 h-12 rounded-[22px] flex items-center justify-center backdrop-blur-md border transition-all ${saved ? 'bg-amber-500 border-amber-400 shadow-lg shadow-amber-900/40' : 'bg-white/10 border-white/20 group-hover:bg-white/20'}`}>
            <Bookmark size={22} className="text-white" fill={saved ? 'currentColor' : 'none'} strokeWidth={2.5} />
          </div>
        </motion.button>
      </div>

      {/* Mute toggle — Industrial Standard */}
      <button onClick={() => setMuted(!muted)}
        className="absolute bottom-6 right-6 w-11 h-11 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center z-10 hover:bg-white/20 transition-all shadow-xl">
        {muted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
      </button>

      {/* Timeline Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 flex gap-1 px-1 py-1 z-20 overflow-hidden opacity-40">
         <motion.div initial={{ width: 0 }} animate={{ width: isActive ? '100%' : 0 }} transition={{ duration: 15, ease: 'linear' }} className="h-full bg-white rounded-full" />
      </div>
    </div>
  );
}

// ═══ CREATE REEL MODAL — High Density ═══
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
    if (!videoFile) { toast.error('Identify video stream source'); return; }
    setLoading(true);
    try {
      const uploadRes = await uploadAPI.single(videoFile);
      const mediaUrl = uploadRes.data?.data?.url || uploadRes.data?.url;
      const res = await postsAPI.create({
        content: caption.trim(), post_type: 'regular', visibility: 'public',
        media_type: 'video', media_url: mediaUrl,
      });
      toast.success('Precision Reel Deployed!');
      onCreated?.(res.data?.data || res.data);
      onClose();
    } catch (err) { toast.error(err?.response?.data?.message || 'Deployment failure'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md z-10 overflow-hidden border border-gray-100 italic transition-all">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
           <div>
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] mb-1">Knowledge Capture</p>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Deploy Strategic Reel</h2>
           </div>
           <button onClick={onClose} className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 transition-all active:scale-95"><X size={20} strokeWidth={3} /></button>
        </div>
        <div className="p-8 space-y-6">
          {!preview ? (
            <button onClick={() => fileRef.current?.click()}
              className="w-full h-64 rounded-[32px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 hover:border-purple-400 hover:bg-purple-50/20 transition-all group">
              <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                 <Video size={32} className="text-gray-300 group-hover:text-purple-600" strokeWidth={2.5} />
              </div>
              <div className="text-center">
                 <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Upload Knowledge Stream</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">60S Limit • VERTICAL 9:16 RECOMMENDED</p>
              </div>
            </button>
          ) : (
            <div className="relative rounded-[32px] overflow-hidden bg-black shadow-xl" style={{ height: '320px' }}>
              <video src={preview} controls className="w-full h-full object-contain" />
              <button onClick={() => { setVideoFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/60 text-white backdrop-blur-md hover:bg-red-500 transition-all"><X size={16} strokeWidth={3} /></button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleFile} />
          
          <div className="space-y-2">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Intelligence Caption</p>
             <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="IDENTIFY CORE CONCEPTS..."
               className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/5 transition-all font-black uppercase tracking-tight placeholder:text-gray-200" rows={2} />
          </div>

          <button onClick={handleSubmit} disabled={loading || !videoFile}
            className="w-full h-16 flex items-center justify-center gap-3 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] bg-slate-900 text-white shadow-2xl shadow-gray-200 disabled:opacity-40 hover:bg-purple-600 transition-all active:scale-[0.98]">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={3} />}
            {loading ? 'CALIBRATING...' : 'DEPLOY KNOWLEDGE'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ MAIN REELS PAGE — High Intensity ═══
export default function ReelsPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    postsAPI.getFeed({ page: 1, limit: 30 })
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

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') goNext();
      if (e.key === 'ArrowUp' || e.key === 'k') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [reels.length]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20 px-4 md:px-0">
      {/* Header — Professional Sync */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-2">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-100">
                 <Video size={16} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Syllabrix Motion</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
             Knowledge Reels
           </h1>
           <p className="text-sm text-gray-400 font-medium max-w-md leading-relaxed">
             Rapid vertical intelligence streams. Mastery in 60 seconds of high-fidelity specialist transmission.
           </p>
        </div>
        
        <button onClick={() => setShowCreate(true)}
          className="h-14 px-8 py-4 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-purple-600 transition-all shadow-xl shadow-gray-200 flex items-center gap-3 active:scale-95">
          <Plus size={18} strokeWidth={3} /> Deploy Reel
        </button>
      </div>

      {/* Primary Streaming Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {loading ? (
           <div className="lg:col-span-8 bg-white rounded-[48px] border border-gray-100 p-32 text-center shadow-sm flex flex-col items-center gap-4">
             <Loader2 size={32} className="animate-spin text-purple-500 mx-auto" strokeWidth={3} />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synchronizing Stream...</p>
           </div>
         ) : reels.length === 0 ? (
           <div className="lg:col-span-8 bg-white rounded-[48px] border border-gray-100 p-24 text-center shadow-sm">
             <div className="w-20 h-20 rounded-[28px] bg-purple-100 flex items-center justify-center mx-auto mb-6">
               <Video size={40} className="text-purple-600" strokeWidth={2.5} />
             </div>
             <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">No Active Streams</h2>
             <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">Be the first to deploy a vertical knowledge stream for the Syllabrix Professional Network.</p>
             <button onClick={() => setShowCreate(true)}
               className="inline-flex items-center gap-3 px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] bg-slate-900 text-white shadow-2xl shadow-gray-200 hover:bg-purple-600 transition-all">
               <Plus size={18} strokeWidth={3} /> Initial Capture
             </button>
           </div>
         ) : (
           <div className="lg:col-span-12 max-w-md mx-auto w-full relative group">
             {/* Nav Arrows Overlay */}
             <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={goPrev} disabled={activeIdx === 0} className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center hover:bg-gray-50 active:scale-90 border border-gray-100 disabled:opacity-20 transition-all"><ChevronUp size={24} strokeWidth={3} /></button>
                <div className="text-center font-black text-[10px] text-gray-400 uppercase tracking-widest">{activeIdx + 1}<br/>—<br/>{reels.length}</div>
                <button onClick={goNext} disabled={activeIdx === reels.length -1} className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center hover:bg-gray-50 active:scale-90 border border-gray-100 disabled:opacity-20 transition-all"><ChevronDown size={24} strokeWidth={3} /></button>
             </div>

             <div className="relative">
                <ReelCard reel={reels[activeIdx]} isActive={true} />
                
                {/* Mobile Scroll Indicator */}
                <div className="mt-8 flex justify-center gap-2">
                   {reels.slice(Math.max(0, activeIdx - 3), activeIdx + 4).map((_, i) => {
                     const realIdx = Math.max(0, activeIdx - 3) + i;
                     return (
                        <div key={realIdx} className={`h-1.5 rounded-full transition-all duration-300 ${realIdx === activeIdx ? 'bg-purple-600 w-12' : 'bg-gray-200 w-2'}`} />
                     );
                   })}
                </div>
             </div>
           </div>
         )}
      </div>

      {/* High-Intensity Create Modal Overlay */}
      {showCreate && (
        <CreateReelModal
          onClose={() => setShowCreate(false)}
          onCreated={(reel) => setReels(prev => [reel, ...prev])}
        />
      )}
    </div>
  );
}
