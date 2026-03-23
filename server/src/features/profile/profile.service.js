const { ApiError } = require('../../utils/api-error');
const queries = require('./profile.queries');

const getProfile = async (userId, viewerId) => {
  const user = await queries.getPublicProfile(userId, viewerId);
  if (!user) throw ApiError.notFound('User not found.');

  // Get type-specific profile
  let typeProfile = null;
  switch (user.user_type) {
    case 'student': typeProfile = await queries.getStudentProfile(userId); break;
    case 'teacher': typeProfile = await queries.getTeacherProfile(userId); break;
    case 'institute': typeProfile = await queries.getInstituteProfile(userId); break;
    case 'parent': typeProfile = await queries.getParentProfile(userId); break;
  }

  return {
    ...user,
    is_following: user.is_following > 0,
    profile: typeProfile,
  };
};

const getProfileByUsername = async (username, viewerId) => {
  const user = await queries.getProfileByUsername(username, viewerId);
  if (!user) throw ApiError.notFound('User not found.');

  let typeProfile = null;
  switch (user.user_type) {
    case 'student': typeProfile = await queries.getStudentProfile(user.id); break;
    case 'teacher': typeProfile = await queries.getTeacherProfile(user.id); break;
    case 'institute': typeProfile = await queries.getInstituteProfile(user.id); break;
    case 'parent': typeProfile = await queries.getParentProfile(user.id); break;
  }

  return {
    ...user,
    is_following: user.is_following > 0,
    profile: typeProfile,
  };
};

const updateProfile = async (userId, userType, userData, profileData) => {
  // Update common user fields (bio, phone, city, state, gender)
  if (userData && Object.keys(userData).length > 0) {
    await queries.updateUserFields(userId, userData);
  }

  // Update type-specific profile
  if (profileData && Object.keys(profileData).length > 0) {
    switch (userType) {
      case 'student': await queries.updateStudentProfile(userId, profileData); break;
      case 'teacher': await queries.updateTeacherProfile(userId, profileData); break;
      case 'institute': await queries.updateInstituteProfile(userId, profileData); break;
      case 'parent': await queries.updateParentProfile(userId, profileData); break;
    }
  }

  return getProfile(userId, userId);
};

const getSuggestions = async (userId, limit = 10) => {
  return queries.getSuggestedUsers(userId, limit);
};

module.exports = { getProfile, getProfileByUsername, updateProfile, getSuggestions };
