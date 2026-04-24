import axiosClient from './axiosClient';
import { CreateRecipePayload } from '../types';

export const recipeApi = {
  createRecipe: (data: CreateRecipePayload) => {
    return axiosClient.post('/recipes', data);
  },
};