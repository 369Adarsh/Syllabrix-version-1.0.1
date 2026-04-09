'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LD_API from '@/lib/api/ld.api';
import toast from 'react-hot-toast';
import { 
  Search, Lightbulb, BookCopy, Plus, ArrowLeft, 
  MessageSquare, ThumbsUp, Tag, Filter, Loader2, Sparkles, X, Send
} from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Item State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', body: '', item_type: 'tip', tags: [] });

  useEffect(() => {
    if (orgId) loadKnowledge();
    else router.push('/corporate/dashboard');
  }, [orgId]);

  const loadKnowledge = async () => {
    setLoading(true);
    try {
      const res = await LD_API.getKnowledgeFeed(orgId);
      setItems(res.data?.data || []);
    } catch (e) {
      toast.error('Failed to load knowledge feed');
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return loadKnowledge();
    setIsSearching(true);
    try {
      const res = await LD_API.searchKnowledge(orgId, searchQuery);
      setItems(res.data?.data || []);
    } catch (e) {
      toast.error('Search failed');
    }
    setIsSearching(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await LD_API.submitKnowledge(orgId, newItem);
      toast.success('Submitted for SME Review!');
      setShowSubmitModal(false);
      setNewItem({ title: '', body: '', item_type: 'tip', tags: [] });
    } catch (e) {
      toast.error('Submission failed');
    }
    setIsSubmitting(false);
  };

  const handleMarkHelpful = async (itemId) => {
    try {
      await LD_API.markHelpful(orgId, itemId);
      setItems(items.map(it => it.id === itemId ? { ...it, helpful_count: (it.helpful_count || 0) + 1 } : it));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !items.length) return <div className="p-20 text-center"><Loader2 className="animate-spin text-indigo-500 mx-auto" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ─── HEADER ─── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/corporate/dashboard?orgId=${orgId}`} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
               <ArrowLeft size={20} />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
               <Lightbulb size={20} />
            </div>
            <div>
               <h1 className="text-xl font-black text-gray-900 tracking-tight">Tribal Knowledge Hub</h1>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Internal Insights & Expert Tips</p>
            </div>
          </div>

          <button 
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all"
          >
            <Plus size={18} /> Share Insight
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
         
         {/* ─── SEARCH SECTION ─── */}
         <div className="mb-12 relative">
            <form onSubmit={handleSearch} className="group">
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search company knowledge base: 'How to handle discount requests...', 'CRM best practices'..."
                 className="w-full h-16 pl-14 pr-32 rounded-3xl bg-white border border-gray-200 shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-gray-800 font-medium"
               />
               <Search className="absolute left-5 top-5 text-gray-400 group-focus-within:text-orange-500" size={24} />
               <button 
                 type="submit" 
                 className="absolute right-3 top-3 h-10 px-6 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all"
               >
                 {isSearching ? <Loader2 className="animate-spin" size={18} /> : 'AI Search'}
               </button>
            </form>
         </div>

         <div className="grid lg:grid-cols-12 gap-10">
            
            {/* ─── MAIN FEED ─── */}
            <div className="lg:col-span-8 space-y-6">
               <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest flex items-center gap-2">
                     <BookCopy size={16} /> Latest Insights
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
                     <span>Most Helpful</span>
                     <span>Recent</span>
                  </div>
               </div>

               {items.length === 0 ? (
                 <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <Sparkles size={40} className="mx-auto mb-4 text-orange-200" />
                    <p className="text-gray-400">No knowledge items match your search.</p>
                 </div>
               ) : items.map((item, idx) => (
                 <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.item_type === 'tip' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                             {item.item_type === 'tip' ? <Lightbulb size={16} /> : <Tag size={16 }/>}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.item_type}</span>
                       </div>
                       <span className="text-[10px] text-gray-400 font-medium">{new Date(item.published_at || item.created_at).toLocaleDateString()}</span>
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 mb-2 leading-snug">{item.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                       {item.body}
                    </p>

                    <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200" />
                          <span className="text-xs font-bold text-gray-500">{item.contributor_name || 'Expert'}</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleMarkHelpful(item.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors"
                          >
                             <ThumbsUp size={14} /> {item.helpful_count || 0} Helpful
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-indigo-500 transition-colors">
                             <MessageSquare size={14} /> Discuss
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* ─── SIDEBAR ─── */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-orange-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-100">
                  <Sparkles size={24} className="mb-4 opacity-50" />
                  <h4 className="font-bold text-lg mb-2">Crowdsourced Intelligence</h4>
                  <p className="text-xs text-orange-500/80 leading-relaxed">
                    Syllabrix turns your team's unique tribal knowledge into searchable learning assets. Shared tips are reviewed by SMEs and distributed to teammates via AI Coach.
                  </p>
               </div>

               <div className="bg-white rounded-3xl border border-gray-100 p-6">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <Tag size={16} className="text-indigo-500" /> Top Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Product', 'Sales', 'Process', 'HR', 'IT'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* ─── SUBMISSION MODAL ─── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                      <Plus size={16} />
                    </div>
                    <h3 className="font-bold text-gray-900">Share Internal Insight</h3>
                 </div>
                 <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                    <input 
                      required
                      type="text" 
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="e.g., Handling discount requests for Enterprise plans"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Type</label>
                       <select 
                         value={newItem.item_type}
                         onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value })}
                         className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent outline-none text-sm font-medium"
                       >
                          <option value="tip">Expert Tip</option>
                          <option value="process">Standard Process</option>
                          <option value="guide">Technical Guide</option>
                          <option value="faq">FAQ</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Tag</label>
                       <input 
                         type="text" 
                         placeholder="e.g., Sales"
                         className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent outline-none text-sm font-medium"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Body Content (Markdown Supported)</label>
                    <textarea 
                      required
                      rows={6}
                      value={newItem.body}
                      onChange={(e) => setNewItem({ ...newItem, body: e.target.value })}
                      placeholder="Explain the insight, process, or tip in detail..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium resize-none"
                    />
                 </div>

                 <button 
                   disabled={isSubmitting}
                   className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Submit to SME Review Queue
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
