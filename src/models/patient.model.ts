import { Schema, model, type InferSchemaType } from 'mongoose';
import { BLOOD_GROUPS, GENDERS, PATIENT_CONDITIONS } from '../constants/index.js';
import { buildKeywords } from '../utils/search.js';

const patientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    age: { type: Number, required: true, min: 0, max: 120 },
    gender: { type: String, enum: GENDERS, required: true },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, lowercase: true, trim: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS },
    diagnosis: { type: String, required: true, trim: true, maxlength: 120 },
    condition: { type: String, enum: PATIENT_CONDITIONS, required: true },
    admittedAt: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, maxlength: 500 },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    keywords: { type: [String], select: false, default: [] },
  },
  { timestamps: true, versionKey: false },
);

// Every compound index ends with _id because lists sort by date then _id.
// Doctor detail page and "patients per doctor" aggregation.
patientSchema.index({ doctor: 1, admittedAt: -1, _id: -1 });
// Condition filter on the patients page and the condition chart.
patientSchema.index({ condition: 1, admittedAt: -1, _id: -1 });
// Default sort and date range filters and the timeline chart.
patientSchema.index({ admittedAt: -1, _id: -1 });
patientSchema.index({ keywords: 1 });

patientSchema.pre('validate', function refreshKeywords() {
  if (this.isNew || this.isModified(['name', 'diagnosis', 'email', 'phone'])) {
    this.keywords = buildKeywords({
      text: [this.name, this.diagnosis, this.email ?? undefined],
      phones: [this.phone],
    });
  }
});

export type PatientDocument = InferSchemaType<typeof patientSchema>;

export const Patient = model('Patient', patientSchema);
