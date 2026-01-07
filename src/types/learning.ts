export type QuizType = 'recognition' | 'production_camera' | 'flashcard';

export interface UserItemProgress {
  id: string;
  user_id: string;
  dictionary_item_id: string;
  is_completed: boolean;
  mastery_level: number;
  streak_count: number;
  last_reviewed_at: string | null;
  next_review_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserQuizLog {
  id: string;
  user_id: string;
  dictionary_item_id: string;
  type: QuizType;
  is_correct: boolean;
  ai_confidence_score: number | null;
  xp_earned: number;
  created_at: string;
}

export interface QuizSubmissionRequest {
  dictionary_item_id: string;
  quiz_type: QuizType;
  is_correct: boolean;
  ai_confidence_score?: number;
}

export interface QuizResultResponse {
  xp_earned: number;
  is_level_up: boolean;
  new_level: number;
  new_total_xp: number;
  item_progress: UserItemProgress;
}