export type LessonType = 'video' | 'text' | 'camera_practice';

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string | null;
  
  // Fitur khusus AI
  type: LessonType;
  target_gesture: string | null; // Contoh: 'A', 'B', 'HELLO'
  
  content_url: string | null; // URL Video / PDF
  order_index: number;
  xp_reward: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}