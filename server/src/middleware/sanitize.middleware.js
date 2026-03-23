// Input sanitization middleware
// Strips HTML tags and dangerous characters from request body

const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (value) => {
      if (typeof value !== 'string') return value;
      return value
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    };

    const sanitizeObject = (obj) => {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          result[key] = sanitize(value);
        } else if (Array.isArray(value)) {
          result[key] = value.map((v) => (typeof v === 'string' ? sanitize(v) : v));
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    req.body = sanitizeObject(req.body);
  }
  next();
};

module.exports = { sanitizeBody };
