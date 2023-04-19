import joi from "joi";
import { generalFields } from "../../middleware/validation.js";



export const createOrder = joi.object({
    products: joi.array().items(joi.object({
        productId: generalFields.id,
        quantity: joi.number().integer().positive().min(1).required()
    }).required()),

    couponName: joi.string(),
    note: joi.string(),
    address: joi.string().required(),
    phone: joi.array().items(
        joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)).required()
    ).min(1).required(),
    paymentType: joi.string().valid('card', 'cash')
}).required()


export const cancelOrder = joi.object({
    orderId: generalFields.id,
    reason: joi.string().min(2).required()
})

export const deliveredOrder = joi.object({
    orderId: generalFields.id,
})