import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { CreateAiModelDto, UpdateAiModelDto } from '../types/aiModel';

export const getAllAiModels = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ai_models')
      .select(`
        *,
        dictionary_items (
          id,
          word
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 'AI models retrieved successfully', data);
  } catch (error) {
    return sendError(res, 'Failed to retrieve AI models', 500, error);
  }
};

export const getAiModelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('ai_models')
      .select(`
        *,
        dictionary_items (
          id,
          word
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return sendSuccess(res, 'AI model retrieved successfully', data);
  } catch (error) {
    return sendError(res, 'Failed to retrieve AI model', 500, error);
  }
};

export const createAiModel = async (req: Request, res: Response) => {
  try {
    const { model_url, config } = req.body as CreateAiModelDto;

    const { data, error } = await supabase
      .from('ai_models')
      .insert({
        model_url,
        config: config || {},
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'AI model created successfully', data);
  } catch (error) {
    return sendError(res, 'Failed to create AI model', 500, error);
  }
};

export const updateAiModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { model_url, config } = req.body as UpdateAiModelDto;

    const updates: any = { updated_at: new Date() };
    if (model_url) updates.model_url = model_url;
    if (config) updates.config = config;

    const { data, error } = await supabase
      .from('ai_models')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'AI model updated successfully', data);
  } catch (error) {
    return sendError(res, 'Failed to update AI model', 500, error);
  }
};

export const deleteAiModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { count } = await supabase
        .from('dictionary_items')
        .select('*', { count: 'exact', head: true })
        .eq('ai_model_id', id);

    if (count && count > 0) {
        return sendError(res, 'Model is being used by dictionary items', 400);
    }

    const { error } = await supabase
      .from('ai_models')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'AI model deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete AI model', 500, error);
  }
};