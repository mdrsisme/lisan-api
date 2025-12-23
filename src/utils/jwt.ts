import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthPayload } from '../types/user';

const JWT_SECRET = (process.env.JWT_SECRET as string);

export const generateToken = (payload: AuthPayload, expiresIn: string | number = '1d'): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as any
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const decodeToken = (token: string): AuthPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    throw new Error('Token tidak valid atau kedaluwarsa');
  }
};