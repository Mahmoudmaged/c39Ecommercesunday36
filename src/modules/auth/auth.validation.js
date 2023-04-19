
import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'


export const signup = joi.object({
    userName: joi.string().min(2).max(25).required(),
    email: generalFields.email,
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref("password"))
}).required()



export const login = joi.object({
    email: generalFields.email,
    password: generalFields.password
}).required()


export const sendForgetEmail = joi.object({
    email: generalFields.email,
}).required()


export const forgetPassword = joi.object({
    email: generalFields.email,
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref("password")),
    code: joi.string().regex(/^[0-9]{4}$/).required()
}).required()



export const token = joi.object({
    token: joi.string().required()
}).required()