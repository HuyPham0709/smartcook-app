import { useState, useEffect } from 'react'; // Thêm useEffect
import { FileText, Search, Filter, Download, User, Settings, Trash2, Shield } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]); // Chuyển sang state
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // Giữ nguyên logic tìm kiếm/lọc trên client
  const filteredLogs = logs.filter(log =>
    log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Giữ nguyên hàm getSeverityColor và các hàm phụ trợ CSS...
  
  if (loading) return <div className="p-8">Loading logs...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Giữ nguyên toàn bộ JSX phần Search, Filter... */}
      {/* Trong phần Table Body, thay auditLogs.map bằng filteredLogs.map */}
      <tbody>
        {filteredLogs.map((log: any) => (
           <tr key={log.id}>
             {/* Render các cột log.timestamp, log.admin... y hệt như cũ */}
           </tr>
        ))}
      </tbody>
    </div>
  );
}