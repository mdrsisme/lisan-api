export type AppRole = 'user' | 'admin';
export type TokenType = 'refresh' | 'verification' | 'password_reset';

export interface User {
  id: string;
  full_name: string;
  username: string | null;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  is_verified: boolean;
  is_premium: boolean;
  role: AppRole;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Token {
  id: string;
  user_id: string;
  token: string;
  type: TokenType;
  is_used: boolean;
  expires_at: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  refresh_token: string;
  user_agent: string | null;
  ip_address: string | null;
  is_valid: boolean;
  expires_at: string;
  created_at: string;
}

export interface AuthPayload {
  id: string;
  email: string;
  role: AppRole;
}