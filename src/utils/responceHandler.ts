// src/utils/responseHandler.ts
import { Response } from 'express';

export const sendSuccessResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  error?: any
): void => {
  console.error('[API ERROR]:', message, error);
  res.status(statusCode).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : undefined,
  });
};
