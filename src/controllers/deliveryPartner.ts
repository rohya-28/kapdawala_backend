import { Request, Response } from 'express';
import DeliveryPartner from '../models/deliveryPartner';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responceHandler';
import mongoose from 'mongoose';
import Order, { IOrder } from '../models/order';
import bcrypt from 'bcrypt';
import User from '../models/user';
import {  registerDeliveryPartnerSchema } from '../validations/deliveryPartnerSchemas';

//  GET /admin/delivery
export const getAllDeliveryPartners = async (_req: Request, res: Response) => {
  try {
    const partners = await DeliveryPartner.find();
    sendSuccessResponse(res, 200, 'Delivery partners fetched.', partners);
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to fetch partners.', error);
  }
};

//  POST /admin/delivery
export const addDeliveryPartner =  async (req: Request, res: Response) => {
  // Validate request body against the schema
  const result = registerDeliveryPartnerSchema.safeParse(req.body);
  if (!result.success) {
      return sendErrorResponse(res, 400, 'Invalid data provided for delivery partner registration.', result.error.errors);
  }

  const {
      email,
      password,
      name,
      phone, // Changed from phoneNumber
      address, // Changed from object
      vehicleDetails,
      licenseNumber,
      identityProofDocument,
  } = result.data;

  try {
      // Step 1: Create the User account with a hashed password.
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] }); // Changed from phoneNumber
      if (existingUser) {
          return sendErrorResponse(res, 409, 'User with this email or phone number already exists.');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt); // Store hashed password

      const newUser = new User({
          name,
          email,
          password: hashedPassword, // Storing hashed password in the 'password' field as per your schema
          phone, // Changed from phoneNumber
          role: 'delivery', // Setting the 'role' as 'delivery' as per your schema's enum
          address, // Address as a string
          // 'location' will default to [0,0] if not provided in the input, as per schema
      });
      const savedUser = await newUser.save();

      // Step 2: Create the DeliveryPartner profile and link it to the new User.
      const newDeliveryPartner = new DeliveryPartner({
          userId: savedUser._id,
          vehicleDetails,
          licenseNumber,
          identityProofDocument,
          isApproved: false, // Requires admin approval
          isAvailable: true,
          commissionRate: 0.10,
      });
      const savedDeliveryPartner = await newDeliveryPartner.save();

      // Step 3: Send a success response.
      sendSuccessResponse(res, 201, 'Delivery partner account registered successfully. Awaiting admin approval.', {
          userId: savedUser._id,
          deliveryPartnerId: savedDeliveryPartner._id,
          email: savedUser.email,
          role: savedUser.role, // Include the role in the response
          isApproved: savedDeliveryPartner.isApproved,
      });

  } catch (error: unknown) {
      console.error('Error during delivery partner registration:', error);

      if (error instanceof mongoose.Error.ValidationError) {
          return sendErrorResponse(res, 400, `Validation Error: ${error.message}`, error.errors);
      }
      if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
          let errorMessage = 'A delivery partner with this email, phone number, vehicle number, or license number might already exist.';
          const duplicateError = error as any;
          if (duplicateError.keyPattern) {
              const duplicateField = Object.keys(duplicateError.keyPattern)[0];
              errorMessage = `Duplicate entry for ${duplicateField}. Please use a unique value.`;
          }
          return sendErrorResponse(res, 409, errorMessage, error);
      }
      sendErrorResponse(res, 500, 'Failed to register delivery partner due to a server error.', error);
  }
};
  
// GET /admin/delivery/:partnerId
export const getPartnerById = async (req: Request, res: Response) => {
  const { partnerId } = req.params;

  try {
    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) return sendErrorResponse(res, 404, 'Partner not found.');

    sendSuccessResponse(res, 200, 'Partner details fetched.', partner);
  } catch (error) {
    sendErrorResponse(res, 500, 'Error fetching partner.', error);
  }
};

//  PATCH /admin/delivery/:partnerId
export const updatePartner = async (req: Request, res: Response) => {
  const { partnerId } = req.params;
  const updates = req.body;

  try {
    const updated = await DeliveryPartner.findByIdAndUpdate(partnerId, updates, { new: true });
    if (!updated) return sendErrorResponse(res, 404, 'Partner not found.');

    sendSuccessResponse(res, 200, 'Partner updated.', updated);
  } catch (error) {
    sendErrorResponse(res, 500, 'Update failed.', error);
  }
};

