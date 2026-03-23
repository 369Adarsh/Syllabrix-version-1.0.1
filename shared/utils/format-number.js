const formatNumber = (num) => {
  if (num == null) return '0';
  if (num >= 1e6) return (num/1e6).toFixed(1).replace(/\.0$/,'') + 'M';
  if (num >= 1e3) return (num/1e3).toFixed(1).replace(/\.0$/,'') + 'K';
  return num.toString();
};
module.exports = { formatNumber };
