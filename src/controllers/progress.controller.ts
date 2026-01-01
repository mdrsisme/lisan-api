import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const updateLessonProgress = async (req: Request, res: Response) => {
  try {
    const { user_id, course_id, module_id, lesson_id, is_completed, last_position_seconds } = req.body;

    if (!user_id || !course_id || !module_id || !lesson_id) {
      return sendError(res, 'Parameter wajib: user_id, course_id, module_id, lesson_id', 400);
    }

    const { data: existingProgress } = await supabase
      .from('user_lesson_progress')
      .select('is_completed')
      .eq('user_id', user_id)
      .eq('lesson_id', lesson_id)
      .single();

    const wasAlreadyCompleted = existingProgress?.is_completed || false;

    const { data: savedProgress, error: upsertError } = await supabase
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

    if (upsertError) throw upsertError;

    if (is_completed && !wasAlreadyCompleted) {
      await addUserXP(user_id, lesson_id);
      await checkAndUpdateModule(user_id, module_id, course_id);
      await checkAndUpdateCourse(user_id, course_id);
    }

    return sendSuccess(res, 'Progress berhasil disimpan', savedProgress);

  } catch (error: any) {
    console.error("Error updateLessonProgress:", error);
    return sendError(res, 'Gagal menyimpan progress', 500, error.message);
  }
};

export const getUserCourseProgress = async (req: Request, res: Response) => {
  try {
    const { user_id, course_id } = req.params;

    if (!user_id || !course_id) {
        return sendError(res, 'User ID dan Course ID wajib diisi', 400);
    }

    const [modulesRes, lessonsRes] = await Promise.all([
      supabase
        .from('user_module_progress')
        .select('module_id, is_completed')
        .eq('user_id', user_id)
        .eq('course_id', course_id),
      
      supabase
        .from('user_lesson_progress')
        .select('lesson_id, is_completed, last_position_seconds')
        .eq('user_id', user_id)
        .eq('course_id', course_id)
    ]);

    if (modulesRes.error) throw modulesRes.error;
    if (lessonsRes.error) throw lessonsRes.error;

    return sendSuccess(res, 'Data progress berhasil diambil', {
      completed_modules: modulesRes.data || [],
      completed_lessons: lessonsRes.data || []
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data progress', 500, error.message);
  }
};

const addUserXP = async (userId: string, lessonId: string) => {
  try {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('xp_reward')
      .eq('id', lessonId)
      .single();

    if (lesson && lesson.xp_reward > 0) {
      const { data: user } = await supabase
        .from('users')
        .select('xp, total_xp') 
        .eq('id', userId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({ 
            xp: (user.xp || 0) + lesson.xp_reward,
            total_xp: (user.total_xp || 0) + lesson.xp_reward 
          })
          .eq('id', userId);
      }
    }
  } catch (err) {
    console.error("Gagal menambah XP:", err);
  }
};

const checkAndUpdateModule = async (userId: string, moduleId: string, courseId: string) => {
  try {
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', moduleId)
      .eq('is_published', true);

    const { count: completedLessons } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_completed', true);

    const isModuleFinished = (totalLessons !== null && completedLessons !== null) && (totalLessons > 0 && totalLessons === completedLessons);

    await supabase.from('user_module_progress').upsert({
        user_id: userId,
        course_id: courseId,
        module_id: moduleId,
        is_completed: isModuleFinished,
        updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, module_id' });

  } catch (err) {
    console.error("Gagal update modul progress:", err);
  }
};

const checkAndUpdateCourse = async (userId: string, courseId: string) => {
    try {
        const { data: modules } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', courseId)
            .eq('is_published', true);
        
        const moduleIds = modules?.map(m => m.id) || [];
    
        if (moduleIds.length === 0) return;
    
        const { count: totalCourseLessons } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .in('module_id', moduleIds)
            .eq('is_published', true);
    
        const { count: userCompletedLessons } = await supabase
            .from('user_lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .eq('is_completed', true);
    
        const total = totalCourseLessons || 0;
        const completed = userCompletedLessons || 0;
        
        let percentage = 0;
        if (total > 0) {
            percentage = Math.round((completed / total) * 100);
        }
    
        const status = percentage === 100 ? 'completed' : 'active';
        
        const updateData: any = {
            progress_percentage: percentage,
            status: status,
            updated_at: new Date().toISOString()
        };

        if (percentage === 100) {
            updateData.completed_at = new Date().toISOString();
        }
    
        await supabase
            .from('enrollments')
            .update(updateData)
            .eq('user_id', userId)
            .eq('course_id', courseId);

    } catch (err) {
        console.error("Gagal update course progress:", err);
    }
};