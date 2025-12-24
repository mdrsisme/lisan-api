import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createSlug } from '../utils/slugify';
import { Course } from '../types/course';

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, level, price } = req.body;
    
    const slug = createSlug(title);
    let thumbnail_url = null;

    if (req.file) {
      thumbnail_url = req.file.path;
    }

    const newCourse = {
      title,
      slug,
      description,
      thumbnail_url,
      level,
      price: Number(price) || 0,
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('courses').insert(newCourse).select().single();
    if (error) throw error;

    return sendSuccess(res, 'Course berhasil dibuat', data);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat course', 500, error);
  }
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    const { search, level, is_published } = req.query;

    let query = supabase.from('courses').select('*');

    if (search) query = query.ilike('title', `%${search}%`);
    if (level) query = query.eq('level', level);
    if (is_published !== undefined) query = query.eq('is_published', is_published === 'true');

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return sendSuccess(res, 'Data course berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data course', 500, error);
  }
};

// Get Full Course Detail (Termasuk Module & Lesson)
export const getCourseBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Join Tables: Courses -> Modules -> Lessons
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules (
          *,
          lessons (*)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) return sendError(res, 'Course tidak ditemukan', 404);

    // Sorting manual karena Supabase join sorting kadang terbatas
    const course = data as Course;
    if (course.modules) {
      course.modules.sort((a, b) => a.order_index - b.order_index);
      course.modules.forEach(m => {
        if (m.lessons) m.lessons.sort((a, b) => a.order_index - b.order_index);
      });
    }

    return sendSuccess(res, 'Detail course ditemukan', course);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail course', 500, error);
  }
};

export const updateCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, level, price, is_published } = req.body;
        
        const updateData: any = {};
        if(title) {
            updateData.title = title;
            updateData.slug = createSlug(title);
        }
        if(description) updateData.description = description;
        if(level) updateData.level = level;
        if(price !== undefined) updateData.price = Number(price);
        if(is_published !== undefined) updateData.is_published = is_published === 'true';
        if(req.file) updateData.thumbnail_url = req.file.path;

        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('courses').update(updateData).eq('id', id).select().single();
        if(error) throw error;

        return sendSuccess(res, 'Course berhasil diupdate', data);
    } catch (error: any) {
        return sendError(res, 'Gagal update course', 500, error);
    }
}