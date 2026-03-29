import { useRef, useEffect, useCallback, useState } from 'react';
import { connectSocket } from '../utils/socket';

/**
 * Student-side WebRTC hook — streams webcam to admin
 * @param {{ studentId, examId, cameraStream }} options
 */
const useWebRTC = ({ studentId, examId, cameraStream }) => {
  const pcRef = useRef(null);
  const socket = useRef(null);
  const [streaming, setStreaming] = useState(false);

  const createPeerConnection = useCallback((adminSocketId) => {
    const pc = new RTCPeerConnection({ iceServers: [] }); // LAN only — no TURN

    // Add camera tracks
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => pc.addTrack(track, cameraStream));
    }

    // ICE candidates → admin
    pc.onicecandidate = (e) => {
      if (e.candidate && socket.current) {
        socket.current.emit('ice-candidate', { targetSocketId: adminSocketId, candidate: e.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      setStreaming(pc.connectionState === 'connected');
    };

    return pc;
  }, [cameraStream]);

  useEffect(() => {
    if (!studentId || !examId || !cameraStream) return;

    socket.current = connectSocket();

    // Signal to admins that student is ready
    socket.current.emit('student-ready', { studentId, examId });

    // Admin requests stream
    socket.current.on('start-stream', async ({ adminSocketId }) => {
      try {
        pcRef.current = createPeerConnection(adminSocketId);
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socket.current.emit('webrtc-offer', { targetSocketId: adminSocketId, offer, studentId, examId });
      } catch (err) {
        console.error('[WebRTC] offer error:', err);
      }
    });

    // Receive answer from admin
    socket.current.on('webrtc-answer', async ({ answer }) => {
      try {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error('[WebRTC] answer error:', err);
      }
    });

    // Receive ICE candidates
    socket.current.on('ice-candidate', async ({ candidate }) => {
      try {
        if (pcRef.current) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('[WebRTC] ICE error:', err);
      }
    });

    return () => {
      if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
      socket.current?.off('start-stream');
      socket.current?.off('webrtc-answer');
      socket.current?.off('ice-candidate');
    };
  }, [studentId, examId, cameraStream, createPeerConnection]);

  return { streaming };
};

export default useWebRTC;
