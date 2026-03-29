const router = require('express').Router();
const c = require('../controllers/examController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Student routes
router.get('/enrolled', requireAuth, requireRole('STUDENT'), c.getEnrolled);
router.get('/:id/session', requireAuth, requireRole('STUDENT'), c.getActiveSession);
router.post('/:id/session/start', requireAuth, requireRole('STUDENT'), c.startSession);

// Admin/QM management
router.get('/', requireAuth, c.getAll);
router.get('/:id', requireAuth, c.getOne);
router.post('/', requireAuth, requireRole('ADMIN'), c.create);
router.put('/:id', requireAuth, requireRole('ADMIN'), c.update);
router.delete('/:id', requireAuth, requireRole('ADMIN'), c.remove);
router.post('/:id/enroll', requireAuth, requireRole('ADMIN'), c.enroll);
router.delete('/:id/enroll', requireAuth, requireRole('ADMIN'), c.unenroll);
router.get('/:id/students', requireAuth, requireRole('ADMIN'), c.getStudentsInExam);

module.exports = router;
