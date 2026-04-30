import { io } from "socket.io-client";

// Lấy token đang lưu trong máy (tùy thuộc vào cách bạn lưu, có thể là 'token' hoặc nằm trong 'user')
const token = localStorage.getItem('token'); 

export const socket = io("http://localhost:3000", {
  auth: {
    token: token // BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ VƯỢ QUA MIDDLEWARE BACKEND
  },
  transports: ['websocket', 'polling'] // Ép dùng websocket trước cho mượt
});