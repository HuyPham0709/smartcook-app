import axiosClient from './axiosClient';
import { CreateRecipePayload } from '../types';

export const recipeApi = {
  createRecipe: (data: CreateRecipePayload) => {
    return axiosClient.post('/recipes', data);
  },
 getRecipeDetails: (id: string, userId?: number) => {
    const query = userId ? `?userId=${userId}` : '';
    return axiosClient.get(`/recipes/${id}${query}`);
  },
};
