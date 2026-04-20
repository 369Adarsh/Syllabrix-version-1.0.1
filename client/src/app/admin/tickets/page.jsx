'use client';
import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Clock, AlertCircle, CheckCircle2,
  Send, User, Search, Hash,
  ArrowLeft, ExternalLink, BadgeAlert, History, RefreshCw
} from 'lucide-react';
import { adminTicketAPI } from '@/lib/api/tickets.api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: 'text-sky-700',     bg: 'bg-sky-100',    border: 'border-sky-200' },
  in_progress: { label: 'In Progress', color: 'text-violet-700',  bg: 'bg-violet-100', border: 'border-violet-200' },
  resolved:    { label: 'Resolved',    color: 'text-emerald-700', bg: 'bg-emerald-100',border: 'border-emerald-200' },
  closed:      { label: 'Closed',      color: 'text-gray-500',    bg: 'bg-gray-100',   border: 'border-gray-200' },
};

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'text-gray-500' },
  medium: { label: 'Medium', color: 'text-blue-600' },
  high:   { label: 'High',   color: 'text-orange-600' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [filter, setFilter] = useState({ status: 'all', priority: 'all' });
  const chatEndRef = useRef(null);

  useEffect(() => { fetchTickets(); }, [filter]);
  useEffect(() => { if (selectedTicket) fetchTicketDetails(selectedTicket.id); }, [selectedTicket]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticketDetails?.conversation]);

  const fetchTickets = async () => {
    try {
      const res = await adminTicketAPI.getTickets(filter);
      setTickets(res.data.tickets || []);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id) => {
    setFetchingDetails(true);
    try {
      const res = await adminTicketAPI.getTicket(id);
      setTicketDetails(res.data);
    } catch {
      toast.error('Failed to load ticket conversation');
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      await adminTicketAPI.addReply(selectedTicket.id, reply);
      setReply('');
      fetchTicketDetails(selectedTicket.id);
      toast.success('Reply submitted');
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await adminTicketAPI.updateStatus(selectedTicket.id, status);
      toast.success(`Ticket marked as ${status}`);
      fetchTickets();
      fetchTicketDetails(selectedTicket.id);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 md:h-[calc(100vh-140px)]">

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Unresolved', count: tickets.filter(t => t.status === 'open').length, icon: AlertCircle, color: 'bg-sky-100 text-sky-600' },
          { label: 'Critical', count: tickets.filter(t => t.priority === 'urgent').length, icon: BadgeAlert, color: 'bg-red-100 text-red-600' },
          { label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length, icon: Clock, color: 'bg-violet-100 text-violet-600' },
          { label: 'Handled Today', count: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{stat.count}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden min-h-0">

        {/* Ticket List */}
        <div className={`w-full md:w-[380px] flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-700 focus:outline-none focus:border-indigo-400 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] text-gray-600 focus:outline-none focus:border-indigo-400"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={filter.priority}
                onChange={(e) => setFilter({...filter, priority: e.target.value})}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] text-gray-600 focus:outline-none focus:border-indigo-400"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex flex-col items-center gap-3">
                <RefreshCw className="text-gray-300 animate-spin" size={32} />
                <p className="text-gray-400 text-xs font-bold animate-pulse">Syncing SyllaDesk...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="mx-auto text-gray-200 mb-3" size={40} />
                <p className="text-gray-400 text-xs font-bold">Queue is empty</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {tickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-4 text-left transition-all hover:bg-indigo-50/50 relative group ${selectedTicket?.id === ticket.id ? 'bg-indigo-50' : ''}`}
                  >
                    {selectedTicket?.id === ticket.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-gray-400">#{ticket.id}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${STATUS_CONFIG[ticket.status]?.bg} ${STATUS_CONFIG[ticket.status]?.color} ${STATUS_CONFIG[ticket.status]?.border}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-[13px] font-bold text-gray-800 line-clamp-1 mb-1">{ticket.subject}</h4>
                    <p className="text-[11px] text-gray-400 mb-2">by @{ticket.username}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${PRIORITY_CONFIG[ticket.priority]?.color}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ticket.priority}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {format(new Date(ticket.created_at), 'MMM d, p')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversation Detail */}
        <div className={`flex-1 flex-col bg-white border border-gray-200 rounded-2xl md:rounded-3xl overflow-hidden relative shadow-sm ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
          {!selectedTicket ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-200 mb-6">
                <MessageSquare className="text-indigo-500" size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">Queue Intelligence</h3>
              <p className="text-gray-400 text-sm max-w-[300px]">Select a ticket from the sidebar to view the conversation and provide solutions.</p>
            </div>
          ) : fetchingDetails ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm font-bold animate-pulse">Loading conversation...</p>
            </div>
          ) : (
            <>
              {/* Detail Header */}
              <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="md:hidden mt-0.5 p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-all shrink-0"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-gray-400">CASE ID: #{selectedTicket.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[ticketDetails?.status || 'open'].border} ${STATUS_CONFIG[ticketDetails?.status || 'open'].color} ${STATUS_CONFIG[ticketDetails?.status || 'open'].bg}`}>
                        {ticketDetails?.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h2 className="text-base md:text-xl font-black text-gray-900 leading-tight">{selectedTicket.subject}</h2>
                  </div>
                </div>

                <div className="flex gap-2 ml-8 md:ml-0">
                  {ticketDetails?.status !== 'resolved' && (
                    <button
                      onClick={() => updateStatus('resolved')}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all border border-emerald-200"
                    >
                      <CheckCircle2 size={13} /> Resolve
                    </button>
                  )}
                  {ticketDetails?.status !== 'closed' && (
                    <button
                      onClick={() => updateStatus('closed')}
                      className="px-3 md:px-4 py-2 bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all border border-gray-200"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>

              {/* Chat View */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50/50">
                {/* Initial Description */}
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                    <User className="text-gray-400" size={20} />
                  </div>
                  <div className="space-y-2 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">@{selectedTicket.username}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Original Issue • {format(new Date(selectedTicket.created_at), 'MMM d, p')}</span>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                      <p className="text-sm text-gray-600 leading-relaxed italic whitespace-pre-wrap">"{selectedTicket.description}"</p>
                    </div>
                    {selectedTicket.academic_doubt_id && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600 text-[10px] font-bold">
                        <ExternalLink size={12} />
                        Linked to Academic Doubt #{selectedTicket.academic_doubt_id}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">
                    <History size={12} /> Conversation
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
                </div>

                {/* Replies */}
                {ticketDetails?.conversation.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.author_type === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                      msg.author_type === 'admin'
                        ? 'bg-indigo-100 border-indigo-200 text-indigo-600'
                        : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                      {msg.author_type === 'admin' ? <Hash size={18} /> : <User size={18} />}
                    </div>
                    <div className={`space-y-2 max-w-[80%] ${msg.author_type === 'admin' ? 'items-end' : ''}`}>
                      <div className={`flex items-center gap-2 ${msg.author_type === 'admin' ? 'justify-end' : ''}`}>
                        <span className="text-xs font-bold text-gray-800">{msg.author_name || 'System User'}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{format(new Date(msg.created_at), 'p')}</span>
                      </div>
                      <div className={`p-4 rounded-2xl shadow-sm ${
                        msg.author_type === 'admin'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white border border-gray-200 rounded-tl-none text-gray-700'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Reply Box */}
              <div className="p-3 md:p-6 bg-white border-t border-gray-100">
                <form onSubmit={handleSendReply} className="relative group">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Provide a solution or request more info..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 pr-16 text-sm text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all min-h-[100px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(e); }
                    }}
                  />
                  <div className="absolute right-4 bottom-4 flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 font-medium hidden group-focus-within:block">Enter to send</span>
                    <button
                      type="submit"
                      disabled={!reply.trim() || sendingReply}
                      className="p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all shadow-md shadow-indigo-200"
                    >
                      {sendingReply ? <Clock className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
