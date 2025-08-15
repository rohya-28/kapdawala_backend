// This one is for admin only
import { Request, Response } from 'express';
import Store from '../models/store';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responceHandler';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import Order from '../models/order';

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


// for Store Owner Order Deletion

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
      const { id } = req.params; // Get the order ID from the URL parameters

      // 1. Validate the order ID format.
      if (!mongoose.Types.ObjectId.isValid(id)) {
          return sendErrorResponse(res, 400, 'Invalid Order ID format.');
      }

      // 2. Authorization Check (now simplified as `verifyStoreToken` handles role verification)
      // verifyStoreToken ensures `req.storeId` exists and the role is 'store'.
      // If the middleware didn't attach `req.storeId` or `req.role`, it would have already returned an error.
      const authenticatedStoreId = req.storeId;

      // This check should ideally not be hit if `verifyStoreToken` works as expected,
      // but it's a good safeguard for TypeScript or if middleware setup changes.
      if (!authenticatedStoreId) {
           return sendErrorResponse(res, 403, 'Forbidden: Store owner ID not available in token.');
      }

      // 3. Find the order. We need to find it first to check its storeId.
      const orderToDelete = await Order.findById(id);

      if (!orderToDelete) {
          return sendErrorResponse(res, 404, 'Order not found.');
      }

      // 4. Verify that the order's storeId matches the authenticated store owner's storeId.
      // Assuming orderToDelete.storeId is a mongoose.Types.ObjectId
      if (!orderToDelete.storeId || !orderToDelete.storeId.equals(authenticatedStoreId)) {
           return sendErrorResponse(res, 403, 'Forbidden. You can only delete orders from your own store.');
      }

      // 5. Optionally, add business logic to prevent deletion of orders in certain statuses.
      if (orderToDelete.status !== 'pending' && orderToDelete.status !== 'created') {
          return sendErrorResponse(res, 400, `Order cannot be deleted. Its current status is "${orderToDelete.status}". Only "pending" or "created" orders can be deleted.`);
      }

      // 6. Delete the order.
      await Order.deleteOne({ _id: id });

      // 7. Send a success response.
      sendSuccessResponse(res, 200, 'Order deleted successfully.', { orderId: id });

  } catch (error: unknown) {
      console.error('Error deleting order:', error);
      if (error instanceof mongoose.Error.ValidationError) {
          return sendErrorResponse(res, 400, `Validation Error: ${error.message}`, error);
      }
      sendErrorResponse(res, 500, 'Failed to delete order due to a server error.', error);
  }
};

