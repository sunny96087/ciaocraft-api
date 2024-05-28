const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");
const feedbackController = require("../controllers/feedbackController");

// 新增回饋
router.post(
    "/",
    handleErrorAsync(feedbackController.newFeedback)
    /*  #swagger.tags = ['Feedback-front']
        #swagger.summary = '新增回饋'   
        #swagger.description = '新增回饋'
        #swagger.parameters['feedback'] = {
            in: 'body',
            required: true,
            schema:{
                contactPerson: { 
                    type: 'string',
                    description: '姓名',
                    required: true
                },
                phone: { 
                    type: 'string',
                    description: '電話',
                    required: true
                },
                email: { 
                    type: 'string',
                    description: '信箱',
                    required: true
                },
                feedback: { 
                    type: 'string',
                    description: '內容',
                    required: true
                }
            }
        }
        
    */
);

module.exports = router;