import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createSlug } from '../utils/slugify';

export const createLesson = async (req: Request, res: Response) => {
  try {
    const { 
      module_id, 
      title, 
      description, 
      type, 
      target_gesture, 
      order_index, 
      xp_reward 
    } = req.body;

    if (!module_id || !title || !type) return sendError(res, 'Data wajib tidak lengkap', 400);

    const slug = createSlug(title);
    let content_url = null;

    // Handle Upload Video / PDF
    if (req.file) {
      content_url = req.file.path;
    } else if (req.body.content_url) {
      // Jika kirim string URL langsung
      content_url = req.body.content_url;
    }

    // Validasi untuk tipe Camera Practice
    if (type === 'camera_practice' && !target_gesture) {
      return sendError(res, 'Target Gesture wajib diisi untuk tipe Camera Practice', 400);
    }

    const newLesson = {
      module_id,
      title,
      slug,
      description,
      type, // 'video' | 'text' | 'camera_practice'
      target_gesture: type === 'camera_practice' ? target_gesture : null,
      content_url,
      order_index: Number(order_index) || 0,
      xp_reward: Number(xp_reward) || 100,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('lessons').insert(newLesson).select().single();
    if (error) throw error;

    return sendSuccess(res, 'Lesson berhasil dibuat', data);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat lesson', 500, error);
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, target_gesture, order_index, xp_reward, is_published } = req.body;

    const updateData: any = {};
    
    if (title) {
        updateData.title = title;
        updateData.slug = createSlug(title);
    }
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (target_gesture) updateData.target_gesture = target_gesture;
    if (order_index !== undefined) updateData.order_index = Number(order_index);
    if (xp_reward !== undefined) updateData.xp_reward = Number(xp_reward);
    if (is_published !== undefined) updateData.is_published = is_published === 'true';
    
    // Replace content URL if new file uploaded
    if (req.file) {
        updateData.content_url = req.file.path;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('lessons').update(updateData).eq('id', id).select().single();
    if (error) throw error;

    return sendSuccess(res, 'Lesson berhasil diupdate', data);
  } catch (error: any) {
    return sendError(res, 'Gagal update lesson', 500, error);
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;
    return sendSuccess(res, 'Lesson berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus lesson', 500, error);
  }
};