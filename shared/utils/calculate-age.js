const calculateAge = (dob) => {
  if (!dob) return null;
  const d = new Date(dob), today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};
module.exports = { calculateAge };
