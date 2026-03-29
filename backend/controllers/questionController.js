const Joi = require('joi');
const questionService = require('../services/questionService');

const questionSchema = Joi.object({
  exam_id: Joi.number().integer().required(),
  question_text: Joi.string().min(1).required(),
  option_a: Joi.string().min(1).required(),
  option_b: Joi.string().min(1).required(),
  option_c: Joi.string().min(1).required(),
  option_d: Joi.string().min(1).required(),
  correct_answer: Joi.string().valid('A', 'B', 'C', 'D').required(),
});

const updateSchema = Joi.object({
  question_text: Joi.string().min(1),
  option_a: Joi.string().min(1),
  option_b: Joi.string().min(1),
  option_c: Joi.string().min(1),
  option_d: Joi.string().min(1),
  correct_answer: Joi.string().valid('A', 'B', 'C', 'D'),
}).min(1);

const getForExam = async (req, res, next) => {
  try {
    const isStudent = req.session.user?.role === 'STUDENT';
    const questions = isStudent
      ? await questionService.getQuestionsForStudent(req.params.exam_id)
      : await questionService.getQuestionsForExam(req.params.exam_id);
    res.json({ success: true, questions });
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = questionSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const q = await questionService.createQuestion(value);
    res.status(201).json({ success: true, question: q });
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    res.json({ success: true, question: await questionService.updateQuestion(req.params.id, value) });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { res.json(await questionService.deleteQuestion(req.params.id)); } catch (e) { next(e); }
};

module.exports = { getForExam, create, update, remove };
