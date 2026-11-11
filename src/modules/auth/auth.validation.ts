import { z } from 'zod';
import { email } from '../../validators/common.js';

export const loginSchema = z.strictObject({
  email,
  password: z.string().min(1, 'Password is required').max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
