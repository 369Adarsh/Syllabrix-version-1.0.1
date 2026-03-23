const { AGE_GROUPS } = require('./age-groups');
const AGE_PERMISSIONS = {
  '5-7': {
    requiresGuardian: true, loginType: 'guardian_only',
    canCreatePosts: false, canViewPosts: true, canComment: false, canLike: true,
    canSendDM: false, canJoinGroups: false, canUseExperienceLab: true,
    experienceLabLevel: 'basic', canSeekMentor: false, canApplyJobs: false,
    hasPublicProfile: false, canFollow: false, canSearch: true, canReport: false,
  },
  '8-10': {
    requiresGuardian: true, loginType: 'guardian_managed',
    canCreatePosts: false, canViewPosts: true, canComment: false, canLike: true,
    canSendDM: false, canJoinGroups: true, canUseExperienceLab: true,
    experienceLabLevel: 'expanded', canSeekMentor: false, canApplyJobs: false,
    hasPublicProfile: false, canFollow: true, canSearch: true, canReport: false,
  },
  '11-13': {
    requiresGuardian: true, loginType: 'guardian_supervised',
    canCreatePosts: true, postsRequireReview: true, canViewPosts: true,
    canComment: true, canLike: true, canSendDM: false, canJoinGroups: true,
    canSendGroupMessage: true, canUseExperienceLab: true, experienceLabLevel: 'full',
    canSeekMentor: false, canApplyJobs: false, hasPublicProfile: true,
    profileRequiresApproval: true, canFollow: true, canSearch: true, canReport: true,
  },
  '14-15': {
    requiresGuardian: false, requiresParentalConsent: true, loginType: 'self',
    canCreatePosts: true, canViewPosts: true, canComment: true, canLike: true,
    canSendDM: true, dmRestriction: 'age_peers_only', canJoinGroups: true,
    canSendGroupMessage: true, canUseExperienceLab: true, experienceLabLevel: 'advanced',
    canSeekMentor: true, canApplyJobs: false, canViewJobs: true,
    hasPublicProfile: true, canFollow: true, canSearch: true, canReport: true,
  },
  '16-17': {
    requiresGuardian: false, loginType: 'self',
    canCreatePosts: true, canViewPosts: true, canComment: true, canLike: true,
    canSendDM: true, dmRestriction: 'verified_users', canJoinGroups: true,
    canSendGroupMessage: true, canUseExperienceLab: true, experienceLabLevel: 'advanced',
    canSeekMentor: true, canApplyJobs: true, canApplyInternships: true,
    canViewJobs: true, hasPublicProfile: true, canFollow: true, canSearch: true, canReport: true,
  },
  '18+': {
    requiresGuardian: false, loginType: 'self',
    canCreatePosts: true, canViewPosts: true, canComment: true, canLike: true,
    canSendDM: true, dmRestriction: 'none', canJoinGroups: true,
    canSendGroupMessage: true, canUseExperienceLab: true, experienceLabLevel: 'full',
    canSeekMentor: true, canBeMentor: true, canApplyJobs: true, canPostJobs: true,
    canViewJobs: true, hasPublicProfile: true, requiresBackgroundCheck: true,
    minorInteractionsLogged: true, canFollow: true, canSearch: true, canReport: true,
  },
};
const hasPermission = (ageGroup, permission) => {
  const perms = AGE_PERMISSIONS[ageGroup];
  if (!perms) return false;
  return perms[permission] === true;
};
module.exports = { AGE_PERMISSIONS, hasPermission };
