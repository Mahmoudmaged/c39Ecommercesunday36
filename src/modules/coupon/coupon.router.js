import * as couponController from './controller/coupon.js'
import * as validators from './coupon.validation.js'
import { validation } from '../../middleware/validation.js';
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { auth, roles } from '../../middleware/auth.js';
import { endPoint } from './coupon.endPoint.js';
const router = Router()

router.get('/',
    auth(Object.values(roles)),
    couponController.couponList)


router.post('/',
    validation({ schema: validators.headers, considerHeaders: true }),
    auth(endPoint.create),
    fileUpload(fileValidation.image).single('image'),
    validation({ schema: validators.createCoupon }),
    couponController.createCoupon)


router.put('/:couponId',
    validation({ schema: validators.headers, considerHeaders: true }),
    auth(endPoint.update),
    fileUpload(fileValidation.image).single('image'),
    validation({ schema: validators.updateCoupon }),
    couponController.updateCoupon)


export default router