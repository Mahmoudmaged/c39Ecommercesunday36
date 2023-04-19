import mongoose, { model, Schema, Types } from "mongoose";

const couponSchema = new Schema({
    name: { type: String, required: true, trim: true  , lowercase:true  , unique:true},
    image: { type: Object },
    amount: { type: Number, default: 1, required: true },
    expireDate :{type:Date , required:true},
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    usedBy: [{ type: Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
})


const couponModel = mongoose.models.Coupon || model('Coupon', couponSchema)
export default couponModel