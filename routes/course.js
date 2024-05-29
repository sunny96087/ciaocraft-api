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
      #swagger.summary = '取得全部課程 (Back)'
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
      #swagger.parameters['startDate'] = {
          in: 'query',
          description: '開課日期的排序方式，日期新到舊(預設)、舊到新: asc',
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
    /*  #swagger.tags = ['Courses-back']
        #swagger.summary = '取得單筆課程資料 + 項目資料 (Back)'
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
router.get(
    "/",
    handleErrorAsync(courseController.getCourses)
    /*  #swagger.tags = ['Courses-front']
        #swagger.summary = '取得課程列表'
        #swagger.description = '搜尋條件：可帶入「課程時長類型 (courseTerm)、課程類型 (courseType)、課程名稱關鍵字 (keyword)」篩選課程。 <br>
        排序條件：sortBy 可帶入「newest (最近日期), mostPopular (最熱門), highestRate (評分最高)」；未選擇則預設 newest 方式排序。 <br>
        分頁功能：可帶入頁碼 (pageNo)、筆數 (pageSize) 以使用分頁功能。未帶入則預設 pageNo = 1, pageSize = 20。'
        #swagger.parameters['courseTerm'] = {
            in: 'query',
            description: '課程時長類型；0: 單堂體驗 1:培訓課程',
            required: false,
            type: 'string'
        }
        #swagger.parameters['courseType'] = {
            in: 'query',
            description: '課程類型；多選以逗號分隔，可帶入類型：工藝手作, 烹飪烘焙, 藝術人文, 生活品味',
            required: false,
            type: 'string'
        }
        #swagger.parameters['keyword'] = {
            in: 'query',
            description: '課程名稱關鍵字',
            required: false,
            type: 'string'
        }
        #swagger.parameters['sortBy'] = {
            in: 'query',
            description: '預設依照日期排序：可填 newest(最近日期), mostPopular(最熱門), highestRate(評分最高)',
            required: false,
            type: 'string'
        }
        #swagger.parameters['pageNo'] = {
            in: 'query',
            description: '當前頁碼，預設 1',
            required: false,
            type: 'number'
        }
        #swagger.parameters['pageSize'] = {
            in: 'query',
            description: '每頁筆數，預設 20 筆，上限 100 筆',
            required: false,
            type: 'number'
        }
     */
);

// ? 新增課程 + 項目資料 (Back)
router.post(
    "/",
    isVendorAuth,
    handleErrorAsync(courseController.newCourse)
    /*
      #swagger.tags = ['Courses-back']
      #swagger.summary = '新增課程 + 項目資料 (Back)'
      #swagger.description = `新增課程 + 項目資料 (Back) <br>
                                teacherId: 老師 ID (string) <br>
                                courseType: 課程類型 (array<string>)；可帶入值包含 "工藝手作", "烹飪烘焙", "藝術人文", "生活品味" <br>
                                courseTerm: 課程時長類型 (int)；0: 單堂體驗 1:培訓課程 <br>
                                courseName: 課程名稱 (string) <br>
                                coursePrice: 課程價格 (int) <br>
                                courseStatus: 課程狀態 (int)，預設為 1；0: 下架, 1: 上架, 2: 刪除 <br>
                                courseCapacity: 課程名額 (int) <br>
                                courseSummary: 課程摘要 (string) <br>
                                courseAddress: 課程地址 (string)；詳細活動地址 <br>
                                courseRemark: 備註 (string)；報名的注意事項 <br>
                                courseImage: 課程圖片 (array<string>)；圖片連結，最多 5 張 <br>
                                courseContent: 課程內容 (string)；帶入編輯器內容 <br>
                                courseItems: 課程項目 (array<object>)；courseDate 為 Date 物件格式<br>`
  
      #swagger.parameters['body'] = {
          in: 'body',
          description: '新增課程 + 項目資料 (Back)',
          required: true,
          schema: {
              $teacherId: '老師 ID',
              $courseType: ["工藝手作", "烹飪烘焙", "藝術人文", "生活品味"],
              $courseTerm: 0,
              $courseName: '課程名稱',
              $coursePrice: 9999,
              $courseStatus: 1,
              $courseCapacity: 30,
              $courseSummary: '課程摘要',
              $courseAddress: '課程地址 (詳細活動地址)',
              $courseRemark:'備註 (報名的注意事項)',
              $courseImage:['圖片1', '圖片2', '圖片3', '圖片4', '圖片5'],
              $courseContent:'課程內容 (編輯器)',
              $courseItems: [
                    {
                        courseDate: '2024-06-01 10:00:00',
                        itemName: '項目名稱1'
                    },
                    {
                        courseDate: '2024-06-01 12:00:00',
                        itemName: '項目名稱2'
                    }
                ]
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
        #swagger.summary = '編輯課程 + 項目資料 (Back)'
        #swagger.description = `編輯課程 + 項目資料 (Back) <br>
                                teacherId: 老師 ID (string) <br>
                                courseType: 課程類型 (array<string>)；可帶入值包含 "工藝手作", "烹飪烘焙", "藝術人文", "生活品味" <br>
                                courseTerm: 課程時長類型 (int)；0: 單堂體驗 1:培訓課程 <br>
                                courseName: 課程名稱 (string) <br>
                                coursePrice: 課程價格 (int) <br>
                                courseStatus: 課程狀態 (int)，預設為 1；0: 下架, 1: 上架, 2: 刪除 <br>
                                courseCapacity: 課程名額 (int) <br>
                                courseSummary: 課程摘要 (string) <br>
                                courseAddress: 課程地址 (string)；詳細活動地址 <br>
                                courseRemark: 備註 (string)；報名的注意事項 <br>
                                courseImage: 課程圖片 (array<string>)；圖片連結，最多 5 張 <br>
                                courseContent: 課程內容 (string)；帶入編輯器內容 <br>
                                courseItems: 課程項目 (array<object>)；courseDate 為 Date 物件格式。課程項目 (時間), 帶入 id 表示更新, 不帶入 id 表示新增, 若資料庫有的 id, 但資料內沒出現, 則刪除該筆資料 <br>`
        #swagger.parameters['courseId'] = {
            in: 'path',
            description: '要編輯的課程ID',
            required: true,
            type: 'string'
        }
        #swagger.parameters['body'] = {
            in: 'body',
            description: '課程和項目資料的更新資訊',
            required: true,
            schema: {
                $teacherId:'老師 ID',
                $courseType:'課程類型',
                $courseTerm:  '課程時長類型, 0: 單堂體驗 1:培訓課程',
                $courseName: '課程名稱',
                $coursePrice: 9999,
                $courseStatus: 1,
                $courseCapacity: 30,
                $courseSummary: '課程摘要',
                $courseAddress:'課程地址 (詳細活動地址)',
                $courseRemark:'備註 (報名的注意事項)',
                $courseImage: ['圖片1', '圖片2', '圖片3', '圖片4', '圖片5'],
                $courseContent: '課程內容 (編輯器)',
                $courseItems: [
                    {
                        id: 'courseItemId',
                        courseDate: '2024-06-01 10:00:00',
                        itemName: '項目名稱1'
                    }
                ]
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
        #swagger.summary = '刪除課程 (偽刪除) (Back)'
        #swagger.description = '刪除課程 (偽刪除) (Back)'
        #swagger.parameters['courseId'] = {
            in: 'path',
            description: '要刪除的課程 ID',
            required: true,
            type: 'string'
        }
    */
);

