import categoryModel from '../../../../DB/model/Category.model.js';
import subcategoryModel from '../../../../DB/model/Subcategory.model.js';

import cloudinary from '../../../utils/cloudinary.js'
import slugify from 'slugify'
import { asyncHandler } from '../../../utils/errorHandling.js';
import { nanoid } from 'nanoid';




export const subcategoryList = asyncHandler(async (req, res, next) => {
    const category = await subcategoryModel.find({ isDeleted: false }).populate([
        {
            path: 'categoryId'
        }
    ])
    return res.status(200).json({ message: "Done", category })
})

export const createSubcategory = asyncHandler(async (req, res, next) => {
    const { categoryId } = req.params;
    if (! await categoryModel.findById(categoryId)) {
        return next(new Error('In-valid Category Id', { cause: 400 }))
    }
    const customId = nanoid()
    const { name } = req.body;
    if (await subcategoryModel.findOne({ name: req.body.name.toLowerCase() })) {
        return next(new Error("Duplicated subcategory name", { cause: 409 }))
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category/${categoryId}/${customId}` })
    const subcategory = await subcategoryModel.create({
        name,
        slug: slugify(name, '-'),
        image: { secure_url, public_id },
        categoryId,
        createdBy: req.user._id,
        customId
    })
    if (!subcategory) {
        await cloudinary.uploader.destroy(public_id)
        return next(new Error('Fail to create this subcategory', { cause: 400 }))
    }
    return res.status(201).json({ message: "Done", subcategory })
})


export const updateSubcategory = asyncHandler(async (req, res, next) => {

    const { categoryId, subcategoryId } = req.params;
    const subcategory = await subcategoryModel.findOne({ _id: subcategoryId, categoryId })
    if (!subcategory) {
        return next(new Error("In-valid subcategory ID", { cause: 404 }))
    }

    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase()
        if (req.body.name == subcategory.name) {
            return next(new Error("Old subcategory name equal new subcategory name", { cause: 400 }))
        }
        if (await subcategoryModel.findOne({ name: req.body.name })) {
            return next(new Error(`Duplicated subcategory name `, { cause: 409 }))
        }
        subcategory.name = req.body.name;
        subcategory.slug = slugify(req.body.name, '-');
    }

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path,
            { folder: `${process.env.APP_NAME}/category/${categoryId}/${subcategory.customId}` })
        await cloudinary.uploader.destroy(subcategory.image.public_id)
        subcategory.image = { secure_url, public_id }
    }

    subcategory.updatedBy = req.user._id
    await subcategory.save()
    return res.status(200).json({ message: "Done", subcategory })
})