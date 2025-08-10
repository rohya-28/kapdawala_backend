import mongoose, { Schema, Document } from "mongoose";

export interface IEndUserOrder extends Document {
  storeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  services: {
    serviceId: mongoose.Types.ObjectId;
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

const EndUserOrderSchema = new Schema<IEndUserOrder>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    services: [
      {
        serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
        clothingTypeId: { type: Schema.Types.ObjectId, ref: "ClothingType" },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    pickupDate: { type: Date, required: true },
    address: {
      textAddress: { type: String, required: true },
      geoLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "completed", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEndUserOrder>("EndUserOrder", EndUserOrderSchema);
