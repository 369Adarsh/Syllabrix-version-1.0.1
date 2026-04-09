'use client';
import { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { AlertCircle } from 'lucide-react';

export default function VideoRoom({ roomId, userId, userName, isTeacher }) {
  const containerRef = useRef(null);
  const [keyWarning, setKeyWarning] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === 'undefined') return;

    // Use environment variables (will fail gracefully if not set yet)
    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0');
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '';

    if (appID === 0 || !serverSecret) {
      setKeyWarning(true);
      return; 
    }

    try {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID, 
        serverSecret, 
        roomId, 
        userId, 
        userName
      );
      
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference, // Configured for Zoom-style class
        },
        turnOnMicrophoneWhenJoining: false,
        turnOnCameraWhenJoining: false,
        showPreJoinView: true,             // Let students check hair/mic before joining
        showScreenSharingButton: isTeacher, // Only teachers can share screen by default
        layout: "Grid", 
        maxUsers: 50
      });

      return () => {
        if (zp) zp.destroy();
      };
    } catch (err) {
      console.error("ZegoCloud Init Error:", err);
    }
  }, [roomId, userId, userName, isTeacher]);

  return (
    <div className="relative w-full h-[calc(100vh-56px)] bg-slate-900 overflow-hidden shadow-2xl">
      {keyWarning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-white p-6 text-center z-50">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">SDK Keys Missing</h2>
          <p className="text-slate-300 max-w-md">
            The Live Class Video Engine requires a ZegoCloud App ID and Server Secret. <br/><br/>
            Please add <code className="bg-slate-900 px-2 py-1 rounded text-emerald-400">NEXT_PUBLIC_ZEGO_APP_ID</code> and <code className="bg-slate-900 px-2 py-1 rounded text-emerald-400">NEXT_PUBLIC_ZEGO_SERVER_SECRET</code> to your <code className="text-emerald-400">client/.env.local</code> file.
          </p>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
    </div>
  );
}
