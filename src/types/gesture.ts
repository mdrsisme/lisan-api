export interface GestureLog {
  id: string;
  user_id: string;
  dictionary_item_id: string | null;
  detected_label: string | null;
  expected_label: string | null;
  accuracy_score: number | null;
  device_info: string | null;
  created_at: Date;
}