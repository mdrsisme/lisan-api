import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { DictionaryProgress, ItemProgress } from '../types/progress';

export const toggleItemProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { dictionary_item_id, is_completed } = req.body;

    if (!dictionary_item_id) return sendError(res, 'ID item wajib diisi', 400);

    const { data, error } = await supabase
      .from('user_item_progress')
      .upsert(
        { user_id: userId, dictionary_item_id, is_completed },
        { onConflict: 'user_id, dictionary_item_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Progress item berhasil diperbarui', data as ItemProgress);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui progress item', 500, error);
  }
};

export const getDictionaryProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { dictionaryId } = req.params;

    const { data, error } = await supabase
      .from('user_dictionary_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('dictionary_id', dictionaryId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return sendSuccess(res, 'Progress dictionary berhasil diambil', data || { progress_percentage: 0 });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil progress dictionary', 500, error);
  }
};

export const getAllProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { data, error } = await supabase
      .from('user_dictionary_progress')
      .select(`
        *,
        dictionaries (id, title, slug, thumbnail_url, difficulty)
      `)
      .eq('user_id', userId)
      .order('last_activity_at', { ascending: false });

    if (error) throw error;
    return sendSuccess(res, 'Seluruh progress berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data progress', 500, error);
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [dictRes, itemRes, progressRes] = await Promise.all([
      supabase.from('user_dictionary_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_completed', true),
      supabase.from('user_item_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_completed', true),
      supabase.from('user_dictionary_progress').select('progress_percentage').eq('user_id', userId)
    ]);

    const totalProgress = progressRes.data?.reduce((acc, curr) => acc + curr.progress_percentage, 0) || 0;
    const count = progressRes.data?.length || 0;
    const avgProgress = count > 0 ? Math.round(totalProgress / count) : 0;

    return sendSuccess(res, 'Statistik user berhasil diambil', {
      total_dictionaries_completed: dictRes.count || 0,
      total_items_learned: itemRes.count || 0,
      average_progress: avgProgress
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil statistik', 500, error);
  }
};

export const resetProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { dictionary_id } = req.body;

    const { data: items } = await supabase.from('dictionary_items').select('id').eq('dictionary_id', dictionary_id);
    
    if (items && items.length > 0) {
      const itemIds = items.map(i => i.id);
      await supabase.from('user_item_progress').delete().eq('user_id', userId).in('dictionary_item_id', itemIds);
    }

    await supabase.from('user_dictionary_progress').delete().eq('user_id', userId).eq('dictionary_id', dictionary_id);
    return sendSuccess(res, 'Progress berhasil direset');
  } catch (error: any) {
    return sendError(res, 'Gagal mereset progress', 500, error);
  }
};