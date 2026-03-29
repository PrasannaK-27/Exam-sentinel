import { useRef, useEffect, useCallback, useState } from 'react';
import { connectSocket } from '../utils/socket';

/**
 * Admin-side WebRTC hook — receives student webcam stream
 * @param {{ adminId }} options
 * @returns {{ requestStream, remoteStreams, logs, activeSessions }}
 */
const useAdminWebRTC = ({ adminId }) => {
  const socket = useRef(null);
  const pcsRef = useRef({}); // studentSocketId -> RTCPeerConnection
  const [remoteStreams, setRemoteStreams] = useState({}); // studentId -> MediaStream
  const [activeSessions, setActiveSessions] = useState([]); // live student list
  const [violationAlerts, setViolationAlerts] = useState([]);

  useEffect(() => {
    if (!adminId) return;
    socket.current = connectSocket();
    socket.current.emit('register-admin', { adminId });

    // Student joined
    socket.current.on('student-joined', (data) => {
      setActiveSessions(prev => {
        const exists = prev.find(s => s.studentId === data.studentId && s.examId === data.examId);
        if (exists) return prev.map(s => s.studentId === data.studentId ? { ...s, socketId: data.socketId } : s);
        return [...prev, data];
      });
    });

    // Student disconnected
    socket.current.on('student-disconnected', ({ studentId, examId }) => {
      setActiveSessions(prev => prev.filter(s => !(s.studentId === studentId && s.examId === examId)));
      setRemoteStreams(prev => { const n = { ...prev }; delete n[studentId]; return n; });
    });

    // Student ready to stream
    socket.current.on('student-ready', (data) => {
      setActiveSessions(prev => {
        const exists = prev.find(s => s.studentId === data.studentId);
        if (exists) return prev.map(s => s.studentId === data.studentId ? { ...s, ...data } : s);
        return [...prev, data];
      });
    });

    // Violation alerts
    socket.current.on('violation-alert', (data) => {
      setViolationAlerts(prev => [data, ...prev].slice(0, 100));
    });

    // Session terminated
    socket.current.on('session-terminated', ({ studentId }) => {
      setActiveSessions(prev => prev.map(s => s.studentId === studentId ? { ...s, terminated: true } : s));
    });

    // WebRTC: receive offer from student
    socket.current.on('webrtc-offer', async ({ offer, from: studentSocketId, studentId }) => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pcsRef.current[studentSocketId] = pc;

        pc.ontrack = (e) => {
          if (e.streams?.[0]) {
            setRemoteStreams(prev => ({ ...prev, [studentId]: e.streams[0] }));
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.current.emit('ice-candidate', { targetSocketId: studentSocketId, candidate: e.candidate });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.current.emit('webrtc-answer', { targetSocketId: studentSocketId, answer });
      } catch (err) {
        console.error('[AdminWebRTC] offer handling error:', err);
      }
    });

    // ICE candidate from student
    socket.current.on('ice-candidate', async ({ candidate, from: studentSocketId }) => {
      try {
        const pc = pcsRef.current[studentSocketId];
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('[AdminWebRTC] ICE error:', err);
      }
    });

    return () => {
      Object.values(pcsRef.current).forEach(pc => pc.close());
      pcsRef.current = {};
      socket.current?.off('student-joined');
      socket.current?.off('student-disconnected');
      socket.current?.off('student-ready');
      socket.current?.off('violation-alert');
      socket.current?.off('session-terminated');
      socket.current?.off('webrtc-offer');
      socket.current?.off('ice-candidate');
    };
  }, [adminId]);

  const requestStream = useCallback((targetSocketId) => {
    socket.current?.emit('request-stream', { targetSocketId, adminSocketId: socket.current.id });
  }, []);

  const terminateStudent = useCallback((studentId, examId) => {
    socket.current?.emit('admin-terminate', { studentId, examId });
  }, []);

  const resetStudent = useCallback((studentId, examId) => {
    socket.current?.emit('admin-reset', { studentId, examId });
  }, []);

  return { requestStream, remoteStreams, activeSessions, violationAlerts, terminateStudent, resetStudent };
};

export default useAdminWebRTC;
