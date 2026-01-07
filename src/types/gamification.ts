export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  current_streak: number;
}

export interface LeaderboardResponse {
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  user_rank?: LeaderboardEntry;
}

export interface StreakUpdateResponse {
  success: boolean;
  current_streak: number;
  message: string;
}