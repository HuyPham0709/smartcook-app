const dotenv = require('dotenv');
dotenv.config({
  path: process.env.NODE_ENV === 'env' ? '.env.docker' : '.env.local'
});

require('./config/db');

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketService = require('./services/socket.service'); // Đảm bảo đường dẫn đúng

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const interactionRoutes = require('./routes/interactionRoutes');

const app = express();

// Lấy FRONTEND_URL từ env, hỗ trợ nhiều URL ngăn cách bằng dấu phẩy
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/interactions', interactionRoutes);

const server = http.createServer(app);
socketService.init(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Backend và Socket.io đang chạy tại: ${PORT}`);
});