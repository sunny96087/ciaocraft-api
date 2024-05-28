const mongoose = require('mongoose');
const memberSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
        },
        account: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
        },
        name: {
            type: String,
        },
        nickname: {
            type: String,
        },
        phone: {
            type: String,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            default: 'other',
        },
        birthday: {
            type: Date,
        },
        photo: {
            type: String,
        },
        status: {
            type: Number,
            default: 1,     // 0: : 停權 1: 啟用
        },
        point: {
            type: Number,
            default: 0,
        },
        interests: {
            type: [String],
            validate: {
                validator: function (v) {
                    return v.every(interest => ['工藝手作', '烹飪烘烤', '藝術人文', '生活品味'].includes(interest));
                },
                message: props => `${props.value} 非有效 interests 值`
            }
        },
        collections: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        }],
        isAdmin: {
            type: Boolean,
            default: false,
        },
        loginAt: {
            type: Date,
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

// 等 courses model 完成後再加入
// memberSchema.virtual('courses', {
//     ref: 'Course',
//     localField: '_id',
//     foreignField: 'collections'
// })

const Member = mongoose.model('Member', memberSchema)
module.exports = Member;