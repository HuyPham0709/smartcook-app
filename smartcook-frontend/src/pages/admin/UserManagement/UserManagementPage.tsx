// src/pages/admin/UserManagement/UserManagementPage.tsx
import React, { useState, useMemo } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { User } from '../../../types/admin';

// --- SUB-COMPONENTS ---
const UserSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4 p-4 border-b">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

const UserFilters = React.memo(({ 
  searchTerm, onSearchChange, limit, onLimitChange 
}: { 
  searchTerm: string; onSearchChange: (v: string) => void; 
  limit: number; onLimitChange: (v: number) => void;
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6 gap-4 border border-gray-100">
    <input
      type="text"
      placeholder="Tìm kiếm theo tên hoặc email..."
      className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
    />
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <span className="text-sm text-gray-600">Hiển thị:</span>
      <select
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  </div>
));

// --- MAIN PAGE COMPONENT ---
export default function UserManagementPage() {
  const {
    users, loading, pagination, searchTerm,
    setSearchTerm, setPagination, toggleUserStatus, deleteUser
  } = useUserManagement();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'delete' | 'status';
    user: User | null;
  }>({ isOpen: false, type: 'delete', user: null });

  const openModal = (type: 'delete' | 'status', user: User) => {
    setModalState({ isOpen: true, type, user });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: 'delete', user: null });
  };

  const handleConfirmAction = () => {
    const { type, user } = modalState;
    if (!user) return;

    if (type === 'delete') {
      deleteUser(user.id);
    } else if (type === 'status') {
      toggleUserStatus(user.id, user.status);
    }
    closeModal();
  };

  const modalConfig = useMemo(() => {
    if (modalState.type === 'delete') {
      return {
        title: 'Xác nhận xóa tài khoản',
        content: `Bạn có chắc chắn muốn xóa người dùng "${modalState.user?.fullName}"? Hành động này sẽ ẩn tài khoản khỏi hệ thống.`,
        btnText: 'Đồng ý xóa',
        btnColor: 'bg-red-600 hover:bg-red-700'
      };
    }
    const isBanning = modalState.user?.status === 'active';
    return {
      title: isBanning ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      content: isBanning 
        ? `Tài khoản "${modalState.user?.fullName}" sẽ bị khóa và không thể đăng nhập. Bạn có chắc chắn?` 
        : `Mở khóa cho tài khoản "${modalState.user?.fullName}"?`,
      btnText: isBanning ? 'Khóa tài khoản' : 'Mở khóa',
      btnColor: isBanning ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
    };
  }, [modalState]);

  // Hàm render Badge cho Role (Giả định ID: 1 là Admin, 2 là User)
  const renderRoleBadge = (roleId: number) => {
    switch(roleId) {
      case 1:
        return <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold">Admin</span>;
      case 2:
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">User</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">Guest</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý người dùng</h1>
          <p className="text-gray-500 mt-2 text-sm">Quản lý tài khoản, phân quyền và trạng thái hoạt động của hệ thống.</p>
        </div>

        {/* Filters */}
        <UserFilters 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          limit={pagination.limit}
          onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
        />

        {/* Table Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-4"><UserSkeleton /></div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Không tìm thấy người dùng nào phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-900 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Họ và tên</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Vai trò</th> {/* Đã thêm */}
                    <th className="px-6 py-4 font-medium">Trạng thái</th>
                    <th className="px-6 py-4 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{renderRoleBadge(user.roleId)}</td> {/* Đã thêm */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status === 'active' ? 'Hoạt động' : 'Đang khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-4">
                        
                        {/* Nút Khóa / Mở khóa (Đổi thành Icon Ổ khóa) */}
                        <button 
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                          onClick={() => openModal('status', user)}
                          className={`inline-block transition-transform hover:scale-110 ${
                            user.status === 'active' ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                          )}
                        </button>

                        {/* Nút Xóa (Đổi thành Icon Thùng rác) */}
                        <button 
                          title="Xóa người dùng"
                          onClick={() => openModal('delete', user)}
                          className="inline-block text-gray-400 hover:text-red-600 transition-all hover:scale-110"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <span className="text-sm text-gray-600">
              Trang <span className="font-semibold text-gray-900">{pagination.page}</span> / {pagination.totalPages} 
              <span className="ml-2 text-gray-400">({pagination.total} bản ghi)</span>
            </span>
            <div className="flex gap-2">
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Trước
              </button>
              <button 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {/* Reusable Confirmation Modal */}
        {modalState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{modalConfig.title}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {modalConfig.content}
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleConfirmAction}
                  className={`px-5 py-2.5 text-white rounded-lg font-medium transition-colors shadow-sm ${modalConfig.btnColor}`}
                >
                  {modalConfig.btnText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}