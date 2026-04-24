
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface FlaggedPost {
  id: string;
  postId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  banUntil: string | null;
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface GetUsersResponse {
  data: User[];
  total: number; 
  page: number; 
  totalPages: number;  
}