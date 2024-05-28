const Vendor = require("../models/vendor");
const Teacher = require("../models/teacher");
const { Course, CourseItem, CourseComment } = require("../models/course");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess");
const { isVendorAuth, generateSendJWT } = require("../utils/vendorAuth");
const tools = require("../utils/tools");

const courseController = {
  // ? 取得全部課程 (query: createdAt, courseTerm, courseStatus, keyword(teacherId > name || courseName)) (Back)
  getAdminCourses: async (req, res, next) => {
    // 取得賣家 id
    const vendorId = req.vendor.id;

    console.log("vendorId", vendorId);
    console.log("req.query", req.query);

    // 從請求中取得查詢參數
    const { startDate, courseTerm, courseStatus, keyword } = req.query;

    // 建立查詢條件
    const query = { vendorId };

    // 只返回 courseStatus 為 0 或 1 的課程
    query.courseStatus = { $in: [0, 1] };

    // 根據 courseTerm 課程時長類型 過濾課程 (0: 單堂體驗 1:培訓課程)
    if (courseTerm !== "") {
      query.courseTerm = courseTerm;
    }

    // 根據 courseStatus 課程狀態 過濾課程 (0: 下架, 1: 上架, 2: 刪除)
    if (courseStatus !== "") {
      query.courseStatus = courseStatus;
    }

    // 根據 keyword 過濾課程
    if (keyword !== "") {
      query.$or = [
        { "teacherId.name": { $regex: keyword, $options: "i" } },
        { courseName: { $regex: keyword, $options: "i" } },
      ];
    }

    // 根據 createdAt 排序課程
    // const sort = {};
    // if (createdAt === "asc") {
    //   sort.createdAt = 1;
    // } else {
    //   sort.createdAt = -1; // 預設為降序
    // }

    // 查詢賣家的所有課程
    let courses = await Course.find(query)
      .populate("teacherId")
      .populate("courseItemId");
    // .sort(sort)

    // 對每個課程查詢相關的 courseItemId 並找出最早的 startTime 和最晚的 endTime
    courses = await Promise.all(
      courses.map(async (course) => {
        const courseItems = await CourseItem.find({
          _id: { $in: course.courseItemId },
        });

        if (courseItems.length === 0) {
          return course;
        }

        const startTimes = courseItems
          .filter((item) => item.startTime)
          .map((item) => new Date(item.startTime).getTime());
        const endTimes = courseItems
          .filter((item) => item.endTime)
          .map((item) => new Date(item.endTime).getTime());

        if (startTimes.length === 0 || endTimes.length === 0) {
          return course;
        }

        const earliestStartTime = new Date(Math.min(...startTimes));
        const latestEndTime = new Date(Math.max(...endTimes));

        return {
          ...course._doc,
          earliestStartTime,
          latestEndTime,
        };
      })
    );

    // 根據 earliestStartTime 排序課程
    if (startDate === "asc") {
      courses.sort((a, b) => a.earliestStartTime - b.earliestStartTime);
    } else {
      courses.sort((a, b) => b.earliestStartTime - a.earliestStartTime); // 預設為降序
    }

    // 返回查詢結果
    handleSuccess(res, courses, "取得全部課程成功");
  },

  // ? 取得單筆課程資料 + 項目資料 (Back)
  getAdminCourse: async (req, res, next) => {
    // 從請求中取得課程 id
    const { courseId } = req.params;

    // 檢查課程是否存在
    const isCourseExist = await tools.findModelByIdNext(Course, courseId, next);
    if (!isCourseExist) {
      return;
    }

    // 檢查課程是否被假刪除
    const courseCheck = await Course.findById(courseId);
    if (courseCheck.courseStatus === 2) {
      return next(appError(404, "該課程已刪除"));
    }

    // 查詢課程
    const course = await Course.findById(courseId)
      .populate("teacherId")
      .populate("courseItemId");

    // 如果課程不存在，則返回錯誤
    if (!course) {
      return next(appError(404, "課程不存在"));
    }

    // 返回查詢結果
    handleSuccess(res, course, "取得單筆課程資料成功");
  },

  // * 取得課程列表 (Front)
  getCourses: async (req, res, next) => {
    console.log("取得課程列表 (Front)");
    let { keyword, courseTerm, courseType, sortBy, pageNo, pageSize } =
      req.query;

    // 建立查詢條件；預設顯示狀態為 0 或 1 的課程
    let queryField = { courseStatus: { $in: [0, 1] } };

    // 關鍵字查詢
    if (keyword) {
      queryField.courseName = { $regex: keyword, $options: "i" };
    }

    // 課程類型(Array)查詢
    if (courseType) {
      queryField.courseType = { $in: courseType.split(",") };
    }

    // 選擇課程時長類型 (0:單堂體驗 1:培訓課程)
    if (courseTerm) {
      courseTerm = parseInt(courseTerm);
      queryField.courseTerm = courseTerm;
    }

    // 分頁查詢 (預設第 1 頁，每頁 100 筆)
    pageNo = parseInt(pageNo) || 1;
    pageSize = parseInt(pageSize) || 100;
    let skip = (pageNo - 1) * pageSize;
    let limit = pageSize;

    // 課程
    let courses = [];

    // 排序查詢 (預設依照最新時間排序)
    sortBy = sortBy || "newest";
    if (sortBy === "newest") {
      // 依照最新時間排序
      courses = await Course.find(queryField)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "brandName courseName courseType courseTerm coursePrice createdAt"
        );
    } else if (sortBy === "mostPopular") {
      // 依照訂單被預訂數量 status=3(已完課) -> 收藏數量 -> 最新時間
      courses = await Course.aggregate([
        {
          $match: queryField,
        },
        {
          $lookup: {
            from: "vendors",
            localField: "vendorId",
            foreignField: "_id",
            as: "vendor",
          },
        },
        {
          $unwind: "$vendor",
        },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "courseId",
            as: "orders",
          },
        },
        {
          $lookup: {
            from: "collections",
            localField: "_id",
            foreignField: "courseId",
            as: "collections",
          },
        },
        {
          $project: {
            courseName: 1,
            brandName: "$vendor.brandName",
            courseType: 1,
            courseTerm: 1,
            coursePrice: 1,
            orderCount: {
              $size: {
                $filter: {
                  input: "$orders",
                  as: "order",
                  cond: { $eq: ["$$order.status", 3] }, // order=3(已完課)
                },
              },
            },
            collectionCount: { $size: "$collections" },
            createdAt: 1,
          },
        },
        {
          $sort: { orderCount: -1, collectionCount: -1, createdAt: -1 },
        },
        { $skip: skip },
        { $limit: limit },
      ]);
    } else if (sortBy === "highestRate") {
      // 依照評價高低 -> 評論數最多 -> 最新上架時間
      courses = await Course.aggregate([
        {
          $match: queryField,
        },
        {
          $lookup: {
            from: "vendors",
            localField: "vendorId",
            foreignField: "_id",
            as: "vendor",
          },
        },
        {
          $unwind: "$vendor",
        },
        {
          $lookup: {
            from: "coursecomments",
            localField: "_id",
            foreignField: "courseId",
            as: "comments",
          },
        },
        {
          $unwind: {
            path: "$comments",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            courseName: { $first: "$courseName" },
            brandName: { $first: "$vendor.brandName" },
            courseType: { $first: "$courseType" },
            courseTerm: { $first: "$courseTerm" },
            coursePrice: { $first: "$coursePrice" },
            averageRate: {
              $avg: {
                $cond: {
                  if: { $ne: ["$comments.rating", null] },
                  then: "$comments.rating",
                  else: null, // 不存在 rate 欄位，則返回 null
                },
              },
            },
            commentCount: {
              $sum: { comments: 1 },
            },
            createdAt: { $first: "$createdAt" },
          },
        },
        {
          $sort: { averageRate: -1, commentCount: -1, createdAt: -1 },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            courseName: 1,
            brandName: 1,
            courseType: 1,
            courseTerm: 1,
            coursePrice: 1,
            averageRate: 1,
            commentCount: 1,
            createdAt: 1,
          },
        },
      ]);
    } else {
    }

    handleSuccess(res, courses, "取得課程列表成功");
  },

  // ? 新增課程 + 項目資料 (Back)
  newCourse: async (req, res, next) => {
    // 先建立主課程
    let data = req.body;

    // 取得登入的賣家 id
    let vendorId = req.vendor.id;

    // 檢查老師 id 是否存在
    const isIdExist = await tools.findModelByIdNext(
      Teacher,
      data.teacherId,
      next
    );
    if (!isIdExist) {
      return;
    }

    // 使用 trimObjectValues 函數來去掉資料中所有值的空格
    data = tools.trimObjectAllValues(data);

    // 定義及檢查欄位內容不得為空 // ps. courseLocation 課程所在地 暫時不用
    const fieldsToCheck = [
      "teacherId",
      "courseType",
      "courseTerm",
      "courseName",
      "coursePrice",
      "courseStatus",
      "courseCapacity",
      "courseSummary",
      "courseAddress",
      "courseImage",
      "courseContent",
    ];
    const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
    if (errorMessage) {
      return next(appError(400, errorMessage));
    }

    // create course
    const newCourse = await Course.create({
      vendorId,
      ...data,
    });

    // 找到相對應的老師並將新課程 _id 添加到 courseId 陣列中
    const teacher = await Teacher.findById(data.teacherId);
    if (!teacher) {
      return next(appError(400, "找不到相對應的老師"));
    }
    teacher.courseId.push(newCourse._id);
    await teacher.save();

    // 建立課程項目並儲存課程項目的 ID
    const courseItems = data.courseItems;
    const courseItemIds = [];
    for (let item of courseItems) {
      const newCourseItem = await CourseItem.create({
        courseId: newCourse._id,
        // ...item,
        capacity: data.courseCapacity,
        mainCourseName: data.courseName,
        startTime: item.startTime,
        endTime: item.endTime,
        itemName: item.itemName,
      });
      courseItemIds.push(newCourseItem._id);
    }

    // 更新課程的 courseItemId
    newCourse.courseItemId = courseItemIds;
    await newCourse.save();

    handleSuccess(res, newCourse, "新增課程及時段成功");
  },

  // ? 刪除課程 (偽刪除) (Back)
  deactivateCourse: async (req, res, next) => {
    // 從請求中獲取課程 id
    const { courseId } = req.params;

    // 檢查課程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return next(appError(404, "課程不存在"));
    }

    // 將課程狀態設為 2 來表示假刪除
    course.courseStatus = 2;
    await course.save();

    // 找到相對應的老師並從 courseId 陣列中移除該課程 _id
    const teacher = await Teacher.findById(course.teacherId);
    if (teacher) {
      const index = teacher.courseId.indexOf(courseId);
      if (index > -1) {
        teacher.courseId.splice(index, 1);
        await teacher.save();
      }
    }

    handleSuccess(res, null, "刪除課程成功");
  },

  // ? 編輯課程 + 項目資料 (Back)
  updateCourse: async (req, res, next) => {
    // 從請求中獲取課程 id 和更新的資料
    const { courseId } = req.params;
    let data = req.body;

    // 檢查課程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return next(appError(404, "課程不存在"));
    }

    // 使用 trimObjectValues 函數來去掉資料中所有值的空格
    data = tools.trimObjectAllValues(data);

    // 定義及檢查欄位內容不得為空
    const fieldsToCheck = [
      "teacherId",
      "courseType",
      "courseTerm",
      "courseName",
      "coursePrice",
      "courseStatus",
      "courseCapacity",
      "courseSummary",
      "courseAddress",
      "courseImage",
      "courseContent",
    ];
    const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
    if (errorMessage) {
      return next(appError(400, errorMessage));
    }

    // 更新課程資料
    Object.assign(course, data);
    await course.save();

    // 找到相對應的老師並將課程 _id 添加到 courseId 陣列中
    const teacher = await Teacher.findById(data.teacherId);
    if (!teacher) {
      return next(appError(400, "找不到相對應的老師"));
    }
    teacher.courseId.push(course._id);
    await teacher.save();

    // 對取回來的 item.id 進行比對, 若資料庫有的 id, 但資料內沒出現, 則刪除該筆資料
    const courseItemIds = data.courseItems.map((item) => item.id);

    for (let id of course.courseItemId) {
      if (!courseItemIds.includes(id.toString())) {
        const courseItem = await CourseItem.findOne({
          _id: id,
          courseId: courseId,
        });
        if (courseItem) {
          courseItem.status = 2; // 將狀態設為 2 來表示假刪除
          await courseItem.save();
        }
      }
    }

    course.courseItemId = course.courseItemId.filter((id) =>
      courseItemIds.includes(id.toString())
    );

    // 更新課程項目
    const courseItems = data.courseItems;
    for (let item of courseItems) {
      const courseItem = await CourseItem.findById(item.id);

      // 如果課程項目存在，則更新課程項目
      if (courseItem) {
        Object.assign(courseItem, item);
        await courseItem.save();
      } else {
        // 如果課程項目不存在，則創建新的課程項目
        const newCourseItem = await CourseItem.create({
          courseId: course._id,
          // ...item,
          capacity: data.courseCapacity,
          mainCourseName: data.courseName,
          startTime: item.startTime,
          endTime: item.endTime,
          itemName: item.itemName,
        });
        course.courseItemId.push(newCourseItem._id); // 將新的課程項目的 _id 加入到 course.courseItemId
        await course.save(); // 立即保存課程
      }
    }

    await course.save(); // 在迴圈結束後再次保存課程

    handleSuccess(res, course, "編輯課程及時段成功");
  },

  // ? 取得所有訂單 (關聯課程 + 項目) (Back)
  // ? 取得單筆訂單資料 (關聯課程 + 項目) (Back)
};

module.exports = courseController;
