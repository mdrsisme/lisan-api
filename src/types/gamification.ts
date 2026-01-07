import { User } from './user';

export type RankingPeriod = 'all_time' | 'weekly' | 'monthly';

export interface LevelBoundary {
  level: number;
  min_xp: number;
  title: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  period: RankingPeriod;
  xp_snapshot: number;
  level_snapshot: number;
  updated_at: string;
  users?: User; 
}

export interface FormattedRanking {
  rank: number;
  username?: string;
  full_name?: string;
  avatar_url?: string | null;
  xp: number;
  level: number;
}