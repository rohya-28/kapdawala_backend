import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    category: { type: String, trim: true },
    image: { type: String },
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    address: { type: String, required: true },
    password: { type: String, required: true },
    isSuspended: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    services: [serviceSchema],
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  { timestamps: true }
);

storeSchema.index({ location: "2dsphere" });


export default mongoose.model("Store", storeSchema);
