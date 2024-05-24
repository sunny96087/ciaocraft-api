const express = require("express"); // 引入 Express 框架
const router = express.Router(); // 創建一個路由器實例
const handleErrorAsync = require("../utils/handleErrorAsync");

const teacherController = require("../controllers/teacherController");
const { isVendorAuth } = require("../utils/vendorAuth");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const passport = require("passport");

// * 取得所有老師 (Manage)
router.get(
  "/manage",
  handleErrorAsync(teacherController.getAdminTeachers)
  /*
    #swagger.tags = ['Teachers-manage']
    #swagger.description = '取得所有老師 (Manage)'

    #swagger.parameters['getManageTeachers'] = {
        in: 'body',
        description: '使用管理員密碼取得所有老師',
        required: true,
        schema: {
            adminPassword: {
                type: 'string',
                description: '管理員密碼',
                required: true
            },
        }
    }
    */
);

// * 取得所有老師 (query: sort, createdAt, 課程類型, keyword) (Back)
router.get(
  "/admin",
  isVendorAuth,
  handleErrorAsync(teacherController.getAdminTeachers)
  /*
    #swagger.tags = ['Teachers-back']
    #swagger.description = '取得所有老師 (Back)'

    #swagger.parameters['sort'] = {
        in: 'query',
        description: '排序方式，數字小到大(預設)、大到小: ORDER_DESC',
        required: false,
        type: 'string'
    }
    #swagger.parameters['createdAt'] = {
        in: 'query',
        description: '創建日期的排序方式，日期新到舊(預設)、舊到新: CREATED_AT_ASC',
        required: false,
        type: 'string'
    }
    #swagger.parameters['keyword'] = {
        in: 'query',
        description: '搜尋關鍵字, 查詢姓名欄位',
        required: false,
        type: 'string'
    }
    #swagger.parameters['courseTerm'] = {
        in: 'query',
        description: '課程時長類型, 0: 單堂體驗 1:培訓課程',
        required: false,
        type: 'string'
    }
  */
);

// * 取得單筆老師資料 (Front)
router.get(
  "/:teacherId",
  handleErrorAsync(teacherController.getTeacher)
  /*
      #swagger.tags = ['Teachers-front']
      #swagger.description = '取得單筆老師資料 (Front)'
      */
);

// * 取得單筆老師資料 (Back)
router.get(
  "/admin/:teacherId",
  isVendorAuth,
  handleErrorAsync(teacherController.getAdminTeacher)
  /*
    #swagger.tags = ['Teachers-back']
    #swagger.description = '取得單筆老師資料 (Back)'
    */
);

// * 新增老師 (Back)
router.post(
  "/",
  isVendorAuth,
  handleErrorAsync(teacherController.newTeacher)
  /*
    #swagger.tags = ['Teachers-back']
    #swagger.description = '新增老師 (Back)'

    #swagger.parameters['newTeacher'] = {
        in: 'body',
        description: '老師資訊',
        required: true,
        schema: {
            type: 'object',
            properties: {
                vendorId: {
                    type: 'string',
                    description: '供應商 ID',
                    required: true
                },
                name: {
                    type: 'string',
                    description: '老師名稱',
                    required: true
                },
                description: {
                    type: 'string',
                    description: '老師描述'
                },
                photo: {
                    type: 'string',
                    description: '老師頭像'
                },
                intro: {
                    type: 'string',
                    description: '老師簡述 (編輯器)'
                },
                socialMediaInfo: {
                    type: 'object',
                    description: '老師社群連結'
                },
                order: {
                    type: 'number',
                    description: '老師排序 (數字越小越前面)',
                    required: true
                }
            }
        }
    }
    */
);

// * 刪除老師 (偽刪除) (Back)
router.patch(
  "/admin/deactivate/:teacherId",
  isVendorAuth,
  handleErrorAsync(teacherController.deactivateTeacher)
  /*
    #swagger.tags = ['Teachers-back']
    #swagger.description = '刪除老師 (偽刪除) (Back)'
    */
);

// * 編輯老師 (Back)
router.patch(
  "/:teacherId",
  isVendorAuth,
  handleErrorAsync(teacherController.updateTeacher)
  /*
    #swagger.tags = ['Teachers-back']
    #swagger.description = '編輯老師 (Back)'
    
    #swagger.parameters['updateTeacher'] = {
        in: 'body',
        description: '老師資訊',
        required: true,
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: '老師名稱',
                    required: true
                },
                description: {
                    type: 'string',
                    description: '老師描述'
                },
                photo: {
                    type: 'string',
                    description: '老師頭像'
                },
                intro: {
                    type: 'string',
                    description: '老師簡述 (編輯器)'
                },
                socialMediaInfo: {
                    type: 'object',
                    description: '老師社群連結'
                },
                order: {
                    type: 'number',
                    description: '老師排序 (數字越小越前面)',
                    required: true
                }
            }
        }
    }
    */
);

// * 刪除老師 (Manage)
router.delete(
  "/:teacherId",
  handleErrorAsync(teacherController.deleteTeacherManage)
  /*
    #swagger.tags = ['Teachers-manage']
    #swagger.description = '刪除老師 (Manage)'
        
    #swagger.parameters['deleteTeacherManage'] = {
        in: 'body',
        description: '使用管理員密碼刪除老師',
        required: true,
        schema: {
            adminPassword: {
                type: 'string',
                description: '管理員密碼',
                required: true
            },
        }
    }
    */
);

module.exports = router;
