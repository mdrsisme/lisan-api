export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AchievementCategory = 'streak' | 'learning' | 'community' | 'collection';

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_url: string | null;
  category: AchievementCategory;
  xp_reward: number;
  target_value: number;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}