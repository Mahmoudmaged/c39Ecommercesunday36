import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'


export const createProduct = joi.object({
    file: joi.object({
        mainImage: joi.array().items(generalFields.file).length(1).required(),
        subImages: joi.array().items(generalFields.file).max(5),
    }).required(),

    name: joi.string().min(2).max(100).required(),

    colors: joi.array(),
    size: joi.array(),
    description: joi.string().min(2).max(50000),
    stock: joi.number().integer().positive().min(1).required(),
    price: joi.number().positive().min(1).required(),
    discount: joi.number().positive().min(1).max(100),

    brandId: generalFields.id,
    subcategoryId: generalFields.id,
    categoryId: generalFields.id,


}).required()


export const updateProduct = joi.object({

    productId: generalFields.id,
    brandId: generalFields.opId,
    subcategoryId: generalFields.opId,
    categoryId: generalFields.opId,

    file: joi.object({
        mainImage: joi.array().items(generalFields.file).max(1),
        subImages: joi.array().items(generalFields.file).max(5),
    }).required(),

    name: joi.string().min(2).max(100),

    colors: joi.array(),
    size: joi.array(),
    description: joi.string().min(2).max(50000),
    stock: joi.number().integer().positive().min(1),
    price: joi.number().positive().min(1),
    discount: joi.number().positive().min(1).max(100),




}).required()

export const wishlist = joi.object({
    productId: generalFields.id
}).required()