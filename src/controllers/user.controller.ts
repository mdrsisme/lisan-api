import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username, score, level, is_verified, is_premium } = req.body;
    
    let updateData: any = {};

    if (username) updateData.username = username;
    if (score !== undefined) updateData.score = score;
    if (level !== undefined) updateData.level = level;
    if (is_verified !== undefined) updateData.is_verified = is_verified;
    if (is_premium !== undefined) updateData.is_premium = is_premium;

    if (req.file) {
      updateData.avatar_url = req.file.path; 
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'Tidak ada data update', 400);
    }

    updateData.updated_at = new Date();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    delete data.password;
    delete data.verification_code;

    return sendSuccess(res, 'Update berhasil', data);

  } catch (error: any) {
    return sendError(res, 'Gagal update profil', 500, error);
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();
    
    if (!user) return sendError(res, 'User tidak ditemukan', 404);

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) return sendError(res, 'Password lama salah', 401);

    const hashedNewPassword = await hashPassword(newPassword);
    
    const { error } = await supabase
      .from('users')
      .update({ password: hashedNewPassword, updated_at: new Date() })
      .eq('id', userId);

    if (error) throw error;

    return sendSuccess(res, 'Password berhasil diubah');

  } catch (error: any) {
    return sendError(res, 'Gagal ubah password', 500, error);
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) throw error;

    return sendSuccess(res, 'Akun dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal hapus akun', 500, error);
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { search, role, sortBy = 'created_at', order = 'desc', page = 1, limit = 10 } = req.query;

    let query = supabase.from('users').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const allowedSorts = ['created_at', 'updated_at', 'level', 'score', 'username', 'email'];
    const sortField = allowedSorts.includes(sortBy as string) ? (sortBy as string) : 'created_at';
    
    query = query.order(sortField, { ascending: order === 'asc' });

    const from = ((Number(page) - 1) * Number(limit));
    const to = from + Number(limit) - 1;
    
    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    if (data) {
      data.forEach(u => {
        delete u.password;
        delete u.verification_code;
      });
    }

    return sendSuccess(res, 'Data user berhasil', {
      users: data,
      pagination: { total: count, page: Number(page), limit: Number(limit) }
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data', 500, error);
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const [
      { count: totalUsers },
      { count: verifiedUsers },
      { count: premiumUsers },
      { count: admins },
      { count: teachers }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_premium', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    ]);

    const { count: highLevelUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('level', 10);

    return sendSuccess(res, 'Statistik berhasil', {
      total: totalUsers,
      verified: verifiedUsers,
      premium: premiumUsers,
      byRole: { admin: admins, teacher: teachers },
      highLevel: highLevelUsers
    });

  } catch (error: any) {
    return sendError(res, 'Gagal mengambil statistik', 500, error);
  }
};