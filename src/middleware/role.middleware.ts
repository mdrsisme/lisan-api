import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      return sendError(res, 'Anda tidak memiliki izin untuk akses ini', 403);
    }

    next();
  };
};