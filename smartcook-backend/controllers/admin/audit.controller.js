const { poolPromise } = require('../../config/db');

const getAuditLogs = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
           SELECT 
                al.ID as id, 
                al.CreatedAt as timestamp, 
                u.FullName as admin, 
                al.Action as action, 
                CAST(al.TargetID AS VARCHAR) as target, 
                al.ActionDetails as details, 
                -- TỰ ĐỘNG XẾP LOẠI SEVERITY DỰA VÀO TÊN HÀNH ĐỘNG
                CASE 
                    WHEN al.Action IN ('Ban', 'ChangeRole', 'DeleteUser') THEN 'high'
                    WHEN al.Action IN ('Delete', 'Approve', 'EditRecipe') THEN 'medium'
                    ELSE 'low' 
                END as severity
            FROM AuditLogs al
            LEFT JOIN Users u ON al.AdminID = u.ID
            ORDER BY al.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi API Audit Logs:", err.message);
        res.status(500).json({ error: "Lỗi server" });
    }
};

module.exports = { getAuditLogs };