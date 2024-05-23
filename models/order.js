const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
            required: [true, "memberId 為必填"]
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: [true, "vendorId 為必填"]
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, "courseId 為必填"]
        },
        courseItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseItem',
            required: [true, "courseItemId 為必填"]
        },
        itemName: {
            type: String,
            required: [true, "itemName 為必填"]
        },
        count: {
            type: Number,
            required: [true, "count 為必填"]
        },
        price: {
            type: Number,
            required: [true, "price 為必填"]
        },
        totalPrice: {
            type: Number,
            required: [true, "totalPrice 為必填"]
        },
        paymentType: {
            type: Number,
            enum: [1, 2], // 1: atm, 2: 金流
            default: 1,
        },
        paidStatus: {
            type: Number,
            enum: [0, 1, 2], // 0:待付款, 1: 已付款, 2: 已取消
            default: 0,
        },
        location: {
            type: String,
        },
        lastFiveDigits: {
            type: String,
        },
    },
    {
        timestamps: true,
        virtuals: true
    }
)

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;  