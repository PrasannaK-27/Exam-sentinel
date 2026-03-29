/**
 * requireAuth — blocks unauthenticated requests
 */
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  next();
};

/**
 * requireRole — blocks users without the required role
 * @param {...string} roles - allowed roles
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  if (!roles.includes(req.session.user.role)) {
    return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
  }
  next();
};

module.exports = { requireAuth, requireRole };
