export type TimeUnit = 'day' | 'month';

const MINUTE_MS = 60 * 1000;

interface ZonedDate {
  year: number;
  month: number; // zero based, like Date
  day: number;
}

function getOffsetMinutes(timeZone: string, date: Date): number {
  const label = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;

  const match = label?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;

  const sign = match[1] === '+' ? 1 : -1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

export function getZonedDate(date: Date, timeZone: string): ZonedDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: read('year'), month: read('month') - 1, day: read('day') };
}

// Midnight of a calendar date in the given time zone, returned as a UTC Date.
export function zonedMidnight(year: number, month: number, day: number, timeZone: string): Date {
  const utc = Date.UTC(year, month, day);
  return new Date(utc - getOffsetMinutes(timeZone, new Date(utc)) * MINUTE_MS);
}

// Bucket keys use the same formats as $dateToString in the aggregation.
export const BUCKET_FORMAT: Record<TimeUnit, string> = {
  day: '%Y-%m-%d',
  month: '%Y-%m',
};

export function bucketKey(year: number, month: number, day: number, unit: TimeUnit): string {
  const date = new Date(Date.UTC(year, month, day));
  const iso = date.toISOString();
  return unit === 'day' ? iso.slice(0, 10) : iso.slice(0, 7);
}
