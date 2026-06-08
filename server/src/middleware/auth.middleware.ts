import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: Record<string, any>;
}

export function optionalAuthenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.split(' ')[1]
    : null;
  const secret = process.env.JWT_SECRET;

  if (token && secret) {
    try {
      req.user = jwt.verify(token, secret) as Record<string, any>;
    } catch {
      req.user = undefined;
    }
  }

  next();
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' });
  }

  try {
    req.user = jwt.verify(token, secret) as Record<string, any>;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
