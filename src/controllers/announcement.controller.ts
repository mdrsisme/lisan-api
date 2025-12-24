import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { Announcement } from '../types/announcement';


export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, is_active } = req.body;

    if (!title || !content) {
      return sendError(res, 'Title dan Content wajib diisi', 400);
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let imageUrl = null;
    let videoUrl = null;

    if (files?.['image']?.[0]) imageUrl = files['image'][0].path;
    if (files?.['video']?.[0]) videoUrl = files['video'][0].path;

    const newAnnouncement = {
      title,
      content,
      image_url: imageUrl,
      video_url: videoUrl,
      is_active: is_active === 'true' || is_active === true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('announcements')
      .insert(newAnnouncement)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Pengumuman berhasil dibuat', data as Announcement, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat pengumuman', 500, error);
  }
};


export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit, 
      sortBy = 'created_at', 
      order = 'desc',
      is_active 
    } = req.query;

    let query = supabase.from('announcements').select('*', { count: 'exact' });

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const allowedSorts = ['created_at', 'updated_at', 'title'];
    const sortField = allowedSorts.includes(sortBy as string) ? (sortBy as string) : 'created_at';
    query = query.order(sortField, { ascending: order === 'asc' });

    const isGetAll = limit === '0' || limit === 'all';
    let pageNum = 1;
    let limitNum = 0;

    if (!isGetAll) {
      pageNum = Number(page) || 1;
      limitNum = Number(limit) || 10;
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;
      query = query.range(from, to);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return sendSuccess(res, 'Data berhasil diambil', {
      data: data as Announcement[],
      meta: {
        total_data: count,
        current_page: isGetAll ? 1 : pageNum,
        per_page: isGetAll ? count : limitNum,
        total_pages: (count && !isGetAll && limitNum > 0) ? Math.ceil(count / limitNum) : 1,
        has_next: (!isGetAll && count && limitNum > 0) ? ((pageNum - 1) * limitNum) + limitNum < count : false
      }
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data', 500, error);
  }
};

export const searchAnnouncements = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return sendError(res, 'Parameter pencarian (q) diperlukan', 400);
    }

    const searchTerm = `%${q}%`;

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, `Hasil pencarian untuk: ${q}`, data as Announcement[]);

  } catch (error: any) {
    return sendError(res, 'Gagal melakukan pencarian', 500, error);
  }
};

export const countAnnouncements = async (req: Request, res: Response) => {
  try {
    const { is_active } = req.query;

    let query = supabase.from('announcements').select('*', { count: 'exact', head: true }); 

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { count, error } = await query;

    if (error) throw error;

    return sendSuccess(res, 'Jumlah data berhasil diambil', { total: count });

  } catch (error: any) {
    return sendError(res, 'Gagal menghitung data', 500, error);
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

    return sendSuccess(res, 'Detail pengumuman', data as Announcement);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail', 500, error);
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, is_active } = req.body;

    const { data: existingData, error: checkError } = await supabase
        .from('announcements')
        .select('id')
        .eq('id', id)
        .single();

    if(checkError || !existingData) return sendError(res, "Pengumuman tidak ditemukan", 404);

    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (is_active !== undefined) updateData.is_active = is_active === 'true' || is_active === true;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files?.['image']?.[0]) updateData.image_url = files['image'][0].path;
    if (files?.['video']?.[0]) updateData.video_url = files['video'][0].path;

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'Tidak ada data yang diubah', 400);
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Pengumuman berhasil diperbarui', data as Announcement);

  } catch (error: any) {
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
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus pengumuman', 500, error);
  }
};