const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
            required: [true, 'memberId 為必填']
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'courseId 為必填']
        },
        content: {
            type: String,
            required: [true, 'content 為必填']
        },
        images: {
            type: [String],
            validate:{
                validator: function(v) {
                    return v.length <= 5;
                },
                message: props => `最多只可存 5 張圖片，現有 ${props.value.length} 張`
            } 
        },
        tags: {
            type: [{
                type: String,
                enum: ['師生互動', '教學環境', '專業度', '其他'],
            }],
            validate: {
                validator: function(v) {
                    return v.every(tag => ['師生互動', '教學環境', '專業度', '其他'].includes(tag));
                },
                message: props => `${props.value} 非有效 tags 值`
            }
        },
        rating: {
            type: Number,
            default: 1,
        },
        likes: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;