import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError, type FieldError } from '../utils/api-error.js';

interface ErrorBody {
  success: false;
  message: string;
  errors?: FieldError[];
}

interface HttpParserError {
  type?: string;
  status?: number;
}

function isDuplicateKeyError(error: unknown): error is { code: number; keyValue?: Record<string, unknown> } {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 11000;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => ({
      field: issue.path.join('.') || 'request',
      message: issue.message,
    }));
    return ApiError.badRequest('Validation failed', errors);
  }

  if (isDuplicateKeyError(error)) {
    const field = Object.keys(error.keyValue ?? {})[0] ?? 'field';
    return ApiError.conflict(`A record with this ${field} already exists`);
  }

  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for ${error.path}`);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
    return ApiError.badRequest('Validation failed', errors);
  }

  // Errors raised by express.json() such as malformed JSON or an oversized body.
  const parserError = error as HttpParserError;
  if (parserError?.type === 'entity.parse.failed') return ApiError.badRequest('Malformed JSON body');
  if (parserError?.type === 'entity.too.large') return new ApiError(413, 'Request body is too large');

  return new ApiError(500, 'Something went wrong. Please try again later.');
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const apiError = toApiError(error);

  if (apiError.statusCode >= 500) {
    console.error(error);
  }

  const body: ErrorBody = { success: false, message: apiError.message };
  if (apiError.errors?.length) body.errors = apiError.errors;

  // Internal details are only exposed while developing.
  if (!env.isProduction && apiError.statusCode >= 500 && error instanceof Error) {
    body.message = error.message;
  }

  res.status(apiError.statusCode).json(body);
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route ${req.method} ${req.path} not found`));
}
