import { Router } from 'express';
import * as patientsController from './patients.controller.js';

export const patientRoutes = Router();

patientRoutes.get('/', patientsController.list);
patientRoutes.post('/', patientsController.create);
patientRoutes.get('/:id', patientsController.getById);
patientRoutes.patch('/:id', patientsController.update);
patientRoutes.delete('/:id', patientsController.remove);
