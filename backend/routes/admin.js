const router = require('express').Router();
const c = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/sessions/active', requireAuth, requireRole('ADMIN'), c.getActiveSessions);
router.get('/sessions/all', requireAuth, requireRole('ADMIN'), c.getAllSessions);
router.post('/sessions/terminate', requireAuth, requireRole('ADMIN'), c.terminateSession);
router.post('/sessions/reset', requireAuth, requireRole('ADMIN'), c.resetSession);
router.get('/logs/exam/:exam_id', requireAuth, requireRole('ADMIN'), c.getLogsForExam);
router.get('/logs/student/:student_id/exam/:exam_id', requireAuth, requireRole('ADMIN'), c.getLogsForStudent);
router.get('/users', requireAuth, requireRole('ADMIN'), c.getAllUsers);

module.exports = router;
