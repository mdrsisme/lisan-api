import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const createStreak = async (req: Request, res: Response) => {
  try {
    const { user_id, current_streak, longest_streak, last_activity_at } = req.body;

    const { data, error } = await supabase
      .from('user_streaks')
      .insert({ user_id, current_streak, longest_streak, last_activity_at })
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Streak berhasil dibuat manual', data, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat streak', 500, error.message);
  }
};

export const getAllStreaks = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, count, error } = await supabase
      .from('user_streaks')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (error) throw error;
    return sendSuccess(res, 'Data semua streak berhasil diambil', { data, count });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data streak', 500, error.message);
  }
};

export const getUserStreak = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const streakData = data || {
        user_id,
        current_streak: 0,
        longest_streak: 0,
        last_activity_at: null
    };

    return sendSuccess(res, 'Data streak user berhasil diambil', streakData);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data streak user', 500, error.message);
  }
};

export const updateStreak = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { current_streak, longest_streak, last_activity_at } = req.body;

    const { data, error } = await supabase
      .from('user_streaks')
      .update({ current_streak, longest_streak, last_activity_at })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Streak berhasil diperbarui', data);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui streak', 500, error.message);
  }
};

export const deleteStreak = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('user_streaks').delete().eq('id', id);

    if (error) throw error;
    return sendSuccess(res, 'Streak berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus streak', 500, error.message);
  }
};