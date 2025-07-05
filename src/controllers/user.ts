// src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import User from '../models/user';
import { config } from '../config/config';

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