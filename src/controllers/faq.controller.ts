import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { FAQ, FaqCategory } from '../types/faq';

export const createFaq = async (req: Request, res: Response) => {
  try {
    const { question, answer, category = 'general', is_active = true } = req.body;

    if (!question || !answer) {
      return sendError(res, 'Pertanyaan dan Jawaban wajib diisi', 400);
    }

    const validCategories: FaqCategory[] = ['general', 'account', 'subscription', 'technical', 'learning'];
    if (category && !validCategories.includes(category)) {
      return sendError(res, `Kategori tidak valid.`, 400);
    }

    const newFaq = {
      question,
      answer,
      category,
      is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('faqs')
      .insert(newFaq)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'FAQ berhasil dibuat', data as FAQ, 201);

  } catch (error: any) {
    return sendError(res, 'Gagal membuat FAQ', 500, error);
  }
};

export const getAllFaqs = async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      category, 
      is_active,
      sortBy = 'created_at',
      order = 'desc', 
      page = 1, 
      limit 
    } = req.query;

    let query = supabase.from('faqs').select('*', { count: 'exact' });

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`question.ilike.${searchTerm},answer.ilike.${searchTerm}`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const allowedSorts = ['created_at', 'updated_at', 'question', 'category'];
    const sortField = allowedSorts.includes(sortBy as string) ? (sortBy as string) : 'created_at';
    query = query.order(sortField, { ascending: order === 'asc' });

    const isGetAll = limit === '0' || limit === 'all';
    let pageNum = 1;
    let limitNum = 10;

    if (!isGetAll) {
      pageNum = Number(page) || 1;
      limitNum = Number(limit) || 10;
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;
      query = query.range(from, to);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return sendSuccess(res, 'Data FAQ berhasil diambil', {
      data: data as FAQ[],
      meta: {
        total_data: count,
        current_page: isGetAll ? 1 : pageNum,
        per_page: isGetAll ? count : limitNum,
        total_pages: (count && !isGetAll && limitNum > 0) ? Math.ceil(count / limitNum) : 1,
        has_next: (!isGetAll && count && limitNum > 0) ? ((pageNum - 1) * limitNum) + limitNum < count : false
      }
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data FAQ', 500, error);
  }
};

export const countFaqs = async (req: Request, res: Response) => {
  try {
    const { count, error } = await supabase
      .from('faqs')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return sendSuccess(res, 'Total data FAQ', { total: count });
  } catch (error: any) {
    return sendError(res, 'Gagal menghitung data', 500, error);
  }
};

export const getFaqById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return sendError(res, 'FAQ tidak ditemukan', 404);

    return sendSuccess(res, 'Detail FAQ', data as FAQ);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail FAQ', 500, error);
  }
};

export const updateFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, answer, category, is_active } = req.body;

    const updateData: any = {};

    if (question) updateData.question = question;
    if (answer) updateData.answer = answer;
    if (category) {
       const validCategories: FaqCategory[] = ['general', 'account', 'subscription', 'technical', 'learning'];
       if (!validCategories.includes(category)) return sendError(res, `Kategori tidak valid.`, 400);
       updateData.category = category;
    }
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) return sendError(res, 'Tidak ada data yang diubah', 400);

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('faqs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'FAQ berhasil diperbarui', data as FAQ);

  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui FAQ', 500, error);
  }
};

export const deleteFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'FAQ berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus FAQ', 500, error);
  }
};