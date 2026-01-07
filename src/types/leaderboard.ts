export interface Level {
  level: number;
  xp_required: number;
  title: string | null;
  created_at: Date;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  xp_snapshot: number;
  level_snapshot: number;
  updated_at: Date;
  rank?: number;
  user?: {
    full_name: string;
    username: string | null;
    avatar_url: string | null;
  };
}