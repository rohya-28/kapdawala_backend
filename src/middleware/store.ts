import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

const sendErrorResponse = (res: Response, statusCode: number, message: string, error?: any) => {
    res.status(statusCode).json({ success: false, message, error: error?.message || error });
};

export const validateStoreId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendErrorResponse(res, 400, 'Invalid Store ID format.');
    }
    next();
};