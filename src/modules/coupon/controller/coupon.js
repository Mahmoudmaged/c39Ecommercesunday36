import couponModel from '../../../../DB/model/Coupon.model.js';
import cloudinary from '../../../utils/cloudinary.js'
import slugify from 'slugify'
import { asyncHandler } from '../../../utils/errorHandling.js';



export const couponList = asyncHandler(async (req, res, next) => {
    const coupon = await couponModel.find({ isDeleted: false })
    return res.status(200).json({ message: "Done", coupon })
})

export const createCoupon = asyncHandler(async (req, res, next) => {

    if (await couponModel.findOne({ name: req.body.name.toLowerCase() })) {
        return next(new Error("Duplicated coupon name", { cause: 409 }))
    }
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/coupon/` })
        req.body.image = { secure_url, public_id }
    }
    req.body.createdBy = req.user._id
    req.body.expireDate = new Date(req.body.expireDate)
    const coupon = await couponModel.create(req.body)
    return res.status(201).json({ message: "Done", coupon })
})


export const updateCoupon = async (req, res, next) => {
    const coupon = await couponModel.findById(req.params.couponId)
    if (!coupon) {
        return next(new Error("In-valid coupon ID", { cause: 404 }))
    }

    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase()
        if (req.body.name == coupon.name) {
            return next(new Error("Old coupon name equal new coupon name", { cause: 400 }))
        }
        if (await couponModel.findOne({ name: req.body.name })) {
            return next(new Error("Duplicated coupon name", { cause: 409 }))
        }
        coupon.name = req.body.name
    }

    if (req.body.amount) {
        coupon.amount = req.body.amount
    }

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path,
            { folder: `${process.env.APP_NAME}/coupon` })
        if (coupon.image?.public_id) {
            await cloudinary.uploader.destroy(coupon.image?.public_id)
        }
        coupon.image = { secure_url, public_id }
    }
    if (req.body.expireDate) {
        coupon.expireDate = new Date(req.body.expireDate)
    }
    coupon.updatedBy = req.user._id
    await coupon.save()
    return res.status(200).json({ message: "Done", coupon })
}