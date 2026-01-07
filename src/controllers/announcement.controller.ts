import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getAnnouncementStats = async (req: Request, res: Response) => {
  try {
    const { count: total } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true });

    const { count: active } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: inactive } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newThisMonth } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    return sendSuccess(res, 'Statistik pengumuman berhasil diambil', {
      total: total || 0,
      active: active || 0,
      inactive: inactive || 0,
      new_this_month: newThisMonth || 0
    });
  } catch (error) {
    return sendError(res, 'Gagal mengambil statistik', 500, error);
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, video_url, is_active } = req.body;
    const image_url = req.file ? req.file.path : null;

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        image_url,
        video_url,
        is_active: is_active === undefined ? true : (is_active === 'true' || is_active === true)
      })
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Pengumuman berhasil dibuat', data, 201);
  } catch (error) {
    return sendError(res, 'Gagal membuat pengumuman', 500, error);
  }
};

export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      is_active, 
      sort = 'created_at', 
      order = 'desc' 
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase.from('announcements').select('*', { count: 'exact' });
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    query = query
      .order(String(sort), { ascending: order === 'asc' })
      .range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return sendSuccess(res, 'Data pengumuman berhasil diambil', {
      announcements: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total_data: count || 0,
        total_page: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    return sendError(res, 'Gagal mengambil data pengumuman', 500, error);
  }
};

export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return sendError(res, 'Pengumuman tidak ditemukan', 404);

    return sendSuccess(res, 'Detail pengumuman berhasil diambil', data);
  } catch (error) {
    return sendError(res, 'Gagal mengambil detail pengumuman', 500, error);
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, video_url, is_active } = req.body;
    
    const updates: any = { updated_at: new Date() };

    if (title) updates.title = title;
    if (content) updates.content = content;
    if (video_url) updates.video_url = video_url;
    if (is_active !== undefined) updates.is_active = is_active === 'true' || is_active === true;
    if (req.file) updates.image_url = req.file.path;

    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Pengumuman berhasil diperbarui', data);
  } catch (error) {
    return sendError(res, 'Gagal memperbarui pengumuman', 500, error);
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Pengumuman berhasil dihapus');
  } catch (error) {
    return sendError(res, 'Gagal menghapus pengumuman', 500, error);
  }
};