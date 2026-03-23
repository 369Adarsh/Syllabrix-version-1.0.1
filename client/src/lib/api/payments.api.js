import api from '../api-client';

export const paymentsAPI = {
  // Plans
  getPlans: () => api.get('/payments/plans'),

  // Orders
  createOrder: (planKey, metadata) => api.post('/payments/orders', { plan_key: planKey, metadata }),
  verifyPayment: (paymentId, razorpayPaymentId, razorpaySignature) =>
    api.post('/payments/verify', { payment_id: paymentId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature }),
  getPaymentHistory: (limit) => api.get('/payments/history', { params: { limit } }),

  // Subscriptions
  startTrial: (planKey) => api.post('/payments/subscriptions/trial', { plan_key: planKey }),
  getMySubscriptions: () => api.get('/payments/subscriptions'),
  checkPlan: (planType) => api.get('/payments/subscriptions/check', { params: { plan_type: planType } }),
  cancelSubscription: (subscriptionId, reason) => api.post(`/payments/subscriptions/${subscriptionId}/cancel`, { reason }),

  // Certificates
  generateCertificate: (data) => api.post('/payments/certificates', data),
  getMyCertificates: () => api.get('/payments/certificates'),
  verifyCertificate: (qrCode) => api.get(`/payments/certificates/verify/${qrCode}`),

  // Doubt Marketplace
  createDoubtSession: (data) => api.post('/payments/doubts', data),
  getMyDoubts: (role) => api.get('/payments/doubts', { params: { role } }),
  acceptDoubt: (sessionId) => api.post(`/payments/doubts/${sessionId}/accept`),
  resolveDoubt: (sessionId, answer) => api.post(`/payments/doubts/${sessionId}/resolve`, { answer }),
};
