import * as orderController from './controller/order.js'
import { auth } from '../../middleware/auth.js'
import { Router } from "express";
import { endpoint } from './order.endPoint.js';
import * as validators from './order.validation.js'
import { validation } from '../../middleware/validation.js'
import express from 'express'
const router = Router()




router.post('/',
    validation({ schema: validators.createOrder }),
    auth(endpoint.create),
    orderController.createOrder)

router.put('/:orderId',
    validation({ schema: validators.cancelOrder }),
    auth(endpoint.cancelOrder),
    orderController.cancelOrder)

router.patch('/:orderId',
    validation({ schema: validators.deliveredOrder }),
    auth(endpoint.deliveredOrder),
    orderController.deliveredOrder)


router.post('/webhook', express.raw({ type: 'application/json' }), orderController.webhook);

export default router