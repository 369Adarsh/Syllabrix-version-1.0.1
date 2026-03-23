const { ApiError } = require('../../utils/api-error');
const queries = require('./groups.queries');
const { emitToGroup } = require('../../socket/index');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const create = async (userId, data) => {
  const groupId = await queries.createGroup({
    name: data.name,
    description: data.description,
    group_type: data.group_type,
    photo_url: data.photo_url,
    creator_id: userId,
  });
  // Add creator as admin
  await queries.addMember(groupId, userId, 'admin');
  return queries.getGroupById(groupId);
};

const getById = async (groupId, userId) => {
  const group = await queries.getGroupById(groupId);
  if (!group) throw ApiError.notFound('Group not found.');
  const myRole = await queries.getMemberRole(groupId, userId);
  return { ...group, my_role: myRole };
};

const getUserGroups = async (userId) => {
  return queries.getUserGroups(userId);
};

const update = async (groupId, userId, data) => {
  const role = await queries.getMemberRole(groupId, userId);
  if (role !== 'admin') throw ApiError.forbidden('Only admins can update the group.');
  await queries.updateGroup(groupId, data);
  return queries.getGroupById(groupId);
};

const remove = async (groupId, userId) => {
  const group = await queries.getGroupById(groupId);
  if (!group) throw ApiError.notFound('Group not found.');
  if (group.creator_id !== userId) throw ApiError.forbidden('Only the creator can delete the group.');
  await queries.deleteGroup(groupId);
};

const addMember = async (groupId, userId, targetUserId) => {
  const role = await queries.getMemberRole(groupId, userId);
  if (!role || role === 'member') throw ApiError.forbidden('Only admins/moderators can add members.');

  const existing = await queries.getMemberRole(groupId, targetUserId);
  if (existing) throw ApiError.conflict('User is already a member.');

  const group = await queries.getGroupById(groupId);
  if (group.member_count >= group.max_members) {
    throw ApiError.badRequest('Group has reached maximum members.');
  }

  await queries.addMember(groupId, targetUserId, 'member');
};

const removeMember = async (groupId, userId, targetUserId) => {
  const role = await queries.getMemberRole(groupId, userId);
  if (!role || role === 'member') throw ApiError.forbidden('Only admins/moderators can remove members.');
  if (userId === targetUserId) throw ApiError.badRequest('Use leave endpoint to leave the group.');
  await queries.removeMember(groupId, targetUserId);
};

const changeMemberRole = async (groupId, userId, targetUserId, newRole) => {
  const role = await queries.getMemberRole(groupId, userId);
  if (role !== 'admin') throw ApiError.forbidden('Only admins can change roles.');
  await queries.updateMemberRole(groupId, targetUserId, newRole);
};

const leaveGroup = async (groupId, userId) => {
  const group = await queries.getGroupById(groupId);
  if (!group) throw ApiError.notFound('Group not found.');
  if (group.creator_id === userId) throw ApiError.badRequest('Creator cannot leave. Transfer ownership or delete the group.');
  await queries.removeMember(groupId, userId);
};

const getMembers = async (groupId, query) => {
  const { page, limit, offset } = getPagination(query);
  return queries.getGroupMembers(groupId, limit, offset);
};

const sendMessage = async (groupId, userId, userAgeGroup, content, mediaUrl, mediaType) => {
  const role = await queries.getMemberRole(groupId, userId);
  if (!role) throw ApiError.forbidden('You must be a member to send messages.');

  const messageId = await queries.sendGroupMessage(groupId, userId, content, mediaUrl, mediaType);
  const message = await queries.getGroupMessageById(messageId);

  // Update group's updated_at
  await queries.updateGroup(groupId, {});

  // Emit via socket
  try { emitToGroup(groupId, 'group:message:receive', message); } catch (e) {}

  return message;
};

const getMessages = async (groupId, userId, query) => {
  const role = await queries.getMemberRole(groupId, userId);
  if (!role) throw ApiError.forbidden('You must be a member to view messages.');

  const { page, limit, offset } = getPagination(query);
  const messages = await queries.getGroupMessages(groupId, limit, offset);
  const total = await queries.getGroupMessagesCount(groupId);
  return { messages, pagination: getPaginationMeta(total, page, limit) };
};

module.exports = {
  create, getById, getUserGroups, update, remove,
  addMember, removeMember, changeMemberRole, leaveGroup, getMembers,
  sendMessage, getMessages,
};
