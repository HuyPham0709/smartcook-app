import axiosClient from './axiosClient';

export const adminApi = {
  getDashboardStats: (range: string) => axiosClient.get(`/admin/dashboard?range=${range}`),
  getAuditLogs: () => axiosClient.get('/admin/audit-logs'),
  getModerationPosts: () => axiosClient.get('/admin/moderation'),
  handleModerationAction: (payload: any) => axiosClient.post('/admin/moderation/action', payload),
  handleBulkModeration: (payload: any) => axiosClient.post('/admin/moderation/bulk', payload),
  getAllUsers: () => {
    return axiosClient.get('/admin/users');
  },
  // Sửa lại: Gửi PATCH trực tiếp đến /users/:id
  updateUserStatus: (userId: string, data: any) => {
    return axiosClient.patch(`/admin/users/${userId}`, data);
  },
  // Xóa thực chất là update field active/status
  deleteUser: (userId: string) => {
    return axiosClient.patch(`/admin/users/${userId}`, { active: 0 });
  }
};
