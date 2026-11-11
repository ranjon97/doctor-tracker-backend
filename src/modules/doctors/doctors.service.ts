import type { QueryFilter } from 'mongoose';
import { Doctor, type DoctorDocument } from '../../models/doctor.model.js';
import { ApiError } from '../../utils/api-error.js';
import { buildDateRangeFilter, paginate, parseSort } from '../../utils/query.js';
import { buildSearchFilter } from '../../utils/search.js';
import * as patientsService from '../patients/patients.service.js';
import type { CreateDoctorInput, ListDoctorsQuery, UpdateDoctorInput } from './doctors.validation.js';

export async function listDoctors(query: ListDoctorsQuery) {
  const { page, limit, search, from, to, specialization, hospital, sort } = query;

  const filter: QueryFilter<DoctorDocument> = {
    ...buildSearchFilter(search),
    ...buildDateRangeFilter('createdAt', from, to),
    ...(specialization && { specialization }),
    ...(hospital && { hospital }),
  };

  const { items, meta } = await paginate(Doctor, filter, { page, limit, sort: parseSort(sort) });
  const counts = await patientsService.countPatientsByDoctor(items.map((doctor) => doctor._id));

  return {
    items: items.map((doctor) => ({ ...doctor, patientCount: counts.get(String(doctor._id)) ?? 0 })),
    meta,
  };
}

export async function getDoctor(id: string) {
  const [doctor, conditions] = await Promise.all([
    Doctor.findById(id).lean(),
    patientsService.getConditionBreakdown(id),
  ]);
  if (!doctor) throw ApiError.notFound('Doctor');

  const patientCount = conditions.reduce((sum, item) => sum + item.count, 0);
  return { ...doctor, patientCount, conditions };
}

export async function createDoctor(input: CreateDoctorInput) {
  const doctor = await Doctor.create(input);
  return getDoctor(String(doctor._id));
}

export async function updateDoctor(id: string, input: UpdateDoctorInput) {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw ApiError.notFound('Doctor');

  doctor.set(input);
  await doctor.save();
  return getDoctor(id);
}

// Patients are removed first so a failure never leaves orphaned patient records.
export async function deleteDoctor(id: string) {
  const exists = await Doctor.exists({ _id: id });
  if (!exists) throw ApiError.notFound('Doctor');

  await patientsService.deletePatientsOfDoctor(id);
  await Doctor.deleteOne({ _id: id });
}

export async function listHospitals() {
  const hospitals = await Doctor.distinct('hospital');
  return hospitals.sort((a, b) => a.localeCompare(b));
}
