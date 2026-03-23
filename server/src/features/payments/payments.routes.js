const express = require('express');
const router = express.Router();
const ctrl = require('./payments.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Plans (public)
router.get('/plans', ctrl.getPlans);

// Orders & Payments
router.post('/orders', authenticate, ctrl.createOrder);
router.post('/verify', authenticate, ctrl.verifyPayment);
router.get('/history', authenticate, ctrl.getPaymentHistory);

// Subscriptions
router.post('/subscriptions/trial', authenticate, ctrl.startTrial);
router.get('/subscriptions', authenticate, ctrl.getMySubscriptions);
router.get('/subscriptions/check', authenticate, ctrl.checkPlan);
router.post('/subscriptions/:subscriptionId/cancel', authenticate, ctrl.cancelSubscription);

// Certificates
router.post('/certificates', authenticate, ctrl.generateCertificate);
router.get('/certificates', authenticate, ctrl.getMyCertificates);
router.get('/certificates/verify/:qrCode', ctrl.verifyCertificate); // public!

// Doubt Marketplace
router.post('/doubts', authenticate, ctrl.createDoubtSession);
router.get('/doubts', authenticate, ctrl.getMyDoubts);
router.post('/doubts/:sessionId/accept', authenticate, ctrl.acceptDoubt);
router.post('/doubts/:sessionId/resolve', authenticate, ctrl.resolveDoubt);

module.exports = router;
