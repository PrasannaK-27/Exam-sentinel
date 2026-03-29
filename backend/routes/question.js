const router = require('express').Router();
const c = require('../controllers/questionController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/exam/:exam_id', requireAuth, c.getForExam);
router.post('/', requireAuth, requireRole('ADMIN', 'QUESTION_MANAGER'), c.create);
router.put('/:id', requireAuth, requireRole('ADMIN', 'QUESTION_MANAGER'), c.update);
router.delete('/:id', requireAuth, requireRole('ADMIN', 'QUESTION_MANAGER'), c.remove);

module.exports = router;
