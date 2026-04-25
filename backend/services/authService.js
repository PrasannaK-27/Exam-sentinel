const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');
const { sendResetEmail } = require('../config/mailer');
const { AppError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 12;

const register = async ({ username, email, password, role }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new AppError('Email already registered.', 409);

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, email, password_hash, role });
  return { id: user.id, username: user.username, email: user.email, role: user.role };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new AppError('Invalid email or password.', 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Invalid email or password.', 401);

  return { id: user.id, username: user.username, email: user.email, role: user.role };
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new AppError('No account found with that email.', 404);

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await user.update({ reset_token: token, reset_token_expires: expires });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendResetEmail({ to: email, resetLink });

  return { message: 'Password reset link sent to your email.' };
};

const resetPassword = async ({ token, newPassword }) => {
  const user = await User.findOne({ where: { reset_token: token } });
  if (!user || !user.reset_token_expires || new Date() > user.reset_token_expires) {
    throw new AppError('Invalid or expired reset token.', 400);
  }

  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.update({ password_hash, reset_token: null, reset_token_expires: null });

  return { message: 'Password reset successfully.' };
};

module.exports = { register, login, forgotPassword, resetPassword };
