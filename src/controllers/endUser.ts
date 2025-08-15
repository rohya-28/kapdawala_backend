import { Request, Response } from "express";
import Store from "../models/store";
import Order, { IOrder, IOrderItem } from "../models/order";
import User from "../models/user";
import { sendSuccessResponse, sendErrorResponse } from "../utils/responceHandler";
import mongoose from "mongoose";


export const getNearbyStores = async (req: Request, res: Response): Promise<void> => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      let maxDistance = req.query.maxDistance ? parseInt(req.query.maxDistance as string) : 5000;
  
      if (
        isNaN(latitude) || latitude < -90 || latitude > 90 ||
        isNaN(longitude) || longitude < -180 || longitude > 180
      ) {
        return sendErrorResponse(res, 400, "Invalid or missing latitude/longitude");
      }
  
      if (!maxDistance || maxDistance <= 0) {
        maxDistance = 5000; // default 5 km in meters
      }
  
      const stores = await Store.find({
        isSuspended: false,
        isOnline: true,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: maxDistance,
          },
        },
      }).select("name address phone location services");
  
      return sendSuccessResponse(res, 200, "Nearby stores fetched successfully", {
        stores,
      });
    } catch (error) {
      console.error("Get Nearby Stores Error:", error);
      return sendErrorResponse(res, 500, "Server error", error);
    }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
      const {
          userId,
          storeId,
          items,
          pickupAddress,
          deliveryAddress,
          pickupScheduledTime,
          notes,
          paymentMethod, // <-- Added paymentMethod
      } = req.body;

      // Basic presence check for all required fields
      if (
          !userId ||
          !storeId ||
          !items ||
          !pickupAddress ||
          !deliveryAddress ||
          !pickupScheduledTime ||
          !paymentMethod // <-- Added paymentMethod
      ) {
          return sendErrorResponse(
              res,
              400,
              "Missing required fields: userId, storeId, items, pickupAddress, deliveryAddress, pickupScheduledTime, paymentMethod."
          );
      }

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return sendErrorResponse(res, 400, "Invalid User ID format.");
      }
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
          return sendErrorResponse(res, 400, "Invalid Store ID format.");
      }

      // Check if User and Store exist
      const [userExists, storeExists] = await Promise.all([
          User.findById(userId),
          Store.findById(storeId),
      ]);

      if (!userExists) {
          return sendErrorResponse(res, 404, "User not found with the provided userId.");
      }
      if (!storeExists) {
          return sendErrorResponse(res, 404, "Store not found with the provided storeId.");
      }

      // Validate and calculate items
      if (!Array.isArray(items) || items.length === 0) {
          return sendErrorResponse(res, 400, "Order must contain at least one item.");
      }

      let totalAmount = 0;
      const validItems: IOrderItem[] = [];

      for (const item of items) {
          const { serviceId, clothingTypeId, quantity, price } = item;

          if (
              !serviceId ||
              !clothingTypeId ||
              typeof quantity !== "number" ||
              typeof price !== "number"
          ) {
              return sendErrorResponse(
                  res,
                  400,
                  "Each item must include serviceId, clothingTypeId, quantity, and price."
              );
          }

          if (!mongoose.Types.ObjectId.isValid(serviceId) || !mongoose.Types.ObjectId.isValid(clothingTypeId)) {
              return sendErrorResponse(res, 400, "Invalid serviceId or clothingTypeId in item.");
          }

          if (quantity <= 0) {
              return sendErrorResponse(res, 400, "Item quantity must be a positive number.");
          }
          if (price < 0) {
              return sendErrorResponse(res, 400, "Item price must be a non-negative number.");
          }

          totalAmount += quantity * price;
          validItems.push(item);
      }

      // Validate address structures
      if (!pickupAddress.textAddress || !pickupAddress.geoLocation || typeof pickupAddress.geoLocation.lat !== 'number' || typeof pickupAddress.geoLocation.lng !== 'number') {
          return sendErrorResponse(res, 400, "Invalid pickupAddress format. It must contain textAddress and geoLocation with lat/lng.");
      }
      if (!deliveryAddress.textAddress || !deliveryAddress.geoLocation || typeof deliveryAddress.geoLocation.lat !== 'number' || typeof deliveryAddress.geoLocation.lng !== 'number') {
          return sendErrorResponse(res, 400, "Invalid deliveryAddress format. It must contain textAddress and geoLocation with lat/lng.");
      }

      // Create and save the order
      const newOrder: IOrder = new Order({
          userId,
          storeId,
          items: validItems,
          totalAmount,
          pickupAddress,
          deliveryAddress,
          pickupDate: new Date(pickupScheduledTime), // Mapped from pickupScheduledTime
          paymentMethod, // <-- Added paymentMethod
          orderNotes: notes, // Mapped from notes
          status: "pending" 
      });

      const savedOrder = await newOrder.save();
      sendSuccessResponse(res, 201, "Order created successfully.", savedOrder);
  } catch (error) {
      console.error("Error creating order:", error);

      if (error instanceof mongoose.Error.ValidationError) {
          return sendErrorResponse(res, 400, `Validation Error: ${error.message}`, error);
      }

      sendErrorResponse(res, 500, "Server error. Could not create the order.");
  }
};



