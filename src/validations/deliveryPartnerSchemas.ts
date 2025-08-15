// src/validations/deliveryPartnerSchemas.ts
import { z } from 'zod';

// Schema for Delivery Partner Registration
export const registerDeliveryPartnerSchema = z.object({
    // User Account Details (for login, mapped to your User model)
    email: z.string().email('Invalid email format.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
    name: z.string().min(1, 'Name is required.'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits.').max(15, 'Phone number too long.'),
    address: z.string().min(1, 'Address is required.'), // As per your User schema (string)

    // Delivery Partner Specific Details (mapped to your DeliveryPartner model)
    vehicleDetails: z.object({
        type: z.string().min(1, 'Vehicle type is required (e.g., Motorcycle, Car).'),
        numberPlate: z.string().min(1, 'Vehicle number plate is required.'),
        model: z.string().optional(),
    }),
    licenseNumber: z.string().min(1, 'License number is required.'),
    identityProofDocument: z.object({
        type: z.string().min(1, 'Identity proof type is required (e.g., Aadhar, PAN).'),
        documentUrl: z.string().url('Invalid document URL format.'),
    }),
});

// Schema for Delivery Partner Login
export const deliveryPartnerLoginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Schema for Approving a Delivery Partner (if you want to validate the ID in Zod)
export const approveDeliveryPartnerParamSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Delivery Partner ID format.'), // Validates ObjectId format
});