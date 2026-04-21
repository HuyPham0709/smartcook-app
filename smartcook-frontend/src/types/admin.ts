// Định nghĩa cho AuditLog
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// Định nghĩa cho Moderation
export interface FlaggedPost {
  id: string;
  postId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
}