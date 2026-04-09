'use client';
import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const ALERT_SOUND_URL = '/sounds/admin-alert.mp3';

// Plays an audio alert
function playAlert() {
  try {
    const audio = new Audio(ALERT_SOUND_URL);
    audio.volume = 0.7;
    audio.play().catch(() => {}); // silently ignore if browser blocks autoplay
  } catch (e) {}
}

// Requests browser notification permission
async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

// Shows a browser native notification
function showBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

export function useAdminAlerts() {
  const socketRef = useRef(null);

  const triggerUrgentAlert = useCallback((report) => {
    // 1. Play sound
    playAlert();

    // 2. Browser native notification
    showBrowserNotification(
      '🚨 Urgent Report Filed',
      `Reason: ${report.reason} — User: ${report.reported_username || 'Unknown'}`
    );

    // 3. In-app toast
    toast.error(`🚨 URGENT: ${report.reason?.toUpperCase() || 'FLAGGED CONTENT'}`, {
      description: `Reported by ${report.reporter_name || 'a user'}. Requires immediate review.`,
      duration: 0, // stays until dismissed
      action: {
        label: 'Review Now',
        onClick: () => window.location.href = '/admin/moderation',
      },
    });
  }, []);

  useEffect(() => {
    requestNotificationPermission();

    const token = localStorage.getItem('syllabrix_token');
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('admin:urgent_report', (report) => {
      triggerUrgentAlert(report);
    });

    return () => {
      socket.disconnect();
    };
  }, [triggerUrgentAlert]);
}
