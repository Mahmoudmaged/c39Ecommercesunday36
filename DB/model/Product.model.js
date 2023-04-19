import mongoose, { model, Schema, Types } from "mongoose";

const productSchema = new Schema({
    customId: String,
    name: { type: String, required: true, trim: true, lowercase: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    stock: {
        type: Number,
        default: 1
    },
    price: {
        type: Number,
        default: 1
    },
    discount: {
        type: Number,
        default: 0
    },
    finalPrice: {
        type: Number,
        default: 1
    },
    colors: {
        type: [String],
    },
    size: {
        type: [String],
        enum: ['s', 'm', 'lg', 'xl', 'xxl']
    },
    // avgRate: { type: Number, default: 1 },


    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
    subcategoryId: { type: Types.ObjectId, ref: 'Subcategory', required: true },
    brandId: { type: Types.ObjectId, ref: 'Brand', required: true },

    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },

    mainImage: { type: Object, required: true },
    subImages: [Object],

    isDeleted: { type: Boolean, default: false },
    wishUsers: [{ type: Types.ObjectId, ref: 'User' }]
}, {
    toObject:{virtuals:true},
    toJSON:{virtuals:true},
    timestamps: true
})


productSchema.virtual('review', {
    ref: 'Review',
    localField: "_id",
    foreignField: 'productId'
})


const productModel = mongoose.models.Product || model('Product', productSchema)
export default productModel