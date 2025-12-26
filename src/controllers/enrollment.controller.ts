import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { Enrollment } from '../types/enrollment';

export const createEnrollment = async (req: Request, res: Response) => {
  try {
    const { user_id, course_id, used_key } = req.body;

    if (!user_id || !course_id) {
      return sendError(res, 'User ID dan Course ID wajib diisi', 400);
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
      used_key,
      status: 'active',
      progress_percentage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('enrollments')
      .insert(newEnrollment)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Enrollment berhasil dibuat', data as Enrollment, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat enrollment', 500, error);
  }
};

export const getAllEnrollments = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort_by = 'created_at', 
      order = 'desc', 
      status,
      user_id,
      course_id,
      q 
    } = req.query;

    let query = supabase
      .from('enrollments')
      .select('*, courses(title), users:user_id(email)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (user_id) query = query.eq('user_id', user_id);
    if (course_id) query = query.eq('course_id', course_id);
    
    if (q) {
      query = query.or(`used_key.ilike.%${q}%`);
    }

    query = query.order(sort_by as string, { ascending: order === 'asc' });

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    return sendSuccess(res, 'Data enrollment berhasil diambil', {
      data: data as Enrollment[],
      meta: {
        total_data: count,
        current_page: pageNum,
        per_page: limitNum,
        total_pages: count ? Math.ceil(count / limitNum) : 0
      }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data enrollment', 500, error);
  }
};

export const getEnrollmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, courses(*), users(*)')
      .eq('id', id)
      .single();

    if (error || !data) return sendError(res, 'Enrollment tidak ditemukan', 404);

    return sendSuccess(res, 'Detail enrollment berhasil diambil', data as Enrollment);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail enrollment', 500, error);
  }
};

export const updateEnrollment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progress_percentage } = req.body;

    const updates: Partial<Enrollment> = { updated_at: new Date().toISOString() };
    
    if (status) {
      updates.status = status;
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.progress_percentage = 100; 
      } else if (status === 'active') {
        updates.completed_at = null;
      }
    }

    if (progress_percentage !== undefined) {
      updates.progress_percentage = Number(progress_percentage);
      if (updates.progress_percentage === 100 && !status) {
         updates.status = 'completed';
         updates.completed_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('enrollments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Enrollment berhasil diperbarui', data as Enrollment);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui enrollment', 500, error);
  }
};

export const deleteEnrollment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('enrollments').delete().eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Enrollment berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus enrollment', 500, error);
  }
};

export const checkEnrollmentStatus = async (req: Request, res: Response) => {
  try {
    const { user_id, course_id } = req.query;

    if (!user_id || !course_id) {
      return sendError(res, 'Parameter user_id dan course_id wajib diisi', 400);
    }

    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .maybeSingle(); 

    if (error) throw error;

    const enrollmentData = data as Enrollment | null;

    return sendSuccess(res, 'Status enrollment berhasil dicek', {
      is_enrolled: !!enrollmentData,
      status: enrollmentData ? enrollmentData.status : null,
      enrollment_data: enrollmentData
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengecek status enrollment', 500, error);
  }
};

export const getStatsUsersPerCourse = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id, courses(title)');

    if (error) throw error;

    const stats = data.reduce((acc: any, curr: any) => {
      const courseId = curr.course_id;
      if (!acc[courseId]) {
        acc[courseId] = {
          course_id: courseId,
          course_title: curr.courses?.title || 'Unknown',
          total_users: 0
        };
      }
      acc[courseId].total_users += 1;
      return acc;
    }, {});

    return sendSuccess(res, 'Statistik user per course', Object.values(stats));
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil statistik', 500, error);
  }
};

export const getStatsCoursesPerUser = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('user_id, status');

    if (error) throw error;

    const stats = data.reduce((acc: any, curr: any) => {
      const userId = curr.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          total_courses: 0,
          active: 0,
          completed: 0,
          dropped: 0
        };
      }
      acc[userId].total_courses += 1;
      if (curr.status === 'active') acc[userId].active += 1;
      if (curr.status === 'completed') acc[userId].completed += 1;
      if (curr.status === 'dropped') acc[userId].dropped += 1;
      return acc;
    }, {});

    return sendSuccess(res, 'Statistik course per user', Object.values(stats));
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil statistik', 500, error);
  }
};

export const getUserEnrollments = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { status } = req.query;

    if (!user_id) {
      return sendError(res, 'User ID wajib diisi', 400);
    }

    let query = supabase
      .from('enrollments')
      .select(`
        id,
        status,
        progress_percentage,
        created_at,
        completed_at,
        courses (
          id,
          title,
          description,
          thumbnail_url, 
          instructor_name,
          price
        )
      `)
      .eq('user_id', user_id);

    if (status) {
      query = query.eq('status', status);
    }
    
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return sendSuccess(res, 'Daftar kursus user berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil daftar kursus user', 500, error);
  }
};

export const getModuleEnrollmentsByUserId = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return sendError(res, 'User ID wajib diisi', 400);
    }

    const { data, error } = await supabase
      .from('module_enrollments')
      .select('*, modules(*)')
      .eq('user_id', user_id);

    if (error) throw error;

    return sendSuccess(res, 'Data module enrollment user berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data module enrollment user', 500, error);
  }
};