export type FeedbackType = 'bug' | 'content_issue' | 'suggestion' | 'other';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'rejected';

export interface Feedback {
  id: string;
  user_id: string | null;
  type: FeedbackType;
  message: string;
  screenshot_url: string | null;
  app_version: string | null;
  device_info: string | null;
  status: FeedbackStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}