const { getAgeGroup } = require('../constants/age-groups');
const { calculateAge } = require('./calculate-age');
const calculateAgeGroup = (dob) => {
  const age = calculateAge(dob);
  return (age === null || age < 5) ? null : getAgeGroup(age);
};
module.exports = { calculateAgeGroup };
