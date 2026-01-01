import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createSlug } from '../utils/slugify'; 

export const createAchievement = async (req: Request, res: Response) => {
  try {
    const { title, description, icon_url, category, xp_reward, target_value } = req.body;
    const slug = createSlug(title);

    const { data, error } = await supabase
      .from('achievements')
      .insert({ slug, title, description, icon_url, category, xp_reward, target_value })
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Achievement berhasil dibuat', data, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat achievement', 500, error.message);
  }
};

export const getAllAchievements = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('xp_reward', { ascending: true });

    if (error) throw error;
    return sendSuccess(res, 'Daftar achievement berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil daftar achievement', 500, error.message);
  }
};

export const getAchievementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('achievements').select('*').eq('id', id).single();

    if (error) throw error;
    return sendSuccess(res, 'Detail achievement berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail achievement', 500, error.message);
  }
};

export const updateAchievement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.title) updates.slug = createSlug(updates.title);

    const { data, error } = await supabase
      .from('achievements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Achievement berhasil diperbarui', data);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui achievement', 500, error.message);
  }
};

export const deleteAchievement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('achievements').delete().eq('id', id);

    if (error) throw error;
    return sendSuccess(res, 'Achievement berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus achievement', 500, error.message);
  }
};

export const grantAchievementToUser = async (req: Request, res: Response) => {
    try {
        const { user_id, achievement_id } = req.body;
        const { data, error } = await supabase
            .from('user_achievements')
            .insert({ user_id, achievement_id })
            .select()
            .single();

        if (error) throw error;
        return sendSuccess(res, 'Achievement berhasil diberikan ke user', data, 201);
    } catch (error: any) {
        return sendError(res, 'Gagal memberikan achievement', 500, error.message);
    }
};

export const getUserAchievements = async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', user_id)
        .order('unlocked_at', { ascending: false });
  
      if (error) throw error;
      return sendSuccess(res, 'Achievement user berhasil diambil', data);
    } catch (error: any) {
      return sendError(res, 'Gagal mengambil achievement user', 500, error.message);
    }
};

export const revokeUserAchievement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; 
        const { error } = await supabase.from('user_achievements').delete().eq('id', id);

        if (error) throw error;
        return sendSuccess(res, 'Achievement berhasil ditarik dari user');
    } catch (error: any) {
        return sendError(res, 'Gagal menarik achievement', 500, error.message);
    }
};