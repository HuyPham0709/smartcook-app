// src/hooks/useUserManagement.ts
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';
import { User, PaginationData } from '../types/admin';
import toast from 'react-hot-toast';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // 1. Logic Debounce cho Search (Delay 500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      // Reset về trang 1 khi từ khóa tìm kiếm thay đổi
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Fetch Users (Dùng useCallback để tránh re-create function)
  // src/hooks/useUserManagement.ts (Chỉ sửa phần fetchUsers)

// src/hooks/useUserManagement.ts (Chỉ sửa phần fetchUsers)

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
      });
      
      // Sửa ở đây: Đảm bảo setUsers luôn nhận vào một mảng (nếu undefined thì gán mảng rỗng)
      setUsers(response.data || []);
      
      // Sửa ở đây: Lấy trực tiếp object pagination từ backend
      if (response.pagination) {
        setPagination(response.pagination);
      }

    } catch (error) {
      toast.error('Không thể tải danh sách người dùng. Vui lòng thử lại!');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch]);

  // Trigger fetch khi dependencies thay đổi
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 3. Logic thay đổi trạng thái (Ban/Unban)
  const toggleUserStatus = async (id: number, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminApi.updateUserInfo(id, { status: newStatus });
      toast.success(`Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản thành công!`);
      await fetchUsers(); // Re-fetch để lấy thông tin banUntil mới nhất từ DB
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };

  // 4. Logic Xóa mềm (Soft delete)
  const deleteUser = async (id: number) => {
    try {
      await adminApi.updateUserInfo(id, { active: 0 });
      toast.success('Đã xóa người dùng khỏi hệ thống!');
      
      // Nếu xóa user cuối cùng của trang hiện tại, lùi về trang trước đó
      if (users.length === 1 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        await fetchUsers();
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa người dùng.');
    }
  };

  return {
    users,
    loading,
    pagination,
    searchTerm,
    setSearchTerm,
    setPagination,
    toggleUserStatus,
    deleteUser,
  };
};