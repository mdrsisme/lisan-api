import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createSlug } from '../utils/slugify';

export const createModule = async (req: Request, res: Response) => {
  try {
    const { course_id, title, description, order_index } = req.body;

    if (!course_id || !title) return sendError(res, 'Course ID dan Title wajib diisi', 400);

    const slug = createSlug(title);

    const newModule = {
      course_id,
      title,
      slug,
      description,
      order_index: Number(order_index) || 0,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('modules').insert(newModule).select().single();
    if (error) throw error;

    return sendSuccess(res, 'Module berhasil dibuat', data);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat module', 500, error);
  }
};

export const updateModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, order_index, is_published } = req.body;

    const updateData: any = {};
    if (title) {
        updateData.title = title;
        updateData.slug = createSlug(title);
    }
    if (description) updateData.description = description;
    if (order_index !== undefined) updateData.order_index = Number(order_index);
    if (is_published !== undefined) updateData.is_published = is_published === 'true';

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('modules').update(updateData).eq('id', id).select().single();
    if (error) throw error;

    return sendSuccess(res, 'Module berhasil diupdate', data);
  } catch (error: any) {
    return sendError(res, 'Gagal update module', 500, error);
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) throw error;
    return sendSuccess(res, 'Module berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus module', 500, error);
  }
};