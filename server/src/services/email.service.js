// ============================================================
// Email Service — Resend-powered transactional emails
// ============================================================

const { Resend } = require('resend');
const { EMAIL, CLIENT_URL } = require('../config/env');

if (!EMAIL.RESEND_API_KEY) {
  console.error('[EMAIL] FATAL: RESEND_API_KEY is not set. Emails will not be sent.');
}
const resend = new Resend(EMAIL.RESEND_API_KEY);

// ======================== TEMPLATES ========================

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Syllabrix</title>
</head>
<body style="margin:0;padding:0;background-color:#F0F2F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F2F5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%);padding:32px 40px;text-align:center;">
              <img src="https://res.cloudinary.com/dfh2u8afi/image/upload/syllabrix-logo-white.png"
                   alt="Syllabrix" height="36"
                   style="height:36px;object-fit:contain;" />
              <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:8px 0 0;letter-spacing:0.05em;">
                India's Complete Education Ecosystem
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8F9FA;padding:20px 40px;text-align:center;border-top:1px solid #E5E7EB;">
              <p style="color:#9CA3AF;font-size:11px;margin:0;line-height:1.6;">
                &copy; 2026 SyllabriX Network. All rights reserved.<br />
                Made with ❤️ for Indian students
              </p>
              <p style="color:#9CA3AF;font-size:11px;margin:8px 0 0;">
                If you didn't create a Syllabrix account, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ======================== SEND VERIFICATION EMAIL ========================

const sendVerificationEmail = async ({ to, username, verificationUrl }) => {
  const content = `
    <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;">
      Verify your email address
    </h2>
    <p style="color:#6B7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
      Hi <strong style="color:#111827;">${username}</strong>, welcome to Syllabrix! 🎉<br />
      Click the button below to verify your email and activate your account.
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${verificationUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#4f46e5);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;letter-spacing:0.01em;">
        Verify My Email
      </a>
    </div>

    <p style="color:#9CA3AF;font-size:12px;margin:20px 0 0;text-align:center;">
      This link expires in <strong>24 hours</strong>.<br />
      Or copy and paste this URL into your browser:
    </p>
    <p style="color:#6366F1;font-size:11px;word-break:break-all;text-align:center;margin:6px 0 0;">
      ${verificationUrl}
    </p>
  `;

  console.log('[EMAIL] Attempting to send verification email to:', to);
  const { data, error } = await resend.emails.send({
    from: `Syllabrix <${EMAIL.FROM}>`,
    to,
    subject: 'Verify your Syllabrix email address',
    html: baseTemplate(content),
  });
  console.log('[EMAIL] Resend response:', data, error);
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data;
};

// ======================== SEND WELCOME EMAIL (after verification) ========================

const sendWelcomeEmail = async ({ to, username, userType }) => {
  const typeLabel = {
    student: 'Student',
    teacher: 'Teacher',
    institute: 'Institute',
    professional_learner: 'Professional Learner',
    parent: 'Parent',
    mentor: 'Mentor',
  }[userType] || 'Member';

  const dashboardUrl = `${CLIENT_URL}/home`;

  const content = `
    <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;">
      Welcome to Syllabrix, ${username}! 🚀
    </h2>
    <p style="color:#6B7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
      Your email is verified and your <strong style="color:#111827;">${typeLabel}</strong> account is ready.<br />
      Complete your profile to unlock the full Syllabrix experience.
    </p>

    <div style="background:#F0F2F5;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="color:#374151;font-size:13px;font-weight:700;margin:0 0 12px;">What's waiting for you:</p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${[
          ['🧠', 'AI-powered learning & mind maps'],
          ['🎮', '15+ educational games & arcade'],
          ['🚀', '574+ profession simulations'],
          ['📜', 'QR-verified skill certificates'],
        ].map(([emoji, text]) => `
          <p style="margin:0;font-size:13px;color:#4B5563;display:flex;align-items:center;gap:8px;">
            <span>${emoji}</span> ${text}
          </p>
        `).join('')}
      </div>
    </div>

    <div style="text-align:center;">
      <a href="${dashboardUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#4f46e5);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;">
        Go to My Dashboard
      </a>
    </div>
  `;

  console.log('[EMAIL] Attempting to send welcome email to:', to);
  const { data, error } = await resend.emails.send({
    from: `Syllabrix <${EMAIL.FROM}>`,
    to,
    subject: `Welcome to Syllabrix, ${username}! Your account is ready.`,
    html: baseTemplate(content),
  });
  console.log('[EMAIL] Resend response:', data, error);
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data;
};

// ======================== SEND PASSWORD RESET EMAIL ========================

const sendPasswordResetEmail = async ({ to, username, resetUrl }) => {
  const content = `
    <h2 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;">
      Reset your password
    </h2>
    <p style="color:#6B7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
      Hi <strong style="color:#111827;">${username}</strong>, we received a request to reset your Syllabrix password.
      Click the button below to set a new password.
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;">
        Reset My Password
      </a>
    </div>

    <p style="color:#9CA3AF;font-size:12px;margin:20px 0 0;text-align:center;">
      This link expires in <strong>1 hour</strong>. If you didn't request a password reset, ignore this email.
    </p>
  `;

  console.log('[EMAIL] Attempting to send password reset email to:', to);
  const { data, error } = await resend.emails.send({
    from: `Syllabrix <${EMAIL.FROM}>`,
    to,
    subject: 'Reset your Syllabrix password',
    html: baseTemplate(content),
  });
  console.log('[EMAIL] Resend response:', data, error);
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data;
};

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail };
