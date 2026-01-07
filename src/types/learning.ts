export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type LearningStatus = 'new' | 'learning' | 'mastered';

export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  order_index: number;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignItem {
  id: string;
  category_id: string;
  word: string;
  definition: string | null;
  hint_text: string | null;
  video_url: string;
  image_url: string | null;
  difficulty: DifficultyLevel;
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  sign_item_id: string;
  status: LearningStatus;
  highest_accuracy: number;
  attempts_count: number;
  last_practiced_at: string;
  created_at: string;
  updated_at: string;
}

export type CreateCategoryPayload = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type CreateSignItemPayload = Omit<SignItem, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSignItemPayload = Partial<CreateSignItemPayload>;