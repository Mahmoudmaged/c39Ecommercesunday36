


import mongoose, { model, Schema, Types } from "mongoose";

const orderSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    products: [{
        name: { type: String, required: true },
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1, required: true },
        unitPrice: { type: Number, default: 1, required: true },
        finalPrice: { type: Number, default: 1, required: true }, // quantity * unitPrice
    }],
    note: String,
    address: { type: String, required: true },
    phone: [String],
    subTotal: { type: Number, default: 1, required: true },
    finalPrice: { type: Number, default: 1, required: true },
    paymentType: { type: String, default: 'cash', enum: ['cash', 'card'] },
    status: { type: String, default: 'placed', enum: ['waitForPayment', 'placed', 'onWay', 'delivered', 'rejected' , 'canceled'] },
    reason: String,
    couponId: { type: Types.ObjectId, ref: 'Coupon' },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
})


const orderModel = mongoose.models.order || model('order', orderSchema)
export default orderModel