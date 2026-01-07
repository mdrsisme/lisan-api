import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { LeaderboardEntry, Level } from '../types/leaderboard';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('leaderboards')
      .select(`
        id,
        xp_snapshot,
        level_snapshot,
        updated_at,
        user:users (
          full_name,
          username,
          avatar_url
        )
      `)
      .order('xp_snapshot', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;

    // Casting ke type LeaderboardEntry[]
    const leaderboardData = data as unknown as LeaderboardEntry[];

    return sendSuccess(res, 'Leaderboard berhasil diambil', leaderboardData);
  } catch (error) {
    return sendError(res, 'Gagal mengambil leaderboard', 500, error);
  }
};

export const getLevels = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('levels')
      .select('*')
      .order('level', { ascending: true });

    if (error) throw error;

    const levelsData = data as Level[];

    return sendSuccess(res, 'Data level berhasil diambil', levelsData);
  } catch (error) {
    return sendError(res, 'Gagal mengambil data level', 500, error);
  }
};