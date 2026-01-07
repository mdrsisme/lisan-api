import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createSlug } from '../utils/slugify';

// --- Dictionary Management ---

export const getAllDictionaries = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, difficulty } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase.from('dictionaries').select('*', { count: 'exact' });

    if (search) query = query.ilike('title', `%${search}%`);
    if (difficulty) query = query.eq('difficulty', difficulty);

    query = query.eq('status', 'published')
                 .order('order_index', { ascending: true })
                 .range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return sendSuccess(res, 'Data kamus berhasil diambil', {
      data,
      meta: {
        total: count,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data kamus', 500, error.message);
  }
};

export const getDictionaryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('dictionaries')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return sendError(res, 'Kamus tidak ditemukan', 404);
    return sendSuccess(res, 'Detail kamus berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail kamus', 500, error.message);
  }
};

export const createDictionary = async (req: Request, res: Response) => {
  try {
    const { title, description, difficulty, order_index } = req.body;
    const thumbnail_url = req.file ? (req.file as any).path : null;
    const slug = createSlug(title);
    
    const { data, error } = await supabase.from('dictionaries').insert({
      title, slug, description, thumbnail_url, difficulty, order_index
    }).select().single();

    if (error) throw error;
    return sendSuccess(res, 'Kamus berhasil dibuat', data, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat kamus', 500, error.message);
  }
};

export const updateDictionary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (req.file) updates.thumbnail_url = (req.file as any).path;
    if (updates.title) updates.slug = createSlug(updates.title);

    const { data, error } = await supabase
      .from('dictionaries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Kamus berhasil diperbarui', data);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui kamus', 500, error.message);
  }
};

export const deleteDictionary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('dictionaries').delete().eq('id', id);
    if (error) throw error;
    return sendSuccess(res, 'Kamus berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus kamus', 500, error.message);
  }
};

// --- Dictionary Items Management ---

export const getItemsByDictionary = async (req: Request, res: Response) => {
  try {
    const { dictionaryId } = req.params;
    const { search } = req.query;

    let query = supabase.from('dictionary_items').select('*').eq('dictionary_id', dictionaryId);
    if (search) query = query.ilike('word', `%${search}%`);

    const { data, error } = await query.order('order_index', { ascending: true });
    if (error) throw error;

    return sendSuccess(res, 'Items berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil items', 500, error.message);
  }
};

export const createDictionaryItem = async (req: Request, res: Response) => {
  try {
    const { dictionary_id, word, definition, type, order_index } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const video_url = files?.['video']?.[0]?.path;
    const image_url = files?.['image']?.[0]?.path;
    const slug = createSlug(word);

    const { data, error } = await supabase.from('dictionary_items').insert({
      dictionary_id, word, slug, definition, type, order_index, video_url, image_url
    }).select().single();

    if (error) throw error;
    return sendSuccess(res, 'Item berhasil ditambahkan', data, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal menambah item', 500, error.message);
  }
};

export const deleteDictionaryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('dictionary_items').delete().eq('id', id);
    if (error) throw error;
    return sendSuccess(res, 'Item berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus item', 500, error.message);
  }
};