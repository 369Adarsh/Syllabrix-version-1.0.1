const { pool } = require('../../database/connection');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════
//  PLAN DEFINITIONS
// ═══════════════════════════════════════════════════════════
const PLANS = {
  parent_pro_monthly: {
    plan_type: 'parent_pro', name: 'Parent Pro Monthly', amount: 19900, // paise
    display_amount: 199, billing_cycle: 'monthly', trial_days: 7,
    features: ['Real-time activity monitoring', 'Detailed learning reports', 'Screen time insights', 'Direct teacher messaging', 'Goal setting & tracking', 'Priority support'],
  },
  parent_pro_yearly: {
    plan_type: 'parent_pro', name: 'Parent Pro Yearly', amount: 149900,
    display_amount: 1499, billing_cycle: 'yearly', trial_days: 7,
    features: ['Everything in Monthly', '37% savings', 'Family account (up to 3 children)', 'Quarterly progress reports', 'Career counselor access'],
  },
  certificate_single: {
    plan_type: 'certificate_unlimited', name: 'Single Certificate', amount: 14900,
    display_amount: 149, billing_cycle: 'one_time',
    features: ['QR-verified PDF certificate', 'Shareable link', 'Syllabrix verified badge'],
  },
  certificate_unlimited: {
    plan_type: 'certificate_unlimited', name: 'Unlimited Certificates', amount: 39900,
    display_amount: 399, billing_cycle: 'yearly',
    features: ['Unlimited certificate downloads', 'Skills Passport PDF', 'QR verification for all', 'Auto-generated from achievements'],
  },
  premium_student: {
    plan_type: 'premium_student', name: 'Premium Student', amount: 9900,
    display_amount: 99, billing_cycle: 'monthly',
    features: ['Unlimited AI Buddy chats', 'Priority AI responses', 'Advanced mind maps', 'Mock interview access', 'Ad-free experience'],
  },
};

// ═══════════════════════════════════════════════════════════
//  RAZORPAY INTEGRATION
// ═══════════════════════════════════════════════════════════

/**
 * Create a Razorpay order
 * In production, this calls Razorpay API. For now, creates local order.
 */
const createOrder = async (userId, planKey, metadata = {}) => {
  const plan = PLANS[planKey];
  if (!plan) throw new Error(`Invalid plan: ${planKey}`);

  const orderId = `order_${crypto.randomBytes(12).toString('hex')}`;

  // Create payment record
  const [result] = await pool.query(
    `INSERT INTO payments (user_id, payment_type, amount_inr, status, razorpay_order_id, description, metadata)
     VALUES (?, 'subscription', ?, 'created', ?, ?, ?)`,
    [userId, plan.display_amount, orderId, `${plan.name} subscription`, JSON.stringify({ plan_key: planKey, ...metadata })]
  );

  return {
    order_id: orderId,
    payment_id: result.insertId,
    amount: plan.amount, // in paise for Razorpay
    amount_display: plan.display_amount,
    currency: 'INR',
    plan: plan,
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    // In production: Razorpay creates the order via API
    // const order = await razorpay.orders.create({ amount, currency, receipt })
  };
};

/**
 * Verify payment and activate subscription
 */
