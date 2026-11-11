/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Model, QueryFilter, PopulateOptions, SortOrder } from 'mongoose';
import type { PaginationMeta } from './response.js';

export function buildDateRangeFilter(field: string, from?: Date, to?: Date) {
  if (!from && !to) return {};

  const range: { $gte?: Date; $lte?: Date } = {};
  if (from) range.$gte = from;
  if (to) range.$lte = to;

  return { [field]: range };
}

// Turns "-createdAt" or "name" into a Mongoose sort object with a stable tiebreaker.
export function parseSort(sort: string): Record<string, SortOrder> {
  const descending = sort.startsWith('-');
  const field = descending ? sort.slice(1) : sort;
  return { [field]: descending ? -1 : 1, _id: -1 };
}

interface PaginateOptions {
  page: number;
  limit: number;
  sort: Record<string, SortOrder>;
  populate?: PopulateOptions;
}

// Plain object type returned by .lean() for a given model.
type LeanOf<M> = M extends Model<any, any, any, any, any, any, infer TLean> ? TLean : never;

/**
 * Shared offset pagination. The page query and the count run in parallel and
 * both are served by the same compound indexes.
 */
export async function paginate<M extends Model<any, any, any, any, any, any, any>>(
  model: M,
  filter: QueryFilter<unknown>,
  { page, limit, sort, populate }: PaginateOptions,
) {
  const query = model
    .find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  if (populate) query.populate(populate);

  const [items, total] = await Promise.all([query.lean() as Promise<LeanOf<M>[]>, model.countDocuments(filter)]);

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };

  return { items, meta };
}
