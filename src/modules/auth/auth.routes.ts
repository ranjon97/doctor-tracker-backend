import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { loginLimiter } from '../../middlewares/rate-limit.js';
import * as authController from './auth.controller.js';

export const authRoutes = Router();

authRoutes.post('/login', loginLimiter, authController.login);
authRoutes.post('/logout', authController.logout);
authRoutes.get('/me', authenticate, authController.me);
