import { Schema, model, type InferSchemaType } from 'mongoose';
import { SPECIALIZATIONS } from '../constants/index.js';
import { buildKeywords } from '../utils/search.js';

const doctorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    specialization: { type: String, enum: SPECIALIZATIONS, required: true },
    hospital: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Search tokens, kept out of API responses.
    keywords: { type: [String], select: false, default: [] },
  },
  { timestamps: true, versionKey: false },
);

// Listing is newest first, optionally narrowed by specialization or hospital.
// _id is the pagination tiebreaker, so including it lets the index provide the sort.
doctorSchema.index({ createdAt: -1, _id: -1 });
doctorSchema.index({ specialization: 1, createdAt: -1, _id: -1 });
doctorSchema.index({ hospital: 1, createdAt: -1, _id: -1 });
doctorSchema.index({ keywords: 1 });

doctorSchema.pre('validate', function refreshKeywords() {
  if (this.isNew || this.isModified(['name', 'specialization', 'hospital', 'email', 'phone'])) {
    this.keywords = buildKeywords({
      text: [this.name, this.specialization, this.hospital, this.email],
      phones: [this.phone],
    });
  }
});

export type DoctorDocument = InferSchemaType<typeof doctorSchema>;

export const Doctor = model('Doctor', doctorSchema);
