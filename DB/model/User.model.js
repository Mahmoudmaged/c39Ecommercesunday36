import { Schema, Types, model } from "mongoose";


const userSchema = new Schema({

    firstName: String,
    lastName: String,
    userName: {
        type: String,
        required: [true, 'userName is required'],
        min: [2, 'minimum length 2 char'],
        max: [20, 'max length 2 char'],
        trim: true
    },
    email: {
        type: String,
        unique: [true, 'email must be unique value'],
        required: [true, 'userName is required'],
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'password is required'],
    },
    phone: {
        type: String,
    },
    DOB: String,
    address: String,
    role: {
        type: String,
        default: 'User',
        enum: ['User', 'Admin']
    },
    status: {
        type: String,
        default: 'offline',
        enum: ['offline', 'online', 'blocked']

    },
    confirmEmail: {
        type: Boolean,
        default: false,
    },
    image: Object,
    forgetCode: {
        type: Number,
        default: null
    },
    changePasswordTime: Date,
    wishlist: [{ type: Types.ObjectId, ref: 'Product' }]

}, {
    timestamps: true
})


const userModel = model('User', userSchema)
export default userModel