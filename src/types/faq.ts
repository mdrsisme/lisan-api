export type FaqCategory = 'general' | 'account' | 'subscription' | 'technical' | 'learning';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFaqPayload {
  question: string;
  answer: string;
  category?: FaqCategory;
  is_active?: boolean;
}

export interface UpdateFaqPayload {
  question?: string;
  answer?: string;
  category?: FaqCategory;
  is_active?: boolean;
}