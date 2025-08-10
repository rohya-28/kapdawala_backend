import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  storeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  services: {
    serviceId: mongoose.Types.ObjectId;
    name: string; // Including the name for a simpler store owner view
    clothingTypeId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  pickupDate: Date;
  address: {
    textAddress: string;
    geoLocation: { lat: number; lng: number };
  };
  status: "new" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for the unified order.
const OrderSchema = new Schema<IOrder>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    services: [
      {
        serviceId: {
          type: Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        name: {
          type: String, // Service name for display purposes
          required: true
        },
        clothingTypeId: {
          type: Schema.Types.ObjectId,
          ref: "ClothingType",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    address: {
      textAddress: {
        type: String,
        required: true,
      },
      geoLocation: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "completed", "cancelled"],
      default: "new",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
