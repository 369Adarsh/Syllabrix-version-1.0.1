const svc = require('./payments.service');
const { sendSuccess } = require('../../utils/api-response');
const { asyncHandler } = require('../../utils/async-handler');

// ═══ PLANS ═══
const getPlans = asyncHandler(async (req, res) => {
  sendSuccess(res, svc.PLANS);
});

// ═══ ORDERS ═══
const createOrder = asyncHandler(async (req, res) => {
  const { plan_key } = req.body;
  if (!plan_key) return res.status(400).json({ success: false, message: 'plan_key is required' });
  const order = await svc.createOrder(req.user.id, plan_key, req.body.metadata);
  sendSuccess(res, order);
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { payment_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!payment_id) return res.status(400).json({ success: false, message: 'payment_id required' });
  const result = await svc.verifyPayment(payment_id, razorpay_payment_id, razorpay_signature);
  sendSuccess(res, result);
});

// ═══ SUBSCRIPTIONS ═══
const startTrial = asyncHandler(async (req, res) => {
  const { plan_key } = req.body;
  if (!plan_key) return res.status(400).json({ success: false, message: 'plan_key is required' });
  const result = await svc.startTrial(req.user.id, plan_key);
  sendSuccess(res, result);
});

const getMySubscriptions = asyncHandler(async (req, res) => {
  const subs = await svc.getUserSubscriptions(req.user.id);
  sendSuccess(res, subs);
});

const checkPlan = asyncHandler(async (req, res) => {
  const { plan_type } = req.query;
  const active = await svc.hasActivePlan(req.user.id, plan_type || 'parent_pro');
  sendSuccess(res, { active });
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const result = await svc.cancelSubscription(req.user.id, req.params.subscriptionId, reason);
  sendSuccess(res, result);
});

const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await svc.getPaymentHistory(req.user.id, parseInt(req.query.limit) || 20);
  sendSuccess(res, payments);
});

// ═══ CERTIFICATES ═══
const generateCertificate = asyncHandler(async (req, res) => {
  const cert = await svc.generateCertificate(req.user.id, req.body);
  sendSuccess(res, cert);
});

const getMyCertificates = asyncHandler(async (req, res) => {
  const certs = await svc.getUserCertificates(req.user.id);
  sendSuccess(res, certs);
});

const verifyCertificate = asyncHandler(async (req, res) => {
  const result = await svc.verifyCertificate(req.params.qrCode);
  if (!result) return res.status(404).json({ success: false, message: 'Certificate not found or invalid' });
  sendSuccess(res, result);
});

// ═══ DOUBT MARKETPLACE ═══
const createDoubtSession = asyncHandler(async (req, res) => {
  const { subject, question, mode } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });
  const session = await svc.createDoubtSession(req.user.id, { subject, question, mode });
  sendSuccess(res, session);
});

const getMyDoubts = asyncHandler(async (req, res) => {
  const role = req.query.role || (req.user.user_type === 'teacher' ? 'teacher' : 'student');
  const sessions = await svc.getDoubtSessions(req.user.id, role);
  sendSuccess(res, sessions);
});

const acceptDoubt = asyncHandler(async (req, res) => {
  const result = await svc.acceptDoubt(req.user.id, req.params.sessionId);
  sendSuccess(res, result);
});

const resolveDoubt = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ success: false, message: 'Answer is required' });
  const result = await svc.resolveDoubt(req.params.sessionId, answer, req.user.id);
  sendSuccess(res, result);
});

module.exports = {
  getPlans, createOrder, verifyPayment,
  startTrial, getMySubscriptions, checkPlan, cancelSubscription, getPaymentHistory,
  generateCertificate, getMyCertificates, verifyCertificate,
  createDoubtSession, getMyDoubts, acceptDoubt, resolveDoubt,
};
