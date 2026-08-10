import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  USER = 'user' // potentially for regular users later
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google'
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  vendorProfileId?: mongoose.Types.ObjectId;
  userProfileId?: mongoose.Types.ObjectId;
  isVerified: boolean;
  authProvider: AuthProvider;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.VENDOR
  },
  vendorProfileId: { type: Schema.Types.ObjectId, ref: 'VendorProfile' },
  userProfileId: { type: Schema.Types.ObjectId, ref: 'UserProfile' },
  isVerified: { type: Boolean, default: false },
  authProvider: {
    type: String,
    enum: Object.values(AuthProvider),
    default: AuthProvider.LOCAL
  },
  lastLogin: { type: Date }
}, {
  timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);
