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
import { deliveryPartnerLoginSchema } from '../validations/deliveryPartnerSchemas';
import deliveryPartner from '../models/deliveryPartner';
import mongoose from 'mongoose';

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
    userId: user._id,
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

    sendSuccessResponse(res, 200, 'Login successful.', { token,  storeId: storeDoc._id, });
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

export const deliveryPartnerLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using the Zod schema
  const result = deliveryPartnerLoginSchema.safeParse(req.body);
  if (!result.success) {
      return sendErrorResponse(res, 400, 'Invalid login data provided.', result.error.errors);
  }

  const { email, password } = result.data;

  try {
      // 1. Find the User record by email. This User record contains the login credentials.
      const user = await User.findOne({ email });
      if (!user) {
          return sendErrorResponse(res, 401, 'Invalid email or password.'); // Generic message for security
      }

      // 2. Compare the provided plaintext password with the hashed password stored in user.password.
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return sendErrorResponse(res, 401, 'Invalid email or password.'); // Generic message for security
      }

      // 3. Verify that the user's role is 'delivery'.
      if (user.role !== 'delivery') {
          return sendErrorResponse(res, 403, 'Access denied. This account is not a delivery partner account.');
      }

      // 4. Find the corresponding DeliveryPartner profile using the userId.
      const deliveryPartnerProfile = await deliveryPartner.findOne({ userId: user._id });
      if (!deliveryPartnerProfile) {
          // This case should ideally not happen if a User with role 'delivery' always has a profile.
          // It indicates a data inconsistency.
          return sendErrorResponse(res, 404, 'Delivery partner profile not found.');
      }

      // 5. Check if the delivery partner's account is approved by admin.
      if (!deliveryPartnerProfile.isApproved) {
          return sendErrorResponse(res, 403, 'Your account is not yet approved by admin. Please wait.');
      }

      // 6. Generate a JWT token. Include necessary IDs and role in the payload.
      const token = sign(
          {
              userId: user._id, // The general user ID
              deliveryPartnerId: deliveryPartnerProfile._id, // The specific DeliveryPartner profile ID
              role: user.role, // 'delivery'
          },
          config.jwtSecret, // Ensure config.jwtSecret is correctly loaded from environment variables
          { expiresIn: '7d' } // Token expires in 7 days
      );

      // 7. Send a success response with the token and relevant IDs.
      sendSuccessResponse(res, 200, 'Login successful.', {
          accessToken: token, // Use accessToken for clarity
          userId: user._id,
          deliveryPartnerId: deliveryPartnerProfile._id,
          role: user.role,
          isApproved: deliveryPartnerProfile.isApproved,
          isAvailable: deliveryPartnerProfile.isAvailable, // Also useful for the client
      });

  } catch (error: unknown) {
      console.error("Error during delivery partner login:", error);
      // Handle Mongoose validation errors if any unexpected ones occur
      if (error instanceof mongoose.Error.ValidationError) {
          return sendErrorResponse(res, 400, `Validation Error: ${error.message}`, error.errors);
      }
      sendErrorResponse(res, 500, 'Login failed due to a server error.', error);
  }
};


