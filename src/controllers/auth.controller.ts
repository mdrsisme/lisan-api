import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { resend } from '../config/resend';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, role } = req.body;

    const { data: existingUser } = await supabase
      .from('users')
      .select('email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      if (existingUser.email === email) return sendError(res, 'Email sudah terdaftar', 400);
      if (existingUser.username === username) return sendError(res, 'Username sudah digunakan', 400);
    }

    const hashedPassword = await hashPassword(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password: hashedPassword,
        verification_code: verificationCode,
        is_verified: false,
        role: role || 'user',
        level: 1,
        score: 0
      });

    if (error) throw error;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Kode Verifikasi Lisan',
      html: `<p>Kode Anda: <strong>${verificationCode}</strong></p>`
    });

    return sendSuccess(res, 'Registrasi berhasil', { email, role: role || 'user' });

  } catch (error: any) {
    return sendError(res, 'Gagal registrasi', 500, error);
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) return sendError(res, 'User tidak ditemukan', 404);
    if (user.is_verified) return sendError(res, 'Akun sudah diverifikasi', 400);
    if (user.verification_code !== code) return sendError(res, 'Kode salah', 400);

    const { error } = await supabase
      .from('users')
      .update({ is_verified: true, verification_code: null })
      .eq('id', user.id);

    if (error) throw error;

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
      .select('id, is_verified, username')
      .eq('email', email)
      .single();

    if (!user) return sendError(res, 'Email tidak terdaftar', 404);
    if (user.is_verified) return sendError(res, 'Akun sudah diverifikasi sebelumnya', 400);

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase
      .from('users')
      .update({ verification_code: newCode })
      .eq('id', user.id);

    if (error) throw error;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Kode Verifikasi Baru Lisan',
      html: `<p>Halo ${user.username}, kode baru Anda: <strong>${newCode}</strong></p>`
    });

    return sendSuccess(res, 'Kode verifikasi baru telah dikirim');

  } catch (error: any) {
    return sendError(res, 'Gagal mengirim kode', 500, error);
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

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return sendError(res, 'Password salah', 401);

    if (!user.is_verified) return sendError(res, 'Akun belum diverifikasi', 403);

    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email
    });

    delete user.password;
    delete user.verification_code;

    return sendSuccess(res, 'Login berhasil', { token, user });

  } catch (error: any) {
    return sendError(res, 'Gagal login', 500, error);
  }
};