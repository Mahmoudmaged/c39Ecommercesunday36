import { generalFields } from "../../middleware/validation.js";
import joi from 'joi'


export const addToCart = joi.object({
    productId: generalFields.id,
    quantity: joi.number().integer().positive().min(1).required()
}).required()