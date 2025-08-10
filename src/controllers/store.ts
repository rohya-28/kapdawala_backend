// This one is for admin only
import { Request, Response } from 'express';
import Store from '../models/store';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responceHandler';
import bcrypt from 'bcrypt';

//  Create Store
export const createStore = async (req: Request, res: Response) => {
  try {
    const { name, phone, address, password } = req.body;

    if (!name || !phone || !address || !password) {
      return sendErrorResponse(res, 400, 'Name, phone, address, and password are required.');
    }

    // Check for existing store
    const existing = await Store.findOne({ phone });
    if (existing) {
      return sendErrorResponse(res, 409, 'Store with this phone already exists.');
    }

    // 🔐 Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create store
    const newStore = await Store.create({
      name,
      phone,
      address,
      password: hashedPassword, // store the hashed password
    });

    sendSuccessResponse(res, 201, 'Store created successfully.', {
      _id: newStore._id,
      name: newStore.name,
      phone: newStore.phone,
      address: newStore.address,
    }); // Don't return password
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to create store.', error);
  }
};

//  Get All Stores
export const getAllStores = async (_req: Request, res: Response) => {
  try {
    const stores = await Store.find();
    sendSuccessResponse(res, 200, 'Stores retrieved successfully.', stores);
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to fetch stores.', error);
  }
};

//  Get Single Store
export const getStoreById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const store = await Store.findById(id);
    if (!store) {
      return sendErrorResponse(res, 404, 'Store not found.');
    }
    sendSuccessResponse(res, 200, 'Store retrieved successfully.', store);
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to retrieve store.', error);
  }
};

//  Update Store
export const updateStore = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updated = await Store.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return sendErrorResponse(res, 404, 'Store not found.');
    }
    sendSuccessResponse(res, 200, 'Store updated successfully.', updated);
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to update store.', error);
  }
};

// Delete Store
export const deleteStore = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await Store.findByIdAndDelete(id);
    if (!deleted) {
      return sendErrorResponse(res, 404, 'Store not found.');
    }
    sendSuccessResponse(res, 200, 'Store deleted successfully.');
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to delete store.', error);
  }
};

// PATCH /api/admin/stores/:id/suspend
export const toggleStoreSuspension = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const store = await Store.findById(id);
    if (!store) return sendErrorResponse(res, 404, 'Store not found.');

    store.isSuspended = !store.isSuspended;
    await store.save();

    sendSuccessResponse(
      res,
      200,
      `Store has been ${store.isSuspended ? 'suspended' : 'unsuspended'}.`,
      { isSuspended: store.isSuspended }
    );
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to toggle suspension.', error);
  }
};

// // POST /api/store/services
// export const addServices = async (req: Request, res: Response) => {
//   const storeId = req.storeId; // from JWT middleware
//   const { services } = req.body;

//   try {
//     const store = await Store.findById(storeId);
//     if (!store) return sendErrorResponse(res, 404, 'Store not found.');

//     store.services.push(...services);
//     await store.save();

//     sendSuccessResponse(res, 200, 'Services added successfully.', store.services);
//   } catch (error) {
//     sendErrorResponse(res, 500, 'Failed to add services.', error);
//   }
// };


