import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { doctorRoutes } from '../modules/doctors/doctors.routes.js';
import { metaRoutes } from '../modules/meta/meta.routes.js';
import { patientRoutes } from '../modules/patients/patients.routes.js';
import { statsRoutes } from '../modules/stats/stats.routes.js';

export const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);

// Everything below requires a valid session with the admin role.
const protectedRoutes = Router();
protectedRoutes.use(authenticate, authorize('admin'));
protectedRoutes.use('/meta', metaRoutes);
protectedRoutes.use('/stats', statsRoutes);
protectedRoutes.use('/doctors', doctorRoutes);
protectedRoutes.use('/patients', patientRoutes);

apiRoutes.use(protectedRoutes);
