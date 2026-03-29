'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2, Pause, Play } from 'lucide-react';
import { storiesAPI } from '@/lib/api/stories.api';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

// Duration for image stories (ms)
const IMAGE_DURATION = 5000;

export default function StoryViewer({ groups, initialGroupIndex = 0, onClose, onDelete }) {
  const { user } = useAuth();
  const [groupIdx, setGroupIdx] = useState(initialGroupIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const videoRef = useRef(null);

  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];
  const isOwn = user?.id === group?.user_id;

  const markViewed = useCallback((s) => {
    if (!s.viewed) {
      storiesAPI.markViewed(s.id).catch(() => {});
    }
  }, []);

  // Advance to next story or group
  const advance = useCallback(() => {
    if (!group) return;
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx(i => i + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(g => g + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  }, [group, storyIdx, groupIdx, groups, onClose]);

  const goBack = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx(i => i - 1);
    } else if (groupIdx > 0) {
      setGroupIdx(g => g - 1);
      setStoryIdx(0);
    }
  }, [storyIdx, groupIdx]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    elapsedRef.current = 0;
    if (story) markViewed(story);
  }, [groupIdx, storyIdx]); // eslint-disable-line

  // Timer for image stories
  useEffect(() => {
    if (!story || story.media_type === 'video') return;
    if (paused) {
      clearInterval(timerRef.current);
      elapsedRef.current += Date.now() - (startTimeRef.current || Date.now());
      return;
    }
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = elapsedRef.current + (Date.now() - startTimeRef.current);
      const pct = Math.min((elapsed / IMAGE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current);
        advance();
      }
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [story, paused, advance]);

  if (!group || !story) return null;

  const handleVideoTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleVideoEnded = () => advance();

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={advance}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-3 z-10">
        {group.stories.map((s, i) => (
          <div key={s.id} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-none rounded-full"
              style={{
                width: i < storyIdx ? '100%' : i === storyIdx ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 px-4 flex items-center gap-3 z-10" onClick={e => e.stopPropagation()}>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
          {group.profile_photo_url
            ? <Image src={group.profile_photo_url} alt="" width={36} height={36} className="object-cover w-full h-full" />
            : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">{group.username?.[0]?.toUpperCase()}</div>
          }
        </div>
        <div>
          <p className="text-white text-[13px] font-semibold leading-tight">{group.full_name || group.username}</p>
          <p className="text-white/60 text-[10px]">{new Date(story.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => setPaused(p => !p)} className="text-white">
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          {isOwn && (
            <button
              onClick={async () => {
                await storiesAPI.delete(story.id).catch(() => {});
                onDelete?.(story.id);
                advance();
              }}
              className="text-white/80 hover:text-red-400"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button onClick={onClose} className="text-white"><X size={22} /></button>
        </div>
      </div>

      {/* Media */}
      <div className="relative w-full h-full max-w-sm mx-auto flex items-center justify-center">
        {story.media_type === 'video' ? (
          <video
            ref={videoRef}
            src={story.media_url}
            className="max-h-full max-w-full object-contain"
            autoPlay
            playsInline
            muted={false}
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <Image
            src={story.media_url}
            alt={story.caption || ''}
            fill
            className="object-contain"
            unoptimized
          />
        )}

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-16 left-4 right-4 text-center">
            <p className="text-white text-[14px] font-medium drop-shadow-lg bg-black/30 rounded-lg px-3 py-2 backdrop-blur-sm">{story.caption}</p>
          </div>
        )}
      </div>

      {/* Tap zones */}
      <button
        className="absolute left-0 top-0 w-1/3 h-full z-20"
        onClick={e => { e.stopPropagation(); goBack(); }}
      />
      <button
        className="absolute right-0 top-0 w-1/3 h-full z-20"
        onClick={e => { e.stopPropagation(); advance(); }}
      />

      {/* Group nav arrows */}
      {groupIdx > 0 && (
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white"
          onClick={e => { e.stopPropagation(); setGroupIdx(g => g - 1); setStoryIdx(0); }}
        >
          <ChevronLeft size={32} />
        </button>
      )}
      {groupIdx < groups.length - 1 && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 text-white/70 hover:text-white"
          onClick={e => { e.stopPropagation(); setGroupIdx(g => g + 1); setStoryIdx(0); }}
        >
          <ChevronRight size={32} />
        </button>
      )}
    </div>
  );
}
