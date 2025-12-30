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
    <title>Verifikasi Akun LISAN</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #333333;
        line-height: 1.6;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        padding: 40px;
        border: 1px solid #dddddd;
        border-radius: 8px;
      }
      .header {
        border-bottom: 1px solid #eeeeee;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #333333;
        text-decoration: none;
      }
      .content {
        margin-bottom: 30px;
      }
      .greeting {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
      }
      .text {
        font-size: 16px;
        color: #555555;
        margin-bottom: 20px;
      }
      .otp-container {
        background-color: #f8f9fa;
        border: 1px dashed #cccccc;
        border-radius: 6px;
        padding: 20px;
        text-align: center;
        margin: 25px 0;
      }
      .otp-code {
        font-family: monospace;
        font-size: 32px;
        font-weight: bold;
        color: #000000;
        letter-spacing: 5px;
        display: inline-block;
      }
      .footer {
        font-size: 12px;
        color: #999999;
        text-align: center;
        margin-top: 40px;
        border-top: 1px solid #eeeeee;
        padding-top: 20px;
      }
      @media (max-width: 600px) {
        .container {
          width: 100%;
          margin: 0;
          border: none;
          border-radius: 0;
          padding: 20px;
        }
      }
    </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="logo">LISAN</span>
        </div>

        <div class="content">
          <div class="greeting">Halo, ${name}</div>
          <div class="text">
            Terima kasih telah mendaftar. Untuk menyelesaikan proses verifikasi akun Anda, silakan gunakan kode di bawah ini:
          </div>

          <div class="otp-container">
            <span class="otp-code">${code}</span>
          </div>

          <div class="text" style="font-size: 14px;">
            Kode ini hanya berlaku selama 24 jam. Jangan berikan kode ini kepada siapa pun. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.
          </div>
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} LISAN.
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendEmailVerification = async (to_email: string, to_name: string, code: string) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Kode Verifikasi Akun LISAN`;
  sendSmtpEmail.htmlContent = getVerificationTemplate(to_name, code);
  sendSmtpEmail.sender = { 
    name: process.env.BREVO_SENDER_NAME || 'LISAN Team', 
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