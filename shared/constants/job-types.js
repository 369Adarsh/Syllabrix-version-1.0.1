const JOB_TYPES = {
  FULL_TIME: 'full_time', PART_TIME: 'part_time', FREELANCE: 'freelance',
  CONTRACT: 'contract', INTERNSHIP: 'internship', VOLUNTEER: 'volunteer',
};
const JOB_TYPE_LIST = Object.values(JOB_TYPES);
const JOB_TYPE_LABELS = {
  full_time: 'Full Time', part_time: 'Part Time', freelance: 'Freelance',
  contract: 'Contract', internship: 'Internship', volunteer: 'Volunteer',
};
const SALARY_PERIODS = {
  MONTHLY: 'monthly', YEARLY: 'yearly', HOURLY: 'hourly', ONE_TIME: 'one_time',
};
const SALARY_PERIOD_LIST = Object.values(SALARY_PERIODS);
module.exports = { JOB_TYPES, JOB_TYPE_LIST, JOB_TYPE_LABELS, SALARY_PERIODS, SALARY_PERIOD_LIST };
