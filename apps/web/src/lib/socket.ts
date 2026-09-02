import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
    socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: (cb) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        cb({ token });
      },
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to WebSocket Server:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('⚡ Disconnected from WebSocket Server');
    });
  }
  return socket;
}
