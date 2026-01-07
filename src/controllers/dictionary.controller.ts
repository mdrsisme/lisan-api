import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { 
  CreateCategoryPayload, 
  UpdateCategoryPayload, 
  CreateSignItemPayload, 
  UpdateSignItemPayload 
} from '../types/learning';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return sendSuccess(res, 'Categories fetched successfully', data);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch categories', 500, error.message);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return sendError(res, 'Category not found', 404, error.message);
    return sendSuccess(res, 'Category details fetched successfully', data);
  } catch (error: any) {
    return sendError(res, 'Server error', 500, error.message);
  }
};

export const createCategory = async (req: Request<{}, {}, CreateCategoryPayload>, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Category created successfully', data, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create category', 400, error.message);
  }
};

export const updateCategory = async (req: Request<{ id: string }, {}, UpdateCategoryPayload>, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('categories')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Category updated successfully', data);
  } catch (error: any) {
    return sendError(res, 'Failed to update category', 400, error.message);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return sendSuccess(res, 'Category deleted successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to delete category', 500, error.message);
  }
};

export const getItemsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { data, error } = await supabase
      .from('sign_items')
      .select('*')
      .eq('category_id', categoryId);

    if (error) throw error;
    return sendSuccess(res, 'Items fetched successfully', data);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch items', 500, error.message);
  }
};

export const createSignItem = async (req: Request<{}, {}, CreateSignItemPayload>, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('sign_items')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Sign item created successfully', data, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create sign item', 400, error.message);
  }
};

export const updateSignItem = async (req: Request<{ id: string }, {}, UpdateSignItemPayload>, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('sign_items')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Sign item updated successfully', data);
  } catch (error: any) {
    return sendError(res, 'Failed to update sign item', 400, error.message);
  }
};

export const deleteSignItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('sign_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return sendSuccess(res, 'Sign item deleted successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to delete sign item', 500, error.message);
  }
};