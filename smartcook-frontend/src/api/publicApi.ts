import axiosClient from './axiosClient';
import { UserProfile } from '../types/user';

export const publicApi = {
  getTrendingRecipes: () => axiosClient.get('/recipes'), 

  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response: any = await axiosClient.get(`/users/profile/${userId}`);
    return response.data !== undefined ? response.data : response;
  }
};