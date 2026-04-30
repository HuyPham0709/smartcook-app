import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export const useSocket = (userId: number | null | undefined) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Nếu chưa đăng nhập (không có userId) thì không thèm kết nối Socket làm gì cho nặng máy
    if (!userId) return;

    // 1. LẤY TOKEN (Cực kỳ quan trọng để vượt qua Backend)
    // Tùy vào cách bạn lưu lúc Login, thông thường token lưu độc lập, hoặc nằm trong object 'user'
    const token = localStorage.getItem('token'); 
    // Nếu bạn lưu nguyên cục: const user = JSON.parse(localStorage.getItem('user') || '{}'); const token = user.token;

    // 2. KHỞI TẠO SOCKET KÈM TOKEN
    socketRef.current = io('http://localhost:3000', {
        auth: {
            token: token // Đây chính là "Chìa khóa" đi qua cửa bảo vệ của backend
        },
        transports: ['websocket', 'polling']
    });

    socketRef.current.emit('user_online', userId);

    // 3. LẮNG NGHE THÔNG BÁO
    socketRef.current.on('NEW_NOTIFICATION', (data: any) => {
      toast(`${data.SenderName} ${data.Message}`, {
        icon: data.Type === 'LIKE' ? '❤️' : data.Type === 'RATING' ? '⭐' : '💬',
        description: new Date().toLocaleTimeString('vi-VN'),
      });
    });

    // Clean up khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return socketRef.current;
};