import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { dictionary_item_id, question, options, correct_answer } = req.body;

    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({ dictionary_item_id, question, options, correct_answer })
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Kuis berhasil dibuat', data);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat kuis', 500, error.message);
  }
};

export const getQuizByItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('dictionary_item_id', itemId);

    if (error) throw error;
    return sendSuccess(res, 'Data kuis berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil kuis', 500, error.message);
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (error) throw error;
    return sendSuccess(res, 'Kuis berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus kuis', 500, error.message);
  }
};