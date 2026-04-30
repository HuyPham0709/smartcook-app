import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export const useSocket = (userId: number | null | undefined) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io('http://localhost:3000');
    socketRef.current.emit('user_online', userId);

    socketRef.current.on('NEW_NOTIFICATION', (data: any) => {
      // Chỉ hiện Toast Notification khi đó là hành động thêm mới
      // Hoặc tránh Toast spam liên tục nếu đang gộp thông báo
      toast(`${data.SenderName} ${data.Message}`, {
        icon: data.Type === 'LIKE' ? '❤️' : data.Type === 'RATING' ? '⭐' : '💬',
        description: new Date().toLocaleTimeString('vi-VN'),
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return socketRef.current;
};