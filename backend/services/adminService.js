const { ExamSession, User, Exam, ActivityLog } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const getActiveSessions = async () => {
  return ExamSession.findAll({
    where: { status: 'IN_PROGRESS' },
    include: [
      { model: User, as: 'student', attributes: ['id', 'username', 'email'] },
      { model: Exam, as: 'exam', attributes: ['id', 'title', 'duration'] },
    ],
    order: [['started_at', 'DESC']],
  });
};

const getAllSessions = async () => {
  return ExamSession.findAll({
    include: [
      { model: User, as: 'student', attributes: ['id', 'username', 'email'] },
      { model: Exam, as: 'exam', attributes: ['id', 'title'] },
    ],
    order: [['started_at', 'DESC']],
  });
};

const terminateSession = async ({ student_id, exam_id }) => {
  const session = await ExamSession.findOne({ where: { student_id, exam_id, status: 'IN_PROGRESS' } });
  if (!session) throw new AppError('No active session found.', 404);
  await session.update({ ended_at: new Date(), status: 'TERMINATED' });
  return { message: 'Session terminated.' };
};

const resetSession = async ({ student_id, exam_id }) => {
  await ExamSession.update({ status: 'TERMINATED', ended_at: new Date() }, { where: { student_id, exam_id } });
  const newSession = await ExamSession.create({ student_id, exam_id });
  return newSession;
};

const logViolation = async ({ student_id, exam_id, action, detail }) => {
  // Increment violation count
  const session = await ExamSession.findOne({ where: { student_id, exam_id, status: 'IN_PROGRESS' } });
  if (session) {
    await session.increment('violation_count');
    await session.reload();
  }
  // Save log
  const log = await ActivityLog.create({ student_id, exam_id, action, detail, timestamp: new Date() });
  return { log, violationCount: session ? session.violation_count : 0 };
};

const getLogsForExam = async (exam_id) => {
  return ActivityLog.findAll({
    where: { exam_id },
    include: [{ model: User, as: 'student', attributes: ['id', 'username'] }],
    order: [['timestamp', 'DESC']],
  });
};

const getLogsForStudent = async ({ student_id, exam_id }) => {
  return ActivityLog.findAll({
    where: { student_id, exam_id },
    order: [['timestamp', 'DESC']],
  });
};

const getAllUsers = async () => {
  return User.findAll({ attributes: ['id', 'username', 'email', 'role', 'created_at'], order: [['created_at', 'DESC']] });
};

module.exports = { getActiveSessions, getAllSessions, terminateSession, resetSession, logViolation, getLogsForExam, getLogsForStudent, getAllUsers };
