
import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const headers = generalFields.headers

export const createSubcategory = joi.object({
    categoryId: generalFields.id,
    name: joi.string().min(2).max(50).required(),
    file: generalFields.file.required()
}).required()


export const updateSubcategory = joi.object({
    categoryId: generalFields.id,
    subcategoryId: generalFields.id,
    name: joi.string().min(2).max(50),
    file: generalFields.file
}).required()