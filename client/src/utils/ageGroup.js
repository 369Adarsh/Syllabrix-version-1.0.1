/**
 * Syllabrix Age Group Utilities
 * Used for sidebar visibility rules and age-gated features.
 */

export function getAgeFromDOB(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

/**
 * Returns which sidebar nav items to hide for a given age group.
 * age_group comes directly from user.age_group (set at registration).
 */
export function getStudentNavRestrictions(ageGroup) {
  const g = ageGroup || '18+';
  return {
    hideMessages:     ['5-7', '8-10', '11-13'].includes(g),
    hideGroups:       ['5-7'].includes(g),
    hideExplore:      ['5-7'].includes(g),
    hideMockInterview:['5-7', '8-10', '11-13'].includes(g),
    hideDebateArena:  ['5-7', '8-10'].includes(g),
    hideCodeLab:      ['5-7', '8-10'].includes(g),
    showMentorship:   ['16-17', '18+'].includes(g),
  };
}
