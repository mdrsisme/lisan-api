import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('view_leaderboard_global')
      .select('*');

    if (error) throw error;
    return sendSuccess(res, 'Global leaderboard fetched successfully', {
      period: 'all_time',
      entries: data
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch global leaderboard', 500, error.message);
  }
};

export const getStreakLeaderboard = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('view_leaderboard_streak')
      .select('*');

    if (error) throw error;
    return sendSuccess(res, 'Streak leaderboard fetched successfully', {
      period: 'current_streak',
      entries: data
    });
  } catch (error: any) {
    return sendError(res, 'Failed to fetch streak leaderboard', 500, error.message);
  }
};