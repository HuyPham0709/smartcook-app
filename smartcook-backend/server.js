const express = require('express');
const cors = require('cors'); // Phải có thư viện này

// Import các routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const app = express();

// 1. Cấu hình CORS để cho phép Frontend (React) gọi API
app.use(cors());

// 2. Middleware để đọc dữ liệu JSON
app.use(express.json());

// 3. Đăng ký các API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
// 4. Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend đang chạy tại http://localhost:${PORT}`);
});