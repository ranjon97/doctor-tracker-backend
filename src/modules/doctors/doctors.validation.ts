import { z } from 'zod';
import { SPECIALIZATIONS } from '../../constants/index.js';
import {
  dateRangeQuery,
  email,
  ensureValidRange,
  optionalQuery,
  paginationQuery,
  personName,
  phone,
  rangeError,
  safeText,
  sortQuery,
} from '../../validators/common.js';

export const DOCTOR_SORT_FIELDS = ['-createdAt', 'createdAt', 'name', '-name'] as const;

const specialization = z.enum(SPECIALIZATIONS, { error: 'Select a valid specialization' });

export const createDoctorSchema = z.strictObject({
  name: personName,
  specialization,
  hospital: safeText(120, 2),
  phone,
  email,
});

export const updateDoctorSchema = createDoctorSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'Provide at least one field to update' });

export const listDoctorsQuery = z
  .object({
    ...paginationQuery,
    ...dateRangeQuery,
    specialization: optionalQuery(specialization),
    hospital: optionalQuery(safeText(120)),
    sort: sortQuery(DOCTOR_SORT_FIELDS, '-createdAt'),
  })
  .refine(ensureValidRange, rangeError);

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type ListDoctorsQuery = z.infer<typeof listDoctorsQuery>;
