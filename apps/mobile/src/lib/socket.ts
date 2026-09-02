import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth-store';

let mobileSocket: Socket | null = null;

export function getMobileSocket(): Socket {
  if (!mobileSocket) {
    const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:4000';
    mobileSocket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: (cb) => {
        const token = useAuthStore.getState().token;
        cb({ token });
      },
    });

    mobileSocket.on('connect', () => {
      console.log('[Socket] Mobile connected to WebSocket Gateway:', mobileSocket?.id);
    });

    mobileSocket.on('disconnect', () => {
      console.log('[Socket] Mobile disconnected from WebSocket');
    });
  }

  return mobileSocket;
}
