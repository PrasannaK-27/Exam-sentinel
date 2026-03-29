const resultService = require('../services/resultService');

const saveResponse = async (req, res, next) => {
  try {
    const { exam_id, question_id, selected_answer } = req.body;
    if (!exam_id || !question_id || !selected_answer) return res.status(400).json({ message: 'exam_id, question_id, and selected_answer are required.' });
    const response = await resultService.saveResponse({ student_id: req.session.user.id, exam_id, question_id, selected_answer });
    res.json({ success: true, response });
  } catch (e) { next(e); }
};

const submitExam = async (req, res, next) => {
  try {
    const result = await resultService.submitExam({ student_id: req.session.user.id, exam_id: req.params.exam_id });
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
};

const getMyResult = async (req, res, next) => {
  try {
    const result = await resultService.getResultForStudent({ student_id: req.session.user.id, exam_id: req.params.exam_id });
    res.json({ success: true, result });
  } catch (e) { next(e); }
};

const getExamResults = async (req, res, next) => {
  try {
    const results = await resultService.getAllResultsForExam(req.params.exam_id);
    res.json({ success: true, results });
  } catch (e) { next(e); }
};

const getAllResults = async (req, res, next) => {
  try {
    const results = await resultService.getAllResults();
    res.json({ success: true, results });
  } catch (e) { next(e); }
};

module.exports = { saveResponse, submitExam, getMyResult, getExamResults, getAllResults };
