const express = require('express');
const sql = require('mssql');
require('dotenv').config();

const app = express();
app.use(express.json());

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

async function startServer() {
    try {
        const pool = await sql.connect(config);
        console.log("✅ Đã kết nối thành công với SQL Server");

        app.get('/users', async (req, res) => {
            try {
                const result = await pool.request().query('SELECT * FROM Users');
                res.json(result.recordset);
            } catch (err) {
                res.status(500).send("Lỗi truy vấn: " + err.message);
            }
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error("❌ Lỗi kết nối SQL Server:", err.message);
    }
}

startServer();