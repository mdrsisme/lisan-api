export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;

  // Optional: Untuk join query
  courses?: any; 
  users?: any;
}