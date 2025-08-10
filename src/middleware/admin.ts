import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

interface DecodedToken {
  sub: string;
  role: string;
}

export interface AdminAuthRequest extends Request {
  userId?: string;
  role?: string;
}

export const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;

    if (decoded.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden: Not an admin' });
      return;
    }

    // Attach to request using type assertion
    (req as AdminAuthRequest).userId = decoded.sub;
    (req as AdminAuthRequest).role = decoded.role;

    next(); // ✅ safe and typed
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
