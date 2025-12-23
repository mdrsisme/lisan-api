import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal server';
  
  return sendError(res, message, statusCode, err);
};