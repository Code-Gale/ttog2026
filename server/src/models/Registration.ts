import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const registrationSchema = new Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, index: true },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  gender: { type: String, enum: ['male', 'female'], required: true },
  tickets: { type: Number, required: true, min: 1, max: 10 },
  dressCode: { type: String, enum: ['burgundy', 'baby-pink', 'bubblegum-pink'], required: true },
  amount: { type: Number, required: true, min: 300000 },
  reference: { type: String, required: true, unique: true, index: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending', index: true },
  ticketId: { type: String, unique: true, sparse: true, index: true },
  checkedInAt: { type: Date, default: null },
  emailSentAt: { type: Date, default: null },
  emailSendingAt: { type: Date, default: null },
  paymentChannel: { type: String, default: null },
}, { timestamps: true });

export type Registration = InferSchemaType<typeof registrationSchema>;
export const RegistrationModel = mongoose.model('Registration', registrationSchema);
