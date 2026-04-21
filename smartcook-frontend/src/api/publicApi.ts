import axiosClient from './axiosClient';

export const publicApi = {
  getTrendingRecipes: () => axiosClient.get('/users') // Tùy chỉnh endpoint theo backend của bạn
};