import { Response } from 'express';

export const sendSuccess = (res: Response, message: string, data: any = null, code: number = 200) => {
  return res.status(code).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, message: string, code: number = 400, error: any = null) => {
  return res.status(code).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
};