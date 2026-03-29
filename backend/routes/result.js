const router = require('express').Router();
const c = require('../controllers/resultController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/response', requireAuth, requireRole('STUDENT'), c.saveResponse);
router.post('/submit/:exam_id', requireAuth, requireRole('STUDENT'), c.submitExam);
router.get('/my/:exam_id', requireAuth, requireRole('STUDENT'), c.getMyResult);
router.get('/exam/:exam_id', requireAuth, requireRole('ADMIN'), c.getExamResults);
router.get('/all', requireAuth, requireRole('ADMIN'), c.getAllResults);

module.exports = router;
