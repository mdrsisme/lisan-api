import axios from 'axios';

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

export const sendEmailVerification = async (to_email: string, to_name: string, code: string) => {
  const data = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      to_email,
      to_name,
      code,
    },
  };

  try {
    await axios.post(EMAILJS_URL, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('EmailJS Error:', error);
    throw new Error('Gagal mengirim email verifikasi');
  }
};