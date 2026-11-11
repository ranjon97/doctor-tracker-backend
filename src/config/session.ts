import type { CookieOptions } from 'express';
import { env } from './env.js';

export const SESSION_COOKIE_NAME = 'dt_session';

export const JWT_OPTIONS = {
  algorithm: 'HS256',
  issuer: 'doctor-tracker-api',
  audience: 'doctor-tracker-client',
} as const;

// The frontend proxies API calls through its own domain, so the cookie is
// first party. SameSite lax blocks cross site POST requests (CSRF) while still
// sending the cookie when the user opens the app from an external link.
export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  path: '/',
  maxAge: env.sessionTtlSeconds * 1000,
};
