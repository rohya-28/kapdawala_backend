import mongoose from 'mongoose';
import dotenv from 'dotenv';
import admin from '../models/admin';
import bcrypt from 'bcrypt';

dotenv.config();

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_CONNECTION_STRING || '');

  const email = 'admin@kapdewala.com';
  const plainPassword = 'ViratIndia@18';
  const hashed = await bcrypt.hash(plainPassword, 10);

  const exists = await admin.findOne({ email });
  if (exists) {
    console.log('Admin already exists.');
    return process.exit(0);
  }

  await admin.create({ email, password: hashed });
  console.log('Admin created successfully ✅');
  process.exit(0);
};

createAdmin();
