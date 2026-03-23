export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
  return formatDate(date);
}

export function truncate(str, len = 100) {
  if (!str || str.length <= len) return str;
  return str.substring(0, len) + '...';
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
