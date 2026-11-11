import { z } from 'zod';
import { BLOOD_GROUPS, GENDERS, PATIENT_CONDITIONS } from '../../constants/index.js';
import {
  clearable,
  dateRangeQuery,
  email,
  ensureValidRange,
  objectId,
  optionalQuery,
  paginationQuery,
  personName,
  phone,
  rangeError,
  safeText,
  sortQuery,
} from '../../validators/common.js';

export const PATIENT_SORT_FIELDS = ['-admittedAt', 'admittedAt', 'name', '-name', 'age', '-age'] as const;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const condition = z.enum(PATIENT_CONDITIONS, { error: 'Select a valid condition' });
const gender = z.enum(GENDERS, { error: 'Select a valid gender' });

const patientFields = z.strictObject({
  name: personName,
  age: z.number({ error: 'Age must be a number' }).int().min(0).max(120),
  gender,
  phone,
  email: clearable(email),
  bloodGroup: clearable(z.enum(BLOOD_GROUPS)),
  diagnosis: safeText(120, 2),
  condition,
  admittedAt: z.coerce
    .date({ error: 'Enter a valid date' })
    .refine((date) => date.getTime() <= Date.now() + ONE_DAY_MS, 'Admission date cannot be in the future'),
  notes: clearable(safeText(500)),
  doctor: objectId,
});

export const createPatientSchema = patientFields;

// Used by POST /doctors/:id/patients where the doctor comes from the URL.
export const createDoctorPatientSchema = patientFields.omit({ doctor: true });

export const updatePatientSchema = patientFields
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'Provide at least one field to update' });

export const listPatientsQuery = z
  .object({
    ...paginationQuery,
    ...dateRangeQuery,
    condition: optionalQuery(condition),
    gender: optionalQuery(gender),
    doctor: optionalQuery(objectId),
    sort: sortQuery(PATIENT_SORT_FIELDS, '-admittedAt'),
  })
  .refine(ensureValidRange, rangeError);

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type ListPatientsQuery = z.infer<typeof listPatientsQuery>;
