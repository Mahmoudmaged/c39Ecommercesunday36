import { auth } from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';
import { endPoint } from './cart.endPoint.js';
import * as cartController from './controller/cart.js'
import * as validators from './cart.validation.js'
import { Router } from "express";
const router = Router()




router.post("/",
    auth(endPoint.addToCart),
    validation({ schema: validators.addToCart }),
    cartController.addToCart)


router.patch("/",
    auth(endPoint.addToCart),
    cartController.clearCart)

router.patch("/delete",
    auth(endPoint.addToCart),
    cartController.deleteItemsFromCart)




export default router