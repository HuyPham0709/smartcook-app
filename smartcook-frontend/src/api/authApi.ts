// src/api/authApi.ts
import axiosClient from './axiosClient';
import { UserProfile } from '../types/user';

export const authApi = {
  login: (data: any) => axiosClient.post('/auth/login', data),
  register: (data: any) => axiosClient.post('/auth/register', data),
  
  // SỬA TẠI ĐÂY: Bỏ '/api' ở đầu
 getProfile: async (): Promise<UserProfile> => {
  const response = await axiosClient.get('/users/profile');
  return (response as any).data || response;
},

  logout: () => axiosClient.post('/auth/logout')
};
