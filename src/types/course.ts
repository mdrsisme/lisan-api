import { Module } from './module'; 

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  level: CourseLevel;
  is_published: boolean;
  access_key: string | null;  
  created_at: string;
  updated_at: string;
  modules?: Module[];
}