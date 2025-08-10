import { Request, Response } from "express";
import Store from "../models/store";
import Order from "../models/order";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responceHandler";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export const addService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, image } = req.body;

    if (!name || !price) {
      res.status(400).json({ message: "Name and price are required" });
      return;
    }

    const storeId = req.storeId;

    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    const newService = {
      name,
      description,
      price,
      category,
      image,
      isSuspended: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.services.push(newService);
    await store.save();

    // The last added service is at the end of the array
    const addedService = store.services[store.services.length - 1];

    res.status(201).json({
      message: "Service added successfully",
      service: addedService,
    });
  } catch (error) {
    console.error("Add Service Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const storeId = req.storeId;
    const serviceId = req.params.serviceId;

    if (!storeId || !serviceId) {
      res.status(400).json({ message: "Store ID and Service ID are required" });
      return;
    }

    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    const serviceIndex = store.services.findIndex(s => s._id.toString() === serviceId);
    if (serviceIndex === -1) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    store.services.splice(serviceIndex, 1);
    await store.save();

    res.status(200).json({ message: "Service deleted successfully" });

  } catch (error) {
    console.error("Delete Service Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /store/inventory
export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const storeId = req.storeId; // from verifyStoreToken middleware
    const store = await Store.findById(storeId).select("services");

    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    res.status(200).json({
      message: "Inventory fetched successfully",
      services: store.services,
    });
  } catch (error) {
    console.error("Get Inventory Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}; 

// PATCH /store/inventory/edit-service
export const editService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId, action, updates } = req.body; // action: "update" or "remove"
    const storeId = req.storeId;

    if (!serviceId || !action) {
      res.status(400).json({ message: "serviceId and action are required" });
      return;
    }

    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    const service = store.services.id(serviceId);
    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    if (action === "update") {
      Object.assign(service, updates); // merge updates
    } 
    else if (action === "remove") {
      service.deleteOne(); // remove from array
    } 
    else {
      res.status(400).json({ message: "Invalid action" });
      return;
    }

    await store.save();

    res.status(200).json({
      message: action === "update" ? "Service updated successfully" : "Service removed successfully",
      services: store.services,
    });
  } catch (error) {
    console.error("Edit Service Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ storeId: req.storeId }).sort({ createdAt: -1 });
    sendSuccessResponse(res, 200, "All orders fetched", orders);
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching orders", error);
  }
};

export const getOrdersByStatus = (status: "new" | "in-progress" | "completed") => {
  return async (req: Request, res: Response) => {
    try {
      const orders = await Order.find({ storeId: req.storeId, status }).sort({ createdAt: -1 });
      sendSuccessResponse(res, 200, `${status} orders fetched`, orders);
    } catch (error) {
      sendErrorResponse(res, 500, `Error fetching ${status} orders`, error);
    }
  };
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, storeId: req.storeId });

    if (!order) return sendErrorResponse(res, 404, "Order not found");

    sendSuccessResponse(res, 200, "Order details fetched", order);
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching order details", error);
  }
};


interface AuthRequest extends Request {
  storeId?: string;
}

export const updateStoreLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const storeId = req.storeId;

    if (!storeId) {
      return sendErrorResponse(res, 401, "Unauthorized - Missing store ID");
    }

    const { latitude, longitude } = req.body;

    if (
      typeof latitude !== "number" || latitude < -90 || latitude > 90 ||
      typeof longitude !== "number" || longitude < -180 || longitude > 180
    ) {
      return sendErrorResponse(res, 400, "Invalid latitude or longitude");
    }

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
      { new: true }
    );

    if (!updatedStore) {
      return sendErrorResponse(res, 404, "Store not found");
    }

    return sendSuccessResponse(res, 200, "Location updated successfully", {
      location: updatedStore.location,
    });
  } catch (error) {
    console.error("Update Location Error:", error);
    return sendErrorResponse(res, 500, "Server error", error);
  }
};
  


