import { Router, type Request, type Response } from 'express';
import { BLOOD_GROUPS, GENDERS, PATIENT_CONDITIONS, SPECIALIZATIONS } from '../../constants/index.js';
import { sendSuccess } from '../../utils/response.js';
import { listHospitals } from '../doctors/doctors.service.js';

export const metaRoutes = Router();

// Single source of truth for dropdown options so the client never hardcodes enums.
metaRoutes.get('/', async (_req: Request, res: Response) => {
  sendSuccess(res, {
    specializations: SPECIALIZATIONS,
    conditions: PATIENT_CONDITIONS,
    genders: GENDERS,
    bloodGroups: BLOOD_GROUPS,
    hospitals: await listHospitals(),
  });
});
