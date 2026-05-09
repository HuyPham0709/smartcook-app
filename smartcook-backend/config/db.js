// config/db.js
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    options: { trustServerCertificate: true }
};

// Tạo một Promise kết nối để dùng chung cho toàn bộ app
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("✅ Đã kết nối thành công với SQL Server");
        return pool;
    })
    .catch(err => {
        console.error("❌ Lỗi kết nối SQL Server:", err.message);
        process.exit(1);
    });

module.exports = { poolPromise, sql };