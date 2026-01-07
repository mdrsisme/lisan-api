import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { UserProgress } from '../types/learning';

export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        sign_items ( word, difficulty, xp_reward )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return sendSuccess(res, 'User progress fetched successfully', data);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch user progress', 500, error.message);
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { user_id, sign_item_id, accuracy } = req.body;

    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user_id)
      .eq('sign_item_id', sign_item_id)
      .single();

    let result;
    const isMastered = accuracy >= 85;
    const newStatus = isMastered ? 'mastered' : 'learning';
    const timestamp = new Date().toISOString();

    if (existing) {
      const bestAccuracy = Math.max(existing.highest_accuracy, accuracy);
      const { data, error } = await supabase
        .from('user_progress')
        .update({
          highest_accuracy: bestAccuracy,
          attempts_count: existing.attempts_count + 1,
          status: existing.status === 'mastered' ? 'mastered' : newStatus,
          last_practiced_at: timestamp
        })
        .eq('id', existing.id)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('user_progress')
        .insert([{
          user_id,
          sign_item_id,
          highest_accuracy: accuracy,
          attempts_count: 1,
          status: newStatus,
          last_practiced_at: timestamp
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    if (isMastered && (!existing || existing.status !== 'mastered')) {
      const { data: itemData } = await supabase
        .from('sign_items')
        .select('xp_reward')
        .eq('id', sign_item_id)
        .single();
        
      if (itemData) {
        await supabase.rpc('increment_user_xp', { 
          user_uuid: user_id, 
          amount: itemData.xp_reward 
        });
      }
    }

    return sendSuccess(res, 'Progress updated successfully', result);
  } catch (error: any) {
    return sendError(res, 'Failed to update progress', 500, error.message);
  }
};

export const updateStreak = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const { data, error } = await supabase
      .rpc('update_daily_streak', { user_uuid: userId });

    if (error) throw error;
    return sendSuccess(res, 'Streak updated successfully', data);
  } catch (error: any) {
    return sendError(res, 'Failed to update streak', 500, error.message);
  }
};