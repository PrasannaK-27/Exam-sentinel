const { Exam, ExamEnrollment, User, ExamSession } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const getAllExams = async () => Exam.findAll({ include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }] });

const getExamById = async (id) => {
  const exam = await Exam.findByPk(id, { include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }] });
  if (!exam) throw new AppError('Exam not found.', 404);
  return exam;
};

const createExam = async ({ title, duration, created_by }) => {
  return Exam.create({ title, duration, created_by });
};

const updateExam = async (id, { title, duration }) => {
  const exam = await Exam.findByPk(id);
  if (!exam) throw new AppError('Exam not found.', 404);
  await exam.update({ title, duration });
  return exam;
};

const deleteExam = async (id) => {
  const exam = await Exam.findByPk(id);
  if (!exam) throw new AppError('Exam not found.', 404);
  await exam.destroy();
  return { message: 'Exam deleted.' };
};

const enrollStudent = async ({ student_id, exam_id }) => {
  const student = await User.findOne({ where: { id: student_id, role: 'STUDENT' } });
  if (!student) throw new AppError('Student not found.', 404);
  const exam = await Exam.findByPk(exam_id);
  if (!exam) throw new AppError('Exam not found.', 404);
  const [enrollment, created] = await ExamEnrollment.findOrCreate({ where: { student_id, exam_id } });
  if (!created) throw new AppError('Student already enrolled.', 409);
  return enrollment;
};

const getEnrolledExams = async (student_id) => {
  return Exam.findAll({
    include: [{
      model: User,
      as: 'enrolledStudents',
      where: { id: student_id },
      attributes: [],
      through: { attributes: [] },
    }],
  });
};

const getEnrolledStudents = async (exam_id) => {
  return User.findAll({
    attributes: ['id', 'username', 'email'],
    include: [{
      model: Exam,
      as: 'enrolledExams',
      where: { id: exam_id },
      attributes: [],
      through: { attributes: [] },
    }],
  });
};

const removeEnrollment = async ({ student_id, exam_id }) => {
  const enrollment = await ExamEnrollment.findOne({ where: { student_id, exam_id } });
  if (!enrollment) throw new AppError('Enrollment not found.', 404);
  await enrollment.destroy();
  return { message: 'Enrollment removed.' };
};

const startSession = async ({ student_id, exam_id }) => {
  const existing = await ExamSession.findOne({ where: { student_id, exam_id, status: 'IN_PROGRESS' } });
  if (existing) return existing;
  return ExamSession.create({ student_id, exam_id });
};

const getActiveSession = async ({ student_id, exam_id }) => {
  return ExamSession.findOne({ where: { student_id, exam_id, status: 'IN_PROGRESS' }, include: [{ model: Exam, as: 'exam' }] });
};

module.exports = { getAllExams, getExamById, createExam, updateExam, deleteExam, enrollStudent, getEnrolledExams, getEnrolledStudents, removeEnrollment, startSession, getActiveSession };
