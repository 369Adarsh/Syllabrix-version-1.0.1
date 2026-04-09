'use client';
import { useState, useEffect } from 'react';
import { 
  MessageSquare, Plus, Clock, HelpCircle, 
  Send, AlertCircle, CheckCircle2, ChevronRight,
  BookOpen, Info, ShieldCheck, Headphones
} from 'lucide-react';
import { supportAPI } from '@/lib/api/tickets.api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_MAP = {
  open: { label: 'Raised', color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-violet-100 text-violet-700', icon: MessageSquare },
  resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700', icon: Info },
};

export default function HelpCenterPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list, detail, new
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  
  // New Ticket Form State
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    isAcademicDoubt: false,
    academic_doubt_id: ''
  });

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const res = await supportAPI.getTickets();
      setTickets(res.data.tickets || []);
    } catch (e) {
      toast.error('Failed to load support history');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await supportAPI.createTicket(formData);
      toast.success('Your case has been registered. Support intelligence is on it!');
      setView('list');
      setFormData({ subject: '', description: '', priority: 'medium', isAcademicDoubt: false, academic_doubt_id: '' });
      fetchMyTickets();
    } catch (e) {
      toast.error('Failed to raise ticket');
    }
  };

  const openTicket = async (ticket) => {
    setLoading(true);
    try {
      const res = await supportAPI.getTicket(ticket.id);
      setSelectedTicket(res.data);
      setView('detail');
    } catch (e) {
      toast.error('Could not load case details');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      await supportAPI.addReply(selectedTicket.id, reply);
      setReply('');
      const res = await supportAPI.getTicket(selectedTicket.id);
      setSelectedTicket(res.data);
      toast.success('Message sent to Support Team');
    } catch (e) {
      toast.error('Failed to send message');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      {/* Hero / Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Headphones size={180} />
        </div>
        <div className="relative z-10 max-w-[600px]">
          <h1 className="text-3xl font-black mb-2">Help Center</h1>
          <p className="text-indigo-100 text-lg">Platform trouble or academic roadblocks? Our support intelligence and master mentors are here to help.</p>
          <div className="mt-8 flex gap-3">
             <button 
               onClick={() => setView('new')}
               className="bg-white text-indigo-700 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg"
             >
               <Plus size={18} />
               Raise New Case
             </button>
             <button 
               onClick={() => setView('list')}
               className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-2xl font-bold transition-all"
             >
               View My Tickets
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-4"
          >
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-slate-800">Support History</h2>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> {tickets.filter(t => t.status === 'open').length} Active
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> {tickets.filter(t => t.status === 'resolved').length} Solved
                  </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="font-bold text-slate-400">Syncing with SyllaDesk...</p>
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HelpCircle className="text-slate-300" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No active cases found</h3>
                    <p className="text-slate-500 mb-8 max-w-[350px] mx-auto">Whenever you have an issue, raise a ticket here for guaranteed resolution from our team.</p>
                    <button onClick={() => setView('new')} className="text-indigo-600 font-bold hover:underline">Raise your first ticket →</button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {tickets.map(ticket => (
                        <button 
                          key={ticket.id}
                          onClick={() => openTicket(ticket)}
                          className="w-full bg-white border border-slate-100 p-5 rounded-3xl hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left flex items-center justify-between group"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${ticket.priority === 'urgent' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                                    {ticket.academic_doubt_id ? <BookOpen size={20} /> : <MessageSquare size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-1">{ticket.subject}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_MAP[ticket.status].color}`}>
                                          {STATUS_MAP[ticket.status].label}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-medium">#{ticket.id} • {format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={20} />
                        </button>
                    ))}
                </div>
            )}
          </motion.div>
        )}

        {view === 'new' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
          >
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-800">Raise Support Ticket</h2>
                <button onClick={() => setView('list')} className="text-slate-400 font-bold hover:text-slate-600">Back to History</button>
             </div>

             <form onSubmit={handleCreateTicket} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Issue Subject</label>
                    <input 
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Brief summary of the issue..."
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Priority</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="low">Low - General Question</option>
                        <option value="medium">Medium - Technical Issue</option>
                        <option value="high">High - Academic Blocker</option>
                        <option value="urgent">Urgent - Platform Bug</option>
                    </select>
                </div>

                <div className="flex items-center gap-4 bg-indigo-50/50 rounded-2xl px-6 border border-indigo-100">
                    <input 
                      type="checkbox"
                      id="academic_doubt"
                      checked={formData.isAcademicDoubt}
                      onChange={(e) => setFormData({...formData, isAcademicDoubt: e.target.checked})}
                      className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <label htmlFor="academic_doubt" className="text-sm font-bold text-indigo-700 cursor-pointer select-none">
                        Is this an Academic Doubt?
                    </label>
                </div>

                {formData.isAcademicDoubt && (
                    <div className="col-span-2 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                         <div className="flex items-start gap-3">
                            <BookOpen className="text-indigo-600 mt-1" size={20} />
                            <div>
                                <p className="text-indigo-800 font-bold text-sm">Linked Doubt Marketplace Intelligence</p>
                                <p className="text-indigo-600/70 text-xs">If you select this, your ticket will be routed to a subject-matter master mentor.</p>
                            </div>
                         </div>
                         <input 
                            value={formData.academic_doubt_id}
                            onChange={(e) => setFormData({...formData, academic_doubt_id: e.target.value})}
                            placeholder="Optional: Case ID from Doubt Marketplace"
                            className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20"
                         />
                    </div>
                )}

                <div className="col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Detail Description</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={5}
                      placeholder="Provide all relevant details to help our team solve the issue faster..."
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>

                <div className="col-span-2 pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
                    >
                        Register Ticket Intelligence <ChevronRight size={20} />
                    </button>
                    <p className="text-center text-slate-400 text-xs mt-4 flex items-center justify-center gap-1.5 font-medium">
                        <ShieldCheck size={14} /> Guaranteed 24-hour turnaround for all priority tickets
                    </p>
                </div>
             </form>
          </motion.div>
        )}

        {view === 'detail' && selectedTicket && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col h-[700px] bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl"
          >
             {/* Detail Header */}
             <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('list')} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                        <ArrowLeft className="text-slate-400" size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 line-clamp-1">{selectedTicket.subject}</h2>
                        <p className="text-xs text-slate-400 font-medium tracking-tight uppercase mt-0.5">CASE ID: #{selectedTicket.id}</p>
                    </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest ${STATUS_MAP[selectedTicket.status].color}`}>
                    {STATUS_MAP[selectedTicket.status].label}
                </span>
             </div>

             {/* Conversation Area */}
             <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Initial Post */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <HelpCircle size={20} />
                    </div>
                    <div className="space-y-2 max-w-[85%]">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800 text-sm">Me</span>
                            <span className="text-[10px] text-slate-400 font-bold">{format(new Date(selectedTicket.created_at), 'MMM d, p')}</span>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-3xl rounded-tl-none border border-slate-100">
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                        </div>
                    </div>
                </div>

                {/* History Divider */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Master Thread</span>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>

                {/* Replies */}
                {selectedTicket.conversation.map((msg, i) => (
                    <div key={i} className={`flex gap-4 ${msg.author_type === 'admin' ? '' : 'flex-row-reverse'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            msg.author_type === 'admin' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-indigo-50 text-indigo-600'
                        }`}>
                            {msg.author_type === 'admin' ? <ShieldCheck size={20} /> : <HelpCircle size={20} />}
                        </div>
                        <div className={`space-y-2 max-w-[85%] ${msg.author_type === 'admin' ? '' : 'items-end'}`}>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-800 text-sm">
                                    {msg.author_type === 'admin' ? 'Support Intelligence' : 'Me'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">{format(new Date(msg.created_at), 'p')}</span>
                            </div>
                            <div className={`p-5 rounded-3xl border ${
                                msg.author_type === 'admin' 
                                ? 'bg-emerald-50 border-emerald-100 rounded-tl-none' 
                                : 'bg-indigo-50 border-indigo-100 rounded-tr-none'
                            }`}>
                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
             </div>

             {/* Reply Box */}
             <div className="p-6 bg-slate-50 border-t border-slate-100">
                <form onSubmit={handleReply} className="relative flex items-end gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                    <textarea 
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-700 resize-none max-h-[120px] py-1"
                        rows={2}
                    />
                    <button 
                       type="submit"
                       disabled={!reply.trim() || sendingReply}
                       className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
                    >
                        <Send size={20} className={sendingReply ? 'animate-pulse' : ''} />
                    </button>
                </form>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
