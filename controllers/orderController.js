const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess");
const tools = require("../utils/tools");
const { Course, CourseItem, CourseComment } = require("../models/course");
const Vendor = require("../models/vendor");
const Teacher = require("../models/teacher");
const Member = require("../models/member");
const Order = require("../models/order");
const mongoose = require("mongoose");

const orderController = {
  // todo : 分成 3 個使用方 ( Front 前台, Back 後台, Manage 平台管理 )

  // ? 取得進帳總覽 (今日、近 7 天、30 天、12個月) (Back)
  getAdminOrdersSummary: async (req, res, next) => {
    const vendorId = req.vendor.id;

    // 使用本地時區
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0);
    todayStart.setMinutes(0);
    todayStart.setSeconds(0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0);
    sevenDaysAgo.setMinutes(0);
    sevenDaysAgo.setSeconds(0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0);
    thirtyDaysAgo.setMinutes(0);
    thirtyDaysAgo.setSeconds(0);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setHours(0);
    twelveMonthsAgo.setMinutes(0);
    twelveMonthsAgo.setSeconds(0);

    let query = { vendorId: vendorId.toString() };

    // 先取回所有訂單
    let allOrders = await Order.find(query).lean();

    // 初始化總計數據
    let todayIncome = 0,
      todayRefund = 0,
      sevenDaysIncome = 0,
      sevenDaysRefund = 0,
      thirtyDaysIncome = 0,
      thirtyDaysRefund = 0,
      twelveMonthsIncome = 0,
      twelveMonthsRefund = 0;

    // 過濾並計算各時間範圍的總額
    allOrders.forEach((order) => {
      if (order.confirmTime) {
        if (order.confirmTime >= todayStart && order.confirmTime < now) {
          todayIncome += order.totalPrice;
        }
        if (
          order.confirmTime >= sevenDaysAgo &&
          order.confirmTime < todayStart
        ) {
          sevenDaysIncome += order.totalPrice;
        }
        if (
          order.confirmTime >= thirtyDaysAgo &&
          order.confirmTime < todayStart
        ) {
          thirtyDaysIncome += order.totalPrice;
        }
        if (
          order.confirmTime >= twelveMonthsAgo &&
          order.confirmTime < todayStart
        ) {
          twelveMonthsIncome += order.totalPrice;
        }
      }

      if (order.refundTime) {
        if (order.refundTime >= todayStart && order.refundTime < now) {
          todayRefund += order.totalPrice;
        }
        if (order.refundTime >= sevenDaysAgo && order.refundTime < todayStart) {
          sevenDaysRefund += order.totalPrice;
        }
        if (
          order.refundTime >= thirtyDaysAgo &&
          order.refundTime < todayStart
        ) {
          thirtyDaysRefund += order.totalPrice;
        }
        if (
          order.refundTime >= twelveMonthsAgo &&
          order.refundTime < todayStart
        ) {
          twelveMonthsRefund += order.totalPrice;
        }
      }
    });

    // 計算總額
    let todayTotal = todayIncome - todayRefund;
    let sevenDaysTotal = sevenDaysIncome - sevenDaysRefund;
    let thirtyDaysTotal = thirtyDaysIncome - thirtyDaysRefund;
    let twelveMonthsTotal = twelveMonthsIncome - twelveMonthsRefund;

    const summary = {
      today: todayTotal,
      sevenDays: sevenDaysTotal,
      thirtyDays: thirtyDaysTotal,
      twelveMonths: twelveMonthsTotal,
    };

    handleSuccess(res, summary, "取得進帳總覽成功");
  },

  // ? 取得進帳詳情 (query: startDate + endDate) (Back)
  getAdminOrdersPayment: async (req, res, next) => {
    // 取得登入賣家的 ID
    const vendorId = req.vendor.id;

    const { startDate, endDate } = req.query;

    // 建立查詢條件
    let query = {};

    // 只取的該賣家的訂單
    query.vendorId = vendorId.toString();

    // 把資料取回來使用
    let orders = await Order.find(query);

    // 計算帳務資料
    let paymentInfo = [];

    orders.forEach((order) => {
      // 若訂單存在收款時間，則增加一筆進帳資料
      if (order.confirmTime) {
        let info = {
          _id: order._id,
          courseName: order.courseName,
          courseItemName: order.courseItemName,
          totalPrice: order.totalPrice,
          transactionTime: order.confirmTime,
        };
        paymentInfo.push(info);
      }

      // 若訂單存在退款時間，則增加一筆退款資料
      if (order.refundTime) {
        let info = {
          _id: order._id,
          courseName: order.courseName,
          courseItemName: order.courseItemName,
          totalPrice: -order.totalPrice,
          transactionTime: order.refundTime,
        };
        paymentInfo.push(info);
      }
    });

    // 確認收款時間日期區間
    if (startDate && endDate) {
      let start = new Date(startDate);
      start.setHours(0);
      start.setMinutes(0);
      start.setSeconds(0);

      // 包含結束日期的整個時間範圍 -> 23:59:59：
      let end = new Date(endDate);
      end.setHours(23);
      end.setMinutes(59);
      end.setSeconds(59);

      console.log("startDate:", start);
      console.log("end:", end);

      paymentInfo = paymentInfo.filter((info) => {
        return info.transactionTime >= start && info.transactionTime <= end;
      });
    }

    // 將資料排序，日期從新到舊
    paymentInfo.sort((a, b) => {
      return b.transactionTime - a.transactionTime;
    });

    handleSuccess(res, paymentInfo, "取得進帳總覽成功");
  },

  // ? 取得所有訂單 (query: 訂單狀態、日期區間、keyword (_id || member.name)) (Back)
  getAdminOrders: async (req, res, next) => {
    // 取得登入賣家的 ID
    const vendorId = req.vendor.id;

    const { startDate, endDate, createdAt, keyword, paidStatus } = req.query;

    // 建立查詢條件
    let query = {};

    // 課程狀態 // 若是回傳 4, 回傳 4 和 5 都是已取消的訂單
    console.log("paidStatus:", paidStatus);
    if (paidStatus) {
      if (Number(paidStatus) === 4) {
        query.paidStatus = { $in: [4, 5] };
      } else {
        query.paidStatus = Number(paidStatus);
      }
    }

    // 訂單日期區間 (訂單建立時間)
    if (startDate && endDate) {
      // 包含結束日期的整個時間範圍 -> 23:59:59：
      let end = new Date(endDate);
      end.setHours(23);
      end.setMinutes(59);
      end.setSeconds(59);

      query.createdAt = {
        $gte: new Date(startDate),
        $lte: end,
      };
    }

    // 只取的該賣家的訂單
    query.vendorId = vendorId.toString();
    // console.log("vendorId:", req.vendor.id);

    // 建立排序條件
    let sort = {};
    if (createdAt === "CREATED_AT_ASC") {
      sort.createdAt = 1; // 日期舊到新
    } else {
      sort.createdAt = -1; // 日期新到舊（預設）
    }

    console.log("query:", query);
    let orders = await Order.find(query)
      .populate("memberId")
      .populate("courseId")
      .populate("courseItemId")
      .sort(sort);

    // if (keyword) {
    //   // 在應用程式中過濾結果
    //   orders = orders.filter(
    //     (order) =>
    //       new RegExp(keyword, "i").test(order._id.toString()) ||
    //       new RegExp(keyword, "i").test(order.memberId.name)
    //   );
    // }
    if (keyword) {
      // 在資料庫中過濾結果
      orders = await Order.aggregate([
        {
          $lookup: {
            from: "members", // 請根據你的實際情況替換為 member 集合的名稱
            localField: "memberId",
            foreignField: "_id",
            as: "member",
          },
        },
        { $unwind: "$member" },
        {
          $match: {
            $or: [
              { "_id": { $regex: keyword, $options: "i" } },
              { "member.name": { $regex: keyword, $options: "i" } },
            ],
          },
        },
      ]);
    }

    handleSuccess(res, orders, "取得所有訂單成功");
  },

  // ? 取得單筆訂單資料 (Back)
  getAdminOrder: async (req, res, next) => {
    const { orderId } = req.params;
    // console.log(orderId);

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Order, orderId, next);
    if (!isIdExist) {
      return;
    }

    const order = await Order.findById(orderId)
      .populate("memberId")
      .populate("courseId")
      .populate("courseItemId");

    if (!order) {
      return next(new appError("找不到此訂單", 404));
    }

    handleSuccess(res, order, "取得單筆訂單成功");
  },

  // ? 修改訂單 (賣家確認收到款項) (Back)
  updateAdminOrder: async (req, res, next) => {
    const { orderId } = req.params;
    const { paidStatus, cancelReason } = req.body;

    // 檢查 ID 格式及是否存在
    const isIdExist = await tools.findModelByIdNext(Order, orderId, next);
    if (!isIdExist) {
      return;
    }

    if (!paidStatus) {
      return next(new appError("請提供訂單狀態碼", 400));
    }

    if (
      paidStatus !== 2 &&
      paidStatus !== 5 &&
      paidStatus !== 6 &&
      paidStatus !== 7
    ) {
      return next(new appError("請提供正確訂單狀態碼", 400));
    }

    if (paidStatus === 5 || paidStatus === 6) {
      if (!cancelReason) {
        return next(new appError("請提供取消訂單原因", 400));
      }
    }

    // 如果 paidStatus 為 2，則設定 confirmTime 為當前時間
    // 如果 paidStatus 為 5 或 6，則設定 cancelTime 為當前時間，並且設定 cancelReason
    const updateData = { paidStatus };
    if (paidStatus === 2) {
      updateData.confirmTime = new Date();
    } else if (paidStatus === 5 || paidStatus === 6) {
      updateData.cancelTime = new Date();
      updateData.cancelReason = cancelReason;
    } else if (paidStatus === 7) {
      updateData.refundTime = new Date();
      updateData.cancelReason = cancelReason;
    }

    // 更新訂單
    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    handleSuccess(res, order, "更新訂單成功");
  },

  // 取得單一訂單資料
  getOrder: async (req, res, next) => {
    const memberId = req.user.id;
    const orderId = req.params.orderId;

    // 檢查訂單是否存在
    const order = await Order
      .findOne({ _id: orderId, memberId: memberId })
      .populate({
        path: 'vendorId',
        select: 'bankName bankCode bankBranch bankAccountName bankAccount'
      })
      .select(`_id memberId vendorId courseId courseItemId 
                brandName courseLocation 
                paymentType paidStatus 
                count price totalPrice 
                startTime endTime note 
                confirmTime refundTime
                cancelTime cancelReason 
                bankName bankCode bankBranch bankAccountName bankAccount 
                createdAt`)
      .lean();

    if (!order) {
      return next(appError(400, '會員無此訂單資料'));
    }

    const isCommentExist = await CourseComment.findOne({ memberId: memberId, courseId: order.courseId });

    if (isCommentExist) {
      order.isCommented = true;
    }
    else {
      order.isCommented = false;
    }

    handleSuccess(res, order, '取得訂單資料成功');
  },

  // 新增訂單
  newOrder: async (req, res, next) => {
    const memberId = req.user.id;
    const { vendorId, courseId, courseItemId, brandName, courseName, courseItemName, count, price, totalPrice, startTime, endTime, note, courseLocation } = req.body;

    // 驗證必填欄位
    if (!vendorId || !courseId || !courseItemId || !brandName || !courseItemName || !count || !price || !totalPrice || !startTime || !endTime || !courseLocation) {
      return next(appError(400, '請輸入所有必填欄位'));
    }

    // 驗證 vendorId 格式、是否存在 及 是否啟用
    const isVendorExist = await tools.findModelByIdNext(Vendor, vendorId, next);
    if (!isVendorExist) {
      return;
    }

    const vendorStatus = await Vendor.findById({ _id: vendorId }).select('status');
    if (vendorStatus.status !== 1) {
      return next(appError(400, '此廠商已停用'));
    }

    // 驗證 courseId 格式、是否存在 及 是否啟用
    const isCourseExist = await tools.findModelByIdNext(Course, courseId, next);
    if (!isCourseExist) {
      return;
    }
    const course = await Course.findById({ _id: courseId }).select('courseStatus');

    if (course.courseStatus !== 1) {
      return next(appError(400, '非上架課程'));
    }

    // 驗證 courseItemId 格式、是否存在 及 是否啟用
    const isCourseItemExist = await tools.findModelByIdNext(CourseItem, courseItemId, next);
    if (!isCourseItemExist) {
      return;
    }
    const courseItemStatus = await CourseItem.findById({ _id: courseItemId }).select('status');
    if (courseItemStatus.status !== 1) {
      return next(appError(400, '非上架課程項目'));
    }

    // 驗證 count, price, totalPrice 須為大於 0 之正整數
    if (!Number.isInteger(count) || count <= 0) {
      return next(appError(400, 'count 須為大於 0 之正整數'));
    }
    if (!Number.isInteger(price) || price <= 0) {
      return next(appError(400, 'price 須為大於 0 之正整數'));
    }
    if (!Number.isInteger(totalPrice) || totalPrice <= 0) {
      return next(appError(400, 'totalPrice 須為大於 0 之正整數'));
    }

    // 驗證 startTime 和轉換 Date 物件
    const isValidStartTimeStr = Date.parse(startTime);
    if (!isValidStartTimeStr) {
      return next(appError(400, 'startTime 格式錯誤'));
    }
    const startTimeDateObj = new Date(startTime);

    // 驗證 endTime 和轉換 Date 物件
    const isValidEndTimeStr = Date.parse(endTime);
    if (!isValidEndTimeStr) {
      return next(appError(400, 'endTime 格式錯誤'));
    }
    const endTimeDateObj = new Date(endTime);

    // 新增訂單
    const newOrder = await Order.create({
      memberId: memberId,
      vendorId: vendorId,
      courseId: courseId,
      courseItemId: courseItemId,
      brandName: brandName,
      courseName: courseName,
      courseItemName: courseItemName,
      count: count,
      price: price,
      totalPrice: totalPrice,
      courseLocation: courseLocation,
      startTime: startTimeDateObj,
      endTime: endTimeDateObj,
      note: note
    });

    if (!newOrder) {
      return next(appError(500, '新增訂單失敗'));
    }

    // 課程項目人數減少
    const updateCourseItem = await CourseItem.findByIdAndUpdate(courseItemId, { $inc: { capacity: -count } });
    if (!updateCourseItem) {
      return next(appError(500, '更新課程項目人數失敗'));
    }

    handleSuccess(res, newOrder, '新增訂單成功');
  },

  // 更新訂單資料 (前台會員僅可更新後5碼)
  updateOrder: async (req, res, next) => {
    const memberId = req.user.id;
    const orderId = req.params.orderId;
    const lastFiveDigits = req.body.lastFiveDigits;

    // 檢查 orderId 格式
    const isOrderExist = await tools.findModelByIdNext(Order, orderId, next);
    if (!isOrderExist) {
      return;
    }

    // 檢查 lastFiveDigits 格式
    if (!lastFiveDigits || lastFiveDigits.length !== 5) {
      return next(appError(400, 'lastFiveDigits 錯誤'));
    }

    // 檢查會員是否有此訂單
    const order = await Order.findOne({ _id: orderId, memberId: memberId });
    if (!order) {
      return next(appError(400, '會員無此訂單資料'));
    }

    // 0: 待付款, 1: 已付款, 2: 已確認收到款, 3:已完課, 4:訂單取消(已過期), 5:訂單取消(不需退款), 6:訂單取消(待退款), 7:訂單取消(已退款)
    const status = 1;

    // 更新後五碼
    const updateOrder = await Order.findOneAndUpdate(
      { _id: orderId, memberId: memberId },
      { lastFiveDigits: lastFiveDigits, status: status },
      { new: true });
    handleSuccess(res, updateOrder, '更新訂單資料成功');
  },
}

module.exports = orderController;
