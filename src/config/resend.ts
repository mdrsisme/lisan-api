import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY as string;

if (!resendApiKey) {
  console.error('ERROR: API Key Resend tidak ditemukan.');
}

export const resend = new Resend(resendApiKey);