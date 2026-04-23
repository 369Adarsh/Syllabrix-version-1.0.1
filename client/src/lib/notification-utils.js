export function getNotificationUrl(n) {
  const { type, reference_type, reference_id, actor_id } = n;
  if (type === 'follow')      return actor_id ? `/profile/${actor_id}` : null;
  if (type === 'like')        return reference_type === 'post' && reference_id ? `/feed` : '/feed';
  if (type === 'comment')     return reference_type === 'post' && reference_id ? `/feed` : '/feed';
  if (type === 'job_alert')   return reference_type === 'job' && reference_id ? `/jobs/${reference_id}` : '/career/jobs';
  if (type === 'mentorship')  return '/mentorship';
  if (type === 'live_class')  return reference_id ? `/live-classes/${reference_id}` : '/live-classes';
  if (type === 'group_invite')return reference_id ? `/groups/${reference_id}` : '/groups';
  if (type === 'achievement') return '/career/jobs';
  return null;
}

export function timeSection(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = 3600000, d = 86400000, w = 7 * d;
  if (diff < h)     return 'New';
  if (diff < d)     return 'Today';
  if (diff < 2 * d) return 'Yesterday';
  if (diff < w)     return 'This Week';
  return 'Earlier';
}

export function buildSections(notifications) {
  const order = ['New', 'Today', 'Yesterday', 'This Week', 'Earlier'];
  const map = {};
  for (const n of notifications) {
    const label = timeSection(n.created_at);
    if (!map[label]) map[label] = [];
    map[label].push(n);
  }
  return order.filter(l => map[l]).map(l => ({ label: l, items: map[l] }));
}
