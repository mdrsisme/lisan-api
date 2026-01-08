export interface AiModel {
  id: string;
  model_url: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
  dictionary_items?: {
    id: string;
    word: string;
  }[];
}

export interface CreateAiModelDto {
  model_url: string;
  config?: Record<string, any>;
}

export interface UpdateAiModelDto {
  model_url?: string;
  config?: Record<string, any>;
}