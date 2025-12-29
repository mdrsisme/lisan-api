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
      body {
        margin: 0; padding: 0;
        background-color: #f8fafc;
        font-family: Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif;
        color: #334155;
      }
      
      .container {
        max-width: 480px;
        margin: 40px auto;
        background-color: #ffffff;
        border: 1px solid rgba(0,0,0,0.05);
        border-radius: 30px;
        overflow: hidden;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
        position: relative;
      }

      .aurora-bg {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 400px;
        overflow: hidden;
        z-index: 0;
        pointer-events: none;
      }

      .orb-1 {
        position: absolute;
        top: -100px; left: -100px;
        width: 400px; height: 400px;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(168, 85, 247, 0.15) 60%, transparent 80%);
        filter: blur(70px);
      }

      .orb-2 {
        position: absolute;
        top: -120px; right: -120px;
        width: 450px; height: 450px;
        background: radial-gradient(circle, rgba(251, 113, 133, 0.2) 0%, rgba(251, 146, 60, 0.15) 60%, transparent 80%);
        filter: blur(80px);
      }

      .header {
        position: relative;
        padding: 50px 30px 20px;
        text-align: center;
        z-index: 1;
      }

      .logo {
        font-size: 38px;
        font-weight: 900;
        letter-spacing: -1px;
        color: #000000;
        display: inline-block;
      }

      .content {
        position: relative;
        padding: 10px 40px 50px;
        text-align: center;
        z-index: 1;
      }
      
      .greeting { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
      .description { font-size: 16px; color: #64748b; line-height: 1.6; margin-bottom: 35px; }
      .highlight { color: #0f172a; font-weight: 700; background: rgba(226, 232, 240, 0.5); padding: 2px 6px; border-radius: 4px; }

      .otp-box {
        background: #ffffff;
        border: 1px solid #f1f5f9;
        border-radius: 20px;
        padding: 24px 36px;
        display: inline-block;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      }

      .otp {
        font-family: Calibri, Candara, Segoe, 'Segoe UI', Optima, sans-serif;
        font-size: 42px;
        font-weight: 700;
        letter-spacing: 12px;
        color: #0f172a;
        margin: 0;
        margin-right: -12px;
      }

      .footer {
        background-color: #ffffff;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #f8fafc;
      }
      .footer p { font-size: 13px; color: #94a3b8; margin: 0; }

      @media (max-width: 480px) {
        .container { margin: 0; border-radius: 0; border: none; box-shadow: none; }
        .otp { font-size: 32px; letter-spacing: 6px; margin-right: -6px; }
      }
    </style>
    </head>
    <body>
      <div class="container">
        <div class="aurora-bg">
          <div class="orb-1"></div>
          <div class="orb-2"></div>
        </div>

        <div class="header">
          <div class="logo">LISAN</div>
        </div>

        <div class="content">
          <div class="greeting">Verifikasi Akun</div>
          <div class="description">
            Halo ${name}, masukkan kode berikut untuk melanjutkan.<br>
            Kode berlaku selama <span class="highlight">24 jam</span>.
          </div>

          <div class="otp-box">
            <div class="otp">${code}</div>
          </div>
          
          <div class="description" style="margin-top: 35px; margin-bottom: 0; font-size: 14px; opacity: 0.7;">
            Abaikan jika Anda tidak meminta kode ini.
          </div>
        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} LISAN.</p>
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