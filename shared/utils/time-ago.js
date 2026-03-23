const timeAgo = (date) => {
  if (!date) return '';
  const s = Math.floor((new Date()-new Date(date))/1000);
  const m=Math.floor(s/60), h=Math.floor(m/60), d=Math.floor(h/24), w=Math.floor(d/7), mo=Math.floor(d/30), y=Math.floor(d/365);
  if(s<60) return 'just now';
  if(m<60) return m+(m===1?' min ago':' mins ago');
  if(h<24) return h+(h===1?' hour ago':' hours ago');
  if(d<7) return d+(d===1?' day ago':' days ago');
  if(w<5) return w+(w===1?' week ago':' weeks ago');
  if(mo<12) return mo+(mo===1?' month ago':' months ago');
  return y+(y===1?' year ago':' years ago');
};
module.exports = { timeAgo };
