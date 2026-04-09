'use client';
import { useEffect, useState } from 'react';
import { jeeAPI } from '@/lib/api/jee.api';
import Link from 'next/link';
import { 
  Book, Star, Lock, ChevronRight, Search, 
  Filter, Sparkles, Zap
} from 'lucide-react';

const BOOK_COVERS = {
  'hc-verma-vol1': 'https://m.media-amazon.com/images/I/81vS3sN5aUL.jpg',
  'hc-verma-vol2': 'https://m.media-amazon.com/images/I/81-pS9S6eAL.jpg',
  'dc-pandey-mechanics': 'https://m.media-amazon.com/images/I/71R2o5D-VML.jpg'
};

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    jeeAPI.getBooks()
      .then(r => setBooks(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = books.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">Reference Books</h1>
          <p className="text-gray-500 text-[14px] mt-1 max-w-xl">Curated solutions for the most popular JEE preparation books. Master advanced concepts with expert-verified steps.</p>
        </div>
        <div className="relative min-w-[280px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search books..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-[14px] focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-[420px] bg-white rounded-3xl animate-pulse ring-1 ring-gray-100" />)
        ) : (
          filtered.map(book => (
            <div key={book.slug} className="group relative bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 transform hover:-translate-y-1">
              {/* Premium Badge */}
              {book.premium && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-yellow-400 text-white rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-lg shadow-yellow-200">
                  <Star size={10} fill="currentColor" /> PREMIUM
                </div>
              )}

              {/* Book Art */}
              <div className="h-60 bg-gradient-to-br from-gray-50 to-gray-200 relative overflow-hidden">
                <img 
                  src={BOOK_COVERS[book.slug] || 'https://via.placeholder.com/300x400'} 
                  alt={book.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/5" />
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">{book.subject}</span>
                  <span className="text-[10px] text-gray-400">• Step-by-step Solutions</span>
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[50px]">{book.name}</h3>
                
                <div className="mt-6 flex items-center justify-between">
                  {book.premium ? (
                    <Link href={`/jee-command/books/${book.slug}`} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-2xl text-[12px] font-bold hover:bg-black transition-all shadow-xl shadow-gray-200">
                      Explore Chapters <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <Link href={`/jee-command/books/${book.slug}`} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[12px] font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                      Explore Free <ChevronRight size={14} />
                    </Link>
                  )}
                  {book.premium && <Lock size={16} className="text-gray-300" />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-32">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-gray-200" />
          </div>
          <p className="text-[18px] font-bold text-gray-800">No books found</p>
          <p className="text-[14px] text-gray-400 mt-2">Try searching with a different book title or subject.</p>
        </div>
      )}

      {/* Suggestion Box */}
      <div className="mt-20 p-8 rounded-[40px] bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden shadow-2xl shadow-blue-200/50">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-[24px] font-extrabold mb-2">Want another book added?</h2>
            <p className="text-blue-100 text-[14px]">Let us know which study material our experts should solve next.</p>
          </div>
          <button className="px-8 py-3.5 bg-white text-blue-600 rounded-2xl text-[14px] font-bold hover:scale-105 transition-all">
            Request Content
          </button>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4 rotate-12">
          <Sparkles size={160} />
        </div>
      </div>
    </div>
  );
}
