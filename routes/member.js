const express = require('express');
const router = express.Router();
const { isAuth } = require("../utils/auth");
const memberController = require('../controllers/memberController');
const handleErrorAsync = require('../utils/handleErrorAsync');

// 取得登入會員資料
router.get(
    "/memberOne",
    isAuth,
    handleErrorAsync(memberController.getMember)
    /* #swagger.tags = ['Member']
        #swagger.description = '取得登入會員資料'
     */
);

// 修改登入會員資料
router.patch(
    "/memberOne",
    isAuth,
    handleErrorAsync(memberController.updateMember)
    /* #swagger.tags = ['Member']
        #swagger.description = '修改登入會員資料，欄位只需填寫要修改的部分'
        #swagger.parameters['member'] = {
            in: 'body',
            schema: {
                nickname: {
                    type: 'string',
                    description: '暱稱'
                },
                interests: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    description: '興趣；目前僅可帶陣列中有包含的內容 ['工藝手作', '烹飪烘烤', '藝術人文', '生活品味'] '
                },
                name: {
                    type: 'string',
                    description: '姓名'
                },
                gender: {
                    type: 'string',
                    description: '性別；僅可帶入 male, female, other'
                },
                birthday: {
                    type: 'string',
                    description: '生日；請帶入DateTime格式，例如: 2024-01-01 或 2024-01-01T00:00:00.000Z'
                },
                phone: {
                    type: 'string',
                    description: '電話'
                }
            }
        }
    */
);

// 取得登入會員收藏
router.get(
    "/memberOne/collections",
    isAuth,
    handleErrorAsync(memberController.getMemberCollections)
    /* #swagger.tags = ['Member']
        #swagger.description = '取得登入會員收藏'
     */
);

// 新增登入會員收藏
router.post(
    "/memberOne/collections",
    isAuth,
    handleErrorAsync(memberController.newCollection)
    /* #swagger.tags = ['Member']
        #swagger.description = '新增收藏'
        #swagger.parameters['collection'] = {
            in: 'body',
            required: true,
            schema: {
                courseId: { 
                    type: 'string',
                    description: '課程 ID',
                    required: true
                }
            }
        }
    */
)

// 刪除登入會員收藏
router.delete(
    "/memberOne/collections/:collectionId",
    isAuth,
    handleErrorAsync(memberController.deleteCollection)
    /* #swagger.tags = ['Member']
        #swagger.description = '刪除收藏'
        #swagger.parameters['collectionId'] = {
            in: 'path',
            required: true,
            type: 'string'
        }
    */
)

// 取得登入會員訂單
router.get(
    "/memberOne/orders",
    isAuth,
    handleErrorAsync(memberController.getMemberOrders)
    /* #swagger.tags = ['Member']
        #swagger.description = '取得登入會員訂單'
     */
);

// 修改會員密碼
router.put(
    "/memberOne/password",
    isAuth,
    handleErrorAsync(memberController.updatePassword)
    /* #swagger.tags = ['Member']
        #swagger.description = '修改會員密碼'
        #swagger.parameters['password'] = {
            in: 'body',
            required: true,
            schema: {
                newPassword: {
                    type: 'string',
                    description: '新密碼; 密碼需包含英文及數字，且至少 8 碼',
                    required: true
                },
                confirmPassword: {
                    type: 'string',
                    description: '確認新密碼',
                    required: true
                }
            }
        }
    */
);

module.exports = router;