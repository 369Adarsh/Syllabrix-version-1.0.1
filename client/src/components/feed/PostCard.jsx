'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { postsAPI } from '@/lib/api/posts.api';
import { Heart, MessageCircle, Share2, Bookmark, Send, Loader2, MoreHorizontal, Trash2, Flag, Copy, EyeOff, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PostCard({ post: initialPost, onDelete }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [liked, setLiked] = useState(!!initialPost?.user_reaction);
  const [saved, setSaved] = useState(!!initialPost?.is_saved);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mediaStyle, setMediaStyle] = useState({});
  const menuRef = useRef(null);

  const isOwn = user?.id?.toString() === post?.user_id?.toString();
  const { ref: cardRef, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    if (showMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const timeAgo = (date) => {
    if (!date) return '';
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm';
    if (s < 86400) return Math.floor(s / 3600) + 'h';
    if (s < 604800) return Math.floor(s / 86400) + 'd';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Smart media sizing — detect aspect ratio
  const handleImageLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    const ratio = w / h;
    if (ratio > 1.5) { // Landscape 16:9
      setMediaStyle({ maxHeight: '350px', width: '100%' });
    } else if (ratio < 0.7) { // Portrait 9:16
      setMediaStyle({ maxHeight: '500px', maxWidth: '320px', margin: '0 auto' });
    } else if (ratio > 0.9 && ratio < 1.1) { // Square 1:1
      setMediaStyle({ maxHeight: '420px', maxWidth: '420px', margin: '0 auto' });
    } else { // Default
      setMediaStyle({ maxHeight: '420px', width: '100%' });
    }
  };

  const handleLike = async () => {
    try { await postsAPI.like(post.id, { reaction_type: 'amazing' }); setLiked(!liked); setPost(p => ({ ...p, likes_count: liked ? p.likes_count - 1 : p.likes_count + 1 })); } catch { toast.error('Could not like'); }
  };

  const handleSave = async () => {
    try { await postsAPI.toggleSave(post.id); setSaved(!saved); toast.success(saved ? 'Unsaved' : 'Saved!'); } catch { toast.error('Could not save'); }
  };

  const handleShare = () => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); toast.success('Link copied!'); };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try { await postsAPI.delete(post.id); toast.success('Deleted'); onDelete?.(post.id); } catch { toast.error('Could not delete'); }
    setShowMenu(false);
  };

  const handleCopyLink = () => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); toast.success('Link copied!'); setShowMenu(false); };

  const loadComments = async () => {
    if (!showComments) {
      setShowComments(true); setCommentsLoading(true);
      try { const res = await postsAPI.getComments(post.id); setComments(res.data?.data || res.data || []); } catch { setComments([]); }
      finally { setCommentsLoading(false); }
    } else { setShowComments(false); }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await postsAPI.comment(post.id, { content: commentText.trim() });
      const nc = res.data?.data || res.data;
      setComments(prev => [{ ...nc, username: user.username, profile_photo_url: user.profile_photo_url }, ...prev]);
      setCommentText(''); setPost(p => ({ ...p, comments_count: (p.comments_count || 0) + 1 }));
    } catch (err) { toast.error(err?.response?.data?.message || 'Could not comment'); }
    finally { setCommentSubmitting(false); }
  };

  const hasMedia = post.media_url && post.media_url !== 'null' && !post.media_url.includes('PASTE_');

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transition: { duration: 0.18 } }}
      className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link href={'/profile/' + post.user_id}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
          {post.profile_photo_url && !post.profile_photo_url.includes('PASTE_') ? (
            <Image src={post.profile_photo_url} alt={post.username} width={40} height={40} className="w-full h-full object-cover rounded-full" />
          ) : (<span className="text-white font-semibold text-sm">{post.username?.charAt(0)?.toUpperCase()}</span>)}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={'/profile/' + post.user_id} className="font-semibold text-gray-800 hover:text-blue-600 text-sm">{post.username}</Link>
            <span className="text-[10px] font-medium text-gray-400 capitalize bg-gray-50 px-1.5 py-0.5 rounded">{post.user_type}</span>
          </div>
          <p className="text-[11px] text-gray-400">{timeAgo(post.created_at)}</p>
        </div>

        {/* 3-DOT MENU — WORKING */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MoreHorizontal size={16} className="text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg border border-gray-200 shadow-xl z-50 py-1.5 animate-fade-in">
              <button onClick={handleCopyLink} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                <Copy size={14} /> Copy link
              </button>
              {isOwn && (
                <button onClick={handleDelete} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={14} /> Delete post
                </button>
              )}
              {!isOwn && (
                <>
                  <button onClick={() => { toast('Hidden from your feed'); setShowMenu(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                    <EyeOff size={14} /> Hide post
                  </button>
                  <button onClick={() => { toast('Post reported'); setShowMenu(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                    <Flag size={14} /> Report
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && <div className="px-4 pb-2"><p className="text-gray-800 text-[14px] leading-relaxed whitespace-pre-wrap">{post.content}</p></div>}

      {/* Media — SMART ASPECT RATIO */}
      {hasMedia && (
        <div className="mt-1 bg-gray-50 border-t border-b border-gray-100 flex items-center justify-center">
          {post.media_type === 'video' ? (
            <video src={post.media_url} controls playsInline preload="metadata" className="w-full object-contain bg-black" style={{ maxHeight: '420px' }} />
          ) : (
            <img src={post.media_url} alt="Post" className="object-contain" style={mediaStyle.maxHeight ? mediaStyle : { maxHeight: '420px', width: '100%' }}
              onLoad={handleImageLoad} loading="lazy" />
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-[11px] text-gray-400 px-4 py-2">
        {post.likes_count > 0 && <span className="flex items-center gap-1"><Heart size={11} className="text-red-400" /> {post.likes_count}</span>}
        {post.comments_count > 0 && <span>{post.comments_count} comment{post.comments_count !== 1 ? 's' : ''}</span>}
        {post.shares_count > 0 && <span>{post.shares_count} share{post.shares_count !== 1 ? 's' : ''}</span>}
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-gray-100 px-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all mx-0.5 ${liked ? 'text-red-500' : 'text-gray-500 hover:bg-gray-50 hover:text-red-500'}`}>
          <motion.span animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </motion.span>
          Like
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={loadComments} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all mx-0.5 ${showComments ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}`}>
          <MessageCircle size={16} /> Comment
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-500 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all mx-0.5">
          <Share2 size={16} /> Share
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} onClick={handleSave} className={`flex items-center justify-center p-2.5 rounded-lg transition-all ${saved ? 'text-amber-500' : 'text-gray-400 hover:bg-gray-50 hover:text-amber-500'}`}>
          <motion.span animate={saved ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.25 }}>
            <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
          </motion.span>
        </motion.button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          <div className="flex gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..." className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment()} />
            <button onClick={submitComment} disabled={commentSubmitting || !commentText.trim()}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40">
              {commentSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          {commentsLoading ? (
            <div className="text-center py-3"><Loader2 size={18} className="animate-spin text-blue-400 mx-auto" /></div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">No comments yet</p>
          ) : (
            comments.map((c, i) => (
              <div key={c.id || i} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">
                  {c.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-700">{c.username}</span>
                    <span className="text-[10px] text-gray-400">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-[12.5px] text-gray-600 mt-0.5">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}
