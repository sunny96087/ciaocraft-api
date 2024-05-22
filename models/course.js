const mongoose = require("mongoose");

// 定義課程模型
const courseSchema = new mongoose.Schema(
  {
    // 關聯廠商
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    // 關聯教師
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    // 關聯課程時間
    courseTimes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseTime",
      },
    ],
    // 課程類型
    courseType: [String],
    // 課程名稱
    courseName: String,
    // 課程價格
    coursePrice: Number,
    // 課程狀態
    courseStatus: {
      type: Boolean, // true: 啟用, false: 停用
      default: true,
    },
    // 課程名額
    courseCapacity: Number,
    // 課程摘要
    courseSummary: String,
    // 課程所在地 (指縣市供作篩選)
    courseLocation: String,
    // 課程地址 (詳細活動地址)
    courseAddress: String,
    // 備註 (報名的注意事項)
    courseRemark: String,
    // 課程圖片
    courseImage: [String],
    // 課程內容 (編輯器)
    courseContent: String,
  },
  {
    versionKey: false,
    timestamps: true,
    virtuals: true, // 虛擬屬性
  }
);

// 創建課程模型
const Course = mongoose.model("Course", courseSchema);

// 定義課程項目模型
const courseItemSchema = new mongoose.Schema(
  {
    // 關聯課程
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    // 項目名額
    capacity: Number,
    // 項目價格
    courseDate: Date,
    // 項目名稱
    itemName: String,
    // 項目狀態
    status: {
      type: Number,
      enum: [0, 1, 2], // 0: 下架, 1: 上架, 2: 刪除
      default: 1,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// 創建課程項目模型
const CourseItem = mongoose.model("CourseItem", courseItemSchema);

// 導出
module.exports = { Course, CourseItem };
