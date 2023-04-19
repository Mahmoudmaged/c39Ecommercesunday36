import * as subcategoryController from './controller/subcategory.js'
import * as validators from './subcategory.validation.js'
import { validation } from '../../middleware/validation.js';
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { auth } from '../../middleware/auth.js';
import { endPoint } from './subcategory.endPoint.js';
const router = Router({ mergeParams: true })


router.get('/', subcategoryController.subcategoryList)


router.post('/',
    validation({ schema: validators.headers, considerHeaders: true }),
    auth(endPoint.create),
    fileUpload(fileValidation.image).single('image'),
    validation({ schema: validators.createSubcategory }),
    subcategoryController.createSubcategory)


router.put('/:subcategoryId',
    validation({ schema: validators.headers, considerHeaders: true }),
    auth(endPoint.update),
    fileUpload(fileValidation.image).single('image'),
    validation({ schema: validators.updateSubcategory }),
    subcategoryController.updateSubcategory)


export default router