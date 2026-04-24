const { Server } = require('socket.io');

// Lưu trữ map giữa userId và socketId (VD: { 20 => 'aXbCdEF123' })
const onlineUsers = new Map();
let io;

module.exports = {
    init: (server) => {
        io = new Server(server, {
            cors: { origin: "*", methods: ["GET", "POST"] } // Cho phép Frontend kết nối
        });

        io.on('connection', (socket) => {
            console.log(`⚡ Client kết nối: ${socket.id}`);

            // Khi user đăng nhập, frontend sẽ gửi sự kiện 'user_online' kèm userId
            socket.on('user_online', (userId) => {
                onlineUsers.set(userId.toString(), socket.id);
                console.log(`👤 User ${userId} online với socket: ${socket.id}`);
            });

            // Khi user ngắt kết nối
            socket.on('disconnect', () => {
                for (let [userId, socketId] of onlineUsers.entries()) {
                    if (socketId === socket.id) {
                        onlineUsers.delete(userId);
                        console.log(`💤 User ${userId} đã offline`);
                        break;
                    }
                }
            });
        });
    },

    // Hàm dùng để gọi từ Controller bắn thông báo cho User cụ thể
    sendNotification: (userId, notificationData) => {
        if (!io) return;
        const socketId = onlineUsers.get(userId.toString());
        if (socketId) {
            // Nếu user đang online, bắn sự kiện ngay lập tức
            io.to(socketId).emit('NEW_NOTIFICATION', notificationData);
        }
    }
};