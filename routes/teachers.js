const express = require("express"); // 引入 Express 框架
const router = express.Router(); // 創建一個路由器實例
const handleErrorAsync = require("../utils/handleErrorAsync");

const teacherController = require("../controllers/teacherController");
const { isAuth } = require("../utils/vendorAuth");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const passport = require("passport");

// * 取得所有老師 (Back)
router.get(
  "/admin",
  isAuth,
  handleErrorAsync(teacherController.getAdminTeachers)
  /*
    #swagger.tags = ['Teachers-back']
    #swagger.description = '取得所有老師 (Back)'
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
  isAuth,
  handleErrorAsync(teacherController.getAdminTeacher)
  /*
    #swagger.tags = ['Teachers-back']
    #swagger.description = '取得單筆老師資料 (Back)'
    */
);

// * 新增老師 (Back)
router.post(
  "/",
  isAuth,
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
  isAuth,
  handleErrorAsync(teacherController.deactivateTeacher)
  /*
    #swagger.tags = ['Teachers-back']
    #swagger.description = '刪除老師 (偽刪除) (Back)'
    */
);

// * 編輯老師 (Back)
router.patch(
  "/:teacherId",
  isAuth,
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