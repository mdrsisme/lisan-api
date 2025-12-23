import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { hashPassword } from '../utils/password';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { User, AuthPayload } from '../types/user';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, username, role = 'user' } = req.body;

    if (!email || !password || !username) {
      return sendError(res, 'Email, Password, dan Username wajib diisi', 400);
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return sendError(res, 'Email atau Username sudah terdaftar', 409);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      email,
      password_hash: hashedPassword,
      full_name,
      username,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: false,
      is_premium: false,
      level: 1,
      xp: 0
    };

    const { data, error } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (error) throw error;

    const userResult = data as User;
    // @ts-ignore
    delete userResult.password_hash;

    return sendSuccess(res, 'User berhasil dibuat', userResult, 201);

  } catch (error: any) {
    return sendError(res, 'Gagal membuat user baru', 500, error);
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      role, 
      sortBy = 'created_at', 
      order = 'desc', 
      page = 1, 
      limit = 10,
      is_premium,
      is_verified
    } = req.query;

    let query = supabase.from('users').select('*', { count: 'exact' });
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`email.ilike.${searchTerm},username.ilike.${searchTerm},full_name.ilike.${searchTerm}`);
    }

    if (role) query = query.eq('role', role);
    if (is_premium) query = query.eq('is_premium', is_premium === 'true');
    if (is_verified) query = query.eq('is_verified', is_verified === 'true');

    const allowedSorts = ['created_at', 'updated_at', 'level', 'xp', 'username', 'email', 'full_name'];
    const sortField = allowedSorts.includes(sortBy as string) ? (sortBy as string) : 'created_at';
    query = query.order(sortField, { ascending: order === 'asc' });

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;
    
    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    const users = data as User[];
    if (users) {
      users.forEach(u => {
        // @ts-ignore
        delete u.password_hash;
      });
    }

    return sendSuccess(res, 'Data pengguna berhasil diambil', {
      data: users,
      meta: {
        total_data: count,
        current_page: pageNum,
        per_page: limitNum,
        total_pages: count ? Math.ceil(count / limitNum) : 0,
        has_next: count ? to < count - 1 : false,
        has_prev: pageNum > 1
      }
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data pengguna', 500, error);
  }
};

export const updateUserAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      username, full_name, email, 
      role, is_verified, is_premium, 
      level, xp, password 
    } = req.body;

    const updateData: any = {};

    if (username) updateData.username = username;
    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email;
    
    if (role) updateData.role = role;
    if (is_verified !== undefined) updateData.is_verified = is_verified;
    if (is_premium !== undefined) updateData.is_premium = is_premium;
    if (level !== undefined) updateData.level = level;
    if (xp !== undefined) updateData.xp = xp;

    if (password) {
      updateData.password_hash = await hashPassword(password);
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'Tidak ada data yang diubah', 400);
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const updatedUser = data;
    delete updatedUser.password_hash;

    return sendSuccess(res, 'Akun user berhasil diperbarui', updatedUser);

  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui akun user', 500, error);
  }
};

export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'User berhasil dihapus permanent');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus user', 500, error);
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).user as AuthPayload;
    const myId = userPayload.id;

    const { username, full_name, email } = req.body;
    
    const updateData: Partial<User> = {};

    if (username) updateData.username = username;
    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email;

    if (req.file) {
      updateData.avatar_url = req.file.path; 
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'Tidak ada data profil yang diubah', 400);
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', myId)
      .select()
      .single();

    if (error) throw error;

    const updatedUser = data as User;
    // @ts-ignore
    delete updatedUser.password_hash;

    return sendSuccess(res, 'Profil Anda berhasil diperbarui', updatedUser);

  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui profil Anda', 500, error);
  }
};

export const deleteMyAccount = async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).user as AuthPayload;
    const myId = userPayload.id;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', myId);

    if (error) throw error;

    return sendSuccess(res, 'Akun Anda berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus akun Anda', 500, error);
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const [
      { count: totalUsers },
      { count: verifiedUsers },
      { count: premiumUsers },
      { count: admins },
      { count: activeUsers } 
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_premium', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      supabase.from('users').select('*', { count: 'exact', head: true }).gt('level', 1)
    ]);

    return sendSuccess(res, 'Statistik pengguna', {
      total_users: totalUsers || 0,
      verified_users: verifiedUsers || 0,
      premium_users: premiumUsers || 0,
      admins: admins || 0,
      active_users: activeUsers || 0,
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil statistik', 500, error);
  }
};


export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return sendError(res, 'User ID diperlukan', 400);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, full_name, role, level, xp, is_verified, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return sendError(res, 'User tidak ditemukan', 404);
    }

    return sendSuccess(res, 'Data user ditemukan', user);

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data user', 500, error);
  }
};