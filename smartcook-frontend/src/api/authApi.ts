// src/api/authApi.ts
import axiosClient from './axiosClient';
import { UserProfile } from '../types/user';

export const authApi = {
  login: (data: any) => axiosClient.post('/auth/login', data),
  register: (data: any) => axiosClient.post('/auth/register', data),
  
  // SỬA TẠI ĐÂY: Bỏ '/api' ở đầu
 getProfile: async (): Promise<UserProfile> => {
  const response = await axiosClient.get('/users/profile');
  // Log thử ở đây để xem cấu trúc thật của response
  console.log("Full Axios Response:", response); 
  
  // Nếu response đã là data (do interceptor), return nó. 
  // Nếu chưa, return response.data
  return (response as any).data || response;
},

  logout: () => axiosClient.post('/auth/logout')
};
