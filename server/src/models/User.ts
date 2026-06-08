import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      trim: true,
      required: true,
    },
    provider: {
      type: String,
      enum: ['google', 'password'],
      default: 'password',
    },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
