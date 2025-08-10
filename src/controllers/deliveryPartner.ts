import { Request, Response } from 'express';
import DeliveryPartner from '../models/deliveryPartner';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responceHandler';

//  GET /admin/delivery
export const getAllDeliveryPartners = async (_req: Request, res: Response) => {
  try {
    const partners = await DeliveryPartner.find();
    sendSuccessResponse(res, 200, 'Delivery partners fetched.', partners);
  } catch (error) {
    sendErrorResponse(res, 500, 'Failed to fetch partners.', error);
  }
};

//  POST /admin/delivery
export const addDeliveryPartner = async (req: Request, res: Response) => {
    const { name, phone, vehicleNumber, address, IdProof } = req.body;
  
    if (!name || !phone || !vehicleNumber || !address || !IdProof) {
      return sendErrorResponse(res, 400, 'All fields are required.');
    }
  
    try {
      const exists = await DeliveryPartner.findOne({ phone });
      if (exists) return sendErrorResponse(res, 409, 'Phone number already exists.');
  
      const newPartner = await DeliveryPartner.create({
        name,
        phone,
        vehicleNumber,
        address,
        IdProof
      });
  
      sendSuccessResponse(res, 201, 'Partner added successfully.', newPartner);
    } catch (error) {
      sendErrorResponse(res, 500, 'Failed to add partner.', error);
    }
  };
  
// GET /admin/delivery/:partnerId
export const getPartnerById = async (req: Request, res: Response) => {
  const { partnerId } = req.params;

  try {
    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) return sendErrorResponse(res, 404, 'Partner not found.');

    sendSuccessResponse(res, 200, 'Partner details fetched.', partner);
  } catch (error) {
    sendErrorResponse(res, 500, 'Error fetching partner.', error);
  }
};

//  PATCH /admin/delivery/:partnerId
export const updatePartner = async (req: Request, res: Response) => {
  const { partnerId } = req.params;
  const updates = req.body;

  try {
    const updated = await DeliveryPartner.findByIdAndUpdate(partnerId, updates, { new: true });
    if (!updated) return sendErrorResponse(res, 404, 'Partner not found.');

    sendSuccessResponse(res, 200, 'Partner updated.', updated);
  } catch (error) {
    sendErrorResponse(res, 500, 'Update failed.', error);
  }
};

// DELETE /admin/delivery/:partnerId
export const deletePartner = async (req: Request, res: Response) => {
  const { partnerId } = req.params;

  try {
    const deleted = await DeliveryPartner.findByIdAndDelete(partnerId);
    if (!deleted) return sendErrorResponse(res, 404, 'Partner not found.');

    sendSuccessResponse(res, 200, 'Partner deleted.');
  } catch (error) {
    sendErrorResponse(res, 500, 'Delete failed.', error);
  }
};
