const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = (p) => /^[6-9]\d{9}$/.test(p);
const isValidUsername = (u) => u && u.length>=3 && u.length<=30 && /^[a-zA-Z0-9_]+$/.test(u);
const isValidPassword = (p) => p && p.length>=8 && p.length<=128;
module.exports = { isValidEmail, isValidPhone, isValidUsername, isValidPassword };
