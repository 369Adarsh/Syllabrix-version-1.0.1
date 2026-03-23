const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const opts = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    datetime: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  };
  if (format === 'iso') return d.toISOString();
  return d.toLocaleDateString('en-IN', opts[format] || opts.short);
};
const formatDateForInput = (date) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};
module.exports = { formatDate, formatDateForInput };
