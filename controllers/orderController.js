const Vendor = require("../models/vendor");
const Course = require("../models/course");
const CourseItem = require("../models/courseItem");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess");

const orderController = {
    // 取得單一訂單資料
    getOrder: async (req, res, next) => {
        const memberId = req.user.id;
        const orderId = req.params.orderId;

        // 檢查訂單是否存在
        const order = await Order.findOne({ _id: orderId, memberId: memberId }).populate('courseId');
        if (!order) {
            return next(appError(400, '會員無此訂單資料'));
        }

        handleSuccess(res, order, '取得訂單資料成功');
    },

    // 新增訂單
    newOrder: async (req, res, next) => {
        const memberId = req.user.id;
        const { vendorId, courseId, courseItemId, vendorName, courseItemName, count, price, totalPrice, courseTime, note, location } = req.body;

        if (!vendorId || !courseId || !courseItemId || !vendorName || !courseItemName || !count || !price || !totalPrice || !courseTime || !location) {
            return next(appError(400, '請輸入所有必填欄位'));
        }

        // 驗證 vendorId 格式、是否存在 及 是否啟用
        const isVendorExist = await tools.findModelByIdNext(Vendor, vendorId, next);
        if (!isVendorExist) {
            return;
        }
        const vendorStatus = await Vendor.findById({_id: vendorId}).select('status');
        if (vendorStatus.status !== 1) {
            return next(appError(400, '此廠商已停用'));
        }

        // 驗證 courseId 格式、是否存在 及 是否啟用
        const isCourseExist = await tools.findModelByIdNext(Course, courseId, next);
        if (!isCourseExist) {
            return;
        }
        const courseStatus = await Course.findById({_id: courseId}).select('status');
        if(courseStatus.status !== 1) {
            return next(appError(400, '非上架課程'));
        }

        // 驗證 courseItemId 格式、是否存在 及 是否啟用
        const isCourseItemExist = await tools.findModelByIdNext(CourseItem, courseItemId, next);
        if (!isCourseItemExist) {
            return;
        }
        const courseItemStatus = await CourseItem.findById({_id: courseItemId}).select('status');
        if(courseItemStatus.status !== 1) {
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

        // 驗證 courseTime 和轉換 Date 物件
        const isValidDateStr = Date.parse(courseTime);
        if (!isValidDateStr) {
            return next(appError(400, 'courseTime 格式錯誤'));
        }
        const courseTimeDateObj = new Date(courseTime);

        // 新增訂單
        const newOrder = await Order.create({
            memberId,
            vendorId,
            courseId,
            courseItemId,
            vendorName,
            courseItemName,
            count,
            price,
            totalPrice,
            courseTimeDateObj,
            note
        });

        if (!newOrder) {
            return next(appError(500, '新增訂單失敗'));
        }

        handleSuccess(res, newOrder, '新增訂單成功');
    },

    // 更新訂單資料 (前台會員僅可更新後5碼)
    updateOrder: async (req, res, next) => {
        const memberId = req.user.id;
        const orderId = req.params.orderId;
        const lastFiveDigits = req.body.lastFiveDigits;

        // 檢查訂單是否存在
        const order = await Order.findOne({ _id: orderId, memberId: memberId });
        if (!order) {
            return next(appError(400, '會員無此訂單資料'));
        }

        // 更新後五碼
        const updateOrder = await Order.findOneAndUpdate({ _id: orderId, memberId: memberId }, { lastFiveDigits: lastFiveDigits }, { new: true });
        handleSuccess(res, updateOrder, '更新訂單資料成功');
    },
}

module.exports = orderController;