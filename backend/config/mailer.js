const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send result email to student after exam completion
 */
const sendResultEmail = async ({ to, studentName, examTitle, score, totalQuestions, submittedAt }) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 50;

  const mailOptions = {
    from: `"ExamSentinel" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Your Exam Result — ${examTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">ExamSentinel</h1>
          <p style="color: #94a3b8; margin: 4px 0;">Smart Online Exam Monitoring</p>
        </div>
        <h2 style="color: #f1f5f9;">Hi ${studentName},</h2>
        <p style="color: #94a3b8;">Your exam has been submitted. Here are your results:</p>
        <div style="background: #1e293b; border-radius: 8px; padding: 24px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Exam</td>
              <td style="padding: 8px 0; color: #f1f5f9; text-align: right; font-weight: bold;">${examTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Score</td>
              <td style="padding: 8px 0; color: #f1f5f9; text-align: right; font-weight: bold;">${score} / ${totalQuestions}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Percentage</td>
              <td style="padding: 8px 0; color: #f1f5f9; text-align: right; font-weight: bold;">${percentage}%</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Status</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: ${passed ? '#22c55e' : '#ef4444'};">${passed ? '✅ PASSED' : '❌ FAILED'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Submitted At</td>
              <td style="padding: 8px 0; color: #f1f5f9; text-align: right;">${new Date(submittedAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 32px;">This is an automated email from ExamSentinel. Please do not reply.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 */
const sendResetEmail = async ({ to, resetLink }) => {
  const mailOptions = {
    from: `"ExamSentinel" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Password Reset Request — ExamSentinel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">ExamSentinel</h1>
        </div>
        <h2 style="color: #f1f5f9;">Password Reset</h2>
        <p style="color: #94a3b8;">You requested a password reset. Click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResultEmail, sendResetEmail };
