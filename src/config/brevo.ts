import * as Brevo from '@getbrevo/brevo';

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ''
);

const getVerificationTemplate = (name: string, code: string) => {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>LISAN – Verifikasi Akun</title>
    <style>
      body { margin: 0; padding: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 30px 60px -20px rgba(139,92,246,0.45); }
      .header { padding: 48px 32px; text-align: center; background: radial-gradient(circle at top right, rgba(56,189,248,0.35), transparent 40%), radial-gradient(circle at bottom left, rgba(163,230,53,0.25), transparent 45%), linear-gradient(135deg, #fb7185, #d946ef, #8b5cf6, #2563eb, #06b6d4, #10b981); }
      .logo { font-size: 28px; font-weight: 900; color: #ffffff; }
      .content { padding: 48px 32px; text-align: center; }
      .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
      .description { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 28px; }
      .otp-wrapper { display: inline-block; padding: 4px; border-radius: 16px; background: linear-gradient(135deg, #f43f5e, #d946ef, #6366f1, #06b6d4, #10b981); box-shadow: 0 20px 40px -15px rgba(217,70,239,0.45); margin-bottom: 28px; }
      .otp-box { background: #f8fafc; border-radius: 12px; padding: 20px 28px; display: flex; align-items: center; gap: 14px; }
      .otp { font-family: 'Courier New', monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #4f46e5; margin: 0; }
      .copy-icon { width: 22px; height: 22px; opacity: 0.6; }
      .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
      .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
      @media (max-width: 480px) { .otp { font-size: 28px; letter-spacing: 6px; } }
    </style>
    </head>
    <body>
    <div class="container">
      <div class="header">
        <div class="logo">LISAN</div>
      </div>
      <div class="content">
        <div class="greeting">Halo, ${name}</div>
        <div class="description">
          Gunakan kode verifikasi berikut untuk mengaktifkan akun Anda.
          Kode ini berlaku selama <strong>24 jam</strong>.
        </div>
        <div class="otp-wrapper">
          <div class="otp-box">
            <div class="otp">${code}</div>
          </div>
        </div>
        <div class="description">
          Jika Anda tidak merasa mendaftar di LISAN,
          silakan abaikan email ini.
        </div>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} LISAN Ecosystem. All rights reserved.</p>
      </div>
    </div>
    </body>
    </html>
  `;
};

export const sendEmailVerification = async (to_email: string, to_name: string, code: string) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `[LISAN] Kode Verifikasi: ${code}`;
  sendSmtpEmail.htmlContent = getVerificationTemplate(to_name, code);
  sendSmtpEmail.sender = { 
    name: process.env.BREVO_SENDER_NAME || 'LISAN Admin', 
    email: process.env.BREVO_SENDER_EMAIL 
  };
  sendSmtpEmail.to = [{ email: to_email, name: to_name }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent to ${to_email}`);
  } catch (error: any) {
    console.error('Brevo Error:', error.body || error.message);
    throw new Error('Gagal mengirim email verifikasi');
  }
};