import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the DeliveryPartner document
export interface IDeliveryPartner extends Document {
    userId: mongoose.Types.ObjectId; // Reference to the User model, linking to the delivery personnel's user account
    vehicleDetails: { // Details about the vehicle used for deliveries
        type: string; // e.g., "Motorcycle", "Bicycle", "Car"
        numberPlate: string;
        model?: string; // Optional: vehicle model
    };
    licenseNumber: string; // Driver's license number for verification
    identityProofDocument: { // Reference to stored identity proof document (e.g., Aadhar, Passport)
        type: string; // e.g., "Aadhar", "PAN", "Driving License"
        documentUrl: string; // URL or path to the stored document
    };
    isAvailable: boolean; // Indicates if the delivery partner is currently available for assignments
    isApproved: boolean; // Status indicating if the delivery partner has been approved by admin
    currentLocation?: { // Optional: Real-time or last known location for assignment
        latitude: number;
        longitude: number;
        timestamp: Date;
    };
    commissionRate: number; // Percentage of order value earned by the delivery partner
    createdAt: Date; // Timestamp for when the delivery partner record was created
    updatedAt: Date; // Timestamp for the last update to the delivery partner record
}

// Define the Mongoose schema for DeliveryPartner
const DeliveryPartnerSchema = new Schema<IDeliveryPartner>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User", // This refers to the 'User' model (where userType is 'delivery_personnel')
            required: true,
            unique: true, // Each User can only be associated with one DeliveryPartner profile
        },
        vehicleDetails: {
            type: { type: String, required: true },
            numberPlate: { type: String, required: true, unique: true },
            model: { type: String },
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
        },
        identityProofDocument: {
            type: { type: String, required: true },
            documentUrl: { type: String, required: true },
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isApproved: { // Added for admin approval process
            type: Boolean,
            default: false,
        },
        currentLocation: { // Added for geolocation and route optimization
            latitude: { type: Number },
            longitude: { type: Number },
            timestamp: { type: Date },
        },
        commissionRate: { // Explicitly define commission rate here
            type: Number,
            default: 0.10, // Example: 10% commission
        },
    },
    { timestamps: true } // Mongoose will automatically add createdAt and updatedAt fields
);

export default mongoose.model<IDeliveryPartner>("DeliveryPartner", DeliveryPartnerSchema);