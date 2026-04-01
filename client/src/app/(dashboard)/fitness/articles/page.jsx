'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { BookOpen, Loader2, Clock, Eye, ArrowLeft, ChevronRight } from 'lucide-react';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    Promise.all([
      fitnessAPI.getArticles({ limit: 50 }),
      fitnessAPI.getArticleCategories(),
    ]).then(([articlesRes, catRes]) => {
      setArticles(articlesRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCategoryFilter = async (catId) => {
    setActiveCategory(catId);
    setLoading(true);
    try {
      const params = catId ? { category_id: catId } : { limit: 50 };
      const res = await fitnessAPI.getArticles(params);
      setArticles(res.data?.data || []);
    } catch (e) {} finally { setLoading(false); }
  };

  const loadArticleDetail = async (id) => {
    try {
      const res = await fitnessAPI.getArticleById(id);
      setSelectedArticle(res.data?.data);
    } catch (e) { console.error(e); }
  };

  if (selectedArticle) {
    return (
      <div className="max-w-[700px] mx-auto">
        <button onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 mb-4 font-medium">
          <ArrowLeft size={16} /> Back to Articles
        </button>
        <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 overflow-hidden">
          {selectedArticle.cover_image_url && (
            <div className="w-full h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
              <BookOpen size={40} className="text-rose-300" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              {selectedArticle.category_name && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">{selectedArticle.category_name}</span>
              )}
              <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} /> {selectedArticle.read_time_min} min read</span>
              <span className="text-[10px] text-gray-400 flex items-center gap-1"><Eye size={10} /> {selectedArticle.views} views</span>
            </div>
            <h1 className="text-[20px] font-extrabold text-gray-800 leading-tight mb-2">{selectedArticle.title}</h1>
            <p className="text-[12px] text-gray-500 mb-4">By {selectedArticle.author_name} • {new Date(selectedArticle.published_at).toLocaleDateString()}</p>
            <div className="prose prose-sm max-w-none text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedArticle.content || selectedArticle.excerpt || 'Article content will be displayed here.'}
            </div>
          </div>
        </motion.article>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
          <BookOpen size={22} className="text-rose-500" /> Fitness Articles
        </h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Tips, guidance, and wellness knowledge</p>
      </motion.div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto mb-4 pb-1 scrollbar-hide">
        <button onClick={() => handleCategoryFilter('')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
            !activeCategory ? 'bg-rose-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-300'
          }`}>All</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => handleCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id ? 'bg-rose-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-300'
            }`}>{cat.icon || ''} {cat.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-rose-500" /></div>
      ) : articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map((article, i) => (
            <motion.button key={article.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => loadArticleDetail(article.id)}
              className="w-full bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4 text-left hover:shadow-md transition-all group">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={24} className="text-rose-300" />
                </div>
                <div className="flex-1 min-w-0">
                  {article.category_name && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-bold">{article.category_name}</span>
                  )}
                  <h3 className="text-[14px] font-bold text-gray-800 mt-1 group-hover:text-rose-600 transition-colors line-clamp-2">{article.title}</h3>
                  {article.excerpt && <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} /> {article.read_time_min} min</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Eye size={10} /> {article.views}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0 self-center" />
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/60 p-10 text-center">
          <BookOpen size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-[13px] text-gray-500">No articles available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
