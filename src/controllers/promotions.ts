import { Request, Response } from 'express';
import Promotion from '../models/promotions';
import PromotionUsage from '../models/promotionUsage';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responceHandler';
import { AuthRequest } from '../types/auth';

// Add Offer
export const addPromotion = async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        discountType,
        discountValue,
        validTill,
        usageLimit
      } = req.body;
  
      if (!title || !discountType || !discountValue) {
        return sendErrorResponse(res, 400, 'Title, type, and value are required.');
      }
  
      const newPromo = await Promotion.create({
        title,
        description,
        discountType,
        discountValue,
        validTill,
        usageLimit
      });
  
      sendSuccessResponse(res, 201, 'Promotion added successfully.', newPromo);
    } catch (error) {
      sendErrorResponse(res, 500, 'Failed to add promotion.', error);
    }
  };
  

// Get All Promotions
export const getAllPromotions = async (_req: Request, res: Response) => {
  try {
    const promos = await Promotion.find();
    sendSuccessResponse(res, 200, 'Promotions retrieved successfully.', promos);
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to fetch promotions.', error);
  }
};


export const applyPromotion = async (req: AuthRequest, res: Response) => {
    const { promotionId } = req.body;
    const userId = req.userId; // or req.storeId
  
    try {
      const promo = await Promotion.findById(promotionId);
      if (!promo || !promo.isActive) {
        return sendErrorResponse(res, 404, 'Promotion not found or inactive.');
      }
  
      // ❌ Check usage limit
      if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
        return sendErrorResponse(res, 400, 'Promotion usage limit reached.');
      }
  
      // ❌ Check expiry
      if (promo.validTill && new Date() > promo.validTill) {
        return sendErrorResponse(res, 400, 'Promotion has expired.');
      }
  
      // ❌ Check if user has already used
      const alreadyUsed = await PromotionUsage.findOne({ userId, promotionId });
      if (alreadyUsed) {
        return sendErrorResponse(res, 400, 'You have already used this promotion.');
      }
  
      // ✅ Apply promotion
      promo.usedCount += 1;
      await promo.save();
  
      await PromotionUsage.create({ userId, promotionId });
  
      sendSuccessResponse(res, 200, 'Promotion applied successfully.');
    } catch (error) {
      sendErrorResponse(res, 500, 'Failed to apply promotion.', error);
    }
  };
  

