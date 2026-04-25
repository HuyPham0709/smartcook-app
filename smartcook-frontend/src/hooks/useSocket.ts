import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export const useSocket = (userId: number | null | undefined) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Chỉ kết nối khi có userId (đã đăng nhập)
    if (!userId) return;

    // Khởi tạo connection
    socketRef.current = io('http://localhost:3000');

    // Khai báo cho Server biết tôi đã online
    socketRef.current.emit('user_online', userId);

    // Lắng nghe sự kiện thông báo từ Server
    socketRef.current.on('NEW_NOTIFICATION', (data: any) => {
      // Hiển thị Toast mượt mà khi có thông báo tới
      toast(data.message, {
        icon: data.type === 'LIKE' ? '❤️' : '💬',
        description: data.time,
        // Bạn có thể custom UI toast ở đây
      });
    });

    // Cleanup khi component unmount hoặc user đăng xuất
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return socketRef.current;
};