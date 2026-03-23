const groupsService = require('./groups.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const create = asyncHandler(async (req, res) => {
  const group = await groupsService.create(req.user.id, req.body);
  sendCreated(res, group, 'Group created!');
});

const getById = asyncHandler(async (req, res) => {
  const group = await groupsService.getById(parseInt(req.params.groupId), req.user.id);
  sendSuccess(res, group);
});

const getUserGroups = asyncHandler(async (req, res) => {
  const groups = await groupsService.getUserGroups(req.user.id);
  sendSuccess(res, groups);
});

const update = asyncHandler(async (req, res) => {
  const group = await groupsService.update(parseInt(req.params.groupId), req.user.id, req.body);
  sendSuccess(res, group, 'Group updated!');
});

const remove = asyncHandler(async (req, res) => {
  await groupsService.remove(parseInt(req.params.groupId), req.user.id);
  sendSuccess(res, null, 'Group deleted.');
});

const addMember = asyncHandler(async (req, res) => {
  await groupsService.addMember(parseInt(req.params.groupId), req.user.id, req.body.user_id);
  sendSuccess(res, null, 'Member added!');
});

const removeMember = asyncHandler(async (req, res) => {
  await groupsService.removeMember(parseInt(req.params.groupId), req.user.id, parseInt(req.params.userId));
  sendSuccess(res, null, 'Member removed.');
});

const changeMemberRole = asyncHandler(async (req, res) => {
  await groupsService.changeMemberRole(
    parseInt(req.params.groupId), req.user.id,
    parseInt(req.params.userId), req.body.role
  );
  sendSuccess(res, null, 'Role updated.');
});

const leaveGroup = asyncHandler(async (req, res) => {
  await groupsService.leaveGroup(parseInt(req.params.groupId), req.user.id);
  sendSuccess(res, null, 'Left group.');
});

const getMembers = asyncHandler(async (req, res) => {
  const members = await groupsService.getMembers(parseInt(req.params.groupId), req.query);
  sendSuccess(res, members);
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await groupsService.sendMessage(
    parseInt(req.params.groupId), req.user.id, req.user.ageGroup,
    req.body.content, req.body.media_url, req.body.media_type
  );
  sendCreated(res, message, 'Message sent!');
});

const getMessages = asyncHandler(async (req, res) => {
  const result = await groupsService.getMessages(parseInt(req.params.groupId), req.user.id, req.query);
  res.json({ success: true, data: result.messages, pagination: result.pagination });
});

module.exports = {
  create, getById, getUserGroups, update, remove,
  addMember, removeMember, changeMemberRole, leaveGroup, getMembers,
  sendMessage, getMessages,
};
