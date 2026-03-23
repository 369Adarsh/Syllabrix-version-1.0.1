const sanitizeInput = (i) => typeof i !== 'string' ? i : i.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
const stripHtml = (i) => typeof i !== 'string' ? i : i.replace(/<[^>]*>/g, '');
module.exports = { sanitizeInput, stripHtml };
