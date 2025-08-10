import mongoose from 'mongoose';

const promotionUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Store' },
    promotionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Promotion' },
    usedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const PromotionUsage = mongoose.model('PromotionUsage', promotionUsageSchema);
export default PromotionUsage;
