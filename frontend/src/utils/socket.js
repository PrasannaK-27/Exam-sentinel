import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socket = io(url, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) socket.disconnect();
};
