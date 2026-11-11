export const USER_ROLES = ['admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Medicine',
  'Gynecology',
  'Nephrology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Urology',
] as const;
export type Specialization = (typeof SPECIALIZATIONS)[number];

export const PATIENT_CONDITIONS = ['Stable', 'Under Observation', 'Recovering', 'Critical', 'Discharged'] as const;
export type PatientCondition = (typeof PATIENT_CONDITIONS)[number];

export const GENDERS = ['Male', 'Female', 'Other'] as const;
export type Gender = (typeof GENDERS)[number];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 50,
} as const;

export const STATS_RANGES = ['30d', '6m', '12m'] as const;
export type StatsRange = (typeof STATS_RANGES)[number];
