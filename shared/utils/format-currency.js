const formatCurrency = (amount, currency = 'INR') => {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-IN', { style:'currency', currency, minimumFractionDigits:0, maximumFractionDigits:0 }).format(amount);
};
module.exports = { formatCurrency };
