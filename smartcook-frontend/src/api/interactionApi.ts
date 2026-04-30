import axiosClient from './axiosClient';
import { CommentPayload, RatingPayload } from '../types/recipe';

export const interactionApi = {
  toggleLike: (recipeId: number | string) => {
    return axiosClient.post(`/interactions/${recipeId}/like`);
  },

  addComment: (recipeId: number | string, data: CommentPayload) => {
    return axiosClient.post(`/interactions/${recipeId}/comment`, data);
  },

  addRating: (recipeId: number | string, data: RatingPayload) => {
    return axiosClient.post(`/interactions/${recipeId}/rating`, data);
  },
  
  // Hỗ trợ truyền phân trang
  getNotifications: (page: number = 1, limit: number = 10) => {
    return axiosClient.get(`/interactions/notifications?page=${page}&limit=${limit}`);
  },
  
  markAsRead: () => {
      return axiosClient.put('/interactions/notifications/mark-read');
  }
};