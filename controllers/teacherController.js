const dayjs = require("dayjs");
const tools = require("../utils/tools");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess"); // 引入自訂的成功處理工具
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuth, generateSendJWT } = require("../utils/auth");
const Teacher = require("../models/teacher");
const Vendor = require("../models/vendor");
const { Course, CourseItem, CourseComment } = require("../models/course");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const crypto = require("crypto");

const teacherController = {
  // todo : 分成 3 個使用方 ( Front 前台, Back 後台, Manage 平台管理 )

  // * 取得所有老師 (query: sort, createdAt, 課程類型, keyword) (Back) 
  getAdminTeachers: async (req, res, next) => {
    const teachers = await Teacher.find({ status: { $in: [0, 1] } }).populate(
      "courseId"
    );
    handleSuccess(res, teachers);
  },

  // * 取得單筆老師資料 (Front)
  getTeacher: async (req, res, next) => {
    const id = req.params.teacherId;

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Teacher, id, next);
    if (!isIdExist) {
      return;
    }

    const teacher = await Teacher.findById(id)
      .populate("courseId")
      .populate("vendorId");
    if (!teacher) {
      return next(appError(400, "找不到老師"));
    }
    handleSuccess(res, teacher);
  },

  // ? 取得單筆老師資料 (Back)
  getAdminTeacher: async (req, res, next) => {
    const id = req.params.teacherId;

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Teacher, id, next);
    if (!isIdExist) {
      return;
    }

    const teacher = await Teacher.findById(id).populate("courseId");

    if (!teacher) {
      return next(appError(400, "找不到老師"));
    }
    handleSuccess(res, teacher);
  },

  // ? 新增老師 (Back)
  newTeacher: async (req, res, next) => {
    let data = req.body;

    // 使用 trimObjectValues 函數來去掉資料中所有值的空格
    data = tools.trimObjectAllValues(data);

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(
      Vendor,
      data.vendorId,
      next
    );
    if (!isIdExist) {
      return;
    }

    // 定義及檢查欄位內容不得為空
    const fieldsToCheck = ["vendorId", "name", "order"];
    const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
    if (errorMessage) {
      return next(appError(400, errorMessage));
    }

    console.log("Before creating new teacher:", data);
    const newTeacher = await Teacher.create({
      vendorId: data.vendorId,
      name: data.name,
      description: data.description,
      photo: data.photo,
      intro: data.intro,
      socialMediaInfo: data.socialMediaInfo,
      order: data.order,
    });
    console.log("After creating new teacher:", newTeacher);

    handleSuccess(res, newTeacher, "新增老師成功");
  },

  // ? 刪除老師 (偽刪除) (Back)
  deactivateTeacher: async (req, res, next) => {
    const id = req.params.teacherId;

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Teacher, id, next);
    if (!isIdExist) {
      return;
    }

    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { status: 2 },
      {
        new: true,
        runValidators: true,
      }
    );

    handleSuccess(res, teacher, "刪除老師成功");
  },

  // ? 編輯老師 (Back)
  updateTeacher: async (req, res, next) => {
    const id = req.params.teacherId;
    let data = req.body;

    // 使用 trimObjectValues 函數來去掉資料中所有值的空格
    data = tools.trimObjectAllValues(data);

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Teacher, id, next);
    if (!isIdExist) {
      return;
    }

    // 定義及檢查欄位內容不得為空
    const fieldsToCheck = ["name", "order"];
    const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
    if (errorMessage) {
      return next(appError(400, errorMessage));
    }

    const teacher = await Teacher.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    handleSuccess(res, teacher, "編輯老師成功");
  },

  // > 刪除老師 (Manage)
  deleteTeacherManage: async (req, res, next) => {
    const id = req.params.teacherId;

    const { adminPassword } = req.body;

    // 檢查管理員密碼是否正確
    const correctAdminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword !== correctAdminPassword) {
      return next(appError("401", "管理員密碼錯誤！"));
    }

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Teacher, id, next);
    if (!isIdExist) {
      return;
    }

    const teacher = await Teacher.findByIdAndDelete(id);

    handleSuccess(res, teacher, "刪除老師成功");
  },
};

module.exports = teacherController;
