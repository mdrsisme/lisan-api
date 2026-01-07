export interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateAnnouncementPayload {
  title?: string;
  content?: string;
  is_active?: boolean;
}