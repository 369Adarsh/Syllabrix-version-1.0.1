'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Clock, MessageSquare, Heart, UserPlus, LogIn, 
  ShieldAlert, FileText, Loader2, Calendar, Smartphone
} from 'lucide-react';
import { adminAPI } from '@/lib/api/admin.api';
import { toast } from 'sonner';

const EVENT_CONFIG = {
  post_created: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  comment_created: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  reaction_like: { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  followed_user: { icon: UserPlus, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  session_started: { icon: LogIn, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  report_filed: { icon: ShieldAlert, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  default: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-400/10' }
};

export default function UserActivityPanel({ user, isOpen, onClose }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchActivity();
    }
  }, [isOpen, user?.id, startDate, endDate]);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await adminAPI.getUserActivity(user.id, params);
      setActivities(res.data || []);
    } catch (e) {
      toast.error('Intelligence Retrieval Failed');
      console.error('Failed to fetch activity', e);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0f] border-l border-white/[0.08] shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">User Intelligence</h2>
                <p className="text-white/40 text-xs mt-0.5">Chronological audit for @{user?.username}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Date Filters */}
            <div className="px-6 py-4 bg-white/[0.01] border-b border-white/[0.05] flex items-center gap-3">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/20 ml-1">From</span>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/20 ml-1">To</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>
              </div>
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="mt-4 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  title="Clear Filters"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <Loader2 className="animate-spin text-violet-500" size={32} />
                  <p className="text-white/20 text-sm font-medium">Aggregating history...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-3">
                  <Clock size={48} />
                  <p className="text-sm">No activity recorded yet</p>
                </div>
              ) : (
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-violet-500/50 before:to-transparent">
                  {activities.map((item, idx) => {
                    const config = EVENT_CONFIG[item.action_type] || EVENT_CONFIG.default;
                    const Icon = config.icon;
                    
                    return (
                      <div key={idx} className="relative pl-10">
                        {/* Dot */}
                        <div className={`absolute left-0 w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center border border-white/[0.05]`}>
                          <Icon className={config.color} size={14} />
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                              {item.action_type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-medium text-white/20 flex items-center gap-1">
                              <Calendar size={10} /> {getTimeAgo(item.created_at)}
                            </span>
                          </div>
                          <p className="text-white/70 text-sm leading-relaxed">
                            {item.summary || `Interacted with ${item.entity_type} #${item.entity_id}`}
                          </p>
                          {item.action_type === 'session_started' && item.summary && (
                            <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.05] w-fit">
                              <Smartphone size={10} className="text-white/30" />
                              <span className="text-[10px] text-white/40 truncate max-w-[200px]">{item.summary}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/[0.02] border-t border-white/[0.08]">
              <p className="text-[10px] text-white/20 text-center leading-relaxed">
                Activity data is fetched from core platform tables and unified system logs. 
                Reports and safety violations are highlighted in orange.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
