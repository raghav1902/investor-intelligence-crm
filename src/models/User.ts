import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  passwordChangedAt?: Date;
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
      // Not required because users might sign in via Google
    },
    image: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
      // Updated whenever the password is changed — used to invalidate older JWTs
    },
  },
  { timestamps: true }
);

// If the model is already compiled, use that, otherwise compile a new one
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
