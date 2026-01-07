export interface DailyQuest {
  id: string;
  title: string;
  description: string | null;
  action_type: string;
  target_count: number;
  xp_reward: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  progress_count: number;
  is_completed: boolean;
  is_claimed: boolean;
  assigned_date: string;
  created_at: Date;
  updated_at: Date;
  quest?: DailyQuest;
}