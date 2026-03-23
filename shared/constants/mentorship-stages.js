const MENTORSHIP_STAGES = {
  EXPLORER: 'explorer', ENTHUSIAST: 'enthusiast', DEDICATED: 'dedicated',
  MENTEE: 'mentee', CHAMPION: 'champion',
};
const MENTORSHIP_STAGE_LIST = Object.values(MENTORSHIP_STAGES);
const MENTORSHIP_STAGE_REQUIREMENTS = {
  explorer: { activitiesRequired: 5 },
  enthusiast: { activitiesRequired: 15, postsRequired: 2, streakDaysRequired: 7 },
  dedicated: { activitiesRequired: 30, projectsShared: 1, endorsementsRequired: 3 },
  mentee: { applicationRequired: true, mentorAcceptance: true },
  champion: { mentorshipCompleted: true, capstonePresented: true },
};
module.exports = { MENTORSHIP_STAGES, MENTORSHIP_STAGE_LIST, MENTORSHIP_STAGE_REQUIREMENTS };
