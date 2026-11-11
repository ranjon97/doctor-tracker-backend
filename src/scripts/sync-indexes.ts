import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';
import { User } from '../models/user.model.js';

// Production runs with autoIndex off, so indexes are created on purpose with this script.
async function syncIndexes() {
  await connectDatabase();
  for (const model of [User, Doctor, Patient]) {
    await model.syncIndexes();
    const names = (await model.listIndexes()).map((index) => index.name);
    console.info(`${model.modelName}: ${names.join(', ')}`);
  }
}

syncIndexes()
  .catch((error) => {
    console.error('Index sync failed', error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
