import { z } from 'zod';
import { PAGINATION } from '../constants/index.js';

// Angle brackets are rejected everywhere, so no stored value can ever form an HTML tag.
const NO_HTML = /^[^<>]*$/;
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const PHONE_PATTERN = /^\+?[0-9][0-9 -]{6,18}$/;
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export const safeText = (max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min, `Must be at least ${min} characters`)
    .max(max, `Must be at most ${max} characters`)
    .regex(NO_HTML, 'HTML tags are not allowed');

export const personName = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(80, 'Name must be at most 80 characters')
  .regex(NAME_PATTERN, 'Name can only contain letters, spaces, dots, apostrophes and hyphens');

export const phone = z.string().trim().regex(PHONE_PATTERN, 'Enter a valid phone number');

export const email = z.string().trim().toLowerCase().max(120).pipe(z.email('Enter a valid email address'));

// Optional form field where an empty string means "clear this value".
export const clearable = <T extends z.ZodType>(schema: T) => z.union([z.literal(''), schema]).optional();

export const objectId = z.string().regex(OBJECT_ID_PATTERN, 'Invalid id');

export const idParams = z.object({ id: objectId });

// Query string helpers. Empty strings from the UI are treated as "not set".
const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

export const optionalQuery = <T extends z.ZodType>(schema: T) => z.preprocess(emptyToUndefined, schema.optional());

export const paginationQuery = {
  page: z.coerce.number().int().min(1).max(10_000).default(PAGINATION.defaultPage),
  limit: z.coerce.number().int().min(1).max(PAGINATION.maxLimit).default(PAGINATION.defaultLimit),
  search: optionalQuery(z.string().trim().max(60)),
};

export const dateRangeQuery = {
  from: optionalQuery(z.coerce.date()),
  to: optionalQuery(z.coerce.date()),
};

export const sortQuery = <T extends readonly [string, ...string[]]>(fields: T, fallback: T[number]) =>
  z.preprocess(emptyToUndefined, z.enum(fields).default(fallback));

export const ensureValidRange = (value: { from?: Date; to?: Date }) =>
  !value.from || !value.to || value.from <= value.to;

export const rangeError = { message: 'Start date must be before end date', path: ['from'] };
