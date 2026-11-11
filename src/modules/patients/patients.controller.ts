import type { Request, Response } from 'express';
import { idParams } from '../../validators/common.js';
import { sendMessage, sendSuccess } from '../../utils/response.js';
import * as patientsService from './patients.service.js';
import {
  createDoctorPatientSchema,
  createPatientSchema,
  listPatientsQuery,
  updatePatientSchema,
} from './patients.validation.js';

export async function list(req: Request, res: Response) {
  const query = listPatientsQuery.parse(req.query);
  const { items, meta } = await patientsService.listPatients(query);
  sendSuccess(res, items, 200, meta);
}

// GET /doctors/:id/patients reuses the same list logic with the doctor taken from the URL.
export async function listForDoctor(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const query = listPatientsQuery.parse({ ...req.query, doctor: id });
  const { items, meta } = await patientsService.listPatients(query);
  sendSuccess(res, items, 200, meta);
}

export async function getById(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  sendSuccess(res, await patientsService.getPatient(id));
}

export async function create(req: Request, res: Response) {
  const input = createPatientSchema.parse(req.body);
  sendSuccess(res, await patientsService.createPatient(input), 201);
}

export async function createForDoctor(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const input = createDoctorPatientSchema.parse(req.body);
  sendSuccess(res, await patientsService.createPatient({ ...input, doctor: id }), 201);
}

export async function update(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const input = updatePatientSchema.parse(req.body);
  sendSuccess(res, await patientsService.updatePatient(id, input));
}

export async function remove(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  await patientsService.deletePatient(id);
  sendMessage(res, 'Patient deleted');
}
