'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';
import { uploadAPI } from '@/lib/api/upload.api';
import { ImagePlus, Video, X, Loader2, Send, Smile, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatePostBox({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('none');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [feeling, setFeeling] = useState(null);
  const [showMoods, setShowMoods] = useState(false);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const textRef = useRef(null);
  const moodRef = useRef(null);

  const moods = [
    { label: 'Productive', emoji: '🦾', color: 'text-blue-500' },
    { label: 'Excited', emoji: '🤩', color: 'text-amber-500' },
    { label: 'Grateful', emoji: '🙏', color: 'text-emerald-500' },
    { label: 'Achieving', emoji: '🏆', color: 'text-indigo-500' },
    { label: 'Focused', emoji: '🎯', color: 'text-purple-500' },
    { label: 'Inspired', emoji: '💡', color: 'text-yellow-500' },
    { label: 'Happy', emoji: '😊', color: 'text-amber-400' },
    { label: 'Tired', emoji: '🥱', color: 'text-slate-400' },
  ];

  useEffect(() => {
    const open = () => {
      setExpanded(true);
      setTimeout(() => textRef.current?.focus(), 100);
      textRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    window.addEventListener('syllabrix:open-create-post', open);

    const handleClickOutside = (e) => {
      if (moodRef.current && !moodRef.current.contains(e.target)) setShowMoods(false);
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('syllabrix:open-create-post', open);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) { toast.error(`Max ${type === 'video' ? '100MB' : '10MB'}`); return; }
    setMediaFile(file); setMediaType(type); setMediaPreview(URL.createObjectURL(file)); setExpanded(true);
  };

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null); setMediaPreview(null); setMediaType('none'); setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) { toast.error('Write something or add media'); return; }
    setLoading(true); setUploadProgress(0);
    try {
      let mediaUrl = null;
      if (mediaFile) {
        setUploadProgress(10);
        const uploadRes = await uploadAPI.single(mediaFile);
        mediaUrl = uploadRes.data?.data?.url || uploadRes.data?.url;
        setUploadProgress(80);
      }
      const res = await postsAPI.create({
        content: content.trim(), post_type: 'regular', visibility: 'public',
        media_type: mediaUrl ? mediaType : 'none', media_url: mediaUrl || null,
        feeling: feeling?.label || null
      });
      setUploadProgress(100); setContent(''); setFeeling(null); removeMedia(); setExpanded(false);
      toast.success('Posted!');
      onPostCreated?.(res.data?.data || res.data);
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to post'); }
    finally { setLoading(false); setUploadProgress(0); }
  };

  if (!user) return null;
  const hasPhoto = user.profile_photo_url && !user.profile_photo_url.includes('PASTE_');

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60">
      {/* Top section — avatar + input */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
          {hasPhoto ? (
            <Image src={user.profile_photo_url} alt="" width={40} height={40} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="text-white font-semibold text-sm">{user.username?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <button onClick={() => { setExpanded(true); setTimeout(() => textRef.current?.focus(), 100); }}
          className={`flex-1 text-left px-4 py-2.5 rounded-full text-[14px] transition-all ${
            expanded ? 'hidden' : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-gray-500'
          }`}>
          What&apos;s on your mind, {user.username}?
        </button>
        {expanded && (
          <div className="flex-1">
            <textarea ref={textRef} value={content} onChange={e => setContent(e.target.value)}
              placeholder={`What's on your mind, ${user.username}?`}
              className="w-full resize-none border-0 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none text-[15px] leading-relaxed"
              rows={content.split('\n').length > 3 ? 5 : 3} autoFocus />
            {feeling && (
              <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mt-1 pb-1">
                <span>— is feeling</span>
                <span className="font-semibold text-gray-700 flex items-center gap-1">
                  <span>{feeling.emoji}</span> {feeling.label}
                </span>
                <button onClick={() => setFeeling(null)} className="p-0.5 hover:bg-gray-100 rounded-full transition-colors ml-0.5">
                  <X size={12} className="text-gray-400" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div className="px-4 pb-2">
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-[#F0F2F5]">
            <button onClick={removeMedia} className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white z-10"><X size={14} className="text-gray-600" /></button>
            {mediaType === 'image' ? (
              <img src={mediaPreview} alt="" className="w-full object-contain" style={{ maxHeight: '300px' }} />
            ) : (
              <video src={mediaPreview} controls className="w-full bg-black" style={{ maxHeight: '300px' }} />
            )}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {loading && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="px-4 pb-2"><div className="bg-gray-100 rounded-full h-1.5 overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div></div>
      )}

      {/* Divider */}
      <div className="mx-4 h-px bg-gray-200/80" />

      {/* Action bar */}
      <div className="flex items-center px-2 py-1.5">
        <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'image')} />
        <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => handleFileSelect(e, 'video')} />

        <button onClick={() => imageRef.current?.click()} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium text-gray-600 hover:bg-[#F0F2F5] transition-colors">
          <ImagePlus size={20} className="text-emerald-500" /> Photo
        </button>
        <button onClick={() => videoRef.current?.click()} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium text-gray-600 hover:bg-[#F0F2F5] transition-colors">
          <Video size={20} className="text-red-500" /> Video
        </button>

        <div className="flex-1 relative" ref={moodRef}>
          <button onClick={() => setShowMoods(!showMoods)} disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              feeling ? 'text-amber-600 bg-amber-50' : 'text-gray-600 hover:bg-[#F0F2F5]'
            }`}>
            <Smile size={20} className={feeling ? 'text-amber-500' : 'text-amber-500'} /> {feeling ? feeling.label : 'Feeling'}
          </button>

          {showMoods && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="text-[12px] font-bold text-gray-400 px-2 py-1 mb-1">HOW ARE YOU FEELING?</div>
              <div className="grid grid-cols-2 gap-1">
                {moods.map((m) => (
                  <button key={m.label}
                    onClick={() => { setFeeling(m); setShowMoods(false); setExpanded(true); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-[13px] font-medium text-gray-700">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {expanded && (
          <button onClick={handleSubmit} disabled={loading || (!content.trim() && !mediaFile)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-40 ml-1">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Post
          </button>
        )}
      </div>
    </div>
  );
}
