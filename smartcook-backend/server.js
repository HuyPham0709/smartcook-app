const express = require('express');
const cors = require('cors');
const http = require('http'); // THÊM DÒNG NÀY
const socketService = require('./services/socket.service'); // THÊM DÒNG NÀY

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const interactionRoutes = require('./routes/interactionRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/interactions', interactionRoutes);

// KHỞI TẠO HTTP SERVER VÀ SOCKET
const server = http.createServer(app);
socketService.init(server); // Khởi động Socket

const PORT = 3000;
// Sửa app.listen thành server.listen
server.listen(PORT, () => {
    console.log(`🚀 Server Backend và Socket.io đang chạy tại http://localhost:${PORT}`);
});