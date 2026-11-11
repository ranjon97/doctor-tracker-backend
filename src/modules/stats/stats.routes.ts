import { Router } from 'express';
import * as statsController from './stats.controller.js';

export const statsRoutes = Router();

statsRoutes.get('/overview', statsController.overview);
