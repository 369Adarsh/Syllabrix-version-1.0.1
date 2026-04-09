'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { Video } from 'lucide-react';

export default function UpcomingClassesWidget() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/live-classes?upcoming=true&limit=3')
      .then(r => setClasses(r.data?.data?.classes || r.data?.classes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Video size={12} className="text-[#534AB7]" /> Upcoming Classes
        </p>
        <Link href="/live-classes" className="text-[11px] font-semibold text-[#378ADD] hover:underline">See all</Link>
      </div>
      {loading ? (
        <div className="space-y-2.5 animate-pulse">
          {[1,2].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg" />)}
        </div>
      ) : classes.length === 0 ? (
        <p className="text-[12px] text-gray-400">No upcoming classes scheduled</p>
      ) : (
        <div className="space-y-2">
          {classes.map(cls => (
            <Link key={cls.id} href={`/live-classes/room/${cls.room_id}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-gray-700 group-hover:text-[#378ADD] truncate transition-colors">{cls.title}</p>
                <p className="text-[10px] text-gray-400">{cls.host_username}</p>
              </div>
              <span className="text-[11px] font-bold text-[#534AB7] flex-shrink-0 ml-2">{formatTime(cls.scheduled_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
