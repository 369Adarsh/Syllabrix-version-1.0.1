'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

// We MUST dynamically import ZegoCloud due to window dependencies
const VideoRoom = dynamic(() => import('@/components/video/VideoRoom'), { ssr: false });

export default function LiveClassRoomPage() {
  const { user } = useAuth();
  const { roomId } = useParams();
  const router = useRouter();

  if (!user) return null;

  const isTeacher = user.user_type === 'teacher' || user.user_type === 'institute';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F8FAFC]">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/live-classes')} 
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> 
              Live Broadcast: {roomId}
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <Users size={12} /> {isTeacher ? 'You are Host (Screen Share Enabled)' : 'Student Access'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Broadcast Studio Hub */}
      <div className="flex-1 overflow-hidden">
        <VideoRoom 
          roomId={roomId} 
          userId={user.id.toString()} 
          userName={user.username || user.full_name || 'Participant'} 
          isTeacher={isTeacher} 
        />
      </div>

    </div>
  );
}
