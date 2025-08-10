import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    discountType: { type: String, enum: ['flat', 'percentage'], required: true },
    discountValue: { type: Number, required: true },

    validTill: { type: Date }, // Optional for time-based
    usageLimit: { type: Number }, // Optional for quantity-based
    usedCount: { type: Number, default: 0 }, // Track usage

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
