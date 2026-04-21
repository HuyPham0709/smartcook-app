import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, User, Settings, Trash2, Shield } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { AuditLog } from '../../types';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    adminApi.getAuditLogs()
      .then((response: any) => {
        // 1. Xử lý trường hợp backend bọc data trong recordset (đặc thù của thư viện mssql)
        let rawData = response.recordset ? response.recordset : response;
        if (!Array.isArray(rawData)) rawData = [];

        // 2. Map lại dữ liệu: Tự động bắt đúng tên cột của DB SQL server sang Frontend
        const formattedLogs = rawData.map((item: any) => ({
          id: item.id || item.ID || 0,
          timestamp: item.timestamp || item.CreatedAt || new Date().toISOString(),
          // Bắt cả trường hợp tên cột là AdminName, AdminID hoặc admin
          admin: item.admin || item.AdminName || `Admin #${item.AdminID}` || 'Unknown Admin',
          action: item.action || item.Action || 'N/A',
          // Ép kiểu về chuỗi (String) để tránh lỗi khi DB trả về số (TargetID)
          target: String(item.target || item.TargetName || item.TargetID || 'N/A'),
          details: item.details || item.ActionDetails || item.Details || '',
          severity: item.severity || 'medium'
        }));

        setLogs(formattedLogs);
      })
      .catch((err: any) => {
        console.error("Lỗi kết nối API Audit Logs:", err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // 3. Hàm tìm kiếm an toàn: Đã thêm (?? "") để nếu dữ liệu bị null cũng KHÔNG bị crash sập trang
  const filteredLogs = logs.filter((log) => {
    const searchStr = searchQuery.toLowerCase();
    const matchesSearch =
      (log.admin ?? "").toLowerCase().includes(searchStr) ||
      (log.action ?? "").toLowerCase().includes(searchStr) ||
      (log.target ?? "").toLowerCase().includes(searchStr) ||
      (log.details ?? "").toLowerCase().includes(searchStr);

    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    if (!action) return FileText;
    if (action.includes('Delete')) return Trash2;
    if (action.includes('User') || action.includes('Banned')) return User;
    if (action.includes('Settings') || action.includes('Configuration')) return Settings;
    if (action.includes('Approved')) return Shield;
    return FileText;
  };

  const exportLogs = () => {
    console.log('Exporting logs...', filteredLogs);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Đang tải dữ liệu Audit Logs...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8" style={{ color: 'var(--green-medium)' }} />
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          </div>
          <p className="text-gray-600">Track all administrative actions and system events</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs by admin, action, or target..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Severity Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  aria-label="Select severity"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--green-medium)] focus:border-transparent appearance-none"
                >
                  <option value="all">All Severity</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <button
                onClick={exportLogs}
                className="px-4 py-3 bg-[var(--green-medium)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
            <div className="text-sm text-gray-600">Total Logs</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter((l) => l.severity === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Severity</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {logs.filter((l) => l.severity === 'medium').length}
            </div>
            <div className="text-sm text-gray-600">Medium Severity</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter((l) => l.severity === 'low').length}
            </div>
            <div className="text-sm text-gray-600">Low Severity</div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => {
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {/* Format lại ngày giờ từ SQL cho đẹp */}
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.admin}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{log.target}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md truncate">{log.details}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                          {log.severity.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No logs found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}