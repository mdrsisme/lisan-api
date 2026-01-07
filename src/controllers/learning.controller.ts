import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { QuizSubmissionRequest } from '../types/learning';

export const getDueItems = async (req: Request, res: Response) => {
  try {
    const user_id = req.query.user_id as string;
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('dictionary_items')
      .select(`
        id, word, video_url, type, image_url, definition,
        user_item_progress!left ( mastery_level, next_review_at )
      `)
      .eq('user_item_progress.user_id', user_id)
      .or(`next_review_at.lte.${new Date().toISOString()},user_item_progress.id.is.null`)
      .order('user_item_progress(mastery_level)', { ascending: true, nullsFirst: true })
      .limit(Number(limit));

    if (error) throw error;

    return sendSuccess(res, 'Soal latihan berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil soal latihan', 500, error.message);
  }
};

export const submitQuizResult = async (req: Request, res: Response) => {
  try {
    const { user_id, dictionary_item_id, quiz_type, is_correct, ai_confidence_score }: QuizSubmissionRequest & { user_id: string } = req.body;

    if (!dictionary_item_id) return sendError(res, 'Item ID wajib diisi', 400);

    const baseXP = is_correct ? 10 : 2;
    const bonusXP = (ai_confidence_score && ai_confidence_score > 0.8) ? 5 : 0;
    const totalEarnedXP = baseXP + bonusXP;

    const { error: logError } = await supabase.from('user_quiz_logs').insert({
      user_id,
      dictionary_item_id,
      type: quiz_type,
      is_correct,
      ai_confidence_score,
      xp_earned: totalEarnedXP
    });

    if (logError) throw logError;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('total_xp, current_level')
      .eq('id', user_id)
      .single();

    if (userError) throw userError;

    let newTotalXP = (userData.total_xp || 0) + totalEarnedXP;
    let newLevel = userData.current_level;

    const { data: nextLevelData } = await supabase
      .from('level_boundaries')
      .select('level, min_xp')
      .gt('level', newLevel)
      .lte('min_xp', newTotalXP)
      .order('level', { ascending: false })
      .limit(1)
      .single();

    if (nextLevelData) {
      newLevel = nextLevelData.level;
    }

    await supabase.from('users').update({ 
      total_xp: newTotalXP, 
      current_level: newLevel 
    }).eq('id', user_id);

    const { data: currentProgress } = await supabase
      .from('user_item_progress')
      .select('mastery_level, streak_count')
      .eq('user_id', user_id)
      .eq('dictionary_item_id', dictionary_item_id)
      .single();

    let newMastery = currentProgress?.mastery_level || 0;
    let newStreak = currentProgress?.streak_count || 0;
    let nextReviewDate = new Date();

    if (is_correct) {
      newMastery = Math.min(newMastery + 1, 5);
      newStreak += 1;
      const daysToAdd = Math.pow(2, newMastery); 
      nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);
    } else {
      newMastery = Math.max(newMastery - 1, 0);
      newStreak = 0;
    }

    const { data: updatedProgress, error: progressError } = await supabase
      .from('user_item_progress')
      .upsert({
        user_id,
        dictionary_item_id,
        is_completed: true,
        mastery_level: newMastery,
        streak_count: newStreak,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: nextReviewDate.toISOString()
      }, { onConflict: 'user_id, dictionary_item_id' })
      .select()
      .single();

    if (progressError) throw progressError;

    const today = new Date().toISOString().split('T')[0];
    const { data: streakData } = await supabase.from('user_streaks').select('*').eq('user_id', user_id).single();

    if (streakData?.last_activity_at !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newCurrentStreak = 1;
        if (streakData?.last_activity_at === yesterdayStr) {
            newCurrentStreak = (streakData.current_streak || 0) + 1;
        }

        const newLongest = Math.max(newCurrentStreak, streakData?.longest_streak || 0);

        await supabase.from('user_streaks').upsert({
            user_id,
            current_streak: newCurrentStreak,
            longest_streak: newLongest,
            last_activity_at: today
        }, { onConflict: 'user_id' });
    }

    return sendSuccess(res, 'Hasil kuis berhasil disimpan', {
      xp_earned: totalEarnedXP,
      is_level_up: newLevel > userData.current_level,
      new_level: newLevel,
      new_total_xp: newTotalXP,
      item_progress: updatedProgress
    });

  } catch (error: any) {
    return sendError(res, 'Gagal menyimpan hasil kuis', 500, error.message);
  }
};

export const getDictionaryProgress = async (req: Request, res: Response) => {
  try {
    const user_id = req.query.user_id as string;
    const { dictionaryId } = req.params;

    const { count: totalItems } = await supabase
      .from('dictionary_items')
      .select('*', { count: 'exact', head: true })
      .eq('dictionary_id', dictionaryId);

    const { count: completedItems } = await supabase
      .from('user_item_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('is_completed', true)
      .not('dictionary_item_id', 'is', null); 

    const percentage = totalItems && totalItems > 0 
      ? Math.round(((completedItems || 0) / totalItems) * 100) 
      : 0;

    return sendSuccess(res, 'Progress dictionary berhasil diambil', {
      dictionary_id: dictionaryId,
      total_items: totalItems || 0,
      completed_items: completedItems || 0,
      percentage
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil progress dictionary', 500, error.message);
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const user_id = req.query.user_id as string;

    const { data: user } = await supabase
      .from('users')
      .select('total_xp, current_level')
      .eq('id', user_id)
      .single();

    const { count: itemsLearned } = await supabase
      .from('user_item_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('is_completed', true);

    const { data: streak } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user_id)
        .single();

    return sendSuccess(res, 'Statistik user berhasil diambil', {
      level: user?.current_level || 1,
      xp: user?.total_xp || 0,
      items_learned: itemsLearned || 0,
      current_streak: streak?.current_streak || 0,
      longest_streak: streak?.longest_streak || 0
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil statistik', 500, error.message);
  }
};