import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from './error.js';

export interface AuthedRequest extends Request {
  userId?: string;
}

export interface TokenPayload {
  sub: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies TokenPayload, config.jwtSecret, { expiresIn: '90d' });
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie('ready_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
    maxAge: 90 * 24 * 3600 * 1000,
  });
}

/** JWT auth from httpOnly cookie or Authorization: Bearer. */
export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const bearer = req.headers.authorization?.replace(/^Bearer /, '');
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.ready_token;
  const token = bearer || cookieToken;
  if (!token) {
    next(new AppError(401, 'unauthenticated', 'Missing auth token'));
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.userId = payload.sub;
    next();
  } catch {
    next(new AppError(401, 'invalid_token', 'Invalid or expired token'));
  }
}

/** Best-effort user id from cookie/bearer — null instead of throwing (used by identity merge). */
export function tryGetUserId(req: AuthedRequest): string | null {
  const bearer = req.headers.authorization?.replace(/^Bearer /, '');
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.ready_token;
  const token = bearer || cookieToken;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    return payload.sub;
  } catch {
    return null;
  }
}
