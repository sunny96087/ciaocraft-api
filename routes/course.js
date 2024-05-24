const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");
const { isVendorAuth } = require("../utils/vendorAuth");
const courseController = require("../controllers/courseController");

// ? 取得全部課程 (query: createdAt, courseTerm, courseStatus, keyword(teacherId > name || courseName)) (Back)
router.get(
  "/admin",
  isVendorAuth,
  handleErrorAsync(courseController.getAdminCourses)
  /*
    #swagger.tags = ['Courses-back']
    #swagger.description = '取得全部課程 (Back)'
    #swagger.parameters['courseTerm'] = {
        in: 'query',
        description: '課程時長類型, 0: 單堂體驗 1:培訓課程',
        required: false,
        type: 'string'
    }
    #swagger.parameters['courseStatus'] = {
        in: 'query',
        description: '課程狀態, 0: 下架, 1: 上架, 2: 刪除',
        required: false,
        type: 'string'
    }
    #swagger.parameters['keyword'] = {
        in: 'query',
        description: '搜尋關鍵字, 查詢老師姓名或課程名稱',
        required: false,
        type: 'string'
    }
    #swagger.parameters['createdAt'] = {
        in: 'query',
        description: '創建日期的排序方式，日期新到舊(預設)、舊到新: CREATED_AT_ASC',
        required: false,
        type: 'string'
    }
*/
);

// ? 取得單筆課程資料 + 項目資料 (Back)
router.get(
  "/admin/:courseId",
  isVendorAuth,
  handleErrorAsync(courseController.getAdminCourse)
  /*
  #swagger.tags = ['Courses-back']
  #swagger.description = '取得單筆課程資料 + 項目資料 (Back)'
  #swagger.parameters['courseId'] = {
      in: 'path',
      description: '要取得的課程 ID',
      required: true,
      type: 'string'
  }
  */
);

// * 取得課程列表 (Front)
router.get("/", handleErrorAsync(courseController.getCourses));

// ? 新增課程 + 項目資料 (Back)
router.post(
  "/",
  isVendorAuth,
  handleErrorAsync(courseController.newCourse)
  /*
    #swagger.tags = ['Courses-back']
    #swagger.description = '新增課程 + 項目資料 (Back)'

    #swagger.parameters['newCourse'] = {
        in: 'body',
        description: '新增課程 + 項目資料 (Back)',
        required: true,
        schema: {
            teacherId: {
                type: 'string',
                description: '老師 ID',
                required: true
            },
            courseType: {
                type: 'array',
                description: '課程類型',
                required: true,
                items: {
                    type: 'string',
                    enum: ["工藝手作", "烹飪烘焙", "藝術人文", "生活品味"]
                }
            },
            courseTerm: {
                type: 'string',
                description: '課程時長類型, 0: 單堂體驗 1:培訓課程',
                required: true,
                enum: [0, 1]
            },
            courseName: {
                type: 'string',
                description: '課程名稱',
                required: true
            },
            coursePrice: {
                type: 'number',
                description: '課程價格',
                required: true
            },
            courseStatus: {
                type: 'number',
                description: '課程狀態, 0: 下架, 1: 上架, 2: 刪除',
                required: true,
                enum: [0, 1, 2],
                default: 1
            },
            courseCapacity: {
                type: 'number',
                description: '課程名額',
                required: true
            },
            courseSummary: {
                type: 'string',
                description: '課程摘要',
                required: true
            },
            courseAddress: {
                type: 'string',
                description: '課程地址 (詳細活動地址)',
                required: true
            },
            courseRemark: {
                type: 'string',
                description: '備註 (報名的注意事項)',
            },
            courseImage: {
                type: 'array',
                description: '課程圖片 (最多 5 張)',
                required: true
            },
            courseContent: {
                type: 'string',
                description: '課程內容 (編輯器)',
                required: true
            },
            courseItems: {
                type: 'array',
                description: '課程項目 (時間)',
                required: true,
                items: {
                    type: 'object',
                    properties: {
                        courseDate: {
                            type: 'string',
                            format: 'date-time',
                            description: '日期'
                    },
                    itemName: {
                        type: 'string',
                        escription: '項目名稱'
                    }
                }
            }
        }
    }
   */
);

// ? 編輯課程 + 項目資料 (Back)

router.patch(
  "/:courseId",
  isVendorAuth,
  handleErrorAsync(courseController.updateCourse)
  /*
  #swagger.tags = ['Courses-back']
  #swagger.description = '編輯課程 + 項目資料 (Back)'
  #swagger.parameters['courseId'] = {
      in: 'path',
      description: '要編輯的課程ID',
      required: true,
      type: 'string'
  }
  #swagger.parameters['updateCourse'] = {
      in: 'body',
      description: '課程和項目資料的更新資訊',
      required: true,
      schema: {
      teacherId: {
          type: 'string',
          description: '老師 ID',
          required: true
      },
      courseType: {
          type: 'array',
          description: '課程類型',
          required: true,
          items: {
          type: 'string',
          enum: ["工藝手作", "烹飪烘焙", "藝術人文", "生活品味"]
          }
      },
      courseTerm: {
          type: 'string',
          description: '課程時長類型, 0: 單堂體驗 1:培訓課程',
          required: true,
          enum: [0, 1]
      },
      courseName: {
          type: 'string',
          description: '課程名稱',
          required: true
      },
      coursePrice: {
          type: 'number',
          description: '課程價格',
          required: true
      },
      courseStatus: {
          type: 'number',
          description: '課程狀態, 0: 下架, 1: 上架, 2: 刪除',
          required: true,
          enum: [0, 1, 2],
          default: 1
      },
      courseCapacity: {
          type: 'number',
          description: '課程名額',
          required: true
      },
      courseSummary: {
          type: 'string',
          description: '課程摘要',
          required: true
      },
      courseAddress: {
          type: 'string',
          description: '課程地址 (詳細活動地址)',
          required: true
      },
      courseRemark: {
          type: 'string',
          description: '備註 (報名的注意事項)',
      },
      courseImage: {
          type: 'array',
          description: '課程圖片 (最多 5 張)',
          required: true
      },
      courseContent: {
          type: 'string',
          description: '課程內容 (編輯器)',
          required: true
      },
      courseItems: {
          type: 'array',
          description: '課程項目 (時間), 帶入 id 表示更新, 不帶入 id 表示新增, 若資料庫有的 id, 但資料內沒出現, 則刪除該筆資料',
          required: true,
          items: {
          type: 'object',
          properties: {
              id: {
                  type: 'string',
                  description: '課程項目 ID'
              },
              courseDate: {
                  type: 'string',
                  format: 'date-time',
                  description: '開課日期'
              },
              itemName: {
                  type: 'string',
                  description: '項目名稱'
              }
          }
          }
        }
    }
  }
*/
);

// ? 刪除課程 (偽刪除) (Back)

router.patch(
  "/admin/deactivate/:courseId",
  isVendorAuth,
  handleErrorAsync(courseController.deactivateCourse)
  /*
  #swagger.tags = ['Courses-back']
  #swagger.description = '刪除課程 (偽刪除) (Back)'
  #swagger.parameters['courseId'] = {
      in: 'path',
      description: '要刪除的課程 ID',
      required: true,
      type: 'string'
  }
  */
);

module.exports = router;
