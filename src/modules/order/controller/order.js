import { asyncHandler } from "../../../utils/errorHandling.js";
import couponModel from '../../../../DB/model/Coupon.model.js'
import productModel from '../../../../DB/model/Product.model.js'
import orderModel from "../../../../DB/model/Order.model.js";
import cartModel from "../../../../DB/model/Cart.model.js";
import { createInvoice } from "../../../utils/pdf.js";
import { clearSelectedItems, emptyCart } from "../../cart/controller/cart.js";
import payment from "../../../utils/payment.js";
import Stripe from "stripe";

export const createOrder = asyncHandler(async (req, res, next) => {
    const { address, phone, couponName, note, paymentType } = req.body

    if (couponName) {
        const coupon = await couponModel.findOne({ name: couponName.toLowerCase(), usedBy: { $nin: req.user._id } })
        if (!coupon) {
            return next(new Error(`In-valid coupon`))
        }
        if (Date.now() > coupon?.expireDate?.getTime()) {
            return next(new Error(`expired coupon`, { cause: 400 }))
        }
        req.body.coupon = coupon
    }
    if (!req.body.products) {
        const cart = await cartModel.findOne({ createdBy: req.user._id })
        console.log(cart);
        if (!cart?.products?.length) {
            return next(new Error(`empty cart`, { cause: 400 }))
        }
        req.body.isCart = true;
        req.body.products = cart.products
    }

    const productIds = []
    const finalProductList = []
    let sumTotal = 0;
    for (let product of req.body.products) {

        const checkedProduct = await productModel.findOne({
            _id: product.productId,
            stock: { $gte: product.quantity },
            isDeleted: false
        })
        if (!checkedProduct) {
            return next(new Error(`In-valid product ${product.productId}`, { cause: 400 }))
        }
        if (req.body.isCart) {
            product = product.toObject()

        }
        productIds.push(product.productId)
        product.name = checkedProduct.name;
        product.unitPrice = checkedProduct.finalPrice;
        product.finalPrice = product.quantity * checkedProduct.finalPrice
        finalProductList.push(product)
        sumTotal += product.finalPrice
    }

    const order = await orderModel.create({
        userId: req.user._id,
        address,
        phone,
        note,
        products: finalProductList,
        subTotal: sumTotal,
        finalPrice: req.body.coupon ? (sumTotal - (sumTotal * (req.body.coupon?.amount / 100))).toFixed(2) : sumTotal,
        couponId: req.body.coupon?._id,
        paymentType,
        status: paymentType ? 'waitForPayment' : 'placed',
    })
    if (!order) {
        return next(new Error("Fail to place your order", { cause: 400 }))
    }
    //  decrease product stock 
    for (const product of req.body.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: - parseInt(product.quantity) } })
    }
    //push user id in coupon if exist
    if (couponName) {
        await couponModel.updateOne({ _id: req.body.coupon._id }, { $addToSet: { usedBy: req.user._id } })
    }

    if (req.body.isCart) {
        //if cart rest cart
        await emptyCart(req.body._id)
    } else {
        await clearSelectedItems(productIds, req.user._id)
    }

    //    [ {
    //         price_data = {
    //             currency= 'usd',
    //             product_data= {
    //                 name
    //             }
    //         },
    //             quantity
    //     }]
    // Handel invoice
    const invoice = {
        shipping: {
            name: req.user.userName,
            address: order.address,
            city: "Cairo",
            state: "Cairo",
            country: "Egypt",
            postal_code: 94111
        },
        items: order.products,
        subtotal: sumTotal,
        Date: order.createdAt,
        total: order.finalPrice,
        invoice_nr: order._id
    };
    await createInvoice(invoice, "invoice.pdf");
    //handel Payment

    if (order.paymentType == 'card') {
        const stripe = new Stripe(process.env.STRIPE_SECRET);
        if (req.body.coupon) {
            const coupon = await stripe.coupons.create({ percent_off: req.body.coupon.amount, duration: 'once' })
            console.log(coupon);
            req.body.couponId = coupon.id
        }
        const session = await payment({
            stripe,
            customer_email: req.user.email,
            metadata: {
                orderId: order._id.toString()
            },
            cancel_url: `${process.env.cancel_url}?orderId=${order._id.toString()}`,
            line_items: order.products.map(product => {
                return {
                    price_data: {
                        currency: 'egp',
                        product_data: {
                            name: product.name
                        },
                        unit_amount: product.unitPrice * 100
                    },
                    quantity: product.quantity
                }
            }),
            discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : []
        })

        return res.status(201).json({ message: "Done", order, url: session.url })
    }
    return res.status(201).json({ message: "Done", order })
})


export const cancelOrder = asyncHandler(async (req, res, next) => {

    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await orderModel.findOne({ _id: orderId, userId: req.user._id })
    if (!order) {
        return next(new Error("In-valid orderId ", { cause: 400 }))
    }

    if ((order.status != 'placed' && order.paymentType == 'cash') || (order.status != 'waitForPayment' && order.paymentType == 'card')) {
        return next(new Error(`Cannot cancel your order after it been changed to ${order.status}`, { cause: 400 }))
    }

    await orderModel.updateOne({ _id: orderId, userId: req.user._id }, { status: 'canceled', reason, updatedBy: req.user._id })

    for (const product of order.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: parseInt(product.quantity) } })
    }

    return res.status(200).json({ message: "Done" })

})

export const deliveredOrder = asyncHandler(async (req, res, next) => {

    const { orderId } = req.params;
    const order = await orderModel.findOne({ _id: orderId })
    if (!order) {
        return next(new Error("In-valid orderId ", { cause: 400 }))
    }
    if (['delivered', 'rejected', 'canceled'].includes(order.status)) {
        return next(new Error(`Can not delivered this order since it been updated to   ${order.status}`, { cause: 400 }))
    }

    await orderModel.updateOne({ _id: orderId }, { status: "delivered", updatedBy: req.user._id })

    return res.status(200).json({ message: "Done" })

})


export const webhook = asyncHandler(async (req, res, next) => {

    const stripe = new Stripe(process.env.STRIPE_SECRET);
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_SECRET_ENDPOINT);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    if (event.type != checkout.session.completed) {
        return res.state(400).json({ message: "Payment Faild", event: event.type })
    }
    console.log(event);
    // Return a 200 res to acknowledge receipt of the event
    res.status(200).json({message:"Done" , event});
})
