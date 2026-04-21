import axiosClient from './axiosClient';

export const authApi = {
  login: (data: any) => axiosClient.post('/auth/login', data),
  register: (data: any) => axiosClient.post('/auth/register', data)
};