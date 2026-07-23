import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  passwordChangedAt?: Date;
  
  // Subscription fields
  plan: 'free' | 'premium';
  planStartedAt?: Date;
  planExpiresAt?: Date;
  billingCycle?: 'monthly' | 'yearly';
  scansUsedThisCycle: number;
  scansLimit?: number;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    planStartedAt: {
      type: Date,
    },
    planExpiresAt: {
      type: Date,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
    },
    scansUsedThisCycle: {
      type: Number,
      default: 0,
    },
    scansLimit: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
