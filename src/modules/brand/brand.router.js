import * as brandController from './controller/brand.js'
import * as validators from './brand.validation.js'
import { validation } from '../../middleware/validation.js';
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { auth } from '../../middleware/auth.js';
import { endPoint } from './brand.endPoint.js';
const router = Router()

router.get('/', brandController.brandList)


router.post('/',
    validation({ schema: validators.headers, considerHeaders: true }),
    auth(endPoint.create),
    fileUpload(fileValidation.image).single('image'),
    validation({ schema: validators.createBrand }),
    brandController.createBrand)


router.put('/:brandId',
    validation({ schema: validators.headers, considerHeaders: true }),
    auth(endPoint.update),
    fileUpload(fileValidation.image).single('image'),
    validation({ schema: validators.updateBrand }),
    brandController.updateBrand)


export default router