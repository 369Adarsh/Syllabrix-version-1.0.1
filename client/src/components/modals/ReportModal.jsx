'use client';
import { useState } from 'react';
import Modal from '../ui/Modal';
import { safetyAPI } from '@/lib/api/safety.api';
import { ShieldAlert, AlertTriangle, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const REPORT_REASONS = [
  { id: 'hate_speech', label: 'Hate Speech', icon: '🚫' },
  { id: 'harassment', label: 'Harassment', icon: '😤' },
  { id: 'spam', label: 'Spam / Scams', icon: '🤥' },
  { id: 'inappropriate', label: 'Inappropriate Content', icon: '🔞' },
  { id: 'bullying', label: 'Bullying', icon: '👊' },
  { id: 'misinformation', label: 'Misinformation', icon: '📢' },
  { id: 'other', label: 'Other Issue', icon: '📝' },
];

export default function ReportModal({ isOpen, onClose, targetUserId, targetName }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return toast.error('Please select a reason');

    setLoading(true);
    try {
      await safetyAPI.report({
        reported_user_id: targetUserId,
        reason,
        description,
      });
      toast.success('Report submitted to Content Sentinel for review');
      onClose();
      // Reset form
      setReason('');
      setDescription('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Report" size="md">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <p className="text-sm text-amber-800 leading-relaxed">
            Help us keep Syllabrix safe. Your report regarding <span className="font-bold">@{targetName}</span> will be reviewed by our moderation squad via Content Sentinel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Reasons Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Reason for Report
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    reason === r.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                      : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Additional Context (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details to help our team understand the issue..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] transition-all"
            />
          </div>

          {/* Action */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Send size={16} />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Reporting is anonymous. Misuse of the reporting system may lead to account restrictions.
        </p>
      </div>
    </Modal>
  );
}
