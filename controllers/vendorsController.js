const dayjs = require("dayjs");
const tools = require("../utils/tools");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess"); // 引入自訂的成功處理工具
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuth, generateSendJWT } = require("../utils/auth");
const Vendor = require("../models/vendor");
const { Course, CourseItem, Comment } = require("../models/course");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const vendorController = {
  // todo : 分成 3 個使用方 ( Front 前台, Back 後台, Manage 平台管理 )

  // * 審核後給予賣家密碼 (Manage)
  updateVendorManage: async function (req, res, next) {
    const vendorId = req.params.vendorId;
    const { adminPassword, password } = req.body;

    const correctAdminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword !== correctAdminPassword) {
      return next(appError("401", "管理員密碼錯誤！"));
    }

    let hashedPassword = await bcrypt.hash(password, 12);

    const vendor = await Vendor.findByIdAndUpdate(vendorId, {
      password: hashedPassword,
    });

    if (!vendor) {
      return next(appError("404", "用戶不存在！"));
    }

    handleSuccess(res, vendor, "更新賣家資料成功");
  },

  // * 寄開通信給賣家 (Manage)
  sendEmailToVendor: async function (req, res, next) {
    const vendorId = req.params.vendorId;
    const { adminPassword, subject, text } = req.body;

    // 檢查管理員密碼是否正確
    const correctAdminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword !== correctAdminPassword) {
      return next(appError("401", "管理員密碼錯誤！"));
    }

    // 從資料庫中找到賣家
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return next(appError(400, "找不到該賣家"));
    }
    // 取得一次性的 access token
    const accessToken = oauth2Client.getAccessToken();

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "yu13142013@gmail.com",
        clientId: process.env.GOOGLE_AUTH_CLIENTID,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_AUTH_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    // 發送郵件
    const mailOptions = {
      from: "巧手玩藝 Ciao!Craft <yu13142013@gmail.com>",
      to: vendor.account,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);

    // 回應成功
    handleSuccess(res, mailOptions, "審核通過郵件已成功發送給賣家");
  },

  // * 取得全部賣家資料 (Manage)
  getVendorsManage: async function (req, res, next) {
    const data = await Vendor.find(); // 查詢所有資料
    handleSuccess(res, data, "取得所有資料成功");
  },

  // * 登入 (Back)
  vendorLogin: async function (req, res, next) {
    const { account, password } = req.body;
    if (!account || !password) {
      return next(appError(400, "帳號密碼不可為空"));
    }

    // 檢查 account 是否存在
    const existingVendor = await Vendor.findOne({ account });
    if (!existingVendor) {
      return next(appError(400, "帳號不存在"));
    }

    const vendor = await Vendor.findOne({ account }).select("+password");
    const auth = await bcrypt.compare(password, vendor.password);
    if (!auth) {
      return next(appError(400, "您的密碼不正確"));
    }

    // 檢查狀態
    switch (vendor.status) {
      case 0:
        return next(appError(400, "帳號正在審核中"));
      case 2:
        return next(appError(400, "帳號被停權，若有疑問請聯絡平台管理員"));
      case 1:
      default:
        // 更新登入時間
        vendor.loginAt = Date.now();
        await vendor.save();
        generateSendJWT(vendor, 200, res);
    }
  },

  // * 取得登入賣家資料 (Back)
  getVendorAdmin: async function (req, res, next) {
    const id = req.user.id;
    const vendor = await Vendor.findById(id);
    // 還沒選要顯示哪些資料

    if (vendor) {
      handleSuccess(res, vendor, "取得賣家資料成功");
    } else {
      return next(appError(400, "找不到該賣家"));
    }
  },

  // * 編輯賣家資料 (Back)
  updateVendor: async function (req, res, next) {
    const id = req.vendor.id;
    let data = req.body;

    // 使用 trimObjectValues 函數來去掉資料中所有值的空格
    data = tools.trimObjectAllValues(data);

    // 使用 hasDataChanged 函數來檢查資料是否有改變
    const oldData = await Vendor.findById(id);
    if (!tools.hasDataChanged(oldData, data)) {
      return next(appError(400, "資料未變更"));
    }

    const updateVendor = await Vendor.findByIdAndUpdate(
      // 更新指定 ID 的資料
      id,
      {
        mobile: data.mobile,
        brandName: data.brandName,
        avatar: data.avatar,
        bannerImage: data.bannerImage,
        intro: data.intro,
        socialMedias: data.socialMedias,
        bankName: data.bankName,
        bankCode: data.bankCode,
        bankBranch: data.bankBranch,
        bankAccountName: data.bankAccountName,
        bankAccount: data.bankAccount,
        address: data.address,
        notice: data.notice,
      },
      { new: true }
    );

    if (updateVendor) {
      // 如果更新成功
      handleSuccess(res, updateVendor, "更新賣家資料成功");
    } else {
      return next(appError(400, "資料更新失敗"));
    }
  },

  // * 修改密碼 (Back)
  updateVendorPassword: async function (req, res, next) {
    const { password, confirmPassword } = req.body;

    // 密碼必須為英數混合且至少 8 碼
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return next(appError("400", "密碼必須為英數混合且至少 8 碼"));
    }

    if (password !== confirmPassword) {
      return next(appError("400", "密碼不一致！"));
    }
    let newPassword = await bcrypt.hash(password, 12);

    const vendor = await Vendor.findByIdAndUpdate(req.vendor.id, {
      password: newPassword,
    });
    generateSendJWT(vendor, 200, res, "更改密碼成功");
  },

  // * 新增賣家申請 (Front)
  newVendorReview: async function (req, res, next) {
    let data = req.body;
    data = tools.trimObjectAllValues(data);

    if (data) {
      // 定義及檢查數據是否包含所有必填欄位
      const requiredFields = [
        "representative",
        "mobile",
        "brandName",
        "account",
      ];
      const { isValid, missingFields } = tools.checkRequiredFields(
        data,
        requiredFields
      );
      if (!isValid) {
        return next(
          appError(400, `以下欄位為必填: ${missingFields.join(", ")}`)
        );
      }

      // 定義及檢查欄位內容不得為空
      const fieldsToCheck = [
        "representative",
        "mobile",
        "brandName",
        "account",
      ];
      const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
      if (errorMessage) {
        return next(appError(400, errorMessage));
      }

      // 定義及提供的數據是否只包含了允許的欄位
      const allowedFields = [
        "representative",
        "mobile",
        "brandName",
        "account",
        "reviewLinks",
        "reviewBrief",
        "reviewImages",
      ];
      const invalidFieldsError = tools.validateFields(data, allowedFields);
      if (invalidFieldsError) {
        return next(appError(400, invalidFieldsError));
      }

      // 檢查 account 是否重複
      const existingUser = await Vendor.findOne({ account: data.account });
      if (existingUser) {
        return next(appError(400, "該 account 已經被註冊"));
      }

      // 建立資料
      const newVendor = await Vendor.create({
        representative: data.representative,
        mobile: data.mobile,
        brandName: data.brandName,
        account: data.account,
        reviewLinks: data.reviewLinks,
        reviewBrief: data.reviewBrief,
        reviewImages: data.reviewImages,
      });

      handleSuccess(res, newVendor, "送出賣家申請成功", 201);
    } else {
      return next(appError(400, "請輸入必填資料"));
    }
  },

  // * 確認賣家帳號是否重複 (Front)
  checkVendorAccount: async function (req, res, next) {
    const account = req.params.account;

    const data = await Vendor.findOne({ account });

    if (!data) {
      handleSuccess(res, null, "該 account 可以使用");
    } else {
      return next(appError(400, "該 account 已經被註冊"));
    }
  },

  // * 取得單筆賣家綜合資料 (需計算學員數、全部課程、師資) (Front)
  getVendor: async function (req, res, next) {
    const vendorId = req.params.vendorId;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return next(appError(400, "找不到該賣家"));
    }

    // 計算學員數
    const students = await Course.find({ vendorId: vendorId });
    const studentCount = students.reduce((acc, course) => {
      return acc + course.students.length;
    }, 0);

    // 取得全部課程
    const courses = await Course.find({ vendorId: vendorId });

    // 取得師資
    const teachers = await Course.find({ vendorId: vendorId }).populate(
      "teacherId"
    );

    const data = {
      vendor,
      studentCount,
      courses,
      teachers,
    };

    handleSuccess(res, data, "取得賣家資料成功");
  },
};

module.exports = vendorController;
