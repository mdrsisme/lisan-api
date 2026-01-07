export type DictCategoryType = 'alphabet' | 'word' | 'phrase';
export type DictItemType = 'flashcard' | 'gesture_test';

export interface UserDictionaryProgress {
  id: string;
  user_id: string;
  dictionary_id: string;
  total_items: number;
  completed_items: number;
  progress_percentage: number;
  is_completed: boolean;
  last_activity_at: string;
  updated_at: string;
}

export interface UserItemProgress {
  id: string;
  user_id: string;
  dictionary_item_id: string;
  status: string;
  attempts_count: number;
  last_practiced_at: string;
  created_at: string;
  updated_at: string;
}

export interface Dictionary {
  id: string;
  title: string;
  slug: string;
  category_type: DictCategoryType;
  description: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  order_index: number;
  created_at: Date;
  updated_at: Date;
  user_progress?: UserDictionaryProgress | null;
}

export interface DictionaryItem {
  id: string;
  dictionary_id: string;
  word: string;
  definition: string | null;
  video_url: string | null;
  image_url: string | null;
  item_type: DictItemType;
  target_gesture_data: string | null;
  order_index: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  is_learned?: boolean;
}