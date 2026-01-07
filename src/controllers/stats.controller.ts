import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: adminCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    const { count: premiumCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true);

    const { count: verifiedCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    const { count: activeToday } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    return sendSuccess(res, 'Statistik user berhasil diambil', {
      total_users: totalUsers || 0,
      by_role: {
        admin: adminCount || 0,
        user: userCount || 0,
      },
      status: {
        premium: premiumCount || 0,
        verified: verifiedCount || 0,
      },
      activity: {
        active_today: activeToday || 0
      }
    });
  } catch (error) {
    return sendError(res, 'Gagal mengambil statistik', 500, error);
  }
};