import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { resend } from '../config/resend';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, full_name, role } = req.body;

    const { data: existingUser } = await supabase
      .from('users')
      .select('email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      if (existingUser.email === email) return sendError(res, 'Email sudah terdaftar', 400);
      if (existingUser.username === username) return sendError(res, 'Username sudah digunakan', 400);
    }

    const password_hash = await hashPassword(password);

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        username,
        full_name: full_name || username,
        password_hash,
        is_verified: false,
        role: role || 'user',
        level: 1,
        xp: 0
      })
      .select()
      .single();

    if (userError) throw userError;

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error: tokenError } = await supabase
      .from('tokens')
      .insert({
        user_id: newUser.id,
        token: verificationCode,
        type: 'verification',
        expires_at: expiresAt.toISOString(),
        is_used: false
      });

    if (tokenError) throw tokenError;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Kode Verifikasi Lisan',
      html: `<p>Kode verifikasi Anda: <strong>${verificationCode}</strong></p>`
    });

    return sendSuccess(res, 'Registrasi berhasil', { email });

  } catch (error: any) {
    return sendError(res, 'Gagal registrasi', 500, error);
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('id, is_verified')
      .eq('email', email)
      .single();

    if (!user) return sendError(res, 'User tidak ditemukan', 404);
    if (user.is_verified) return sendError(res, 'Akun sudah diverifikasi', 400);

    const { data: tokenData } = await supabase
      .from('tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('token', code)
      .eq('type', 'verification')
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!tokenData) return sendError(res, 'Kode salah atau kadaluwarsa', 400);

    await supabase
      .from('users')
      .update({ is_verified: true, updated_at: new Date() })
      .eq('id', user.id);

    await supabase
      .from('tokens')
      .update({ is_used: true })
      .eq('id', tokenData.id);

    return sendSuccess(res, 'Verifikasi berhasil');

  } catch (error: any) {
    return sendError(res, 'Gagal verifikasi', 500, error);
  }
};

export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('id, is_verified, full_name')
      .eq('email', email)
      .single();

    if (!user) return sendError(res, 'Email tidak terdaftar', 404);
    if (user.is_verified) return sendError(res, 'Akun sudah diverifikasi', 400);

    await supabase
      .from('tokens')
      .update({ is_used: true })
      .eq('user_id', user.id)
      .eq('type', 'verification');

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error } = await supabase
      .from('tokens')
      .insert({
        user_id: user.id,
        token: newCode,
        type: 'verification',
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Kode Verifikasi Baru',
      html: `<p>Halo ${user.full_name}, kode baru Anda: <strong>${newCode}</strong></p>`
    });

    return sendSuccess(res, 'Kode baru dikirim');

  } catch (error: any) {
    return sendError(res, 'Gagal kirim kode', 500, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .single();

    if (!user) return sendError(res, 'Akun tidak ditemukan', 404);

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) return sendError(res, 'Password salah', 401);

    if (!user.is_verified) return sendError(res, 'Akun belum diverifikasi', 403);

    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email
    });

    delete user.password_hash;

    return sendSuccess(res, 'Login berhasil', { token, user });

  } catch (error: any) {
    return sendError(res, 'Gagal login', 500, error);
  }
};