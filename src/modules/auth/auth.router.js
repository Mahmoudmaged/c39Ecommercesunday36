import * as authController from './controller/registration.js'
import * as validators from './auth.validation.js'
import { validation } from '../../middleware/validation.js';
import { Router } from "express";
const router = Router()



router.post("/signup", validation({ schema: validators.signup }), authController.signup)
router.get("/confirmEmail/:token", validation({ schema: validators.token }), authController.confirmEmail)
router.get("/NewConfirmEmail/:token", validation({ schema: validators.token }), authController.generateRefreshEmailToken)

router.post("/login", validation({ schema: validators.login }), authController.login)


router.patch('/sendCode', validation({ schema: validators.sendForgetEmail }), authController.sendForgetCode)
router.put("/forgetPassword" , validation({ schema: validators.forgetPassword }), authController.forgetPassword)


export default router