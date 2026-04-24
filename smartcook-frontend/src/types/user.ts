
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  avatarUrl?: string;
  createdAt?: string;
}

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
export interface BannedErrorDetails {
    reason: string;
    bannedUntil: string | null;
    remainingTime: string; // <-- Thêm dòng này
}

export interface BannedErrorResponse {
    success: boolean;
    code: string; // Thường là "USER_BANNED"
    message: string;
    details: BannedErrorDetails;
}