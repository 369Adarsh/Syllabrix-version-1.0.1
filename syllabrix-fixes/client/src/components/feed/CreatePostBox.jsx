'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api-client';
import { HiOutlinePhotograph, HiOutlineVideoCamera, HiX } from 'react-icons/hi';
import { IoSend } from 'react-icons/io5';
import toast from 'react-hot-toast';

export default function CreatePostBox({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('none'); // 'none' | 'image' | 'video'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (50MB max for video, 10MB for image)
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${type === 'video' ? '50MB' : '10MB'}.`);
      return;
    }

    setMediaFile(file);
    // ✅ FIX: media_type is separate from post_type
    // post_type is ALWAYS 'regular' for normal posts
    // media_type tells the backend what kind of media is attached
    setMediaType(type);

    // Generate preview
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type });
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType('none');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) {
      toast.error('Write something or add media to post.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let mediaUrl = null;

      // Upload media first if present
      if (mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);

        const uploadEndpoint = mediaType === 'video' ? '/api/upload/video' : '/api/upload/image';
        const uploadRes = await api.post(uploadEndpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(pct);
          },
        });

        mediaUrl = uploadRes.data?.data?.url || uploadRes.data?.data?.secure_url;
      }

      // ✅ CRITICAL FIX: post_type is ALWAYS 'regular'
      // media_type carries the media format info (image/video/none)
      // This was the root cause of "Validation failed" error
      const postPayload = {
        content: content.trim(),
        post_type: 'regular',           // ✅ ALWAYS 'regular' — NOT 'image' or 'video'
        media_type: mediaType,           // ✅ 'none' | 'image' | 'video' — this is what backend validates
        media_url: mediaUrl || undefined,
        visibility: 'public',
      };

      const res = await api.post('/api/posts', postPayload);

      if (res.data?.success) {
        toast.success('Post created!');
        setContent('');
        removeMedia();
        if (onPostCreated) onPostCreated(res.data.data);
      }
    } catch (err) {
      console.error('Post creation error:', err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create post.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
      {/* User avatar + text area */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {user?.profile_photo_url ? (
            <img src={user.profile_photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            user?.username?.charAt(0)?.toUpperCase() || 'U'
          )}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share something amazing..."
          className="flex-1 resize-none border-0 outline-none text-gray-700 placeholder-gray-400 text-[15px] min-h-[60px] bg-transparent"
          rows={2}
          maxLength={2000}
        />
      </div>

      {/* Media preview */}
      {mediaPreview && (
        <div className="relative mt-3 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
          <button
            onClick={removeMedia}
            className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
          {mediaPreview.type === 'video' ? (
            <video
              src={mediaPreview.url}
              controls
              className="w-full max-h-[400px] object-contain bg-black rounded-xl"
            />
          ) : (
            <img
              src={mediaPreview.url}
              alt="Preview"
              className="w-full max-h-[400px] object-contain"
            />
          )}
        </div>
      )}

      {/* Upload progress bar */}
      {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1">
          {/* Photo button */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors text-gray-500 hover:text-blue-600">
            <HiOutlinePhotograph className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'image')}
            />
          </label>

          {/* Video button */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors text-gray-500 hover:text-purple-600">
            <HiOutlineVideoCamera className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Video</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'video')}
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{content.length}/2000</span>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !mediaFile)}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            <IoSend className="w-4 h-4" />
            <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
