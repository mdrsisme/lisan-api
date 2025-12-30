import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { RankingPeriod } from '../types/ranking';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as RankingPeriod) || 'all_time';
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('leaderboards')
      .select(`
        id,
        xp_snapshot,
        level_snapshot,
        period,
        users (
          username,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('period', period)
      .order('xp_snapshot', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formattedData = data?.map((entry: any, index: number) => ({
      rank: from + index + 1,
      username: entry.users?.username,
      full_name: entry.users?.full_name,
      avatar_url: entry.users?.avatar_url,
      xp: entry.xp_snapshot,
      level: entry.level_snapshot
    }));

    return sendSuccess(res, 'Data leaderboard berhasil diambil', {
      period,
      page,
      limit,
      total_records: count,
      leaderboard: formattedData
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil leaderboard', 500, error);
  }
};