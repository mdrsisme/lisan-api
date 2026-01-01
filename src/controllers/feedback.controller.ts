import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { user_id, type, message, screenshot_url, app_version, device_info } = req.body;

    if (!message) return sendError(res, 'Pesan feedback wajib diisi', 400);

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: user_id || null,
        type: type || 'bug',
        message,
        screenshot_url,
        app_version,
        device_info,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Feedback berhasil dikirim', data, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal mengirim feedback', 500, error.message);
  }
};

export const getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase.from('feedback').select('*, user:users(full_name, email)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return sendSuccess(res, 'Data feedback berhasil diambil', { data, count });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data feedback', 500, error.message);
  }
};

export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('feedback')
        .select('*, user:users(full_name, email)')
        .eq('id', id)
        .single();

    if (error) throw error;
    return sendSuccess(res, 'Detail feedback berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail feedback', 500, error.message);
  }
};

export const updateFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const { data, error } = await supabase
      .from('feedback')
      .update({ status, admin_notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Feedback berhasil diperbarui', data);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui feedback', 500, error.message);
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('feedback').delete().eq('id', id);

    if (error) throw error;
    return sendSuccess(res, 'Feedback berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus feedback', 500, error.message);
  }
};