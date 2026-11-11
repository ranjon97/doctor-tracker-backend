import type { Request } from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

const tooManyRequests = (message: string) => ({ success: false, message });

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyRequests('Too many requests. Please slow down.'),
});

// Keyed by IP and email so one attacker cannot lock out every account,
// and one account cannot be brute forced from many IPs behind the same proxy.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return `${ipKeyGenerator(req.ip ?? '')}:${email}`;
  },
  message: tooManyRequests('Too many login attempts. Please try again in 15 minutes.'),
});
