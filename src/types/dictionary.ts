export type DictionaryStatus = 'draft' | 'published' | 'archived';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ItemType = 'word' | 'phrase' | 'number' | 'alphabet';

export interface Dictionary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  status: DictionaryStatus;
  difficulty: DifficultyLevel;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface DictionaryItem {
  id: string;
  dictionary_id: string;
  word: string;
  slug: string;
  definition: string | null;
  video_url: string;
  image_url: string | null;
  type: ItemType;
  order_index: number;
  created_at: string;
  updated_at: string;
}