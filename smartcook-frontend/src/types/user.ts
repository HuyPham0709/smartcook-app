export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  avatarUrl?: string;
  createdAt?: string;
}