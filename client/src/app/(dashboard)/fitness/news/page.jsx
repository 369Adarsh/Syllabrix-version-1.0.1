'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Newspaper, Loader2, ExternalLink, Clock } from 'lucide-react';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fitnessAPI.getNews(30).then(r => setNews(r.data?.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gray-500" /></div>;

  return (
    <div className="max-w-[700px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
          <Newspaper size={22} className="text-gray-600" /> Fitness News
        </h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Latest health and fitness updates</p>
      </motion.div>

      {news.length > 0 ? (
        <div className="space-y-3">
          {news.map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                  <Newspaper size={20} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] font-bold text-gray-800 leading-snug line-clamp-2">{item.title}</h3>
                  {item.excerpt && <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{item.excerpt}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-400 font-medium">{item.source || 'Fitness News'}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {new Date(item.published_at).toLocaleDateString()}
                    </span>
                    {item.source_url && (
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-blue-500 flex items-center gap-0.5 hover:text-blue-600">
                        Read <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/60 p-10 text-center">
          <Newspaper size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-[13px] text-gray-500">No news articles available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
