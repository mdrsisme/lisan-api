import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { Enrollment, EnrollmentStatus } from '../types/enrollment';

const getPagination = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { from: offset, to: offset + limit - 1 };
};

export const enrollCourse = async (req: Request, res: Response) => {
  try {
    const { user_id, course_id, access_key } = req.body;

    if (!user_id || !course_id) {
      return sendError(res, 'User ID dan Course ID wajib diisi', 400);
    }

    const { data: course } = await supabase
      .from('courses')
      .select('access_key')
      .eq('id', course_id)
      .single();

    if (!course) {
      return sendError(res, 'Kursus tidak ditemukan', 404);
    }

    if (course.access_key && course.access_key !== '') {
      if (access_key !== course.access_key) {
        return sendError(res, 'Kode akses kursus salah atau wajib diisi', 403);
      }
    }

    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single();

    if (existing) {
      return sendError(res, 'User sudah terdaftar di kursus ini', 409);
    }

    const newEnrollment = {
      user_id,
      course_id,
      status: 'active',
      progress_percentage: 0,
      used_key: access_key || null,
    };

    const { data, error } = await supabase
      .from('enrollments')
      .insert(newEnrollment)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Berhasil mendaftar kursus', data as Enrollment, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal mendaftar kursus', 500, error);
  }
};

export const getUserEnrollments = async (req: Request, res: Response) => {
  try {
    const { 
      user_id, 
      status, 
      page = 1, 
      limit = 10 
    } = req.query;

    if (!user_id) {
      return sendError(res, 'User ID wajib diisi', 400);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const { from, to } = getPagination(pageNum, limitNum);

    let query = supabase
      .from('enrollments')
      .select('*, courses(title, slug, thumbnail_url, level)', { count: 'exact' })
      .eq('user_id', user_id);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('updated_at', { ascending: false });

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    return sendSuccess(res, 'Data enrollment berhasil diambil', {
      enrollments: data,
      pagination: {
        total_data: count,
        total_page: Math.ceil((count || 0) / limitNum),
        current_page: pageNum,
        per_page: limitNum
      }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data enrollment', 500, error);
  }
};

export const getGeneralStats = async (req: Request, res: Response) => {
  try {
    const [userRes, courseRes, enrollRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true })
    ]);

    return sendSuccess(res, 'Statistik umum berhasil diambil', {
      total_users: userRes.count || 0,
      total_courses: courseRes.count || 0,
      total_enrollments: enrollRes.count || 0
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil statistik umum', 500, error);
  }
};

export const getUserEnrollmentCounts = async (req: Request, res: Response) => {
  try {
    const { sort_order = 'desc', limit = 20 } = req.query;

    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('user_id, courses(title)');

    if (error) throw error;
    if (!enrollments) return sendSuccess(res, 'Data kosong', []);

    const userMap: Record<string, any> = {};
    enrollments.forEach((item: any) => {
      const uid = item.user_id;
      if (!userMap[uid]) {
        userMap[uid] = { user_id: uid, total_courses: 0, courses: [] };
      }
      userMap[uid].total_courses += 1;
      if (item.courses) userMap[uid].courses.push(item.courses.title);
    });

    let result = Object.values(userMap);
    result.sort((a, b) => sort_order === 'asc' ? a.total_courses - b.total_courses : b.total_courses - a.total_courses);

    return sendSuccess(res, 'Statistik enrollment user berhasil diambil', result.slice(0, Number(limit)));
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data', 500, error);
  }
};

export const getModuleUserStats = async (req: Request, res: Response) => {
  try {
    const { sort_order = 'desc', limit = 20 } = req.query;

    const { data: progressData, error } = await supabase
      .from('user_module_progress')
      .select('module_id, modules(title)');

    if (error) throw error;
    if (!progressData) return sendSuccess(res, 'Data kosong', []);

    const moduleMap: Record<string, any> = {};
    progressData.forEach((item: any) => {
      const mid = item.module_id;
      if (!moduleMap[mid]) {
        moduleMap[mid] = { module_id: mid, title: item.modules?.title || 'Unknown', total_users: 0 };
      }
      moduleMap[mid].total_users += 1;
    });

    let result = Object.values(moduleMap);
    result.sort((a, b) => sort_order === 'asc' ? a.total_users - b.total_users : b.total_users - a.total_users);

    return sendSuccess(res, 'Statistik user per modul berhasil diambil', result.slice(0, Number(limit)));
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data', 500, error);
  }
};

export const checkEnrollmentStatus = async (req: Request, res: Response) => {
  try {
    const { user_id, course_id } = req.query;

    if (!user_id || !course_id) {
      return sendError(res, 'User ID dan Course ID wajib diisi', 400);
    }

    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return sendSuccess(res, 'User belum terdaftar', { enrolled: false });
    }

    return sendSuccess(res, 'User terdaftar', { enrolled: true, data });
  } catch (error: any) {
    return sendError(res, 'Gagal mengecek status enrollment', 500, error);
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { progress_percentage } = req.body;

    if (progress_percentage === undefined || progress_percentage < 0 || progress_percentage > 100) {
      return sendError(res, 'Progress percentage harus antara 0 - 100', 400);
    }

    const updates: any = {
      progress_percentage: Number(progress_percentage)
    };

    if (updates.progress_percentage === 100) {
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('enrollments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Progress berhasil diperbarui', data);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui progress', 500, error);
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: EnrollmentStatus[] = ['active', 'completed', 'dropped'];
    if (!status || !validStatuses.includes(status)) {
      return sendError(res, 'Status tidak valid', 400);
    }

    const updates: any = { status };
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      updates.progress_percentage = 100;
    }

    const { data, error } = await supabase
      .from('enrollments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Status enrollment berhasil diperbarui', data);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui status', 500, error);
  }
};