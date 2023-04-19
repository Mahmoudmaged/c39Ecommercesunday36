
import authRouter from './modules/auth/auth.router.js'
import branRouter from './modules/brand/brand.router.js'
import cartRouter from './modules/cart/cart.router.js'
import categoryRouter from './modules/category/category.router.js'
import couponRouter from './modules/coupon/coupon.router.js'
import orderRouter from './modules/order/order.router.js'
import productRouter from './modules/product/product.router.js'
import reviewsRouter from './modules/reviews/reviews.router.js'
import subcategoryRouter from './modules/subcategory/subcategory.router.js'
import userRouter from './modules/user/user.router.js'
import connectDB from '../DB/connection.js'
import { globalErrorHandling } from './utils/errorHandling.js'
import cors from 'cors'

const initApp = (app, express) => {

    app.use(cors()) //allow access from anywhere

    // var whitelist = ['http://127.0.0.1:5500', 'http://example2.com']
    // var corsOptions = {
    //     origin: function (origin, callback) {
    //         if (whitelist.indexOf(origin) !== -1) {
    //             callback(null, true)
    //         } else {
    //             callback(new Error('Not allowed by CORS'))
    //         }
    //     }
    // }
    // app.use(cors(corsOptions))

    // app.use(async (req, res, next) => {
    // console.log(req.header('origin'));
    //     let notMatched = false
    //     for (const origin of whitelist) {
    //         if (origin === req.header("origin")) {
    //             await res.header('Access-Control-Allow-Origin', origin);
    //             await res.header('Access-Control-Allow-Headers', '*')
    //             await res.header("Access-Control-Allow-Private-Network", 'true')
    //             await res.header('Access-Control-Allow-Methods', '*')
    //             console.log("Origin Work");
    //             notMatched = true
    //             return next();

    //         }
    //     }
    //     return res.status(403).json({ message: "Not allowed by CORS" })
    // });


    //convert Buffer Data
    
    app.use(express.json({}))
    //Setup API Routing 
    app.get('/', (req, res, next) => {
        res.send("Welcome to c39 E-commerce App")
    })
    app.use(`/auth`, authRouter)
    app.use(`/user`, userRouter)
    app.use(`/product`, productRouter)
    app.use(`/category`, categoryRouter)
    app.use(`/subCategory`, subcategoryRouter)
    app.use(`/reviews`, reviewsRouter)
    app.use(`/coupon`, couponRouter)
    app.use(`/cart`, cartRouter)
    app.use(`/order`, orderRouter)
    app.use(`/brand`, branRouter)

    app.all('*', (req, res, next) => {
        res.send("In-valid Routing Plz check url  or  method")
    })


    app.use(globalErrorHandling)
    connectDB()

}



export default initApp