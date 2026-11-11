import type { Request, Response } from 'express';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../../config/session.js';
import { sendMessage, sendSuccess } from '../../utils/response.js';
import * as authService from './auth.service.js';
import { loginSchema } from './auth.validation.js';

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { token, user } = await authService.login(input);

  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  sendSuccess(res, user);
}

export function logout(_req: Request, res: Response) {
  const { maxAge: _maxAge, ...clearOptions } = sessionCookieOptions;
  res.clearCookie(SESSION_COOKIE_NAME, clearOptions);
  sendMessage(res, 'Signed out');
}

export function me(req: Request, res: Response) {
  sendSuccess(res, req.user);
}
