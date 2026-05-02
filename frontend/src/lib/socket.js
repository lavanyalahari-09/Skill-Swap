import { io } from 'socket.io-client';

const socketURL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');

export const createChatSocket = (token) =>
  io(socketURL, {
    auth: { token },
    autoConnect: false,
    transports: ['websocket', 'polling']
  });
