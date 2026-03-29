const adminService = require('../services/adminService');

const getActiveSessions = async (req, res, next) => {
  try { res.json({ success: true, sessions: await adminService.getActiveSessions() }); } catch (e) { next(e); }
};
const getAllSessions = async (req, res, next) => {
  try { res.json({ success: true, sessions: await adminService.getAllSessions() }); } catch (e) { next(e); }
};
const getLogsForExam = async (req, res, next) => {
  try { res.json({ success: true, logs: await adminService.getLogsForExam(req.params.exam_id) }); } catch (e) { next(e); }
};
const getLogsForStudent = async (req, res, next) => {
  try {
    const { student_id, exam_id } = req.params;
    res.json({ success: true, logs: await adminService.getLogsForStudent({ student_id, exam_id }) });
  } catch (e) { next(e); }
};
const terminateSession = async (req, res, next) => {
  try {
    const { student_id, exam_id } = req.body;
    if (!student_id || !exam_id) return res.status(400).json({ message: 'student_id and exam_id required.' });
    res.json(await adminService.terminateSession({ student_id, exam_id }));
  } catch (e) { next(e); }
};
const resetSession = async (req, res, next) => {
  try {
    const { student_id, exam_id } = req.body;
    if (!student_id || !exam_id) return res.status(400).json({ message: 'student_id and exam_id required.' });
    res.json({ success: true, session: await adminService.resetSession({ student_id, exam_id }) });
  } catch (e) { next(e); }
};
const getAllUsers = async (req, res, next) => {
  try { res.json({ success: true, users: await adminService.getAllUsers() }); } catch (e) { next(e); }
};

module.exports = { getActiveSessions, getAllSessions, getLogsForExam, getLogsForStudent, terminateSession, resetSession, getAllUsers };
