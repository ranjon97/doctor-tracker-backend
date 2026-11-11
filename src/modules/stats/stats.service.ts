import { env } from '../../config/env.js';
import { PATIENT_CONDITIONS, type StatsRange } from '../../constants/index.js';
import { Doctor } from '../../models/doctor.model.js';
import { Patient } from '../../models/patient.model.js';
import { BUCKET_FORMAT, bucketKey, getZonedDate, zonedMidnight, type TimeUnit } from '../../utils/date.js';

const TOP_DOCTORS_LIMIT = 8;
const RECENT_PATIENTS_LIMIT = 5;
const AGE_BOUNDARIES = [0, 18, 35, 50, 65, 121];
const AGE_LABELS: Record<number, string> = { 0: '0-17', 18: '18-34', 35: '35-49', 50: '50-64', 65: '65+' };

interface RangeConfig {
  unit: TimeUnit;
  size: number;
}

const RANGE_CONFIG: Record<StatsRange, RangeConfig> = {
  '30d': { unit: 'day', size: 30 },
  '6m': { unit: 'month', size: 6 },
  '12m': { unit: 'month', size: 12 },
};

interface Period {
  unit: TimeUnit;
  start: Date;
  previousStart: Date;
  keys: string[];
}

// Builds the current window, the equally long window before it, and every bucket key.
function resolvePeriod(range: StatsRange, now = new Date()): Period {
  const { unit, size } = RANGE_CONFIG[range];
  const tz = env.APP_TIMEZONE;
  const today = getZonedDate(now, tz);

  if (unit === 'day') {
    const firstDay = today.day - (size - 1);
    return {
      unit,
      start: zonedMidnight(today.year, today.month, firstDay, tz),
      previousStart: zonedMidnight(today.year, today.month, firstDay - size, tz),
      keys: Array.from({ length: size }, (_, i) => bucketKey(today.year, today.month, firstDay + i, unit)),
    };
  }

  const firstMonth = today.month - (size - 1);
  return {
    unit,
    start: zonedMidnight(today.year, firstMonth, 1, tz),
    previousStart: zonedMidnight(today.year, firstMonth - size, 1, tz),
    keys: Array.from({ length: size }, (_, i) => bucketKey(today.year, firstMonth + i, 1, unit)),
  };
}

async function getTimeline({ unit, start, keys }: Period) {
  const rows = await Patient.aggregate<{ _id: string; count: number }>([
    { $match: { admittedAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: BUCKET_FORMAT[unit], date: '$admittedAt', timezone: env.APP_TIMEZONE } },
        count: { $sum: 1 },
      },
    },
  ]);

  // Empty buckets are filled with zero so the chart has no gaps.
  const counts = new Map(rows.map((row) => [row._id, row.count]));
  return keys.map((key) => ({ key, count: counts.get(key) ?? 0 }));
}

async function getConditionDistribution() {
  const rows = await Patient.aggregate<{ _id: string; count: number }>([
    { $group: { _id: '$condition', count: { $sum: 1 } } },
  ]);
  const counts = new Map(rows.map((row) => [row._id, row.count]));
  return PATIENT_CONDITIONS.map((condition) => ({ condition, count: counts.get(condition) ?? 0 }));
}

// Groups first, then looks up names only for the top doctors.
function getPatientsPerDoctor() {
  return Patient.aggregate<{ doctorId: string; name: string; specialization: string; count: number }>([
    { $group: { _id: '$doctor', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: TOP_DOCTORS_LIMIT },
    {
      $lookup: {
        from: Doctor.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'doctor',
        pipeline: [{ $project: { name: 1, specialization: 1 } }],
      },
    },
    { $unwind: '$doctor' },
    {
      $project: { _id: 0, doctorId: '$_id', name: '$doctor.name', specialization: '$doctor.specialization', count: 1 },
    },
  ]);
}

function getDoctorsBySpecialization() {
  return Doctor.aggregate<{ specialization: string; count: number }>([
    { $group: { _id: '$specialization', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $project: { _id: 0, specialization: '$_id', count: 1 } },
  ]);
}

async function getAgeGroups() {
  const rows = await Patient.aggregate<{ _id: number; count: number }>([
    { $bucket: { groupBy: '$age', boundaries: AGE_BOUNDARIES, default: 'unknown', output: { count: { $sum: 1 } } } },
  ]);
  const counts = new Map(rows.map((row) => [row._id, row.count]));
  return AGE_BOUNDARIES.slice(0, -1).map((boundary) => ({
    label: AGE_LABELS[boundary],
    count: counts.get(boundary) ?? 0,
  }));
}

function getRecentPatients() {
  return Patient.find()
    .sort({ admittedAt: -1 })
    .limit(RECENT_PATIENTS_LIMIT)
    .select('name age gender condition diagnosis admittedAt doctor')
    .populate({ path: 'doctor', select: 'name specialization' })
    .lean();
}

/**
 * Every widget is an independent, index friendly query and all of them run in
 * parallel. Totals use collection metadata instead of scanning documents.
 */
export async function getOverview(range: StatsRange) {
  const period = resolvePeriod(range);

  const [
    totalDoctors,
    totalPatients,
    newPatients,
    previousNewPatients,
    criticalPatients,
    timeline,
    conditions,
    perDoctor,
    specializations,
    ageGroups,
    recentPatients,
  ] = await Promise.all([
    Doctor.estimatedDocumentCount(),
    Patient.estimatedDocumentCount(),
    Patient.countDocuments({ admittedAt: { $gte: period.start } }),
    Patient.countDocuments({ admittedAt: { $gte: period.previousStart, $lt: period.start } }),
    Patient.countDocuments({ condition: 'Critical' }),
    getTimeline(period),
    getConditionDistribution(),
    getPatientsPerDoctor(),
    getDoctorsBySpecialization(),
    getAgeGroups(),
    getRecentPatients(),
  ]);

  return {
    range,
    unit: period.unit,
    totals: {
      doctors: totalDoctors,
      patients: totalPatients,
      newPatients,
      previousNewPatients,
      criticalPatients,
      avgPatientsPerDoctor: totalDoctors ? Number((totalPatients / totalDoctors).toFixed(1)) : 0,
    },
    timeline,
    conditions,
    perDoctor,
    specializations,
    ageGroups,
    recentPatients,
  };
}
