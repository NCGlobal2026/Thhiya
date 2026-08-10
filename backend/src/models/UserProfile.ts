import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
    userId: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    phone?: string;
    companyName?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    companyName: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