// DELETE /admin/delivery/:partnerId
export const deletePartner = async (req: Request, res: Response) => {
  const { partnerId } = req.params;

  try {
    const deleted = await DeliveryPartner.findByIdAndDelete(partnerId);
    if (!deleted) return sendErrorResponse(res, 404, 'Partner not found.');

    sendSuccessResponse(res, 200, 'Partner deleted.');
  } catch (error) {
    sendErrorResponse(res, 500, 'Delete failed.', error);
  }
};

export const acceptOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Destructure orderId from params and deliveryPersonnelId from authenticated user/body.
        // Assuming orderId comes from route params (e.g., /orders/:orderId/accept)
        const { orderId } = req.params;
        // Assuming deliveryPersonnelId comes from the authenticated user's token or request body
        // For simplicity, let's assume it comes from the request body for now.
        // In a real app, this would typically be extracted from the JWT token of the logged-in delivery guy.
        const { deliveryPersonnelId } = req.body;

        // 2. Basic validation for IDs
        if (!orderId || !deliveryPersonnelId) {
            return sendErrorResponse(res, 400, "Order ID and Delivery Personnel ID are required.");
        }
        if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(deliveryPersonnelId)) {
            return sendErrorResponse(res, 400, "Invalid ID format for Order or Delivery Personnel.");
        }

        // 3. Verify Delivery Personnel existence and availability
        const deliveryGuy = await DeliveryPartner.findById(deliveryPersonnelId);
        if (!deliveryGuy) {
            return sendErrorResponse(res, 404, "Delivery personnel not found.");
        }
        if (!deliveryGuy.isApproved) { // Check if the delivery guy is approved
             return sendErrorResponse(res, 403, "Delivery personnel not approved to accept orders.");
        }
        if (!deliveryGuy.isAvailable) { // Check if the delivery guy is currently available
             return sendErrorResponse(res, 400, "Delivery personnel is currently not available.");
        }


        // 4. Find the order and ensure it can be accepted.
        // The order must be 'pending' and not already assigned to a delivery person.
        const order: IOrder | null = await Order.findById(orderId);

        if (!order) {
            return sendErrorResponse(res, 404, "Order not found.");
        }

        if (order.status !== "pending") {
            return sendErrorResponse(res, 400, `Order status is "${order.status}". Only "pending" orders can be accepted.`);
        }

        if (order.deliveryPersonnelId) {
            return sendErrorResponse(res, 400, "This order has already been assigned to a delivery person.");
        }

        // 5. Assign the delivery personnel to the order and update its status.
        order.deliveryPersonnelId = new mongoose.Types.ObjectId(deliveryPersonnelId);
        order.status = "picked_up"; // Or a new status like "assigned" if you want an intermediate step

        await order.save();

        // 6. Send success response.
        sendSuccessResponse(res, 200, "Order successfully accepted by delivery personnel.", order);

    } catch (error) {
        console.error("Error accepting order:", error);
        if (error instanceof mongoose.Error.ValidationError) {
            return sendErrorResponse(res, 400, `Validation Error: ${error.message}`, error);
        }
        sendErrorResponse(res, 500, "Server error. Could not accept the order.");
    }
};

// Delivery Partner Section 
export const getAvailableOrders = async (req: Request, res: Response): Promise<void> => {
  try {
      // Find orders that meet the criteria for being "available":
      // 1. Their 'status' is "pending".
      // 2. The 'deliveryPersonnelId' field does NOT exist (meaning it's not assigned to anyone).
      const availableOrders = await Order.find({
          status: "pending",
          deliveryPersonnelId: { $exists: false } // Ensures the order is not yet assigned
      })
      .sort({ createdAt: 1 }) // Optional: Sort by creation date, oldest first, so partners see oldest orders first
      .populate('userId', 'name phoneNumber') // Optional: Populate user details (name, phone) for context
      .populate('storeId', 'name address.textAddress') // Optional: Populate store details (name, address) for context
      .select('-__v -updatedAt'); // Optional: Exclude certain fields from the response for cleaner data

      // If no available orders are found, send an appropriate message.
      if (availableOrders.length === 0) {
          return sendSuccessResponse(res, 200, "No new orders are currently available for assignment.", []);
      }

      // Send a success response with the list of available orders.
      sendSuccessResponse(res, 200, "Available orders fetched successfully.", availableOrders);

  } catch (error: unknown) { // Type 'error' as unknown for safety
      console.error("Error fetching available orders:", error);
      // Send a generic server error response if something goes wrong.
      sendErrorResponse(res, 500, "Server error. Could not fetch available orders.", error);
  }
};

