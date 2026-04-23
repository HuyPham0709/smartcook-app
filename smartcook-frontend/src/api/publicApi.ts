import axiosClient from './axiosClient';
import { UserProfile } from '../types/user';

export const publicApi = {
  getTrendingRecipes: () => axiosClient.get('/users'), 

  // ĐÃ SỬA LẠI ĐỂ KHỚP VỚI INTERCEPTOR CỦA AXIOSCLIENT
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response: any = await axiosClient.get(`/users/profile/${userId}`);
    
    // Nếu axiosClient đã tự động bóc tách data, ta trả về thẳng response
    // Ngược lại nếu chưa bóc tách, ta trả về response.data
    return response.data !== undefined ? response.data : response;
  }
};