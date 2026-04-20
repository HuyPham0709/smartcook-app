const express = require('express');

// Import routes
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());

// Thêm CORS để Frontend (React) ở port khác có thể gọi API được
const cors = require('cors');
app.use(cors());

// Gắn route vào app
// Chú ý: Đổi '/users' thành '/recipes' để Frontend lấy được dữ liệu trang chủ
app.use('/recipes', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});