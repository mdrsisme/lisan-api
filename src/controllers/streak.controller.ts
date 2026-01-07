import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

// Ambil status streak user saat ini
export const getMyStreak = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.id;

    // Cek apakah data streak ada, jika tidak buat baru
    let { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!data) {
        const { data: newData, error: newError } = await supabase
            .from('user_streaks')
            .insert({ user_id })
            .select()
            .single();
        if (newError) throw newError;
        data = newData;
    }

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    return sendSuccess(res, 'Data streak berhasil diambil', data);
  } catch (error) {
    return sendError(res, 'Gagal mengambil streak', 500, error);
  }
};

// Dipanggil saat user menyelesaikan task/lesson harian
export const updateStreak = async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Ambil data streak
    let { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!streakData) {
      // Jika belum ada, buat baru start 1
      const { data: newData } = await supabase
        .from('user_streaks')
        .insert({ 
            user_id, 
            current_streak: 1, 
            longest_streak: 1, 
            last_activity_date: today 
        })
        .select().single();
      return sendSuccess(res, 'Streak dimulai!', newData);
    }

    const lastActive = streakData.last_activity_date;
    
    // Jika sudah latihan hari ini, tidak ada update
    if (lastActive === today) {
        return sendSuccess(res, 'Streak sudah terhitung hari ini', streakData);
    }

    // Hitung selisih hari
    const dateToday = new Date(today);
    const dateLast = new Date(lastActive);
    const diffTime = Math.abs(dateToday.getTime() - dateLast.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    let newStreak = streakData.current_streak;
    
    if (diffDays === 1) {
        // Jika selisih 1 hari (kemarin), streak bertambah
        newStreak += 1;
    } else {
        // Jika lebih dari 1 hari (absen), reset ke 1
        newStreak = 1;
    }

    const newLongest = Math.max(newStreak, streakData.longest_streak);

    const { data: updatedData, error } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        updated_at: new Date()
      })
      .eq('id', streakData.id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Streak diperbarui', updatedData);
  } catch (error) {
    return sendError(res, 'Gagal update streak', 500, error);
  }
};