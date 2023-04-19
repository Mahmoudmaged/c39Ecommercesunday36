import cartModel from "../../../../DB/model/Cart.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";


export const addToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity } = req.body
    // Check product 
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new Error("In-valid product Id", { cause: 404 }))
    }

    if (quantity > product.stock || product.isDeleted == true) {
        await productModel.updateOne({ _id: productId }, {
            $addToSet: { wishUsers: req.user._id }
        })
        return next(new Error("Sorry can not add this  item  as it is out of stock or freezed", { cause: 400 }))
    }

    console.log(req.user._id);
    const cart = await cartModel.findOne({ createdBy: req.user._id })

    if (!cart) {
        console.log("FF");
        //generate cart for firstTime
        const newCart = await cartModel.create({
            createdBy: req.user._id,
            products: [{ productId, quantity }]
        })
        return res.status(201).json({ message: "Done", cart: newCart })
    }
    // push new product to his cart
    let matchProduct = false
    for (let i = 0; i < cart.products.length; i++) {
        if (cart.products[i].productId.toString() == productId) {
            cart.products[i].quantity = quantity;
            matchProduct = true
            console.log("pp");

            break;
        }
    }
    if (!matchProduct) {
        cart.products.push({ productId, quantity })
    }
    await cart.save()
    return res.status(200).json({ message: "Done", cart })

})

export async function emptyCart(createdBy) {
    const cart = await cartModel.updateOne({ createdBy }, { products: [] })
    return cart
}
export const clearCart = asyncHandler(async (req, res, next) => {
    const cart = await emptyCart(req.user._id)
    return res.status(200).json({ message: "Done", cart })
})

export async function clearSelectedItems(productIds, createdBy) {
    const cart = await cartModel.updateOne({ createdBy }, {
        $pull: {
            products: {
                productId: { $in: productIds }
            }
        }
    })
    return cart
}

export const deleteItemsFromCart = asyncHandler(async (req, res, next) => {
    const cart = await clearSelectedItems(req.body.productIds, req.user._id)
    return res.status(200).json({ message: "Done", cart })
})
