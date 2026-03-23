const generateUsername = (name) => {
  if (!name) return '';
  const base = name.toLowerCase().trim().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'').substring(0,20);
  return base + '_' + (Math.floor(Math.random()*9000)+1000);
};
module.exports = { generateUsername };
