import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const logGesture = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { dictionary_item_id, detected_label, expected_label, accuracy_score, device_info } = req.body;

    const { data, error } = await supabase
      .from('gesture_logs')
      .insert({
        user_id: userId,
        dictionary_item_id,
        detected_label,
        expected_label,
        accuracy_score,
        device_info
      })
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Log gestur berhasil disimpan', data, 201);
  } catch (error) {
    return sendError(res, 'Gagal menyimpan log gestur', 500, error);
  }
};