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

    return sendSuccess(res, 'Dashboard summary berhasil diambil', {
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
    return sendError(res, 'Gagal mengambil summary dashboard', 500, error);
  }
};

export const getMyLearningProgress = async (req: Request, res: Response) => {
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

    return sendSuccess(res, 'Data progress belajar berhasil diambil', data);
  } catch (error) {
    return sendError(res, 'Gagal mengambil data progress', 500, error);
  }
};