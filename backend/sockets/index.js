const adminService = require('../services/adminService');

// Track connected admin sockets and student sockets
const adminSockets = new Map();   // adminSocketId -> socket
const studentSockets = new Map(); // `${student_id}:${exam_id}` -> socket

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ─── Role Registration ───────────────────────────────────────────────────
    socket.on('register-admin', ({ adminId }) => {
      socket.join('admins');
      adminSockets.set(socket.id, { adminId, socket });
      console.log(`[Socket] Admin ${adminId} registered`);
    });

    socket.on('register-student', ({ studentId, examId }) => {
      const key = `${studentId}:${examId}`;
      studentSockets.set(key, socket);
      socket.join(`exam:${examId}`);
      socket.studentId = studentId;
      socket.examId = examId;

      // Notify admins of new student
      io.to('admins').emit('student-joined', { studentId, examId, socketId: socket.id });
      console.log(`[Socket] Student ${studentId} registered for exam ${examId}`);
    });

    // ─── Violation Events ────────────────────────────────────────────────────
    socket.on('violation', async ({ studentId, examId, action, detail }) => {
      try {
        const { log, violationCount } = await adminService.logViolation({ student_id: studentId, exam_id: examId, action, detail });

        // Broadcast violation to all admins
        io.to('admins').emit('violation-alert', {
          studentId, examId, action, detail,
          violationCount, timestamp: log.timestamp,
        });

        // If >= 4 violations, auto-terminate
        if (violationCount >= 4) {
          await adminService.terminateSession({ student_id: studentId, exam_id: examId });
          // Notify student
          const key = `${studentId}:${examId}`;
          const studentSocket = studentSockets.get(key);
          if (studentSocket) {
            studentSocket.emit('exam-terminated', { reason: 'Too many violations. Your exam has been terminated.' });
          }
          // Notify admins
          io.to('admins').emit('session-terminated', { studentId, examId, reason: 'auto-violation-limit' });
        }
      } catch (err) {
        console.error('[Socket] violation error:', err.message);
      }
    });

    // ─── Admin Actions ───────────────────────────────────────────────────────
    socket.on('admin-terminate', async ({ studentId, examId }) => {
      try {
        await adminService.terminateSession({ student_id: studentId, exam_id: examId });
        const key = `${studentId}:${examId}`;
        const studentSocket = studentSockets.get(key);
        if (studentSocket) studentSocket.emit('exam-terminated', { reason: 'Terminated by administrator.' });
        io.to('admins').emit('session-terminated', { studentId, examId, reason: 'admin-action' });
      } catch (err) {
        console.error('[Socket] admin-terminate error:', err.message);
      }
    });

    socket.on('admin-reset', async ({ studentId, examId }) => {
      try {
        const newSession = await adminService.resetSession({ student_id: studentId, exam_id: examId });
        const key = `${studentId}:${examId}`;
        const studentSocket = studentSockets.get(key);
        if (studentSocket) studentSocket.emit('session-reset', { session: newSession });
        io.to('admins').emit('session-reset-ack', { studentId, examId });
      } catch (err) {
        console.error('[Socket] admin-reset error:', err.message);
      }
    });

    // ─── WebRTC Signaling ────────────────────────────────────────────────────
    // Student signals ready to stream
    socket.on('student-ready', ({ studentId, examId }) => {
      io.to('admins').emit('student-ready', { studentId, examId, socketId: socket.id });
    });

    // Admin requests stream from student
    socket.on('request-stream', ({ targetSocketId, adminSocketId }) => {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit('start-stream', { adminSocketId });
      }
    });

    // WebRTC Offer (student → admin)
    socket.on('webrtc-offer', ({ targetSocketId, offer, studentId, examId }) => {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit('webrtc-offer', { offer, from: socket.id, studentId, examId });
      }
    });

    // WebRTC Answer (admin → student)
    socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit('webrtc-answer', { answer, from: socket.id });
      }
    });

    // ICE Candidate exchange
    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit('ice-candidate', { candidate, from: socket.id });
      }
    });

    // ─── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      adminSockets.delete(socket.id);

      if (socket.studentId && socket.examId) {
        const key = `${socket.studentId}:${socket.examId}`;
        studentSockets.delete(key);
        io.to('admins').emit('student-disconnected', { studentId: socket.studentId, examId: socket.examId });
      }
    });
  });
};
