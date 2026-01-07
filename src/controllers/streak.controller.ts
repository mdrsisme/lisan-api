import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getMyStreak = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.id;

    let { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!data && (!error || error.code === 'PGRST116')) {
        const { data: newData, error: newError } = await supabase
            .from('user_streaks')
            .insert({ user_id })
            .select()
            .single();
        
        if (newError) throw newError;
        data = newData;
    } else if (error) {
        throw error;
    }

    return sendSuccess(res, 'Streak data retrieved', data);
  } catch (error) {
    return sendError(res, 'Failed to get streak', 500, error);
  }
};

export const getStreakByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    // PERBAIKAN: Handle jika data tidak ditemukan (User belum punya history streak)
    if (error && error.code === 'PGRST116') {
        return sendSuccess(res, 'User streak retrieved (default)', {
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null,
            freeze_count: 0
        });
    }

    // Jika error lain (koneksi putus, dll), lempar error
    if (error) throw error;

    return sendSuccess(res, 'User streak retrieved', data);
  } catch (error) {
    return sendError(res, 'Failed to get user streak', 500, error);
  }
};

export const getStreakStats = async (req: Request, res: Response) => {
    try {
      const user_id = (req as any).user.id;
  
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user_id)
        .single();
  
      if (error) throw error;

      // Logic simulation for period stats based on available columns
      const stats = {
          day_streak: data.current_streak,
          week_streak_milestone: Math.floor(data.current_streak / 7),
          month_streak_milestone: Math.floor(data.current_streak / 30),
          longest_streak: data.longest_streak,
          last_active: data.last_activity_date,
          is_frozen: data.freeze_count > 0
      };
  
      return sendSuccess(res, 'Streak statistics retrieved', stats);
    } catch (error) {
      return sendError(res, 'Failed to get streak stats', 500, error);
    }
};

export const updateStreak = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.id;
    const today = new Date().toISOString().split('T')[0];

    let { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!streakData) {
      const { data: newData, error: insertError } = await supabase
        .from('user_streaks')
        .insert({ 
            user_id, 
            current_streak: 1, 
            longest_streak: 1, 
            last_activity_date: today 
        })
        .select().single();
        
      if (insertError) throw insertError;
      return sendSuccess(res, 'Streak started', newData);
    }

    const lastActive = streakData.last_activity_date;
    
    if (lastActive === today) {
        return sendSuccess(res, 'Streak already updated today', streakData);
    }

    const dateToday = new Date(today);
    const dateLast = new Date(lastActive);
    const diffTime = Math.abs(dateToday.getTime() - dateLast.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    let newStreak = streakData.current_streak;
    
    if (diffDays === 1) {
        newStreak += 1;
    } else {
        if (streakData.freeze_count > 0) {
             const { data: frozenData } = await supabase
                .from('user_streaks')
                .update({ 
                    freeze_count: streakData.freeze_count - 1,
                    last_activity_date: today,
                    updated_at: new Date()
                })
                .eq('id', streakData.id)
                .select().single();
             return sendSuccess(res, 'Streak frozen used', frozenData);
        }
        newStreak = 1;
    }

    const newLongest = Math.max(newStreak, streakData.longest_streak);

    const { data: updatedData, error } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        updated_at: new Date()
      })
      .eq('id', streakData.id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Streak updated', updatedData);
  } catch (error) {
    return sendError(res, 'Failed to update streak', 500, error);
  }
};

export const resetStreak = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user.id;
        
        const { data, error } = await supabase
            .from('user_streaks')
            .update({
                current_streak: 0,
                last_activity_date: null,
                updated_at: new Date()
            })
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) throw error;
        return sendSuccess(res, 'Streak reset successfully', data);
    } catch (error) {
        return sendError(res, 'Failed to reset streak', 500, error);
    }
};