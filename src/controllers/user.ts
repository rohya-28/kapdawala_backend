// src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken'; 
import createHttpError from 'http-errors';
import User from '../models/user';
import { config } from '../config/config';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responceHandler';
import Store from '../models/store';
import admin from '../models/admin';

const signupSchema = z.object({
  name: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'delivery', 'store_owner', 'admin']),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.format() });
    return;
  }

  const { name, email, password, role } = result.data;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  res.status(201).json({ message: 'Signup successful' });
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = signInSchema.safeParse(req.body);
  if (!result.success) {
    next(createHttpError(400, 'Invalid login data'));
    return;
  }

  const { email, password } = result.data;

  const user = await User.findOne({ email });
  if (!user) {
    next(createHttpError(404, 'User not found'));
    return;
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    next(createHttpError(401, 'Incorrect password'));
    return;
  }

  const token = sign(
    {
      sub: user._id,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    accessToken: token,
    role: user.role,
    message: 'Login successful',
  });
};

export const storeLogin = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  try {
    const storeDoc = await Store.findOne({ phone });
    if (!storeDoc) {
      return sendErrorResponse(res, 401, 'Invalid phone or password.');
    }

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(password, storeDoc.password);
    if (!isMatch) {
      return sendErrorResponse(res, 401, 'Invalid phone or password.');
    }

    const token = sign(
    { storeId: storeDoc._id.toString(), role: 'store' },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    sendSuccessResponse(res, 200, 'Login successful.', { token });
  } catch (error) {
    sendErrorResponse(res, 500, 'Login failed.', error);
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const existingAdmin = await admin.findOne({ email });
    if (!existingAdmin) return sendErrorResponse(res, 404, 'Admin not found.');

    const isMatch = await bcrypt.compare(password, existingAdmin.password);
    if (!isMatch) return sendErrorResponse(res, 401, 'Invalid credentials.');

    const token = sign(
      { sub: existingAdmin._id, role: 'admin' },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    sendSuccessResponse(res, 200, 'Login successful.', { token });
  } catch (error) {
    sendErrorResponse(res, 500, 'Login failed.', error);
  }
};

export const updateAdminPassword = async (req: Request, res: Response) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const existingAdmin = await admin.findOne({ email });
    if (!existingAdmin) return sendErrorResponse(res, 404, 'Admin not found.');

    const isMatch = await bcrypt.compare(oldPassword, existingAdmin.password);
    if (!isMatch) return sendErrorResponse(res, 401, 'Old password is incorrect.');

    const hashed = await bcrypt.hash(newPassword, 10);
    existingAdmin.password = hashed;
    await existingAdmin.save();

    sendSuccessResponse(res, 200, 'Password updated successfully.');
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to update password.', error);
  }
};


