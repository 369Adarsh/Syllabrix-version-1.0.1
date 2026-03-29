'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Camera, Video, Type, Smile, Upload, Loader2 } from 'lucide-react';
import { storiesAPI } from '@/lib/api/stories.api';

const FILTERS = [
  { label: 'None',     value: '' },
  { label: 'Warm',     value: 'sepia(0.4) saturate(1.4) brightness(1.05)' },
  { label: 'Cool',     value: 'hue-rotate(200deg) saturate(1.2)' },
  { label: 'Vintage',  value: 'sepia(0.6) contrast(1.1) brightness(0.95)' },
  { label: 'B&W',      value: 'grayscale(1)' },
  { label: 'Vivid',    value: 'saturate(1.8) contrast(1.1)' },
  { label: 'Fade',     value: 'opacity(0.85) brightness(1.1) contrast(0.9)' },
];

const STICKERS = ['🎉', '🔥', '💡', '📚', '🎯', '⭐', '💬', '🚀', '❤️', '😂'];

export default function StoryUploadModal({ onClose, onCreated }) {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [filter, setFilter] = useState('');
  const [caption, setCaption] = useState('');
  const [stickers, setStickers] = useState([]); // { emoji, x, y }
  const [dragging, setDragging] = useState(null);
  const [showStickers, setShowStickers] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setIsVideo(f.type.startsWith('video/'));
    setPreview(URL.createObjectURL(f));
    setFilter('');
    setStickers([]);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  const addSticker = (emoji) => {
    setStickers(prev => [...prev, { id: Date.now(), emoji, x: 50, y: 50 }]);
    setShowStickers(false);
  };

  const flattenAndUpload = async () => {
    setUploading(true);
    try {
      let uploadFile = file;

      // For images with filter/stickers: flatten onto canvas
      if (!isVideo && (filter || stickers.length > 0)) {
        const img = new window.Image();
        img.src = preview;
        await new Promise(r => { img.onload = r; });

        const canvas = canvasRef.current;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (filter) ctx.filter = filter;
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';

        // Draw stickers
        const scale = img.naturalWidth / 400; // preview is ~400px wide
        ctx.font = `${40 * scale}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const s of stickers) {
          const sx = (s.x / 100) * canvas.width;
          const sy = (s.y / 100) * canvas.height;
          ctx.fillText(s.emoji, sx, sy);
        }

        const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
        uploadFile = new File([blob], 'story.jpg', { type: 'image/jpeg' });
      }

      const fd = new FormData();
      fd.append('file', uploadFile);
      if (caption.trim()) fd.append('caption', caption.trim());

      const res = await storiesAPI.create(fd);
      onCreated?.(res.data?.data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Sticker drag
  const startDrag = (e, id) => {
    e.preventDefault();
    setDragging(id);
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setStickers(prev => prev.map(s => s.id === dragging ? { ...s, x, y } : s));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1a1a2e] w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-white font-bold text-[15px]">Create Story</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!preview ? (
            /* Drop zone */
            <div
              className="mx-4 mb-4 h-64 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-white/40 transition-colors"
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex gap-4">
                <Camera size={28} className="text-white/50" />
                <Video size={28} className="text-white/50" />
              </div>
              <p className="text-white/50 text-[13px] text-center px-6">Tap to choose a photo or video<br/><span className="text-[11px]">Up to 45 seconds for videos</span></p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-[12px] font-medium">
                <Upload size={14} /> Browse files
              </div>
            </div>
          ) : (
            <div className="px-4 pb-2 space-y-3">
              {/* Preview area */}
              <div
                className="relative w-full aspect-[9/16] max-h-64 rounded-xl overflow-hidden bg-black select-none"
                onMouseMove={onMouseMove}
                onMouseUp={() => setDragging(null)}
                onTouchEnd={() => setDragging(null)}
              >
                {isVideo ? (
                  <video
                    src={preview}
                    className="w-full h-full object-contain"
                    style={{ filter }}
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-contain"
                    style={{ filter }}
                    draggable={false}
                  />
                )}
                {/* Stickers overlay */}
                {stickers.map(s => (
                  <span
                    key={s.id}
                    className="absolute text-3xl cursor-grab active:cursor-grabbing select-none"
                    style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)' }}
                    onMouseDown={e => startDrag(e, s.id)}
                    onTouchStart={e => startDrag(e, s.id)}
                    onDoubleClick={() => setStickers(prev => prev.filter(st => st.id !== s.id))}
                  >{s.emoji}</span>
                ))}
              </div>

              {/* Hidden canvas for flatten */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Filter strip */}
              {!isVideo && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {FILTERS.map(f => (
                    <button
                      key={f.label}
                      onClick={() => setFilter(f.value)}
                      className={`flex-shrink-0 flex flex-col items-center gap-1 ${filter === f.value ? 'opacity-100' : 'opacity-60'}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt={f.label} className="w-12 h-12 rounded-lg object-cover" style={{ filter: f.value }} />
                      <span className={`text-[9px] font-medium ${filter === f.value ? 'text-blue-400' : 'text-white/50'}`}>{f.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Caption */}
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                maxLength={300}
                placeholder="Add a caption..."
                className="w-full bg-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2 text-[13px] outline-none border border-white/10 focus:border-white/30"
              />

              {/* Sticker picker */}
              <div className="relative">
                <button
                  onClick={() => setShowStickers(p => !p)}
                  className="flex items-center gap-1.5 text-white/60 hover:text-white text-[12px]"
                >
                  <Smile size={16} /> Add sticker
                </button>
                {showStickers && (
                  <div className="absolute bottom-full left-0 mb-2 bg-[#2a2a3e] rounded-xl p-3 flex flex-wrap gap-2 z-10 shadow-xl">
                    {STICKERS.map(e => (
                      <button key={e} onClick={() => addSticker(e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Change file */}
              <button
                onClick={() => { setPreview(null); setFile(null); }}
                className="text-white/40 hover:text-white/70 text-[12px]"
              >
                Change media
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-6 pt-3 border-t border-white/10">
          <button
            onClick={preview ? flattenAndUpload : () => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[14px] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Posting...</> : preview ? 'Share to Story' : 'Choose Media'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
