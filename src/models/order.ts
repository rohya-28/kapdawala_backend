import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for individual order items
export interface IOrderItem {
    serviceId: mongoose.Types.ObjectId;
    clothingTypeId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

// Define the interface for the Order document
export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId; 
    storeId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: 'created' | 'pending' | 'picked_up' | 'in_process' | 'ready' | 'delivered' | 'cancelled';
    pickupAddress: {
        textAddress: string;
        geoLocation: {
            lat: number;
            lng: number;
        };
    };
    deliveryAddress: {
        textAddress: string;
        geoLocation: {
            lat: number;
            lng: number;
        };
    };
    deliveryPersonnelId?: mongoose.Types.ObjectId;
    pickupDate: Date;
    deliveryDate?: Date;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentMethod: 'cash' | 'online';
    orderNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Define the Mongoose schema for Order
const OrderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
        items: [
            {
                serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
                clothingTypeId: { type: Schema.Types.ObjectId, ref: 'ClothingType', required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['created', 'pending', 'accepted', 'picked_up', 'in_process', 'ready', 'delivered', 'cancelled'],
            default: 'pending',
            required: true,
        },
        pickupAddress: {
            textAddress: { type: String, required: true },
            geoLocation: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            },
        },
        deliveryAddress: {
            textAddress: { type: String, required: true },
            geoLocation: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            },
        },
        deliveryPersonnelId: { type: Schema.Types.ObjectId, ref: 'DeliveryPartner' },
        pickupDate: { type: Date, required: true },
        deliveryDate: { type: Date },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'online'],
            required: true,
        },
        orderNotes: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);