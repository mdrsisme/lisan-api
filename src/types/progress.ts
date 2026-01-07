export interface DictionaryProgress {
  id: string;
  user_id: string;
  dictionary_id: string;
  progress_percentage: number;
  is_completed: boolean;
  completed_at?: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface ItemProgress {
  id: string;
  user_id: string;
  dictionary_item_id: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgressStats {
  total_dictionaries_completed: number;
  total_items_learned: number;
  average_progress: number;
}