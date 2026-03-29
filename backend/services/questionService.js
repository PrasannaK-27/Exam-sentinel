const { Question, Exam } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const getQuestionsForExam = async (exam_id) => {
  return Question.findAll({ where: { exam_id } });
};

// Student-safe: strips correct_answer
const getQuestionsForStudent = async (exam_id) => {
  const questions = await Question.findAll({ where: { exam_id } });
  return questions.map(q => ({
    id: q.id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
  }));
};

const createQuestion = async ({ exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer }) => {
  const exam = await Exam.findByPk(exam_id);
  if (!exam) throw new AppError('Exam not found.', 404);
  return Question.create({ exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer });
};

const updateQuestion = async (id, data) => {
  const question = await Question.findByPk(id);
  if (!question) throw new AppError('Question not found.', 404);
  await question.update(data);
  return question;
};

const deleteQuestion = async (id) => {
  const question = await Question.findByPk(id);
  if (!question) throw new AppError('Question not found.', 404);
  await question.destroy();
  return { message: 'Question deleted.' };
};

module.exports = { getQuestionsForExam, getQuestionsForStudent, createQuestion, updateQuestion, deleteQuestion };
