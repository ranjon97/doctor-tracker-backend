import { Types, type QueryFilter } from 'mongoose';
import { Doctor } from '../../models/doctor.model.js';
import { Patient, type PatientDocument } from '../../models/patient.model.js';
import { ApiError } from '../../utils/api-error.js';
import { emptyStringsToUndefined } from '../../utils/object.js';
import { buildDateRangeFilter, paginate, parseSort } from '../../utils/query.js';
import { buildSearchFilter } from '../../utils/search.js';
import type { CreatePatientInput, ListPatientsQuery, UpdatePatientInput } from './patients.validation.js';

const DOCTOR_SUMMARY = { path: 'doctor', select: 'name specialization hospital' } as const;

async function assertDoctorExists(doctorId: string) {
  const exists = await Doctor.exists({ _id: doctorId });
  if (!exists) throw ApiError.badRequest('Selected doctor does not exist');
}

export async function listPatients(query: ListPatientsQuery) {
  const { page, limit, search, from, to, condition, gender, doctor, sort } = query;

  const filter: QueryFilter<PatientDocument> = {
    ...buildSearchFilter(search),
    ...buildDateRangeFilter('admittedAt', from, to),
    ...(condition && { condition }),
    ...(gender && { gender }),
    ...(doctor && { doctor: new Types.ObjectId(doctor) }),
  };

  return paginate(Patient, filter, { page, limit, sort: parseSort(sort), populate: DOCTOR_SUMMARY });
}

export async function getPatient(id: string) {
  const patient = await Patient.findById(id).populate(DOCTOR_SUMMARY).lean();
  if (!patient) throw ApiError.notFound('Patient');
  return patient;
}

export async function createPatient(input: CreatePatientInput) {
  await assertDoctorExists(input.doctor);
  const patient = await Patient.create(emptyStringsToUndefined(input));
  return getPatient(String(patient._id));
}

export async function updatePatient(id: string, input: UpdatePatientInput) {
  const patient = await Patient.findById(id);
  if (!patient) throw ApiError.notFound('Patient');

  if (input.doctor && input.doctor !== String(patient.doctor)) {
    await assertDoctorExists(input.doctor);
  }

  // set() plus save() keeps schema validation and the keyword hook in one place.
  patient.set(emptyStringsToUndefined(input));
  await patient.save();
  return getPatient(id);
}

export async function deletePatient(id: string) {
  const result = await Patient.deleteOne({ _id: id });
  if (result.deletedCount === 0) throw ApiError.notFound('Patient');
}

export async function deletePatientsOfDoctor(doctorId: string) {
  await Patient.deleteMany({ doctor: doctorId });
}

// One grouped query for a whole page of doctors instead of one count per doctor.
export async function countPatientsByDoctor(doctorIds: Types.ObjectId[]) {
  if (doctorIds.length === 0) return new Map<string, number>();

  const rows = await Patient.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { doctor: { $in: doctorIds } } },
    { $group: { _id: '$doctor', count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [String(row._id), row.count]));
}

export async function getConditionBreakdown(doctorId: string) {
  return Patient.aggregate<{ condition: string; count: number }>([
    { $match: { doctor: new Types.ObjectId(doctorId) } },
    { $group: { _id: '$condition', count: { $sum: 1 } } },
    { $project: { _id: 0, condition: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ]);
}
