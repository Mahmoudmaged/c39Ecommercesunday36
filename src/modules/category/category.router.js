import * as categoryController from './controller/category.js'
import * as validators from './category.validation.js'
import { validation } from '../../middleware/validation.js';
import { fileUpload, fileValidation } from '../../utils/multer.js'
import subcategoryRouter from '../subcategory/subcategory.router.js'
import { Router } from "express";
import { auth } from '../../middleware/auth.js';
import { endPoint } from './category.endPoint.js';
const router = Router({caseSensitive:true})


router.use("/:categoryId/subcategory", subcategoryRouter)


router.get('/', categoryController.categoryList)


router.post('/',
    validation({ schema: validators.headers, considerHeaders: true }),
    auth(endPoint.create),
    fileUpload(fileValidation.image).single('image'),
    validation({ schema: validators.createCategory }),
    categoryController.createCategory)


router.put('/:categoryId',
    auth(endPoint.update),
    fileUpload(fileValidation.image).single('image'),
    validation({ schema: validators.updateCategory }),
    categoryController.updateCategory)


export default router