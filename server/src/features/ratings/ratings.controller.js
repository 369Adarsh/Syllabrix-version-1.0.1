const svc = require('./ratings.service');
const { sendSuccess, sendCreated } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

const rate = asyncHandler(async (req, res) => {
  sendCreated(res, await svc.rate(req.user.id, parseInt(req.params.teacherId), req.body.rating, req.body.review, req.body.class_id));
});
const getTeacherRatings = asyncHandler(async (req, res) => {
  const result = await svc.getTeacherRatings(parseInt(req.params.teacherId), req.query);
  res.json({ success: true, data: result.ratings, average: result.average, pagination: result.pagination });
});

module.exports = { rate, getTeacherRatings };
