export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: 'COMPANY' | 'CANDIDATE';
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  candidate?: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  company?: { id: string; name: string; logoUrl?: string };
}

export interface Session {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
}
