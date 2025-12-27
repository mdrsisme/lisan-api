import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const updateLessonProgress = async (req: Request, res: Response) => {
  try {
    const { user_id, course_id, module_id, lesson_id, is_completed, last_position_seconds } = req.body;

    if (!user_id || !course_id || !module_id || !lesson_id) {
      return sendError(res, 'Parameter wajib: user_id, course_id, module_id, lesson_id', 400);
    }

    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id,
        course_id,
        module_id,
        lesson_id,
        is_completed: is_completed === true,
        last_position_seconds: last_position_seconds || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, lesson_id' })
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Progress berhasil disimpan', data);
  } catch (error: any) {
    return sendError(res, 'Gagal menyimpan progress', 500, error);
  }
};

export const getUserCourseProgress = async (req: Request, res: Response) => {
  try {
    const { user_id, course_id } = req.params;

    if (!user_id || !course_id) {
        return sendError(res, 'User ID dan Course ID wajib diisi', 400);
    }

    const modulesPromise = supabase
      .from('user_module_progress')
      .select('module_id, is_completed')
      .eq('user_id', user_id)
      .eq('course_id', course_id);

    const lessonsPromise = supabase
      .from('user_lesson_progress')
      .select('lesson_id, is_completed, last_position_seconds')
      .eq('user_id', user_id)
      .eq('course_id', course_id);

    const [modulesRes, lessonsRes] = await Promise.all([modulesPromise, lessonsPromise]);

    if (modulesRes.error) throw modulesRes.error;
    if (lessonsRes.error) throw lessonsRes.error;

    return sendSuccess(res, 'Data progress berhasil diambil', {
      completed_modules: modulesRes.data || [],
      completed_lessons: lessonsRes.data || []
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data progress', 500, error);
  }
};