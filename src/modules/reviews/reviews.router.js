import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { endPoint } from "./reviews.endPoint.js";
import * as reviewController from './controller/review.js'
const router = Router({ mergeParams: true })




router.post('/',
    auth(endPoint.create),
    reviewController.createReview
)




router.patch('/:reviewId',
    auth(endPoint.update),
    reviewController.updateReview
)





export default router