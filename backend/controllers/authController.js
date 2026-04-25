const Joi = require('joi');
const authService = require('../services/authService');

const registerSchema = Joi.object({
  username: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'STUDENT', 'QUESTION_MANAGER').required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const user = await authService.register(value);
    res.status(201).json({ success: true, user });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const user = await authService.login(value);
    req.session.user = user;
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed.' });
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out.' });
  });
};

const me = (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Not authenticated.' });
  res.json({ success: true, user: req.session.user });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const result = await authService.forgotPassword({ email });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password required.' });
    const result = await authService.resetPassword({ token, newPassword });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

module.exports = { register, login, logout, me, forgotPassword, resetPassword };
