const { pool } = require('../../database/connection');

exports.getStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM jee_subscriptions WHERE user_id=? AND status='active' ORDER BY expires_at DESC LIMIT 1",
      [req.user.id]
    );
    if (!rows.length) {
      return res.json({ success: true, data: { plan: 'free', is_active: true, features: { mock_tests_per_month: 3, ai_doubts_per_day: 5, chapters_unlocked: 5 } } });
    }
    const sub = rows[0];
    const isExpired = new Date(sub.expires_at) < new Date();
    if (isExpired) {
      await pool.query("UPDATE jee_subscriptions SET status='expired' WHERE id=?", [sub.id]);
      return res.json({ success: true, data: { plan: 'free', is_active: false } });
    }
    res.json({ success: true, data: { ...sub, is_active: true } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { plan } = req.body;
    const prices = { pro: 29900, elite: 49900 }; // in paise
    const price = prices[plan];
    if (!price) return res.status(400).json({ success: false, message: 'Invalid plan' });
    // TODO: integrate Razorpay when payment gateway is ready
    // For now return a checkout session placeholder
    res.json({ success: true, data: {
      order_id: `order_jee_${Date.now()}`,
      amount: price,
      currency: 'INR',
      plan,
      message: 'Razorpay integration pending. Contact support to activate.'
    }});
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const { plan, razorpay_order_id, razorpay_payment_id } = req.body;
    // TODO: verify Razorpay signature here
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    await pool.query(
      "INSERT INTO jee_subscriptions (user_id, plan, razorpay_order_id, razorpay_payment_id, started_at, expires_at, status) VALUES (?,?,?,?,NOW(),?,'active')",
      [req.user.id, plan, razorpay_order_id, razorpay_payment_id, expiresAt]
    );
    res.json({ success: true, data: { plan, expires_at: expiresAt } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
