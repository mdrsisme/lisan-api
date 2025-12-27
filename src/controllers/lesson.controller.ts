import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createSlug } from '../utils/slugify';
import { Lesson, LessonType } from '../types/lesson';

const getPagination = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { from: offset, to: offset + limit - 1 };
};

export const getLessonStats = async (req: Request, res: Response) => {
  try {
    const { module_id, type, is_published } = req.query;

    let query = supabase.from('lessons').select('*', { count: 'exact', head: true });

    if (module_id) {
      query = query.eq('module_id', module_id);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (is_published !== undefined && is_published !== '') {
      query = query.eq('is_published', is_published === 'true');
    }

    const { count, error } = await query;

    if (error) throw error;

    return sendSuccess(res, 'Statistik pelajaran berhasil diambil', {
      total_data: count || 0,
      filter: {
        module_id: module_id || 'all',
        type: type || 'all',
        is_published: is_published !== undefined ? is_published : 'all'
      }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil statistik pelajaran', 500, error);
  }
};

export const createLesson = async (req: Request, res: Response) => {
  try {
    const { module_id, title, description, type, target_gesture, order_index, xp_reward, is_published } = req.body;
    const content_url = req.file ? (req.file as any).path : null;

    if (!module_id || !title) {
      return sendError(res, 'Module ID dan Judul pelajaran wajib diisi', 400);
    }

    const slug = createSlug(title);

    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', module_id)
      .eq('slug', slug)
      .single();

    if (existingLesson) {
      return sendError(res, 'Pelajaran dengan judul ini sudah ada di modul tersebut', 409);
    }

    const newLesson: Partial<Lesson> = {
      module_id,
      title,
      slug,
      description,
      type: (type as LessonType) || 'text',
      target_gesture: target_gesture || null,
      content_url,
      order_index: order_index ? Number(order_index) : 0,
      xp_reward: xp_reward ? Number(xp_reward) : 100,
      is_published: is_published === 'true' || is_published === true,
    };

    const { data, error } = await supabase
      .from('lessons')
      .insert(newLesson)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Pelajaran berhasil dibuat', data as Lesson, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat pelajaran', 500, error);
  }
};

export const getAllLessons = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { from, to } = getPagination(page, limit);

    const { module_id, search, type, is_published, sort_by, sort_order } = req.query;

    let query = supabase.from('lessons').select('*', { count: 'exact' });

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`title.ilike.${searchTerm},slug.ilike.${searchTerm}`);
    }

    if (module_id) {
      query = query.eq('module_id', module_id);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (is_published !== undefined && is_published !== '') {
      query = query.eq('is_published', is_published === 'true');
    }

    const sortColumn = (sort_by as string) || 'order_index';
    const sortDirection = sort_order === 'desc' ? false : true;

    query = query.order(sortColumn, { ascending: sortDirection });

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    return sendSuccess(res, 'Data pelajaran berhasil diambil', {
      lessons: data as Lesson[],
      pagination: {
        total_data: count,
        total_page: Math.ceil((count || 0) / limit),
        current_page: page,
        per_page: limit
      }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data pelajaran', 500, error);
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return sendError(res, 'Pelajaran tidak ditemukan', 404);
    }

    return sendSuccess(res, 'Detail pelajaran berhasil diambil', data as Lesson);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail pelajaran', 500, error);
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Lesson> = {};

    if (req.body.title) {
      let targetModuleId = req.body.module_id;

      if (!targetModuleId) {
         const { data: currentLesson } = await supabase.from('lessons').select('module_id').eq('id', id).single();
         if (!currentLesson) return sendError(res, 'Pelajaran tidak ditemukan', 404);
         targetModuleId = currentLesson.module_id;
      }

      const newSlug = createSlug(req.body.title);
      
      // Cek duplikasi di target module
      const { data: duplicate } = await supabase
        .from('lessons')
        .select('id')
        .eq('module_id', targetModuleId)
        .eq('slug', newSlug)
        .neq('id', id)
        .single();

      if (duplicate) {
        return sendError(res, 'Judul pelajaran ini sudah digunakan di modul tersebut', 409);
      }

      updates.title = req.body.title;
      updates.slug = newSlug;
    }

    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.type) updates.type = req.body.type as LessonType;
    if (req.body.target_gesture !== undefined) updates.target_gesture = req.body.target_gesture;
    if (req.body.order_index !== undefined) updates.order_index = Number(req.body.order_index);
    if (req.body.xp_reward !== undefined) updates.xp_reward = Number(req.body.xp_reward);
    if (req.body.module_id) updates.module_id = req.body.module_id;
    
    if (req.body.is_published !== undefined) {
      updates.is_published = req.body.is_published === 'true' || req.body.is_published === true;
    }

    if (req.file) {
      updates.content_url = (req.file as any).path;
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 'Tidak ada data update yang valid', 400);
    }

    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Pelajaran berhasil diperbarui', data as Lesson);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui pelajaran', 500, error);
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Pelajaran berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus pelajaran', 500, error);
  }
};

export const getPublishedLessons = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, module_id, search } = req.query;
    let query = supabase
      .from('lessons')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (module_id) {
      query = query.eq('module_id', module_id);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`title.ilike.${searchTerm},slug.ilike.${searchTerm}`);
    }

    query = query.order('order_index', { ascending: true });

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    return sendSuccess(res, 'Daftar pelajaran publik berhasil diambil', {
      lessons: data as Lesson[],
      pagination: {
        total_data: count,
        total_page: (count && limitNum > 0) ? Math.ceil(count / limitNum) : 1,
        current_page: pageNum,
        per_page: limitNum
      }
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data pelajaran publik', 500, error);
  }
};