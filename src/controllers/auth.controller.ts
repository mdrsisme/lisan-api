import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { sendEmailVerification } from '../config/brevo';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { getExpiryDate } from '../utils/date';
import { User } from '../types/user';

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password } = req.body;

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return sendError(res, 'Email sudah terdaftar', 400);
    }

    const password_hash = await hashPassword(password);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        full_name,
        email,
        password_hash,
        role: 'user',
        is_verified: false,
        xp: 0,
        level: 1
      })
      .select()
      .single();

    if (error || !newUser) {
      return sendError(res, 'Gagal membuat akun', 500, error);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = getExpiryDate(1); 

    await supabase.from('tokens').insert({
      user_id: newUser.id,
      token: code,
      type: 'email_verification',
      expires_at: expiresAt
    });

    await sendEmailVerification(email, full_name, code);

    const userResponse = { ...newUser };
    delete (userResponse as any).password_hash;

    return sendSuccess(res, 'Registrasi berhasil, silakan cek email untuk verifikasi', userResponse, 201);
  } catch (error) {
    return sendError(res, 'Terjadi kesalahan server', 500, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return sendError(res, 'Email atau password salah', 401);
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Email atau password salah', 401);
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = generateToken(payload, '1d');
    const refreshToken = generateToken(payload, '7d');

    delete (user as any).password_hash;

    return sendSuccess(res, 'Login berhasil', {
      user,
      access_token: accessToken,
      refresh_token: refreshToken
    });
  } catch (error) {
    return sendError(res, 'Terjadi kesalahan server', 500, error);
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, is_verified')
      .eq('email', email)
      .single();

    if (!user) {
      return sendError(res, 'User tidak ditemukan', 404);
    }

    if (user.is_verified) {
      return sendError(res, 'Akun sudah terverifikasi', 400);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = getExpiryDate(1);

    await supabase.from('tokens').delete().eq('user_id', user.id).eq('type', 'email_verification');

    const { error } = await supabase.from('tokens').insert({
      user_id: user.id,
      token: code,
      type: 'email_verification',
      expires_at: expiresAt
    });

    if (error) throw error;

    await sendEmailVerification(email, user.full_name, code);

    return sendSuccess(res, 'Kode OTP berhasil dikirim ulang');
  } catch (error) {
    return sendError(res, 'Gagal mengirim OTP', 500, error);
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) return sendError(res, 'User tidak ditemukan', 404);

    const { data: tokenRecord } = await supabase
      .from('tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'email_verification')
      .eq('token', code)
      .eq('is_used', false)
      .single();

    if (!tokenRecord) {
      return sendError(res, 'Kode verifikasi salah atau tidak ditemukan', 400);
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return sendError(res, 'Kode verifikasi telah kadaluwarsa', 400);
    }

    await supabase
      .from('users')
      .update({ is_verified: true, updated_at: new Date() })
      .eq('id', user.id);

    await supabase
      .from('tokens')
      .update({ is_used: true })
      .eq('id', tokenRecord.id);

    return sendSuccess(res, 'Verifikasi akun berhasil');
  } catch (error) {
    return sendError(res, 'Gagal verifikasi akun', 500, error);
  }
};