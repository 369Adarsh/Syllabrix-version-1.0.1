const AGE_GROUPS = {
  JUNIOR_EXPLORER: '5-7',
  EXPLORER: '8-10',
  YOUNG_LEARNER: '11-13',
  STUDENT: '14-15',
  SENIOR_STUDENT: '16-17',
  ADULT: '18+',
};
const AGE_GROUP_LIST = Object.values(AGE_GROUPS);
const AGE_GROUP_LABELS = {
  '5-7': 'Junior Explorer (5-7)', '8-10': 'Explorer (8-10)',
  '11-13': 'Young Learner (11-13)', '14-15': 'Student (14-15)',
  '16-17': 'Senior Student (16-17)', '18+': 'Adult (18+)',
};
const getAgeGroup = (age) => {
  if (age >= 5 && age <= 7) return '5-7';
  if (age >= 8 && age <= 10) return '8-10';
  if (age >= 11 && age <= 13) return '11-13';
  if (age >= 14 && age <= 15) return '14-15';
  if (age >= 16 && age <= 17) return '16-17';
  if (age >= 18) return '18+';
  return null;
};
module.exports = { AGE_GROUPS, AGE_GROUP_LIST, AGE_GROUP_LABELS, getAgeGroup };
