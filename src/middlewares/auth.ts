import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JWT_OPTIONS, SESSION_COOKIE_NAME } from '../config/session.js';
import type { UserRole } from '../constants/index.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';

interface SessionPayload {
  sub: string;
  role: UserRole;
}

function readToken(req: Request): string | undefined {
  const token: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  return typeof token === 'string' && token.length > 0 ? token : undefined;
}

function verifyToken(token: string): SessionPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      algorithms: [JWT_OPTIONS.algorithm],
      issuer: JWT_OPTIONS.issuer,
      audience: JWT_OPTIONS.audience,
    }) as SessionPayload;
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.');
  }
}

/**
 * Verifies the session cookie and loads the user on every request, so a
 * deleted user or a changed role takes effect immediately.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) throw ApiError.unauthorized();

  const payload = verifyToken(token);
  const user = await User.findById(payload.sub).select('name email role').lean();
  if (!user) throw ApiError.unauthorized('Your account is no longer active.');

  req.user = { id: String(user._id), name: user.name, email: user.email, role: user.role };
  next();
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
}

export function signSessionToken(userId: string, role: UserRole): string {
  const payload: SessionPayload = { sub: userId, role };
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: JWT_OPTIONS.algorithm,
    issuer: JWT_OPTIONS.issuer,
    audience: JWT_OPTIONS.audience,
    expiresIn: env.sessionTtlSeconds,
  });
}
