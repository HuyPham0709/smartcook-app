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
  }
};