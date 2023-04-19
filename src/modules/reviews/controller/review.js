import orderModel from '../../../../DB/model/Order.model.js'
import productModel from '../../../../DB/model/Product.model.js'
import reviewModel from '../../../../DB/model/Review.model.js';

import { asyncHandler } from "../../../utils/errorHandling.js";



export const createReview = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const { comment, rating } = req.body;

    const order = await orderModel.findOne({ userId: req.user._id, "products.productId": productId, status: 'delivered' })
    if (!order) {
        return next(new Error('Cannot enter review before receive this item', { cause: 400 }))
    }

    if (await reviewModel.findOne({ productId, orderId: order._id, userId: req.user._id })) {
        return next(new Error('Already reviewed  by you', { cause: 400 }))
    }
    await reviewModel.create({ createdBy: req.user._id, comment, rating, productId, orderId: order._id })
    return res.status(201).json({ message: "Done" })
})


export const updateReview = asyncHandler(async (req, res, next) => {
    const { productId, reviewId } = req.params
    const review = await reviewModel.findOneAndUpdate({ _id: reviewId, productId, userId: req.user._id }, req.body)
    if (!review) {
        return next(new Error('In-valid review Id', { cause: 400 }))
    }
    return res.status(200).json({ message: "Done" })
}) 