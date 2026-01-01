export type AchievementCategory = 'streak' | 'learning' | 'community' | 'collection' | 'level';

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_url: string | null;
  category: AchievementCategory;
  xp_reward: number;
  target_value: number; // Misal: 7 (untuk streak 7 hari) atau 1000 (untuk 1000 XP)
  type: 'XP_REACHED' | 'LEVEL_REACHED' | 'STREAK_REACHED' | 'MANUAL'; // [BARU] Penting untuk logika otomatis
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement; // Untuk join
}