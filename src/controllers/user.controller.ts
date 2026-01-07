import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { hashPassword } from '../utils/password';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, sort = 'created_at', order = 'desc', role, is_premium } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    let query = supabase.from('users').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (is_premium) {
      query = query.eq('is_premium', is_premium === 'true');
    }

    query = query
      .order(String(sort), { ascending: order === 'asc' })
      .range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return sendSuccess(res, 'Data users berhasil diambil', {
      users: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total_data: count,
        total_page: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    return sendError(res, 'Gagal mengambil data users', 500, error);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return sendError(res, 'User tidak ditemukan', 404);

    delete (data as any).password_hash;
    return sendSuccess(res, 'Detail user berhasil diambil', data);
  } catch (error) {
    return sendError(res, 'Gagal mengambil detail user', 500, error);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, username, email, password, is_premium, role } = req.body;
    const avatar = req.file ? req.file.path : undefined;

    const updates: any = { updated_at: new Date() };

    if (full_name) updates.full_name = full_name;
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (is_premium !== undefined) updates.is_premium = Boolean(is_premium);
    if (role) updates.role = role;
    if (avatar) updates.avatar_url = avatar;
    
    if (password) {
      updates.password_hash = await hashPassword(password);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    delete (data as any).password_hash;
    return sendSuccess(res, 'Data user berhasil diperbarui', data);
  } catch (error) {
    return sendError(res, 'Gagal memperbarui user', 500, error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'User berhasil dihapus');
  } catch (error) {
    return sendError(res, 'Gagal menghapus user', 500, error);
  }
};