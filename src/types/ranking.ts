// src/types/ranking.ts
import { User } from './user';

export type RankingPeriod = 'all_time' | 'weekly' | 'monthly';

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