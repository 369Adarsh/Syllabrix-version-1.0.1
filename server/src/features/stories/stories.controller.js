const { getFeedStories, createUserStory, viewStory, removeStory } = require('./stories.service');
const { ApiError } = require('../../utils/api-error');

const getFeed = async (req, res, next) => {
  try {
    const groups = await getFeedStories(req.user.id);
    res.json({ success: true, data: groups });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const story = await createUserStory(req.user.id, req.file, { caption: req.body.caption });
    res.status(201).json({ success: true, data: story });
  } catch (err) { next(err); }
};

const markViewed = async (req, res, next) => {
  try {
    await viewStory(Number(req.params.id), req.user.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await removeStory(Number(req.params.id), req.user.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { getFeed, create, markViewed, remove };
