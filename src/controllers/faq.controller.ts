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

    // Validasi Category (Optional, tapi bagus untuk mencegah error DB)
    const validCategories: FaqCategory[] = ['general', 'account', 'subscription', 'technical', 'learning'];
    if (category && !validCategories.includes(category)) {
      return sendError(res, `Kategori tidak valid. Pilihan: ${validCategories.join(', ')}`, 400);
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

export const getFaqs = async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      category, 
      is_active,
      sortBy = 'created_at', 
      order = 'desc', 
      page = 1, 
      limit = 10 
    } = req.query;

    let query = supabase.from('faqs').select('*', { count: 'exact' });

    // 1. Search (Question or Answer)
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`question.ilike.${searchTerm},answer.ilike.${searchTerm}`);
    }

    // 2. Filter Category
    if (category) {
      query = query.eq('category', category);
    }

    // 3. Filter Active Status
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    // 4. Sorting
    const allowedSorts = ['created_at', 'updated_at', 'question', 'category'];
    const sortField = allowedSorts.includes(sortBy as string) ? (sortBy as string) : 'created_at';
    query = query.order(sortField, { ascending: order === 'asc' });

    // 5. Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    return sendSuccess(res, 'Data FAQ berhasil diambil', {
      data: data as FAQ[],
      meta: {
        total_data: count,
        current_page: pageNum,
        per_page: limitNum,
        total_pages: count ? Math.ceil(count / limitNum) : 0,
        has_next: count ? to < count - 1 : false
      }
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data FAQ', 500, error);
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
       if (!validCategories.includes(category)) {
         return sendError(res, `Kategori tidak valid.`, 400);
       }
       updateData.category = category;
    }
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'Tidak ada data yang diubah', 400);
    }

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