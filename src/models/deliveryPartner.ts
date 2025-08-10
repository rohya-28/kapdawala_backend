import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
   IdProof: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  totalEarnings: {
    type: Number,
    default: 0, // Earnings in ₹
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('DeliveryPartner', deliveryPartnerSchema);
