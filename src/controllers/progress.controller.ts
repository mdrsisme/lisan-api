import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const { data: progressData, error: progressError } = await supabase
      .from('user_dictionary_progress')
      .select('is_completed, completed_items')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    const totalDictionariesCompleted = progressData.filter(p => p.is_completed).length;
    const totalWordsLearned = progressData.reduce((sum, p) => sum + p.completed_items, 0);

    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .single();

    return sendSuccess(res, 'Dashboard summary retrieved', {
      user: {
        xp: userData.xp,
        level: userData.level
      },
      learning: {
        words_learned: totalWordsLearned,
        dictionaries_completed: totalDictionariesCompleted,
        current_streak: streakData?.current_streak || 0,
        longest_streak: streakData?.longest_streak || 0
      }
    });

  } catch (error) {
    return sendError(res, 'Failed to get dashboard summary', 500, error);
  }
};

export const getAllLearningProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data, error } = await supabase
      .from('user_dictionary_progress')
      .select(`
        id,
        progress_percentage,
        is_completed,
        completed_items,
        total_items,
        last_activity_at,
        dictionary:dictionaries (
          id,
          title,
          slug,
          thumbnail_url,
          category_type
        )
      `)
      .eq('user_id', userId)
      .order('last_activity_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 'Learning progress list retrieved', data);
  } catch (error) {
    return sendError(res, 'Failed to get learning progress', 500, error);
  }
};

export const getProgressByDictionaryId = async (req: Request, res: Response) => {
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

    return sendSuccess(res, 'Specific dictionary progress retrieved', data || null);
  } catch (error) {
    return sendError(res, 'Failed to get dictionary progress', 500, error);
  }
};

export const createOrUpdateProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { dictionary_id, completed_items, total_items } = req.body;

    const percentage = (completed_items / total_items) * 100;
    const is_completed = percentage >= 100;

    const { data, error } = await supabase
      .from('user_dictionary_progress')
      .upsert({
        user_id: userId,
        dictionary_id,
        completed_items,
        total_items,
        progress_percentage: percentage,
        is_completed,
        last_activity_at: new Date()
      }, { onConflict: 'user_id, dictionary_id' })
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Progress updated successfully', data);
  } catch (error) {
    return sendError(res, 'Failed to update progress', 500, error);
  }
};

export const deleteProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { dictionaryId } = req.params;

    // 1. Delete dictionary progress
    const { error: dictError } = await supabase
      .from('user_dictionary_progress')
      .delete()
      .eq('user_id', userId)
      .eq('dictionary_id', dictionaryId);

    if (dictError) throw dictError;

    // 2. Delete related items progress (Reset items)
    const { data: dictItems } = await supabase
      .from('dictionary_items')
      .select('id')
      .eq('dictionary_id', dictionaryId);

    if (dictItems && dictItems.length > 0) {
        const itemIds = dictItems.map(i => i.id);
        await supabase
            .from('user_item_progress')
            .delete()
            .eq('user_id', userId)
            .in('dictionary_item_id', itemIds);
    }

    return sendSuccess(res, 'Progress reset successfully');
  } catch (error) {
    return sendError(res, 'Failed to reset progress', 500, error);
  }
};