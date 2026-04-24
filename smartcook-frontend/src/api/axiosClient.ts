import axios, { AxiosError } from 'axios';
import { toast } from 'sonner'; // Cần import sonner
import { BannedErrorResponse } from '../types/user'; // Chú ý đường dẫn tương đối trỏ về file user.ts

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Giữ nguyên cấu hình cũ của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // Tự động gắn token nếu có (Logic cũ)
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    
    // Xử lý 401 (Hết hạn Token)
    if (error.response?.status === 401) {
      console.warn("Phiên đăng nhập hết hạn.");
    }

    // Xử lý 403 Banned
    if (error.response?.status === 403) {
      const data = error.response.data as any; // Dùng as any hoặc BannedErrorResponse
      
      if (data?.code === 'USER_BANNED') {
        // 1. Xóa session
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user'); 

        // 2. CHỈ RELOAD TRANG NẾU KHÔNG PHẢI LÀ TRANG LOGIN
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        // Nếu ĐANG ở trang login, nó sẽ không làm gì cả và đẩy lỗi tiếp về cho LoginPage.tsx tự in ra màn hình
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;