const verifyPayment = async (paymentId, razorpayPaymentId, razorpaySignature) => {
  // Get payment record
  const [payments] = await pool.query(`SELECT * FROM payments WHERE id = ?`, [paymentId]);
  if (payments.length === 0) throw new Error('Payment not found');

  const payment = payments[0];
  const metadata = typeof payment.metadata === 'string' ? JSON.parse(payment.metadata) : (payment.metadata || {});
  const planKey = metadata.plan_key;
  const plan = PLANS[planKey];

  // In production: verify Razorpay signature
  // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  //   .update(`${payment.razorpay_order_id}|${razorpayPaymentId}`)
  //   .digest('hex');
  // if (expectedSignature !== razorpaySignature) throw new Error('Invalid signature');

  // Update payment status
  await pool.query(
    `UPDATE payments SET status = 'captured', razorpay_payment_id = ?, razorpay_signature = ?, paid_at = NOW() WHERE id = ?`,
    [razorpayPaymentId || `pay_${crypto.randomBytes(8).toString('hex')}`, razorpaySignature || 'verified', paymentId]
  );

  // Create/activate subscription
  if (plan) {
    const periodEnd = new Date();
    if (plan.billing_cycle === 'monthly') periodEnd.setMonth(periodEnd.getMonth() + 1);
    else if (plan.billing_cycle === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else if (plan.billing_cycle === 'quarterly') periodEnd.setMonth(periodEnd.getMonth() + 3);

    const trialEnd = plan.trial_days ? new Date(Date.now() + plan.trial_days * 86400000) : null;

    // Check existing subscription
    const [existing] = await pool.query(
      `SELECT id FROM subscriptions WHERE user_id = ? AND plan_type = ? AND status IN ('active','trial')`,
      [payment.user_id, plan.plan_type]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE subscriptions SET status = 'active', current_period_end = ?, updated_at = NOW() WHERE id = ?`,
        [periodEnd, existing[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO subscriptions (user_id, plan_type, plan_name, amount_inr, billing_cycle, status, trial_ends_at, current_period_start, current_period_end)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [payment.user_id, plan.plan_type, plan.name, plan.display_amount, plan.billing_cycle,
         trialEnd ? 'trial' : 'active', trialEnd, periodEnd]
      );
    }
  }

  return { success: true, plan_key: planKey };
};

/**
 * Start free trial
 */
const startTrial = async (userId, planKey) => {
  const plan = PLANS[planKey];
  if (!plan || !plan.trial_days) throw new Error('No trial available for this plan');

  const [existing] = await pool.query(
    `SELECT id FROM subscriptions WHERE user_id = ? AND plan_type = ?`,
    [userId, plan.plan_type]
  );
  if (existing.length > 0) throw new Error('You already have this subscription');

  const trialEnd = new Date(Date.now() + plan.trial_days * 86400000);

  const [result] = await pool.query(
    `INSERT INTO subscriptions (user_id, plan_type, plan_name, amount_inr, billing_cycle, status, trial_ends_at, current_period_start, current_period_end)
     VALUES (?, ?, ?, ?, ?, 'trial', ?, NOW(), ?)`,
    [userId, plan.plan_type, plan.name, plan.display_amount, plan.billing_cycle, trialEnd, trialEnd]
  );

  return { subscription_id: result.insertId, trial_ends_at: trialEnd, plan: plan.name };
};

/**
 * Get user's active subscriptions
 */
const getUserSubscriptions = async (userId) => {
  const [subs] = await pool.query(
    `SELECT * FROM subscriptions WHERE user_id = ? AND status IN ('active','trial') ORDER BY created_at DESC`,
    [userId]
  );
  return subs;
};

/**
 * Check if user has a specific plan
 */
const hasActivePlan = async (userId, planType) => {
  const [subs] = await pool.query(
    `SELECT id FROM subscriptions WHERE user_id = ? AND plan_type = ? AND status IN ('active','trial') AND current_period_end > NOW() LIMIT 1`,
    [userId, planType]
  );
  return subs.length > 0;
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (userId, subscriptionId, reason) => {
  const [sub] = await pool.query(
    `SELECT * FROM subscriptions WHERE id = ? AND user_id = ?`,
    [subscriptionId, userId]
  );
  if (sub.length === 0) throw new Error('Subscription not found');

  await pool.query(
    `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = ? WHERE id = ?`,
    [reason || null, subscriptionId]
  );

  return { cancelled: true };
};

/**
 * Get payment history
 */
const getPaymentHistory = async (userId, limit = 20) => {
  const [payments] = await pool.query(
    `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  return payments;
};

// ═══════════════════════════════════════════════════════════
//  CERTIFICATE SERVICE
// ═══════════════════════════════════════════════════════════

/**
 * Generate a certificate for a user
 */
const generateCertificate = async (userId, data) => {
  const { certificate_type, title, description, issued_for, skills, score, grade } = data;

  const qrCode = `SYLL-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  const verificationUrl = `https://syllabrix.com/verify/${qrCode}`;

  const [result] = await pool.query(
    `INSERT INTO certificates (user_id, certificate_type, title, description, issued_for, skills, score, grade, qr_code, verification_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, certificate_type, title, description || null, issued_for || null,
     skills ? JSON.stringify(skills) : null, score || null, grade || null, qrCode, verificationUrl]
  );

  return {
    id: result.insertId,
    qr_code: qrCode,
    verification_url: verificationUrl,
    title,
    certificate_type,
  };
};

/**
 * Get user's certificates
 */
const getUserCertificates = async (userId) => {
  const [certs] = await pool.query(
    `SELECT * FROM certificates WHERE user_id = ? AND is_published = 1 ORDER BY issued_at DESC`,
    [userId]
  );
  return certs.map(c => ({
    ...c,
    skills: typeof c.skills === 'string' ? JSON.parse(c.skills) : c.skills,
  }));
};

/**
 * Verify a certificate by QR code
 */
const verifyCertificate = async (qrCode) => {
  const [certs] = await pool.query(
    `SELECT c.*, u.username, u.profile_photo_url FROM certificates c JOIN users u ON c.user_id = u.id WHERE c.qr_code = ? AND c.is_published = 1`,
    [qrCode]
  );
  if (certs.length === 0) return null;

  // Increment verified count
  await pool.query(`UPDATE certificates SET verified_count = verified_count + 1 WHERE qr_code = ?`, [qrCode]);

  const cert = certs[0];
  return {
    ...cert,
    skills: typeof cert.skills === 'string' ? JSON.parse(cert.skills) : cert.skills,
    is_valid: true,
  };
};

// ═══════════════════════════════════════════════════════════
//  DOUBT MARKETPLACE
// ═══════════════════════════════════════════════════════════

/**
 * Create a doubt session (free AI or paid teacher)
 */
const createDoubtSession = async (studentId, data) => {
  const { subject, question, mode } = data;
  const amount = mode === 'ai' ? 0 : 20; // ₹20 for teacher sessions

  const [result] = await pool.query(
    `INSERT INTO doubt_sessions (student_id, subject, question, mode, amount_inr, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [studentId, subject, question, mode || 'ai', amount, mode === 'ai' ? 'in_progress' : 'pending']
  );

  return { id: result.insertId, mode, amount };
};

/**
 * Get doubt sessions for a user
 */
const getDoubtSessions = async (userId, role = 'student') => {
  const field = role === 'teacher' ? 'teacher_id' : 'student_id';
  const [sessions] = await pool.query(
    `SELECT ds.*, u.username as student_name, t.username as teacher_name
     FROM doubt_sessions ds
     LEFT JOIN users u ON ds.student_id = u.id
     LEFT JOIN users t ON ds.teacher_id = t.id
     WHERE ds.${field} = ?
     ORDER BY ds.created_at DESC LIMIT 20`,
    [userId]
  );
  return sessions;
};

/**
 * Teacher picks up a doubt
 */
const acceptDoubt = async (teacherId, sessionId) => {
  await pool.query(
    `UPDATE doubt_sessions SET teacher_id = ?, status = 'in_progress', started_at = NOW() WHERE id = ? AND status = 'pending'`,
    [teacherId, sessionId]
  );
  return { accepted: true };
};

/**
 * Resolve a doubt
 */
const resolveDoubt = async (sessionId, answer, userId) => {
  await pool.query(
    `UPDATE doubt_sessions SET teacher_answer = ?, status = 'resolved', resolved_at = NOW() WHERE id = ?`,
    [answer, sessionId]
  );
  return { resolved: true };
};

module.exports = {
  PLANS,
  createOrder, verifyPayment, startTrial,
  getUserSubscriptions, hasActivePlan, cancelSubscription, getPaymentHistory,
  generateCertificate, getUserCertificates, verifyCertificate,
  createDoubtSession, getDoubtSessions, acceptDoubt, resolveDoubt,
};
