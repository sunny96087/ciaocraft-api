const mongoose = require('mongoose');
const { validate } = require('./user');
const { login } = require('../controllers/authController');

const vendorSchema = new mongoose.Schema(
    {
        account: {
            // account 也是申請賣家時的電子信箱
            type: String,
            validate: {
                validator: function (v) {
                    return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v)
                },
                message: props => `${props.value} 不是有效 email`
            },
            unique: true,
            required: [true, 'account 為必填']
        },
        password: {
            type: String,
            required: [true, 'password 為必填']
        },
        representative: {
            type: String,
            required: [true, 'representative 為必填']
        },
        mobile: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^[0-9]+$/.test(v)
                },
                message: props => `${props.value} 只能是數字字元`
            },
            required: [true, 'phone 為必填'],
        },
        brandName: {
            type: String,
            required: [true, 'brandName 為必填']
        },
        reviewLinks: {
            type: [String],
            required: [true, 'reviewLinks 為必填']
        },
        reviewBrief: {
            type: String,
            required: [true, 'reviewBrief 為必填']
        },
        reviewImages: {
            trype: [String],
            validate: {
                validator: function (v) {
                    return v.length <= 5
                },
                message: props => `最多只可存 5 張圖片，現有 ${props.value.length} 張`
            },
            required: [true, 'reviewImages 為必填'],
        },
        avatar: {
            type: String,
            required: [true, 'avatar 為必填']
        },
        bannerImage: {
            // 形象圖片
            type: String
        },
        intro: {
            type: String,
        },
        socialMedias: {
            type: [
                {
                    platform: {
                        type: String,
                        enum: ['facebook', 'instagram', 'website'],
                    },
                    url: {
                        type: String,
                    }
                }
            ]
        },
        bankName: {
            type: String,
            required: [true, 'bankName 為必填']
        },
        bankCode: {
            type: String,
            required: [true, 'bankCode 為必填']
        },
        bankBranch: {
            type: String,
            required: [true, 'bankBranchCode 為必填']
        },
        bankAccountName: {
            type: String,
            required: [true, 'bankAccountName 為必填']
        },
        bankAccount: {
            type: String,
            required: [true, 'bankAccount 為必填']
        },
        status: {
            type: Number,
            enum: [0, 1, 2],  // 0: 審核中 1: 啟用 2: 停權
        },
        address: {
            type: String
        },
        notice: {
            type: String
        },
        loginAt: {
            type: Date,
        }
    },
    {
        timestamps: true,
        virtuals: true
    }
)

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;