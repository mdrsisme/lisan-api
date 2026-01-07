import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createSlug } from '../utils/slugify';
import { Dictionary, DictionaryItem, DictionaryStatus, DifficultyLevel, ItemType } from '../types/dictionary';

const getPagination = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { from: offset, to: offset + limit - 1 };
};

// --- Dictionary (Category) ---

export const createDictionary = async (req: Request, res: Response) => {
  try {
    const { title, description, status, difficulty, order_index } = req.body;
    const thumbnail_url = req.file ? (req.file as any).path : null;

    if (!title) return sendError(res, 'Judul kamus wajib diisi', 400);

    const slug = createSlug(title);
    
    const { data: existing } = await supabase
      .from('dictionaries')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) return sendError(res, 'Kamus dengan judul ini sudah ada', 409);

    const newDict: Partial<Dictionary> = {
      title,
      slug,
      description,
      thumbnail_url,
      status: (status as DictionaryStatus) || 'published',
      difficulty: (difficulty as DifficultyLevel) || 'beginner',
      order_index: order_index ? Number(order_index) : 0
    };

    const { data, error } = await supabase.from('dictionaries').insert(newDict).select().single();
    if (error) throw error;

    return sendSuccess(res, 'Kamus berhasil dibuat', data, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat kamus', 500, error);
  }
};

export const getAllDictionaries = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status, difficulty } = req.query;
    const { from, to } = getPagination(Number(page), Number(limit));

    let query = supabase.from('dictionaries').select('*', { count: 'exact' });

    if (search) query = query.ilike('title', `%${search}%`);
    if (status) query = query.eq('status', status);
    if (difficulty) query = query.eq('difficulty', difficulty);

    query = query.order('order_index', { ascending: true }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return sendSuccess(res, 'Data kamus berhasil diambil', {
      dictionaries: data as Dictionary[],
      pagination: {
        total_data: count,
        total_page: Math.ceil((count || 0) / Number(limit)),
        current_page: Number(page),
        per_page: Number(limit)
      }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data kamus', 500, error);
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
    return sendError(res, 'Gagal mengambil detail kamus', 500, error);
  }
};

export const updateDictionary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Dictionary> = { ...req.body };

    if (req.body.title) updates.slug = createSlug(req.body.title);
    if (req.file) updates.thumbnail_url = (req.file as any).path;

    const { data, error } = await supabase
      .from('dictionaries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Kamus berhasil diperbarui', data);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui kamus', 500, error);
  }
};

export const deleteDictionary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('dictionaries').delete().eq('id', id);
    if (error) throw error;
    return sendSuccess(res, 'Kamus berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus kamus', 500, error);
  }
};

// --- Dictionary Items (Words) ---

export const createDictionaryItem = async (req: Request, res: Response) => {
  try {
    const { dictionary_id, word, definition, type, order_index } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const video_url = files?.['video']?.[0]?.path;
    const image_url = files?.['image']?.[0]?.path;

    if (!dictionary_id || !word || !video_url) {
      return sendError(res, 'Dictionary ID, Kata, dan Video wajib diisi', 400);
    }

    const slug = createSlug(word);
    
    const { data: existing } = await supabase
        .from('dictionary_items')
        .select('id')
        .eq('dictionary_id', dictionary_id)
        .eq('slug', slug)
        .single();

    if (existing) return sendError(res, 'Kata ini sudah ada dalam kamus tersebut', 409);

    const newItem: Partial<DictionaryItem> = {
      dictionary_id,
      word,
      slug,
      definition,
      video_url,
      image_url,
      type: (type as ItemType) || 'word',
      order_index: order_index ? Number(order_index) : 0
    };

    const { data, error } = await supabase.from('dictionary_items').insert(newItem).select().single();
    if (error) throw error;

    return sendSuccess(res, 'Kata berhasil ditambahkan', data, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal menambahkan kata', 500, error);
  }
};

export const getItemsByDictionary = async (req: Request, res: Response) => {
  try {
    const { dictionaryId } = req.params;
    const { page = 1, limit = 20, search } = req.query;
    const { from, to } = getPagination(Number(page), Number(limit));

    let query = supabase
      .from('dictionary_items')
      .select('*', { count: 'exact' })
      .eq('dictionary_id', dictionaryId);

    if (search) query = query.ilike('word', `%${search}%`);

    query = query.order('order_index', { ascending: true }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return sendSuccess(res, 'Daftar kata berhasil diambil', {
      items: data as DictionaryItem[],
      pagination: {
        total_data: count,
        total_page: Math.ceil((count || 0) / Number(limit)),
        current_page: Number(page),
        per_page: Number(limit)
      }
    });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil daftar kata', 500, error);
  }
};

export const updateDictionaryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<DictionaryItem> = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.['video']?.[0]) updates.video_url = files['video'][0].path;
    if (files?.['image']?.[0]) updates.image_url = files['image'][0].path;
    if (req.body.word) updates.slug = createSlug(req.body.word);

    const { data, error } = await supabase
      .from('dictionary_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Kata berhasil diperbarui', data);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui kata', 500, error);
  }
};

export const deleteDictionaryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('dictionary_items').delete().eq('id', id);
    if (error) throw error;
    return sendSuccess(res, 'Kata berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus kata', 500, error);
  }
};