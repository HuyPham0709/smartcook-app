import axiosClient from './axiosClient';
import { GetUsersResponse } from '../types/admin';

export const adminApi = {
  getDashboardStats: (range: string) => axiosClient.get(`/admin/dashboard?range=${range}`),
  getAuditLogs: () => axiosClient.get('/admin/audit-logs'),
  getModerationPosts: () => axiosClient.get('/admin/moderation'),
  handleModerationAction: (payload: any) => axiosClient.post('/admin/moderation/action', payload),
  handleBulkModeration: (payload: any) => axiosClient.post('/admin/moderation/bulk', payload),
  
  getAllUsers: async (params: { page: number; limit: number; search: string }): Promise<GetUsersResponse> => {
    const response = await axiosClient.get('/admin/users', { params });
    // Sửa ở đây: Trả về trực tiếp response (vì axiosClient đã bóc response.data rồi)
    return response as unknown as GetUsersResponse; 
  },

  updateUserInfo: async (id: number, payload: { status?: 'active' | 'suspended'; active?: 0 | 1 }): Promise<{ message: string }> => {
    const response = await axiosClient.put(`/admin/users/${id}`, payload);
    // Sửa ở đây: Bỏ .data
    return response as unknown as { message: string }; 
  }
};