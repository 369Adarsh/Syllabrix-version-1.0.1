const USER_TYPES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  INSTITUTE: 'institute',
  PARENT: 'parent',
  MENTOR: 'mentor',
};
const USER_TYPE_LIST = Object.values(USER_TYPES);
const USER_TYPE_LABELS = {
  student: 'Student', teacher: 'Teacher', institute: 'Institute',
  parent: 'Parent / Guardian', mentor: 'Mentor',
};
module.exports = { USER_TYPES, USER_TYPE_LIST, USER_TYPE_LABELS };
