import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { FormattedRanking, LevelBoundary, UserStreak } from '../types/gamification';

// --- LEVEL BOUNDARIES ---

export const getLevelBoundaries = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('level_boundaries')
      .select('*')
      .order('level', { ascending: true });

    if (error) throw error;
    return sendSuccess(res, 'Data level boundaries berhasil diambil', data as LevelBoundary[]);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data level', 500, error.message);
  }
};

// --- LEADERBOARD (FIXED COLUMN NAMES) ---

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // [FIX] Menggunakan kolom 'xp' dan 'level' sesuai database Anda
    const { data, error, count } = await supabase
      .from('users')
      .select('id, full_name, username, avatar_url, xp, level', { count: 'exact' })
      .order('xp', { ascending: false }) // Urutkan berdasarkan xp
      .range(from, to);

    if (error) throw error;

    const leaderboard: FormattedRanking[] = (data || []).map((user: any, index: number) => ({
      rank: from + index + 1,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      xp: user.xp || 0,     // Mapping dari kolom xp
      level: user.level || 1 // Mapping dari kolom level
    }));

    return sendSuccess(res, 'Data leaderboard berhasil diambil', {
      page,
      limit,
      total_records: count,
      leaderboard
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil leaderboard', 500, error.message);
  }
};

// --- STREAK MANAGEMENT ---

export const createStreak = async (req: Request, res: Response) => {
  try {
    const { user_id, current_streak, longest_streak, last_activity_at } = req.body;

    const { data, error } = await supabase
      .from('user_streaks')
      .insert({ 
        user_id, 
        current_streak: current_streak || 0, 
        longest_streak: longest_streak || 0, 
        last_activity_at 
      })
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Streak berhasil dibuat manual', data as UserStreak, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat streak', 500, error.message);
  }
};

export const getAllStreaks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from('user_streaks')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (error) throw error;
    return sendSuccess(res, 'Data semua streak berhasil diambil', { 
      data: data as UserStreak[], 
      count 
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data streak', 500, error.message);
  }
};

export const getUserStreak = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; 

    const result = data || { 
      user_id: userId,
      current_streak: 0, 
      longest_streak: 0, 
      last_activity_at: null 
    };

    return sendSuccess(res, 'Data streak user berhasil diambil', result as UserStreak);
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
    return sendSuccess(res, 'Streak berhasil diperbarui', data as UserStreak);
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