import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createSlug } from '../utils/slugify';
import { Module } from '../types/module';

const getPagination = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { from: offset, to: offset + limit - 1 };
};

export const getModuleStats = async (req: Request, res: Response) => {
  try {
    const { course_id, is_published } = req.query;

    let moduleQuery = supabase.from('modules').select('*', { count: 'exact', head: true });

    if (course_id) {
      moduleQuery = moduleQuery.eq('course_id', course_id);
    }
    if (is_published !== undefined && is_published !== '') {
      moduleQuery = moduleQuery.eq('is_published', is_published === 'true');
    }

    let lessonQuery = supabase
      .from('lessons')
      .select('modules!inner(course_id)', { count: 'exact', head: true });

    if (course_id) {
      lessonQuery = lessonQuery.eq('modules.course_id', course_id);
    }
    if (is_published !== undefined && is_published !== '') {
      lessonQuery = lessonQuery.eq('is_published', is_published === 'true');
    }

    const [moduleRes, lessonRes] = await Promise.all([moduleQuery, lessonQuery]);

    if (moduleRes.error) throw moduleRes.error;
    if (lessonRes.error) throw lessonRes.error;

    return sendSuccess(res, 'Statistik modul berhasil diambil', {
      counts: {
        modules: moduleRes.count || 0,
        lessons: lessonRes.count || 0
      },
      filter: {
        course_id: course_id || 'all',
        is_published: is_published !== undefined ? is_published : 'all'
      }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil statistik modul', 500, error);
  }
};

export const createModule = async (req: Request, res: Response) => {
  try {
    const { course_id, title, description, order_index, is_published } = req.body;
    const thumbnail_url = req.file ? (req.file as any).path : null;

    if (!course_id || !title) {
      return sendError(res, 'Course ID dan Judul modul wajib diisi', 400);
    }

    const slug = createSlug(title);

    const { data: existingModule } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', course_id)
      .eq('slug', slug)
      .single();

    if (existingModule) {
      return sendError(res, 'Modul dengan judul ini sudah ada di kursus tersebut', 409);
    }

    const newModule: Partial<Module> = {
      course_id,
      title,
      slug,
      description,
      thumbnail_url,
      order_index: order_index ? Number(order_index) : 0,
      is_published: is_published === 'true' || is_published === true,
    };

    const { data, error } = await supabase
      .from('modules')
      .insert(newModule)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Modul berhasil dibuat', data as Module, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat modul', 500, error);
  }
};

export const getAllModules = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { from, to } = getPagination(page, limit);
    
    const { course_id, search, is_published, sort_by, sort_order } = req.query;

    let query = supabase
      .from('modules')
      .select('*, lessons(count)', { count: 'exact' });

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`title.ilike.${searchTerm},slug.ilike.${searchTerm}`);
    }

    if (course_id) {
      query = query.eq('course_id', course_id);
    }

    if (is_published !== undefined && is_published !== '') {
      query = query.eq('is_published', is_published === 'true');
    }

    const sortColumn = (sort_by as string) || 'order_index';
    const sortDirection = sort_order === 'desc' ? false : true;
    
    query = query.order(sortColumn, { ascending: sortDirection });

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    const formattedData = data?.map((item: any) => ({
      ...item,
      lesson_count: item.lessons ? item.lessons[0]?.count : 0,
      lessons: undefined 
    }));

    return sendSuccess(res, 'Data modul berhasil diambil', {
        modules: formattedData,
        pagination: {
          total_data: count,
          total_page: Math.ceil((count || 0) / limit),
          current_page: page,
          per_page: limit
        }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data modul', 500, error);
  }
};

export const getModuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('modules')
      .select('*, lessons(*)') 
      .eq('id', id)
      .single();

    if (error || !data) {
      return sendError(res, 'Modul tidak ditemukan', 404);
    }

    if (data.lessons && Array.isArray(data.lessons)) {
       data.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
    }

    const result = {
        ...data,
        lesson_count: data.lessons ? data.lessons.length : 0
    };

    return sendSuccess(res, 'Detail modul berhasil diambil', result);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail modul', 500, error);
  }
};

export const updateModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Module> = {};

    if (req.body.title) {
      const { data: currentModule } = await supabase.from('modules').select('course_id').eq('id', id).single();
      
      if (currentModule) {
        const newSlug = createSlug(req.body.title);
        
        const { data: duplicate } = await supabase
          .from('modules')
          .select('id')
          .eq('course_id', currentModule.course_id)
          .eq('slug', newSlug)
          .neq('id', id)
          .single();

        if (duplicate) {
          return sendError(res, 'Judul modul ini sudah digunakan di kursus ini', 409);
        }

        updates.title = req.body.title;
        updates.slug = newSlug;
      }
    }

    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.order_index !== undefined) updates.order_index = Number(req.body.order_index);
    if (req.body.course_id) updates.course_id = req.body.course_id;
    
    if (req.body.is_published !== undefined) {
      updates.is_published = req.body.is_published === 'true' || req.body.is_published === true;
    }

    if (req.file) {
      updates.thumbnail_url = (req.file as any).path;
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 'Tidak ada data update yang valid', 400);
    }

    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Modul berhasil diperbarui', data as Module);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui modul', 500, error);
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Modul berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus modul', 500, error);
  }
};