import type { Request, Response } from 'express';
import { idParams } from '../../validators/common.js';
import { sendMessage, sendSuccess } from '../../utils/response.js';
import * as doctorsService from './doctors.service.js';
import { createDoctorSchema, listDoctorsQuery, updateDoctorSchema } from './doctors.validation.js';

export async function list(req: Request, res: Response) {
  const query = listDoctorsQuery.parse(req.query);
  const { items, meta } = await doctorsService.listDoctors(query);
  sendSuccess(res, items, 200, meta);
}

export async function getById(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  sendSuccess(res, await doctorsService.getDoctor(id));
}

export async function create(req: Request, res: Response) {
  const input = createDoctorSchema.parse(req.body);
  sendSuccess(res, await doctorsService.createDoctor(input), 201);
}

export async function update(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const input = updateDoctorSchema.parse(req.body);
  sendSuccess(res, await doctorsService.updateDoctor(id, input));
}

export async function remove(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  await doctorsService.deleteDoctor(id);
  sendMessage(res, 'Doctor and related patients deleted');
}
