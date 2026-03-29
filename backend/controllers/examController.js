const Joi = require('joi');
const examService = require('../services/examService');

const examSchema = Joi.object({ title: Joi.string().min(2).max(255).required(), duration: Joi.number().integer().min(1).required() });

const getAll = async (req, res, next) => {
  try { res.json({ success: true, exams: await examService.getAllExams() }); } catch (e) { next(e); }
};
const getOne = async (req, res, next) => {
  try { res.json({ success: true, exam: await examService.getExamById(req.params.id) }); } catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try {
    const { error, value } = examSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
    }

    const exam = await examService.createExam({ ...value, created_by: req.session.user.id });
    res.status(201).json({ success: true, exam });
  } catch (e) { next(e); }
};
const update = async (req, res, next) => {
  try {
    const { error, value } = examSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    res.json({ success: true, exam: await examService.updateExam(req.params.id, value) });
  } catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try { res.json(await examService.deleteExam(req.params.id)); } catch (e) { next(e); }
};
const enroll = async (req, res, next) => {
  try {
    const { student_id } = req.body;
    if (!student_id) return res.status(400).json({ message: 'student_id required.' });
    res.status(201).json({ success: true, enrollment: await examService.enrollStudent({ student_id, exam_id: req.params.id }) });
  } catch (e) { next(e); }
};
const unenroll = async (req, res, next) => {
  try { res.json(await examService.removeEnrollment({ student_id: req.body.student_id, exam_id: req.params.id })); } catch (e) { next(e); }
};
const getEnrolled = async (req, res, next) => {
  try { res.json({ success: true, exams: await examService.getEnrolledExams(req.session.user.id) }); } catch (e) { next(e); }
};
const getStudentsInExam = async (req, res, next) => {
  try { res.json({ success: true, students: await examService.getEnrolledStudents(req.params.id) }); } catch (e) { next(e); }
};
const startSession = async (req, res, next) => {
  try {
    const session = await examService.startSession({ student_id: req.session.user.id, exam_id: req.params.id });
    res.json({ success: true, session });
  } catch (e) { next(e); }
};
const getActiveSession = async (req, res, next) => {
  try {
    const session = await examService.getActiveSession({ student_id: req.session.user.id, exam_id: req.params.id });
    res.json({ success: true, session });
  } catch (e) { next(e); }
};

module.exports = { getAll, getOne, create, update, remove, enroll, unenroll, getEnrolled, getStudentsInExam, startSession, getActiveSession };
