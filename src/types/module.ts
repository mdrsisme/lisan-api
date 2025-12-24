import { Lesson } from './lesson';

export interface Module {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;

  lessons?: Lesson[];
}