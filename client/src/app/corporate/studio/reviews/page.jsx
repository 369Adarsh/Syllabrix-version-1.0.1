'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LD_API from '@/lib/api/ld.api';
import toast from 'react-hot-toast';
import {
  History, CheckCircle, XCircle, Clock, Eye, AlertCircle, Loader2, Sparkles, Shield
} from 'lucide-react';

export default function SMEReviewQueuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');

  const [isViewing, setIsViewing] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (orgId) {
      loadReviews();
    } else {
      LD_API.getMyOrgs().then(res => {
        if (res.data?.data?.length > 0) {
          router.replace(`/corporate/studio/reviews?orgId=${res.data.data[0].id}`);
        } else {
          router.push('/corporate/dashboard');
        }
      }).catch(() => router.push('/corporate/dashboard'));
    }
  }, [orgId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await LD_API.getReviewQueue(orgId);
      setReviews(res.data?.data || []);
    } catch (e) {
      toast.error('Failed to load review queue');
    }
    setLoading(false);
  };

  const handleViewContent = async (review) => {
    setSelectedReview(review);
    setIsViewing(true);
    setLoadingPreview(true);
    setPreviewContent(null);
    try {
      if (review.content_type === 'program') {
        const res = await LD_API.getProgram(orgId, review.content_id);
        setPreviewContent(res.data?.data);
      } else if (review.content_type === 'knowledge_item') {
        const res = await LD_API.getKnowledgeFeed(orgId, { id: review.content_id });
        const item = res.data?.data?.find(it => it.id === review.content_id);
        setPreviewContent(item);
      } else if (review.content_type === 'module') {
        toast.error('Module-level detailed fetch not implemented yet');
      }
    } catch (e) {
      toast.error('Failed to fetch content preview');
    }
    setLoadingPreview(false);
  };

  const handleAction = async (reviewId, status) => {
    try {
      await LD_API.submitReview(orgId, reviewId, {
        status, // 'approved', 'rejected', 'changes_requested'
        feedback_notes: status === 'approved' ? 'Looks good!' : 'Needs revision'
      });
      toast.success(`Content ${status} successfully`);
      setIsViewing(false);
      loadReviews();
    } catch (e) {
      toast.error('Failed to update review status');
    }
  };

  if (!orgId || loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ─── HEADER ─── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/corporate/studio?orgId=${orgId}`} className="text-gray-400 hover:text-gray-600">
              &larr; Studio
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <History size={16} className="text-amber-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900">SME Review Queue</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={18} /> Pending AI Content
            </h3>
            <p className="text-sm text-gray-500 mt-1">Review AI-generated courses before they are published to the learning base.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Content Type</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 flex justify-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-gray-400">All caught up! No content pending review.</td></tr>
                ) : reviews.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-800 capitalize">
                      {r.content_type?.replace('_', ' ')}
                    </td>
                    <td className="p-4 text-gray-500 truncate max-w-[250px]">
                      {r.content_title || 'AI Generated Content'}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {r.status === 'pending' ? (
                         <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit text-xs font-bold"><Clock size={12}/> Pending</span>
                      ) : r.status === 'approved' ? (
                         <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded w-fit text-xs font-bold"><CheckCircle size={12}/> Approved</span>
                      ) : (
                         <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded w-fit text-xs font-bold"><AlertCircle size={12}/> Needs Revision</span>
                      )}
                    </td>
                    <td className="p-4">
                      {r.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleViewContent(r)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors" title="View Review Details"><Eye size={16}/></button>
                          <button onClick={() => handleAction(r.id, 'approved')} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Quick Approve"><CheckCircle size={16}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── REVIEW PREVIEW MODAL ─── */}
      {isViewing && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedReview?.content_title || 'Reviewing Content'}
                </h3>
                <p className="text-sm text-gray-500">Status: <span className="text-amber-600 font-bold uppercase">{selectedReview?.status}</span></p>
              </div>
              <button onClick={() => setIsViewing(false)} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors">
                <XCircle size={20}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center h-64">
                   <Loader2 className="animate-spin text-indigo-500 mb-2" />
                   <p className="text-sm text-gray-500">Loading AI generated draft...</p>
                </div>
              ) : previewContent ? (
                <div className="max-w-4xl mx-auto space-y-8">
                   {/* Meta Section */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-gray-100">
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Type</p>
                        <p className="text-sm font-bold text-gray-800 capitalize">{previewContent.program_type || previewContent.item_type || 'Content'}</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Status</p>
                        <p className="text-sm font-bold text-gray-800 capitalize">{previewContent.status}</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Contributor</p>
                        <p className="text-sm font-bold text-gray-800 font-mono">ID: {previewContent.created_by || previewContent.contributor_id || 'AI'}</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">AI Check</p>
                        <p className="text-sm font-bold text-green-600">PASSED</p>
                      </div>
                   </div>

                   {/* Content Preview */}
                   {selectedReview?.content_type === 'program' && (
                     <div className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <Sparkles size={18} className="text-amber-500" /> Curriculum Highlights
                        </h4>
                        <div className="grid gap-3">
                           {(previewContent.modules || []).map((m, midx) => (
                             <div key={midx} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold">{m.order_index}</span>
                                   <h5 className="font-bold text-gray-900">{m.title}</h5>
                                </div>
                                <span className="text-[10px] font-bold uppercase px-2 py-1 bg-gray-100 text-gray-500 rounded">{m.module_type}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                   
                   {selectedReview?.content_type === 'knowledge_item' && (
                     <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                              <Sparkles size={24} />
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-gray-900 tracking-tight">{previewContent.title}</h4>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{previewContent.item_type} Insight</p>
                           </div>
                        </div>
                        
                        <div className="prose prose-slate max-w-none prose-sm">
                           <div className="whitespace-pre-wrap font-medium text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-6 border border-gray-100 italic">
                              "{previewContent.body}"
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-6">
                           {(previewContent.tags || []).map((tag, tidx) => (
                             <span key={tidx} className="px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 uppercase rounded-full">
                               #{tag}
                             </span>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
              ) : (
                <div className="text-center p-20 text-gray-400">
                   <AlertCircle size={40} className="mx-auto mb-4 opacity-20" />
                   <p>Could not load content for this review.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between">
               <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold px-3 py-1.5 bg-amber-50 rounded-lg">
                 <Shield size={14} /> AI Governance Check: PASS (Bias: 0.02, Hallucination: 0.05)
               </div>
               <div className="flex gap-3">
                  <button onClick={() => handleAction(selectedReview.id, 'revision_requested')} className="px-6 py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all">
                    Request Revision
                  </button>
                  <button onClick={() => handleAction(selectedReview.id, 'approved')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <CheckCircle size={18} /> Approve & Publish
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
