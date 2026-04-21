import { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, Trash2, Mail } from 'lucide-react';
import { adminApi } from '../../api/adminApi';

// Cập nhật Interface để khớp với dữ liệu từ SQL Server
export interface User {
  _id?: string | number;
  ID?: number;
  username?: string;
  FullName?: string;
  email?: string;
  Email?: string;
  role?: 'admin' | 'user';
  RoleID?: number;
  status?: 'active' | 'suspended';
  BanUntil?: string | null;
  createdAt?: string;
  CreatedAt?: string;
  active?: number; // Thêm trường active cho logic xóa mềm
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch dữ liệu người dùng
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      
      let fetchedUsers: User[] = [];
      if (Array.isArray(data)) {
        fetchedUsers = data;
      } else if (data && Array.isArray(data.recordset)) {
        fetchedUsers = data.recordset;
      } else if (data && Array.isArray(data.data)) {
        fetchedUsers = data.data;
      } else if (data && Array.isArray(data.users)) {
        fetchedUsers = data.users;
      } else {
        console.warn("Dữ liệu API không đúng định dạng mảng:", data);
      }

      // Ẩn đi các user đã bị xóa (active = 0) ngay khi tải dữ liệu
      setUsers(fetchedUsers.filter(u => u.active !== 0));

    } catch (err: any) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Lọc người dùng (Bao hàm cả key của React và SQL)
  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter((user) => {
    const name = user.username || user.FullName || '';
    const mail = user.email || user.Email || '';
    const search = (searchTerm || '').toLowerCase();
    
    return name.toLowerCase().includes(search) || mail.toLowerCase().includes(search);
  });

  // HÀM 1: CẬP NHẬT TRẠNG THÁI (FIX LỖI 400 BAD REQUEST)
  const handleToggleStatus = async (userId: string | number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      // FIX LỖI 400: Gói dữ liệu vào một Object thay vì truyền chuỗi
      // Tùy theo việc Backend của bạn bắt field `status` hay `BanUntil`
      const payload = { 
        status: newStatus,
        BanUntil: newStatus === 'suspended' ? '2099-12-31T23:59:59' : null 
      };

      // Ép kiểu (any) để tránh lỗi TS nếu adminApi.ts đang khai báo kiểu khác
      await adminApi.updateUserStatus(userId.toString(), payload as any);
      
      // Cập nhật lại UI sau khi đổi trạng thái thành công
      setUsers(users.map(u => (u._id || u.ID) === userId ? { ...u, status: newStatus as any, BanUntil: payload.BanUntil } : u));
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái người dùng:", err);
    }
  };

  // HÀM 2: XÓA NGƯỜI DÙNG (CẬP NHẬT ACTIVE = 0)
  const handleDeleteUser = async (userId: string | number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      // Gửi Object chứa active: 0 lên Backend
      const payload = { active: 0 };
      await adminApi.updateUserStatus(userId.toString(), payload as any);
      
      // Xóa thành công thì lọc bỏ người dùng đó khỏi danh sách hiển thị
      setUsers(users.filter(u => u._id !== userId && u.ID !== userId));
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xl">Đang tải danh sách người dùng...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full md:w-80 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => {
                    // Ánh xạ dữ liệu từ SQL sang UI
                    const userId = user._id || user.ID || idx;
                    const displayName = user.username || user.FullName || 'Unknown User';
                    const displayEmail = user.email || user.Email || 'No email';
                    const joinDate = user.createdAt || user.CreatedAt;
                    
                    // Phân loại Role dựa trên RoleID của SQL (1: Admin, 2: Mod, 3: User, 4: KOL)
                    const roleId = user.RoleID;
                    const displayRole = user.role || (roleId === 1 ? 'admin' : roleId === 2 ? 'moderator' : roleId === 4 ? 'kol' : 'user');
                    
                    // Tính toán Status: Nếu BanUntil lớn hơn hiện tại => Bị khóa
                    const isSuspended = (user.BanUntil && new Date(user.BanUntil) > new Date());
                    const displayStatus = user.status || (isSuspended ? 'suspended' : 'active');

                    return (
                      <tr key={userId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{displayName}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {displayEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            displayRole === 'admin' ? 'bg-purple-100 text-purple-700' : 
                            displayRole === 'moderator' ? 'bg-orange-100 text-orange-700' :
                            displayRole === 'kol' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {displayRole}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center w-max gap-1 ${
                            displayStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {displayStatus === 'active' ? <CheckCircle className="w-3 h-3"/> : <Ban className="w-3 h-3"/>}
                            {displayStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {joinDate ? new Date(joinDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end items-center gap-3">
                            {/* NÚT ĐỔI TRẠNG THÁI */}
                            <button 
                              onClick={() => handleToggleStatus(userId, displayStatus)}
                              className="text-gray-500 hover:text-blue-600 transition-colors"
                              title={displayStatus === 'active' ? 'Suspend User' : 'Activate User'}
                            >
                              {displayStatus === 'active' ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                            </button>

                            {/* NÚT XÓA */}
                            <button 
                              onClick={() => handleDeleteUser(userId)}
                              className="text-gray-500 hover:text-red-600 transition-colors" 
                              title="Delete User"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}