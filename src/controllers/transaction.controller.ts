import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { user_id, amount, provider, payment_method, metadata } = req.body;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id,
        amount,
        provider,
        payment_method,
        metadata: metadata || {},
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Transaksi berhasil dibuat', data, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal membuat transaksi', 500, error.message);
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase.from('transactions').select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return sendSuccess(res, 'Semua transaksi berhasil diambil', { data, count });
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil data transaksi', 500, error.message);
  }
};

export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return sendSuccess(res, 'Riwayat transaksi user berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil riwayat transaksi', 500, error.message);
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();

    if (error) throw error;
    return sendSuccess(res, 'Detail transaksi berhasil diambil', data);
  } catch (error: any) {
    return sendError(res, 'Gagal mengambil detail transaksi', 500, error.message);
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, provider_order_id, metadata } = req.body;

    const { data, error } = await supabase
      .from('transactions')
      .update({ status, provider_order_id, metadata })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return sendSuccess(res, 'Transaksi berhasil diperbarui', data);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui transaksi', 500, error.message);
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) throw error;
    return sendSuccess(res, 'Transaksi berhasil dihapus');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus transaksi', 500, error.message);
  }
};