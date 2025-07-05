import { Request, Response, NextFunction } from 'express';

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  return res.status(status).json({ message });
};

export default globalErrorHandler;
