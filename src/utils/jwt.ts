import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET as string);

export const generateToken = (payload: any, expiresIn: string | number = '1d'): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as any
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const decodeToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token tidak valid atau kedaluwarsa');
  }
};