'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';
import { uploadAPI } from '@/lib/api/upload.api';
import { ACTIVITY_TYPES } from '@/data/young-explorer-feed';
import { Loader2, Camera, X, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatePostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileRef = useRef(null);

  const [activityType, setActivityType] = useState(null);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.profilePhoto(file);
      const url = res.data?.data?.url || res.data?.url;
      if (!url) throw new Error('no url');
      setMediaUrl(url);
    } catch {
      toast.error('Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!activityType) { toast.error('Please pick what you did today!'); return; }
    if (!content.trim() && !mediaUrl) { toast.error('Add a description or photo!'); return; }
    setSubmitting(true);
    try {
      const meta = ACTIVITY_TYPES.find(a => a.id === activityType);
      await postsAPI.create({
        content: content.trim() || `${meta?.emoji || '⭐'} ${meta?.label || 'Activity'}`,
        post_type: activityType === 'achievement' ? 'achievement' : 'experience_share',
        media_url: mediaUrl || undefined,
        media_type: mediaUrl ? 'image' : 'none',
        visibility: 'public',
        hashtags: [activityType],
      });
      toast.success('🎉 Shared! Everyone will see your awesome post!', { duration: 3000 });
      router.push('/my-world');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const greetName = user?.full_name?.split(' ')[0] || user?.username || 'Explorer';

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="font-black text-gray-900 text-[20px]">Share Something! ✨</h1>
          <p className="text-gray-500 text-[13px]">What did you do today, {greetName}?</p>
        </div>
      </div>

      {/* Activity Type Picker */}
      <div className="mb-6">
        <p className="text-[12px] font-black uppercase tracking-widest text-gray-500 mb-3">I did some...</p>
        <div className="grid grid-cols-4 gap-3">
          {ACTIVITY_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setActivityType(type.id)}
              className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border-2 transition-all ${
                activityType === type.id
                  ? 'border-amber-400 bg-amber-50 shadow-md scale-105'
                  : 'border-gray-100 bg-white hover:border-amber-200 hover:bg-amber-50/50'
              }`}
            >
              <span className="text-2xl leading-none">{type.emoji}</span>
              <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tell us about it */}
      <div className="mb-5">
        <p className="text-[12px] font-black uppercase tracking-widest text-gray-500 mb-2">Tell everyone about it!</p>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write what you did, how it felt, what you learned... 😊"
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-300 transition-all resize-none"
        />
        <p className="text-right text-[11px] text-gray-400 mt-1">{content.length}/500</p>
      </div>

      {/* Photo Upload */}
      <div className="mb-6">
        <p className="text-[12px] font-black uppercase tracking-widest text-gray-500 mb-2">Add a Photo (Optional)</p>
        {mediaUrl ? (
          <div className="relative">
            <img src={mediaUrl} alt="preview" className="w-full rounded-2xl object-cover max-h-52" />
            <button
              onClick={() => setMediaUrl('')}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-amber-200 rounded-2xl text-amber-600 font-bold text-[13px] hover:bg-amber-50 transition-all disabled:opacity-50"
          >
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : <><Camera size={16} /> Add a photo</>}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || uploading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[15px] text-white shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
      >
        {submitting ? <><Loader2 size={18} className="animate-spin" /> Sharing…</> : <><Send size={18} /> Share with Everyone! 🎉</>}
      </button>

      {/* Tips */}
      <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <p className="text-[12px] font-black text-amber-700 mb-1.5">💡 Ideas to share:</p>
        <ul className="space-y-1 text-[12px] text-amber-600">
          <li>🎨 Take a photo of your drawing and share it</li>
          <li>🏆 Tell everyone about a medal or prize you won</li>
          <li>📚 Describe the best story you read this week</li>
          <li>⚽ Share the score of a game you played!</li>
        </ul>
      </div>
    </div>
  );
}
