import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getDailyQuests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const today = new Date().toISOString().split('T')[0];

    const { data: userQuests, error } = await supabase
      .from('user_quests')
      .select(`
        *,
        quest:daily_quests(*)
      `)
      .eq('user_id', userId)
      .eq('assigned_date', today);

    if (error) throw error;

    if (!userQuests || userQuests.length === 0) {
      const { data: activeQuests } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('is_active', true);

      if (activeQuests && activeQuests.length > 0) {
        const newQuests = activeQuests.map(quest => ({
          user_id: userId,
          quest_id: quest.id,
          assigned_date: today,
          progress_count: 0,
          is_completed: false,
          is_claimed: false
        }));

        const { data: insertedQuests, error: insertError } = await supabase
          .from('user_quests')
          .insert(newQuests)
          .select(`*, quest:daily_quests(*)`);
        
        if (insertError) throw insertError;
        return sendSuccess(res, 'Quest harian berhasil diambil', insertedQuests);
      }
    }

    return sendSuccess(res, 'Quest harian berhasil diambil', userQuests);
  } catch (error) {
    return sendError(res, 'Gagal mengambil quest', 500, error);
  }
};

export const claimQuestReward = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { userQuestId } = req.params;

    const { data: userQuest, error: fetchError } = await supabase
      .from('user_quests')
      .select(`
        *,
        quest:daily_quests(xp_reward)
      `)
      .eq('id', userQuestId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !userQuest) return sendError(res, 'Quest tidak ditemukan', 404);
    if (!userQuest.is_completed) return sendError(res, 'Quest belum selesai', 400);
    if (userQuest.is_claimed) return sendError(res, 'Hadiah sudah diklaim', 400);

    const xpReward = (userQuest.quest as any).xp_reward;

    const { error: updateQuestError } = await supabase
      .from('user_quests')
      .update({ is_claimed: true, updated_at: new Date() })
      .eq('id', userQuestId);

    if (updateQuestError) throw updateQuestError;

    const { error: userError } = await supabase.rpc('increment_xp', { 
      x_user_id: userId, 
      x_amount: xpReward 
    });

    if (userError) {
        const { data: currentUser } = await supabase.from('users').select('xp').eq('id', userId).single();
        await supabase.from('users').update({ xp: (currentUser?.xp || 0) + xpReward }).eq('id', userId);
    }

    return sendSuccess(res, 'Hadiah berhasil diklaim', { xp_gained: xpReward });
  } catch (error) {
    return sendError(res, 'Gagal klaim hadiah', 500, error);
  }
};

export const createDailyQuest = async (req: Request, res: Response) => {
  try {
    const { title, description, action_type, target_count, xp_reward } = req.body;

    const { data, error } = await supabase
      .from('daily_quests')
      .insert({
        title,
        description,
        action_type,
        target_count,
        xp_reward
      })
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Daily Quest berhasil dibuat', data, 201);
  } catch (error) {
    return sendError(res, 'Gagal membuat quest', 500, error);
  }
};