import mongoose, { Schema, Document } from 'mongoose';

export type OtpPurpose = 'signup' | 'login';

export interface IAuthOtp extends Document {
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  usedAt?: Date;
  payload?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AuthOtpSchema = new Schema<IAuthOtp>({
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  purpose: { type: String, enum: ['signup', 'login'], required: true, index: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  usedAt: { type: Date },
  payload: { type: Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
});

AuthOtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export default mongoose.model<IAuthOtp>('AuthOtp', AuthOtpSchema);