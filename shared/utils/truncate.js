const truncate = (t, max=150) => !t ? '' : t.length<=max ? t : t.substring(0,max).trim()+'...';
module.exports = { truncate };
