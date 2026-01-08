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
        user_progress:user_dictionary_progress!left(
            total_items,
            completed_items,
            progress_percentage,
            is_completed,
            user_id
        )
      `)
      .order('order_index', { ascending: true });

    if (type) query = query.eq('category_type', type);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    const formattedData = data.map((item: any) => {
        const myProgress = Array.isArray(item.user_progress) 
            ? item.user_progress.find((p: any) => p.user_id === userId)
            : null;

        return {
            ...item,
            user_progress: myProgress || null
        };
    });

    return sendSuccess(res, 'Data dictionaries retrieved', formattedData);
  } catch (error) {
    return sendError(res, 'Failed to retrieve dictionaries', 500, error);
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

    if (error) throw error;
    return sendSuccess(res, 'Dictionary details retrieved', data);
  } catch (error) {
    return sendError(res, 'Failed to retrieve dictionary', 500, error);
  }
};

export const createDictionary = async (req: Request, res: Response) => {
  try {
    const { title, category_type, description, is_active } = req.body;
    const thumbnail_url = req.file ? req.file.path : null;
    const slug = createSlug(title);

    const { data, error } = await supabase
      .from('dictionaries')
      .insert({ 
        title, 
        slug, 
        category_type, 
        description, 
        thumbnail_url,
        is_active: is_active === 'true' || is_active === true 
      })
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Dictionary created successfully', data, 201);
  } catch (error) {
    return sendError(res, 'Failed to create dictionary', 500, error);
  }
};

export const updateDictionary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category_type, description, is_active } = req.body;
    
    const updates: any = { 
      title, 
      category_type, 
      description,
      updated_at: new Date()
    };

    if (is_active !== undefined) {
        updates.is_active = is_active === 'true' || is_active === true;
    }
    
    if (req.file) {
      updates.thumbnail_url = req.file.path;
    }

    if (title) {
        updates.slug = createSlug(title);
    }

    const { data, error } = await supabase
      .from('dictionaries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Dictionary updated successfully', data);
  } catch (error) {
    return sendError(res, 'Failed to update dictionary', 500, error);
  }
};

export const deleteDictionary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('dictionaries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return sendSuccess(res, 'Dictionary deleted successfully', null);
  } catch (error) {
    return sendError(res, 'Failed to delete dictionary', 500, error);
  }
};

export const getItemsByDictionary = async (req: Request, res: Response) => {
  try {
    const { dictionaryId } = req.params;
    const { search } = req.query;
    const userId = (req as any).user?.id;

    let query = supabase
      .from('dictionary_items')
      .select(`
        *,
        ai_model:ai_models (
           id,
           model_url,
           config
        ),
        progress:user_item_progress (
           status, 
           user_id
        )
      `)
      .eq('dictionary_id', dictionaryId)
      .order('order_index', { ascending: true });

    if (search) {
        query = query.ilike('word', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formattedData = data.map((item: any) => {
        const userProgress = item.progress?.find((p: any) => p.user_id === userId);
        return {
            ...item,
            ai_model_url: item.ai_model?.model_url || null,
            ai_model_config: item.ai_model?.config || null,
            is_learned: !!userProgress,
            status: userProgress ? userProgress.status : 'new'
        };
    });

    return sendSuccess(res, 'Dictionary items retrieved', formattedData);
  } catch (error) {
    return sendError(res, 'Failed to retrieve items', 500, error);
  }
};

export const createDictionaryItem = async (req: Request, res: Response) => {
  try {
    const { 
        dictionary_id, 
        word, 
        definition, 
        item_type, 
        target_gesture_data, 
        video_url,
        ai_model_id 
    } = req.body;
    
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
        ai_model_id: (ai_model_id && ai_model_id !== 'null') ? ai_model_id : null,
        target_gesture_data
      })
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Item added successfully', data, 201);
  } catch (error) {
    return sendError(res, 'Failed to add item', 500, error);
  }
};

export const updateDictionaryItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { 
        word, 
        definition, 
        item_type, 
        target_gesture_data, 
        video_url, 
        is_active,
        ai_model_id 
    } = req.body;
    
    const updates: any = {
        word, definition, item_type, target_gesture_data, video_url,
        updated_at: new Date()
    };

    if (ai_model_id !== undefined) {
        updates.ai_model_id = (ai_model_id && ai_model_id !== 'null') ? ai_model_id : null;
    }

    if (is_active !== undefined) updates.is_active = is_active;
    if (req.file) updates.image_url = req.file.path;

    const { data, error } = await supabase
      .from('dictionary_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Item updated successfully', data);
  } catch (error) {
    return sendError(res, 'Failed to update item', 500, error);
  }
};

export const deleteDictionaryItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { error } = await supabase
      .from('dictionary_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return sendSuccess(res, 'Item deleted successfully', null);
  } catch (error) {
    return sendError(res, 'Failed to delete item', 500, error);
  }
};

export const trackItemProgress = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.id;

    const { data: itemData, error: itemError } = await supabase
      .from('user_item_progress')
      .upsert({
        user_id: userId,
        dictionary_item_id: itemId,
        status: status || 'learned',
        last_practiced_at: new Date()
      }, { onConflict: 'user_id, dictionary_item_id' })
      .select()
      .single();

    if (itemError) throw itemError;

    const { data: dictItem } = await supabase
        .from('dictionary_items')
        .select('dictionary_id')
        .eq('id', itemId)
        .single();

    if (dictItem) {
        const dictId = dictItem.dictionary_id;

        const { count: totalItems } = await supabase
            .from('dictionary_items')
            .select('*', { count: 'exact', head: true })
            .eq('dictionary_id', dictId)
            .eq('is_active', true);

        const { count: completedItems } = await supabase
            .from('user_item_progress')
            .select('dictionary_item_id, dictionary_items!inner(dictionary_id)', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'learned')
            .eq('dictionary_items.dictionary_id', dictId);
        
        const total = totalItems || 1;
        const completed = completedItems || 0;
        const percentage = Math.round((completed / total) * 100);

        await supabase
            .from('user_dictionary_progress')
            .upsert({
                user_id: userId,
                dictionary_id: dictId,
                total_items: total,
                completed_items: completed,
                progress_percentage: percentage,
                is_completed: percentage === 100,
                last_activity_at: new Date()
            }, { onConflict: 'user_id, dictionary_id' });
    }

    return sendSuccess(res, 'Progress saved', itemData);
  } catch (error) {
    return sendError(res, 'Failed to save progress', 500, error);
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { dictionaryId, itemId } = req.params;
    const userId = (req as any).user?.id;

    const { data, error } = await supabase
      .from('dictionary_items')
      .select(`
        *,
        ai_model:ai_models (
            id,
            model_url,
            config
        ),
        progress:user_item_progress (
            status, 
            user_id
        )
      `)
      .eq('dictionary_id', dictionaryId)
      .eq('id', itemId)
      .single();

    if (error) throw error;
    if (!data) return sendError(res, 'Item not found', 404);

    // Format data agar konsisten dengan getItemsByDictionary
    const userProgress = data.progress?.find((p: any) => p.user_id === userId);
    const formattedData = {
      ...data,
      ai_model_url: data.ai_model?.model_url || null,
      ai_model_config: data.ai_model?.config || null,
      is_learned: !!userProgress,
      status: userProgress ? userProgress.status : 'new'
    };

    // Hapus raw join data agar clean
    delete formattedData.progress;
    delete formattedData.ai_model;

    return sendSuccess(res, 'Dictionary item retrieved', formattedData);
  } catch (error) {
    return sendError(res, 'Failed to retrieve item', 500, error);
  }
};