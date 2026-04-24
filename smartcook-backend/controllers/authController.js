// controllers/authController.js
const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Hàm Helper: Tạo Token để dùng chung, tránh lặp code
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user.ID, roleId: user.RoleID }, // Dữ liệu từ DB
        process.env.JWT_SECRET || 'secret_key_tam_thoi', 
        { expiresIn: '15m' }
    );
    return { accessToken };
};

// [POST] /api/auth/register
const register = async (req, res) => {
    const { email, password, fullName } = req.body;
    try {
        const pool = await poolPromise;
        
        // 1. Kiểm tra Email tồn tại
        const checkUser = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT ID FROM Users WHERE Email = @Email');
            
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Email này đã được sử dụng!' });
        }

        // 2. Mã hóa mật khẩu & Lưu vào DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.request()
            .input('Email', sql.NVarChar, email)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .input('FullName', sql.NVarChar, fullName)
            .query(`
                INSERT INTO Users (Email, PasswordHash, FullName, RoleID) 
                VALUES (@Email, @PasswordHash, @FullName, 3) 
            `); // 3 là Role User mặc định

        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
};

// [POST] /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await poolPromise;
        
        // 1. Tìm User
        const result = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE Email = @Email');
            
        const user = result.recordset[0];
        if (!user) return res.status(400).json({ message: 'Sai email hoặc mật khẩu!' });

        // 2. Kiểm tra mật khẩu
        const validPassword = await bcrypt.compare(password, user.PasswordHash);
        if (!validPassword) return res.status(400).json({ message: 'Sai email hoặc mật khẩu!' });

        // ==========================================
        // THÊM MỚI: KIỂM TRA TRẠNG THÁI KHÓA TÀI KHOẢN
        // ==========================================
        const now = new Date();
        const banUntilDate = user.BanUntil ? new Date(user.BanUntil) : null;
        const isBanned = user.active === 0 || (banUntilDate && banUntilDate > now);

        if (isBanned) {
            let remainingTimeMsg = "Vĩnh viễn";
            if (banUntilDate && banUntilDate > now) {
                const diffMs = banUntilDate.getTime() - now.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                
                if (diffDays > 0) {
                    remainingTimeMsg = `${diffDays} ngày ${diffHours} giờ`;
                } else if (diffHours > 0) {
                    remainingTimeMsg = `${diffHours} giờ`;
                } else {
                    remainingTimeMsg = `Dưới 1 giờ`;
                }
            }

            return res.status(403).json({
                success: false,
                code: "USER_BANNED",
                message: "Đăng nhập thất bại. Tài khoản đã bị khóa!",
                details: {
                    reason: user.BanReason || "Vi phạm tiêu chuẩn cộng đồng.",
                    remainingTime: remainingTimeMsg,
                    bannedUntil: user.BanUntil
                }
            });
        }
        // ==========================================

        // 3. (Tùy chọn) Chèn logic 2FA ở đây nếu user.Is2FAEnabled = 1
        
        // 4. Trả về Token
        const tokens = generateTokens(user);
        res.json({ message: 'Đăng nhập thành công', ...tokens, user: { id: user.ID, email: user.Email, name: user.FullName } });

    } catch (err) {
        res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
};

module.exports = { register, login };