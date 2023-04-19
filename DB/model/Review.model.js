import mongoose, { model, Schema, Types } from "mongoose";

const reviewSchema = new Schema({
    productId: { type: Types.ObjectId, ref: 'Product', required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Types.ObjectId, ref: 'Order', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    rating: { type: Number, default: 1, min: 1, max: 5 },
    comment: { type: String },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
})


const reviewModel = mongoose.models.Review || model('Review', reviewSchema)
export default reviewModel