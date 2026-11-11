import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import type { Gender, PatientCondition, Specialization } from '../constants/index.js';
import { BLOOD_GROUPS } from '../constants/index.js';
import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';
import { User } from '../models/user.model.js';
import { DIAGNOSES, DOCTOR_SEEDS, FEMALE_NAMES, LAST_NAMES, MALE_NAMES, NOTES } from './data.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_ADMISSION_AGE_DAYS = 330;

// Small deterministic PRNG so every seed run produces the same demo data.
function createRandom(seed: number) {
  let state = seed;
  const next = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(items: readonly T[]) => items[Math.floor(next() * items.length)],
  };
}

const random = createRandom(20261110);

function daysAgo(days: number, hour = 10) {
  const date = new Date(Date.now() - days * DAY_MS);
  date.setUTCHours(hour, random.int(0, 59), 0, 0);
  // Never place a record in the future when the chosen hour is later than now.
  const latest = Date.now() - random.int(10, 90) * 60 * 1000;
  return date.getTime() > latest ? new Date(latest) : date;
}

function pickGender(specialization: Specialization): Gender {
  if (specialization === 'Gynecology') return 'Female';
  if (specialization === 'Urology') return 'Male';
  return random.next() < 0.5 ? 'Male' : 'Female';
}

function pickAge(specialization: Specialization): number {
  if (specialization === 'Pediatrics') return random.int(1, 15);
  if (specialization === 'Gynecology') return random.int(21, 44);
  if (specialization === 'Cardiology' || specialization === 'Nephrology') return random.int(45, 78);
  return random.int(19, 70);
}

// Older admissions are more likely to be discharged, recent ones more likely active.
function pickCondition(admittedDaysAgo: number): PatientCondition {
  const roll = random.next();
  if (admittedDaysAgo > 90 && roll < 0.45) return 'Discharged';
  if (roll < 0.4) return 'Stable';
  if (roll < 0.62) return 'Recovering';
  if (roll < 0.82) return 'Under Observation';
  if (roll < 0.91) return 'Critical';
  return 'Discharged';
}

function buildPhone() {
  const prefix = random.pick(['017', '018', '019', '016', '015']);
  return `${prefix}${random.int(10, 99)}-${random.int(100000, 999999)}`;
}

function buildPatients(doctorId: string, specialization: Specialization, count: number, joinedDaysAgo: number) {
  const window = Math.min(joinedDaysAgo, MAX_ADMISSION_AGE_DAYS);

  return Array.from({ length: count }, () => {
    const gender = pickGender(specialization);
    const firstName = random.pick(gender === 'Female' ? FEMALE_NAMES : MALE_NAMES);
    const lastName = random.pick(LAST_NAMES);
    // The exponent skews admissions toward recent dates for a growing trend line.
    const admittedDaysAgo = Math.floor(random.next() ** 1.6 * window);
    const hasEmail = random.next() < 0.4;

    return {
      name: `${firstName} ${lastName}`,
      age: pickAge(specialization),
      gender,
      phone: buildPhone(),
      email: hasEmail ? `${firstName}.${lastName}${random.int(1, 99)}@gmail.com`.toLowerCase() : undefined,
      bloodGroup: random.pick(BLOOD_GROUPS),
      diagnosis: random.pick(DIAGNOSES[specialization]),
      condition: pickCondition(admittedDaysAgo),
      admittedAt: daysAgo(admittedDaysAgo, random.int(3, 12)),
      notes: random.next() < 0.5 ? random.pick(NOTES) : undefined,
      doctor: doctorId,
    };
  });
}

async function seed() {
  if (env.isProduction && !process.argv.includes('--force')) {
    console.error('Refusing to seed a production database without --force');
    process.exit(1);
  }

  await connectDatabase();

  await Promise.all([User.deleteMany({}), Doctor.deleteMany({}), Patient.deleteMany({})]);
  await Promise.all([User.syncIndexes(), Doctor.syncIndexes(), Patient.syncIndexes()]);

  await User.create({
    name: env.SEED_ADMIN_NAME,
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    role: 'admin',
  });

  let patientTotal = 0;

  for (const { joinedDaysAgo, patients, ...fields } of DOCTOR_SEEDS) {
    const joinedAt = daysAgo(joinedDaysAgo);
    const doctor = await Doctor.create({ ...fields, createdAt: joinedAt, updatedAt: joinedAt });

    const patientDocs = buildPatients(String(doctor._id), fields.specialization, patients, joinedDaysAgo);
    // create() instead of insertMany() so the keyword hook runs for each patient.
    await Patient.create(patientDocs);
    patientTotal += patientDocs.length;
  }

  console.info(`Seeded 1 admin, ${DOCTOR_SEEDS.length} doctors and ${patientTotal} patients`);
  console.info(`Login: ${env.SEED_ADMIN_EMAIL}`);
}

seed()
  .catch((error) => {
    console.error('Seeding failed', error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
