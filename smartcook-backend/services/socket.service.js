const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // Cần để xác thực token

const onlineUsers = new Map();
let io;

module.exports = {
    init: (server) => {
        io = new Server(server, {
            cors: { 
                origin: "http://localhost:5173", // Trỏ đích danh tới Vite Frontend thay vì "*"
                methods: ["GET", "POST"],
                credentials: true // Cho phép truyền token/auth
            }
        });

        // --- BẢO MẬT: MIDDLEWARE XÁC THỰC ---
        io.use((socket, next) => {
            const token = socket.handshake.auth.token; // Lấy token từ Frontend gửi lên

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

           jwt.verify(token, process.env.JWT_SECRET || 'secret_key_tam_thoi', async (err, decoded) => {
                if (err) return next(new Error("Authentication error: Invalid token"));
                
                // Lưu thông tin user vào chính object socket để dùng sau này
                socket.user = decoded; 
                next();
            });
        });

        io.on('connection', (socket) => {
            // Lấy userId trực tiếp từ Token đã verify, không tin tưởng vào client gửi lên
            const userId = socket.user.userId; 
            
            onlineUsers.set(userId.toString(), socket.id);
            console.log(`✅ Bảo mật: User ${userId} đã kết nối an toàn`);

            socket.on('disconnect', () => {
                onlineUsers.delete(userId.toString());
                console.log(`💤 User ${userId} đã ngắt kết nối`);
            });
        });
    },

    sendNotification: (userId, notificationData) => {
        if (!io) return;
        const socketId = onlineUsers.get(userId.toString());
        if (socketId) {
            io.to(socketId).emit('new_notification', notificationData);
        }
    }
};