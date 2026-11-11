import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

declare global { namespace Express { interface Request { admin?: { email: string } } } }
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Please sign in to continue.' });
  try { const payload = jwt.verify(header.slice(7), config.JWT_SECRET, { issuer: 'tomtom-gala', audience: 'tomtom-gala-admin' }) as jwt.JwtPayload; if (payload.role !== 'admin' || typeof payload.email !== 'string') throw new Error(); req.admin = { email: payload.email }; next(); }
  catch { res.status(401).json({ message: 'Your session has expired. Please sign in again.' }); }
}
