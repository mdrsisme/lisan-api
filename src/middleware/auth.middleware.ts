import { Request, Response, NextFunction } from 'express';
import { decodeToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Akses ditolak, token tidak ditemukan', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = decodeToken(token);
    
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    return sendError(res, 'Sesi kadaluwarsa atau token tidak valid', 401);
  }
};