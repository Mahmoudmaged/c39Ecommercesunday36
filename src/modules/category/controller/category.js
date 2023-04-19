import categoryModel from '../../../../DB/model/Category.model.js';
import cloudinary from '../../../utils/cloudinary.js'
import slugify from 'slugify'
import { asyncHandler } from '../../../utils/errorHandling.js';



export const categoryList = asyncHandler(async (req, res, next) => {
    const category = await categoryModel.find({ isDeleted: false }).populate([
        {
            path: 'subcategory'
        }
    ])
    console.log(category);
    return res.status(200).json({ message: "Done", category })
})

export const createCategory = asyncHandler(async (req, res, next) => {
    const { name } = req.body;
    if (await categoryModel.findOne({ name: name.toLowerCase() })) {
        return next(new Error(`Duplicated category name `, { cause: 409 }))
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category` })
    const category = await categoryModel.create({
        name,
        slug: slugify(name, { replacement: '-', lower: true }),
        image: { secure_url, public_id },
        createdBy: req.user._id
    })
    if (!category) {
        await cloudinary.uploader.destroy(public_id)
        return next(new Error('Fail to create this category', { cause: 400 }))
    }
    return res.status(201).json({ message: "Done", category })
})


export const updateCategory = asyncHandler(async (req, res, next) => {
    const category = await categoryModel.findById(req.params.categoryId)
    if (!category) {
        return next(new Error("In-valid Category ID", { cause: 404 }))
    }

    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase()
        if (req.body.name == category.name) {
            return next(new Error("Old category name equal new category name", { cause: 400 }))
        }
        if (await categoryModel.findOne({ name: req.body.name })) {
            return next(new Error(`Duplicated category name `, { cause: 409 }))
        }
        category.name = req.body.name;
        category.slug = slugify(req.body.name, { replacement: '-', lower: true });
    }

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path,
            { folder: `${process.env.APP_NAME}/category` })
        await cloudinary.uploader.destroy(category.image.public_id)
        category.image = { secure_url, public_id }
    }
    category.updatedBy = req.user._id
    await category.save()
    return res.status(200).json({ message: "Done", category })
})