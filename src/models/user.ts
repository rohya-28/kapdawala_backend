import mongoose, { Schema } from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'delivery' | 'store_owner' | 'admin';
  address?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; 
  };
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['user', 'delivery', 'store_owner', 'admin'],
      required: true,
    },
    address: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], 
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

export default mongoose.model<IUser>('User', userSchema);
