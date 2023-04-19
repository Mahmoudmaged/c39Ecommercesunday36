import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { endPoint } from "./product.endPoint.js";
import { fileUpload, fileValidation } from '../../utils/multer.js'
import * as  productController from './controller/product.js'
import * as validators from './product.validation.js'
import { validation } from '../../middleware/validation.js'
import reviewRouter from '../reviews/reviews.router.js'
const router = Router()


router.use("/:productId/review", reviewRouter)


router.get("/", productController.productList)
router.post("/",
    auth(endPoint.create),
    fileUpload(fileValidation.image).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
    ]),
    validation({ schema: validators.createProduct }),
    productController.createProduct
)

router.put("/:productId",
    auth(endPoint.update),
    fileUpload(fileValidation.image).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
    ]),
    validation({ schema: validators.updateProduct }),
    productController.updateProduct
)



router.patch("/:productId/wishlist/",
    auth(endPoint.wishlist),
    validation({schema:validators.wishlist}),
    productController.addToWishlist)

router.patch("/:productId/wishlist/remove",
    auth(endPoint.wishlist),
    validation({schema:validators.wishlist}),
    productController.removeFromWishlist)

export default router