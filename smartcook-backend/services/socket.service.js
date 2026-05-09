const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const onlineUsers = new Map();
let io;

function init(server) {
  const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',') 
    : ["http://localhost:5173"];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
  });

  // BẢO VỆ BACKEND KHỎI CRASH TẠI ĐÂY
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      // 1. Chặn đứng ngay lập tức nếu token rỗng, null, hoặc undefined
      // CHÚ Ý: Bắt buộc phải có chữ "return" ở đây để code ngưng chạy tiếp
      if (!token || token === "null" || token === "undefined") {
        return next(new Error("No token provided"));
      }

      // 2. Verify token
      jwt.verify(token, process.env.JWT_SECRET || "secret_key_tam_thoi", (err, decoded) => {
        if (err) {
          return next(new Error("Invalid token"));
        }
        socket.user = decoded;
        next();
      });
    } catch (error) {
      console.error("❌ Lỗi ngầm trong Socket Middleware:", error.message);
      return next(new Error("Internal Server Error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.userId;
    if (userId) {
      onlineUsers.set(userId.toString(), socket.id);
      console.log(`✅ User ${userId} connected`);

      socket.on("disconnect", () => {
        onlineUsers.delete(userId.toString());
        console.log(`💤 User ${userId} disconnected`);
      });
    }
  });
}

function sendNotification(userId, notificationData) {
  if (!io) return;
  const socketId = onlineUsers.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("new_notification", notificationData);
  }
}

module.exports = { init, sendNotification };