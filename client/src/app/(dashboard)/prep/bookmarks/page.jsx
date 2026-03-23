'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { prepAPI } from '@/lib/api/prep.api';
import Spinner from '@/components/ui/Spinner';
import { BookMarked, Trash2, ArrowLeft, Loader2, Newspaper, Brain, FileText } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const TYPE_ICONS = { current_affairs: Newspaper, quiz: Brain, syllabus: FileText, topic: BookMarked };
const TYPE_COLORS = { current_affairs: 'bg-orange-100 text-orange-600', quiz: 'bg-purple-100 text-purple-600', syllabus: 'bg-blue-100 text-blue-600', topic: 'bg-emerald-100 text-emerald-600' };

export default function PrepBookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prepAPI.getBookmarks({})
      .then(r => setBookmarks(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    try {
      await prepAPI.removeBookmark(id);
      setBookmarks(p => p.filter(b => b.id !== id));
      toast.success('Bookmark removed');
    } catch { toast.error('Could not remove'); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 p-5">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/prep" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft size={16} className="text-white" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <BookMarked size={20} className="text-blue-200" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Prep Bookmarks</h1>
            <p className="text-blue-200/70 text-xs">{bookmarks.length} saved items</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <Loader2 size={28} className="animate-spin text-blue-500 mx-auto" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <BookMarked size={28} className="text-blue-400" />
          </div>
          <h2 className="font-bold text-gray-700 mb-2">No Bookmarks Yet</h2>
          <p className="text-sm text-gray-400">Save current affairs, quizzes, and topics for quick access.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map(b => {
            const Icon = TYPE_ICONS[b.content_type] || BookMarked;
            const color = TYPE_COLORS[b.content_type] || 'bg-gray-100 text-gray-600';
            return (
              <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {b.title || `${b.content_type?.replace('_', ' ')} #${b.content_id}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium text-gray-400 uppercase">{b.content_type?.replace('_', ' ')}</span>
                      {b.folder_name && <span className="text-[10px] text-gray-400">· {b.folder_name}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => remove(b.id)}
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all">
                  <Trash2 size={15} className="text-gray-300 hover:text-red-500 transition-colors" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
