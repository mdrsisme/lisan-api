import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'RESEND_API_KEY'
];

requiredEnv.forEach((name) => {
  if (!process.env[name]) {
    console.warn(`WARNING: Variabel lingkungan ${name} belum diatur.`);
  }
});

export const config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET as string,
  supabase: {
    url: process.env.SUPABASE_URL as string,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  },
  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME as string,
    key: process.env.CLOUDINARY_API_KEY as string,
    secret: process.env.CLOUDINARY_API_SECRET as string,
  },
  resend: {
    key: process.env.RESEND_API_KEY as string,
  },
};