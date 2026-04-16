// config/db.js
const sql = require('mssql');

const config = {
    user: 'sa',       
    password: '123',   
    server: 'localhost',          
    database: 'SmartCookDB', 
    options: {
        encrypt: true,           
        trustServerCertificate: true 
    }
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