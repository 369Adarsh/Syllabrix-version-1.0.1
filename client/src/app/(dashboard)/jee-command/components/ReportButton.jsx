'use client';
import { useState } from 'react';
import { Flag, X, Send, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { jeeAPI } from '@/lib/api/jee.api';

export default function ReportButton({ contentId, contentType, name = "Question" }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('wrong_answer');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Endpoint for reporting content
      await api.post('/jee/reports', {
        content_id: contentId,
        content_type: contentType,
        report_reason: reason,
        description: description
      });
      setSubmitted(true);
      setTimeout(() => setOpen(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-red-500 transition-all px-2 py-1 rounded hover:bg-red-50"
      >
        <Flag size={12} /> Report Issue
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-black tracking-tight text-gray-900 flex items-center gap-2">
                   <AlertTriangle className="text-red-500" size={20} /> Report Content
                </h3>
                <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
              </div>

              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                     <CheckCircle2 size={32} />
                  </div>
                  <p className="text-[17px] font-black text-gray-900 mb-2 whitespace-nowrap overflow-hidden">Thank you for reporting!</p>
                  <p className="text-[13px] text-gray-500">Our subject experts will review this content manually.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Reason for reporting</label>
                    <select 
                      value={reason} 
                      onChange={e => setReason(e.target.value)}
                      className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-bold outline-none focus:ring-4 focus:ring-red-50 focus:border-red-400 transition-all"
                    >
                      <option value="wrong_answer">Wrong Answer Key</option>
                      <option value="wrong_solution">Error in Solution Steps</option>
                      <option value="typo">Spelling or Symbol Typo</option>
                      <option value="unclear">Context / Images are unclear</option>
                      <option value="missing_step">Crucial step is missing</option>
                      <option value="other">Other issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Additional Context (Optional)</label>
                    <textarea 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={`Explain what's wrong with this ${name}...`}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-medium outline-none h-24 focus:ring-4 focus:ring-red-50 focus:border-red-400 transition-all resize-none"
                    />
                  </div>

                  <button 
                    disabled={submitting}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[14px] font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Submit Report
                  </button>
                  <p className="text-[10px] text-gray-400 text-center font-medium">Reporting helps our community grow stronger. Your feedback is appreciated.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
