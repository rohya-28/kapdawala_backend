import { Request, Response } from "express";
import Store from "../models/store";
import Order from "../models/order";
import { sendSuccessResponse, sendErrorResponse } from "../utils/responceHandler";


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

export const createOrder = async (req: Request, res: Response) : Promise<void> => {
  try {
    // Destructure the required fields from the request body.
    // The 'status' is automatically set by the schema to 'new'.
    const {
      storeId,
      userId,
      services,
      totalAmount,
      pickupDate,
      address,
    } = req.body;

    // --- Basic Validation ---
    if (!storeId || !userId || !services || !totalAmount || !pickupDate || !address) {
      return sendErrorResponse(res,400, "Please provide all required fields.");
    }

    // --- Create a new Order document ---
    const newOrder = new Order({
      storeId,
      userId,
      services,
      totalAmount,
      pickupDate,
      address,
      // The 'status' will default to 'new' as defined in the schema.
    });

    const savedOrder = await newOrder.save();

    // Respond with a success message and the created order.
    // Use a 201 status code for successful creation.
    res.status(201).json({
      message: "Order created successfully.",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error. Could not create the order." });
  }
};


