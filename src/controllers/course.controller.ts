import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createSlug } from '../utils/slugify';
import { Course, CourseLevel } from '../types/course';

const getPagination = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { from: offset, to: offset + limit - 1 };
};

const applySearch = (query: any, search?: string) => {
  if (search) return query.ilike('title', `%${search}%`);
  return query;
};

const applyFilters = (query: any, level?: string, is_published?: string) => {
  let q = query;
  if (level) q = q.eq('level', level);
  if (is_published !== undefined && is_published !== '') {
    q = q.eq('is_published', is_published === 'true');
  }
  return q;
};

const applySort = (query: any, sortBy: string = 'created_at', sortOrder: string = 'desc') => {
  return query.order(sortBy, { ascending: sortOrder === 'asc' });
};

export const getCourseStats = async (req: Request, res: Response) => {
  try {
    const { level, is_published } = req.query;

    let courseQuery = supabase.from('courses').select('*', { count: 'exact', head: true });

    if (level) {
      courseQuery = courseQuery.eq('level', level);
    }
    if (is_published !== undefined && is_published !== '') {
      courseQuery = courseQuery.eq('is_published', is_published === 'true');
    }

    let moduleQuery = supabase.from('modules').select('*', { count: 'exact', head: true });
    if (is_published !== undefined && is_published !== '') {
      moduleQuery = moduleQuery.eq('is_published', is_published === 'true');
    }

    let lessonQuery = supabase.from('lessons').select('*', { count: 'exact', head: true });
    if (is_published !== undefined && is_published !== '') {
      lessonQuery = lessonQuery.eq('is_published', is_published === 'true');
    }

    const [courseRes, moduleRes, lessonRes] = await Promise.all([
      courseQuery,
      moduleQuery,
      lessonQuery
    ]);

    if (courseRes.error) throw courseRes.error;
    if (moduleRes.error) throw moduleRes.error;
    if (lessonRes.error) throw lessonRes.error;

    return sendSuccess(res, 'Statistik konten berhasil diambil', {
      counts: {
        courses: courseRes.count || 0,
        modules: moduleRes.count || 0,
        lessons: lessonRes.count || 0,
      },
      filter: {
        level: level || 'all',
        is_published: is_published !== undefined ? is_published : 'all'
      }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil statistik', 500, error);
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, level, is_published, access_key } = req.body;
    const thumbnail_url = req.file ? (req.file as any).path : null;

    if (!title) {
      return sendError(res, 'Judul kursus wajib diisi', 400);
    }

    const slug = createSlug(title);

    const { data: existingSlug } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingSlug) {
      return sendError(res, 'Kursus dengan judul ini sudah ada', 409);
    }

    const newCourse: Partial<Course> = {
      title,
      slug,
      description,
      level: (level as CourseLevel) || 'beginner',
      is_published: is_published === 'true',
      access_key: access_key || null,
      thumbnail_url,
    };

    const { data, error } = await supabase
      .from('courses')
      .insert(newCourse)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Kursus berhasil dibuat', data as Course, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat kursus', 500, error);
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      level, 
      is_published, 
      sort_by, 
      sort_order 
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const { from, to } = getPagination(pageNum, limitNum);

    let query = supabase.from('courses').select('*', { count: 'exact' });

    query = applySearch(query, search as string);
    query = applyFilters(query, level as string, is_published as string);
    query = applySort(query, sort_by as string, sort_order as string);

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    return sendSuccess(res, 'Data kursus berhasil diambil', {
      courses: data as Course[],
      pagination: {
        total_data: count,
        total_page: Math.ceil((count || 0) / limitNum),
        current_page: pageNum,
        per_page: limitNum
      }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data kursus', 500, error);
  }
};

export const getPublishedCourses = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      level 
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const { from, to } = getPagination(pageNum, limitNum);

    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (level) {
      query = query.eq('level', level);
    }

    query = query.order('created_at', { ascending: false });

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    return sendSuccess(res, 'Daftar kursus publik berhasil diambil', {
      courses: data as Course[],
      pagination: {
        total_data: count,
        total_page: (count && limitNum > 0) ? Math.ceil(count / limitNum) : 1,
        current_page: pageNum,
        per_page: limitNum
      }
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data kursus publik', 500, error);
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('courses')
      .select('*, modules(*)') 
      .eq('id', id)
      .single();

    if (error || !data) {
      return sendError(res, 'Kursus tidak ditemukan', 404);
    }

    return sendSuccess(res, 'Detail kursus berhasil diambil', data as Course);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail kursus', 500, error);
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Course> = {};

    if (req.body.title) {
      updates.title = req.body.title;
      updates.slug = createSlug(req.body.title);
    }
    
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.level) updates.level = req.body.level as CourseLevel;
    if (req.body.access_key !== undefined) updates.access_key = req.body.access_key;

    if (req.body.is_published !== undefined) {
      updates.is_published = req.body.is_published === 'true' || req.body.is_published === true;
    }

    if (req.file) {
      updates.thumbnail_url = (req.file as any).path;
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 'Tidak ada data yang dikirim untuk diperbarui', 400);
    }

    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Kursus berhasil diperbarui', data as Course);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui kursus', 500, error);
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Kursus berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus kursus', 500, error);
  }
};