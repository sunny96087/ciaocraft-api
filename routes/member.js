const express = require('express');
const router = express.Router();
const { isAuth } = require("../utils/auth");
const memberController = require('../controllers/memberController');
const handleErrorAsync = require('../utils/handleErrorAsync');

// 取得所有會員資料 (開發方便查詢用)
router.get(
    "/",
    handleErrorAsync(memberController.getAllMembers)
    /*  #swagger.tags = ['Members-front']
        #swagger.summary = '取得所有會員 (開發查詢用)'
        #swagger.description = '取得所有會員 (方便開發查詢用)'
        #swagger.parameters['adminPasswird'] = {
            in: 'body',
            description: '管理者密碼',
            required: true,
            schema: {
                adminPassword: {
                    type: 'string',
                    description: '管理者密碼',
                    required: true
                }
            }
        }
     */
)

// 取得登入會員資料
router.get(
    "/memberOne",
    isAuth,
    handleErrorAsync(memberController.getMember)
    /*  #swagger.tags = ['Members-front']
        #swagger.summary = '取得登入會員資料'
        #swagger.description = '取得登入會員資料'
     */
);

// 修改登入會員資料
router.patch(
    "/memberOne",
    isAuth,
    handleErrorAsync(memberController.updateMember)
    /*  #swagger.tags = ['Members-front']
        #swagger.summary = '修改會員資料'
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
                    description: '興趣；目前僅可帶入: 工藝手作,烹飪烘烤,藝術人文, 生活品味'
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
    /*  #swagger.tags = ['Members-front']
        #swagger.summary = '取得登入會員收藏'
        #swagger.description = '取得登入會員收藏'
        #swagger.parameters['courseTerm'] = {
            in: 'query',
            description: '課程期別',
            type: 'string'
        }
     */
);

// 新增登入會員收藏
router.post(
    "/memberOne/collections",
    isAuth,
    handleErrorAsync(memberController.newMemberCollections)
    /*  #swagger.tags = ['Members-front']
        #swagger.summary = '會員新增收藏'
        #swagger.description = '會員新增收藏'
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
    handleErrorAsync(memberController.deleteMemberCollection)
    /*  #swagger.tags = ['Members-front']
        #swagger.summary = '會員刪除收藏'
        #swagger.description = '會員刪除收藏'
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
    /*  #swagger.tags = ['Members-front']
        #swagger.summary = '取得登入會員全部訂單'
        #swagger.description = '取得登入會員全部訂單'
        #swagger.parameters['status'] = {
            in: 'query',
            description: '訂單狀態；0:未付款, 1:已付款, 2:已確認收款, 3:已完成, 4:已取消, 5:訂單取消(不需退款), 6:訂單取消(待退款), 7:訂單取消(已退款)',
            type: 'string'
        }
     */
);

// 修改會員密碼
router.put(
    "/memberOne/password",
    isAuth,
    handleErrorAsync(memberController.updatePassword)
    /*  #swagger.tags = ['Members-front']
        #swagger.summary = '修改會員密碼'
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