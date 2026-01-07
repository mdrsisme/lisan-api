export type AppRole = 'user' | 'admin';
export type TokenType = 'email_verification' | 'password_reset' | 'refresh_token';

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
  created_at: Date;
  updated_at: Date;
}

export interface Token {
  id: string;
  user_id: string;
  token: string;
  type: TokenType;
  is_used: boolean;
  expires_at: Date;
  created_at: Date;
}