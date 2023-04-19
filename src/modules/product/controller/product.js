import subcategoryModel from '../../../../DB/model/Subcategory.model.js'
import brandModel from '../../../../DB/model/Brand.model.js'
import slugify from "slugify";
import cloudinary from '../../../utils/cloudinary.js'
import { nanoid } from 'nanoid';
import productModel from '../../../../DB/model/Product.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';
import { paginate } from '../../../utils/paginate.js';
import ApiFeatures from '../../../utils/apiFeatures.js';
import userModel from '../../../../DB/model/User.model.js';

//OOP  
//search
//filter
//paginate 
//sort
//select fields 

export const productList = asyncHandler(async (req, res, next) => {


    const apiFeature = new ApiFeatures(productModel.find().populate([
        {
            path: 'review',
            match: { isDeleted: false }
        }
    ]), req.query).paginate().search().select().filter()
    const products = await apiFeature.mongooseQuey

    for (let i = 0; i < products.length; i++) {
        let totalRating = 0;
        for (let j = 0; j < products[i].review.length; j++) {
            totalRating += products[i].review[j].rating
        }

        let avgRating = totalRating / products[i].review.length
        const product = products[i].toObject()
        product.avgRating = avgRating;
        products[i] = product
    }
    return res.status(200).json({ message: "Done", products })
});


export const createProduct = asyncHandler(async (req, res, next) => {
    const {
        name, price, discount,
        categoryId, subcategoryId, brandId
    } = req.body;
    console.log(req.body);
    if (!await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
        return next(new Error("In-valid category or subcategoryId", { cause: 400 }))
    }

    if (!await brandModel.findOne({ _id: brandId })) {
        return next(new Error("In-valid brandId ", { cause: 400 }))
    }

    req.body.slug = slugify(name);
    req.body.finalPrice = Number.parseFloat(price - (price * ((discount || 0) / 100))).toFixed(2)

    req.body.customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}` })
    req.body.mainImage = { secure_url, public_id }

    if (req.files?.subImages?.length) {
        req.body.subImages = []
        for (const image of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages` })
            req.body.subImages.push({ secure_url, public_id })
        }
    }

    req.body.createdBy = req.user._id
    const product = await productModel.create(req.body)
    return res.status(201).json({ message: 'Done', product })


})


export const updateProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new Error("In-valid ProductId ", { cause: 400 }))
    }

    const {
        name, price, discount,
        categoryId, subcategoryId, brandId
    } = req.body;

    //   IDS
    if (categoryId && subcategoryId) {
        if (!await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
            return next(new Error("In-valid category or subcategoryId", { cause: 400 }))
        }
    }
    if (brandId) {
        if (!await brandModel.findOne({ _id: brandId })) {
            return next(new Error("In-valid brandId ", { cause: 400 }))
        }
    }

    // Name
    if (name) {
        req.body.slug = slugify(name)
    }

    // price
    req.body.finalPrice = (price || discount) ? Number.parseFloat((price || product.price) - ((price || product.price) * ((discount || product.discount) / 100))).toFixed(2) : product.finalPrice;

    // Images

    if (req.files?.mainImage?.length) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${product.customId}` })
        await cloudinary.uploader.destroy(product.mainImage.public_id)
        req.body.mainImage = { secure_url, public_id }
    }

    if (req.files?.subImages?.length) {
        req.body.subImages = []
        for (const image of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(image.path, { folder: `${process.env.APP_NAME}/product/${product.customId}/subImages` })
            req.body.subImages.push({ secure_url, public_id })
        }
    }

    req.body.updatedBy = req.user._id;
    await productModel.updateOne({ _id: productId }, req.body)
    return res.status(200).json({ message: "Done" })

})

export const addToWishlist = asyncHandler(async (req, res, next) => {

    const product = await productModel.findOne({ _id: req.params.productId, isDeleted: false })
    if (!product) {
        return next(new Error('In-valid product', { cause: 400 }))
    }
    await userModel.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: req.params.productId } })
    return res.status(200).json({ message: "Done" })
})

export const removeFromWishlist = asyncHandler(async (req, res, next) => {

    await userModel.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } })
    return res.status(200).json({ message: "Done" })
})