// 取得單筆課程資料 (Front)
router.get(
    "/:courseId",
    handleErrorAsync(courseController.getCourse)
    /* 
    #swagger.tags = ['Courses-front']
    #swagger.summary = '取得單筆課程資料'
    #swagger.description = '取得單筆課程資料，不含評論'
    #swagger.parameters['courseId'] = {
        in: 'path',
        description: '要取得的課程 ID',
        required: true,
        type: 'string'
    }
    */
)

// 取得單筆課程全部評論 (Front)
router.get(
    "/:courseId/comments",
    handleErrorAsync(courseController.getCourseAllComments)
    /* 
    #swagger.tags = ['Courses-front']
    #swagger.summary = '取得單筆課程全部評論'
    #swagger.description = '取得單筆課程全部評論'
    #swagger.parameters['courseId'] = {
        in: 'path',
        description: '要取得的課程 ID',
        required: true,
        type: 'string'
    }
    */
)

// 取得單筆評論 (Front)
router.get(
    "/comments/:commentId",
    handleErrorAsync(courseController.getComment)
    /* 
    #swagger.tags = ['Courses-front']
    #swagger.summary = '取得單筆評論'
    #swagger.description = '取得單筆評論' 
    #swagger.parameters['commentId'] = {
        in: 'path',
        description: '要取得的評論 ID',
        required: true,
        type: 'string'
    }
    */

)

// 新增評論 (Front)
router.post(
    "/comments",
    handleErrorAsync(courseController.newComment)
    /* 
    #swagger.tags = ['Courses-front']
    #swagger.summary = '新增評論'
    #swagger.description = '新增評論'
    #swagger.parameters['newComment'] = {
        in: 'body',
        description: '新增評論',
        required: true,
        schema: {
            memberId: {
                type: 'string',
                description: '會員 ID',
                required: true
            },
            courseId: {
                type: 'string',
                description: '課程 ID',
                required: true
            },
            content: {
                type: 'string',
                description: '評論內容',
                required: true
            },
            images: {
                type: 'array',
                description: '評論圖片 (最多 5 張)',
            },
            tags: {
                type: 'array',
                description: '評論標籤',
                required: true,
                items: {
                    type: 'string',
                    enum: ["師生互動", "教學環境", "專業度", "其他"]
                }
            },
            rating: {
                type: 'number',
                description: '評分',
                required: true
            },
            likes: {
                type: 'number',
                description: '按讚數',
            }
        }
    }
    */
)

module.exports = router;
