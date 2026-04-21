const express = require('express');
const cors = require('cors'); // Phải có thư viện này

// Import các routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import adminRoutes bạn vừa tạo
const authRoutes = require('./routes/authRoutes');
const app = express();

// 1. Cấu hình CORS để cho phép Frontend (React) gọi API
app.use(cors());

// 2. Middleware để đọc dữ liệu JSON
app.use(express.json());

// 3. Đăng ký các API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
// 4. Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend đang chạy tại http://localhost:${PORT}`);
});