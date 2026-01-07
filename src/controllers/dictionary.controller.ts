import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { createSlug } from '../utils/slugify';

export const getAllDictionaries = async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query;
    const userId = (req as any).user?.id;
    
    let query = supabase
      .from('dictionaries')
      .select(`
        *,
        user_progress:user_dictionary_progress(
            total_items,
            completed_items,
            progress_percentage,
            is_completed
        )
      `)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (userId) {
        query = query.eq('user_dictionary_progress.user_id', userId);
    }

    if (type) query = query.eq('category_type', type);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    const formattedData = data.map((item: any) => ({
        ...item,
        user_progress: item.user_progress?.[0] || null
    }));

    return sendSuccess(res, 'Data kamus berhasil diambil', formattedData);
  } catch (error) {
    return sendError(res, 'Gagal mengambil data kamus', 500, error);
  }
};

export const createDictionary = async (req: Request, res: Response) => {
  try {
    const { title, category_type, description } = req.body;
    const thumbnail_url = req.file ? req.file.path : null;
    const slug = createSlug(title);

    const { data, error } = await supabase
      .from('dictionaries')
      .insert({ title, slug, category_type, description, thumbnail_url })
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Kamus berhasil dibuat', data, 201);
  } catch (error) {
    return sendError(res, 'Gagal membuat kamus', 500, error);
  }
};

export const getItemsByDictionary = async (req: Request, res: Response) => {
  try {
    const { dictionaryId } = req.params;
    const userId = (req as any).user?.id;

    const { data, error } = await supabase
      .from('dictionary_items')
      .select(`
        *,
        progress:user_item_progress(status, user_id)
      `)
      .eq('dictionary_id', dictionaryId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;

    const formattedData = data.map((item: any) => {
        const userProgress = item.progress?.find((p: any) => p.user_id === userId);
        return {
            ...item,
            is_learned: !!userProgress,
            status: userProgress ? userProgress.status : 'new'
        };
    });

    return sendSuccess(res, 'Item kamus berhasil diambil', formattedData);
  } catch (error) {
    return sendError(res, 'Gagal mengambil item', 500, error);
  }
};

export const createDictionaryItem = async (req: Request, res: Response) => {
  try {
    const { dictionary_id, word, definition, item_type, target_gesture_data, video_url } = req.body;
    const image_url = req.file ? req.file.path : null;

    const { data, error } = await supabase
      .from('dictionary_items')
      .insert({
        dictionary_id,
        word,
        definition,
        video_url,
        image_url,
        item_type: item_type || 'flashcard',
        target_gesture_data: item_type === 'gesture_test' ? target_gesture_data : null
      })
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Item berhasil ditambahkan', data, 201);
  } catch (error) {
    return sendError(res, 'Gagal menambahkan item', 500, error);
  }
};

export const trackItemProgress = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.id;

    const { data, error } = await supabase
      .from('user_item_progress')
      .upsert({
        user_id: userId,
        dictionary_item_id: itemId,
        status: status || 'learned',
        last_practiced_at: new Date()
      }, { onConflict: 'user_id, dictionary_item_id' })
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Progress item tersimpan', data);
  } catch (error) {
    return sendError(res, 'Gagal menyimpan progress', 500, error);
  }
};