// Interface cơ bản cho thông tin User chung (giữ nguyên của bạn)
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  avatarUrl?: string;
  createdAt?: string;
}

// --- THÊM CÁC INTERFACE DÀNH CHO TRANG PROFILE ---

export interface Author {
  name: string;
  avatar: string;
  isKOL: boolean;
}

export interface Post {
  id: number;
  title: string;
  image: string;
  prepTime: string;
  likes: number;
  comments: number;
  remixes: number;
  author: Author;
}

export interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
  color: string;
}

// Cập nhật lại UserProfile để hứng toàn bộ dữ liệu trả về từ backend /api/users/profile/:id
export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isKOL: boolean;
  stats: {
      recipes: number;
      followers: number;
      following: number;
      totalLikes: number;
  };
  badges: Badge[];
  myRecipes: Post[];
  savedRecipes: Post[];
}