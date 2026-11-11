import { Router } from 'express';
import * as patientsController from '../patients/patients.controller.js';
import * as doctorsController from './doctors.controller.js';

export const doctorRoutes = Router();

doctorRoutes.get('/', doctorsController.list);
doctorRoutes.post('/', doctorsController.create);
doctorRoutes.get('/:id', doctorsController.getById);
doctorRoutes.patch('/:id', doctorsController.update);
doctorRoutes.delete('/:id', doctorsController.remove);

doctorRoutes.get('/:id/patients', patientsController.listForDoctor);
doctorRoutes.post('/:id/patients', patientsController.createForDoctor);
