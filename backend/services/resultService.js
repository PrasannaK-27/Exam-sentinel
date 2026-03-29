const { StudentResponse, Question, ExamSession, Result, Exam, User, ActivityLog } = require('../models');
const { sendResultEmail } = require('../config/mailer');
const { AppError } = require('../middleware/errorHandler');

const saveResponse = async ({ student_id, exam_id, question_id, selected_answer }) => {
  const [response, created] = await StudentResponse.findOrCreate({
    where: { student_id, exam_id, question_id },
    defaults: { selected_answer, saved_at: new Date() },
  });
  if (!created) {
    await response.update({ selected_answer, saved_at: new Date() });
  }
  return response;
};

const submitExam = async ({ student_id, exam_id }) => {
  const session = await ExamSession.findOne({ where: { student_id, exam_id, status: 'IN_PROGRESS' } });
  if (!session) throw new AppError('No active exam session found.', 404);

  // Calculate score
  const questions = await Question.findAll({ where: { exam_id } });
  const responses = await StudentResponse.findAll({ where: { student_id, exam_id } });

  const responseMap = {};
  responses.forEach(r => { responseMap[r.question_id] = r.selected_answer; });

  let score = 0;
  questions.forEach(q => {
    if (responseMap[q.id] && responseMap[q.id].toUpperCase() === q.correct_answer.toUpperCase()) score++;
  });

  // End session
  await session.update({ ended_at: new Date(), status: 'COMPLETED' });

  // Save result
  const result = await Result.create({ student_id, exam_id, score });

  // Send email
  try {
    const student = await User.findByPk(student_id);
    const exam = await Exam.findByPk(exam_id);
    await sendResultEmail({
      to: student.email,
      studentName: student.username,
      examTitle: exam.title,
      score,
      totalQuestions: questions.length,
      submittedAt: result.submitted_at,
    });
  } catch (emailErr) {
    console.error('Email send failed:', emailErr.message);
  }

  return { score, total: questions.length, result };
};

const getResultForStudent = async ({ student_id, exam_id }) => {
  const result = await Result.findOne({
    where: { student_id, exam_id },
    include: [{ model: Exam, as: 'exam' }],
  });
  if (!result) throw new AppError('Result not found.', 404);
  const totalQuestions = await Question.count({ where: { exam_id } });
  return { ...result.toJSON(), totalQuestions };
};

const getAllResultsForExam = async (exam_id) => {
  return Result.findAll({
    where: { exam_id },
    include: [{ model: User, as: 'student', attributes: ['id', 'username', 'email'] }, { model: Exam, as: 'exam' }],
    order: [['score', 'DESC']],
  });
};

const getAllResults = async () => {
  return Result.findAll({
    include: [
      { model: User, as: 'student', attributes: ['id', 'username', 'email'] },
      { model: Exam, as: 'exam', attributes: ['id', 'title'] },
    ],
    order: [['submitted_at', 'DESC']],
  });
};

module.exports = { saveResponse, submitExam, getResultForStudent, getAllResultsForExam, getAllResults };
