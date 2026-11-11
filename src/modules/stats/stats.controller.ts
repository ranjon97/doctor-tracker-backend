import type { Request, Response } from 'express';
import { z } from 'zod';
import { STATS_RANGES } from '../../constants/index.js';
import { sendSuccess } from '../../utils/response.js';
import * as statsService from './stats.service.js';

const overviewQuery = z.object({
  range: z.enum(STATS_RANGES).default('6m'),
});

export async function overview(req: Request, res: Response) {
  const { range } = overviewQuery.parse(req.query);
  sendSuccess(res, await statsService.getOverview(range));
}
