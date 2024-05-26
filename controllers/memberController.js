const Member = require("../models/member");
const Collection = require("../models/collection");
const Order = require("../models/order");
const validator = require("validator");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess");

const memberController = {
    // 取得所有會員資料 (開發方便查詢用)
    getAllMembers: async (req, res, next) => {
        const members = await Member.find();
        handleSuccess(res, members, "取得所有會員資料成功");
    },

    // 取得單筆會員資料
    getMember: async (req, res, next) => {
        const memberId = req.user.id;

        // 取得會員資料
        const member = await Member.findById(memberId)
            .select("nickname name gender birthday phone interests point");

        // 取得 收藏 總數
        const collections = await Collection.find({ memberId: memberId });
        member.totalCollections = collections.length;

        // 取得 上過的課程 總數 (不重複)
        const courses = await Order.find({ memberId: memberId, status:1 }).distinct("courseId");
        member.totalCourses = courses.length;

        handleSuccess(res, member, "取得會員資料成功");
    },

    // 取得會員收藏
    getMemberCollections: async (req, res, next) => {
        const memberId = req.user.id;

        // 取得會員收藏
        const collections = await Collection.find({ memberId: memberId }).populate("courseId").sort({ createdAt: -1 });

        handleSuccess(res, collections, "取得會員收藏成功");
    },

    // 取得會員訂單
    getMemberOrders: async (req, res, next) => {
        const memberId = req.user.id;
        const { status } = req.query;

        // 查詢條件
        const queryField = { memberId: memberId };
        if (status) {
            queryField.status = status;
        }

        // 取得會員訂單
        const orders = await Order.find(queryField)
            .populate("courseId")
            .sort({ createdAt: -1 });
        handleSuccess(res, orders, "取得會員訂單成功");
    },

    // 修改會員資料
    updateMember: async (req, res, next) => {
        const memberId = req.user.id;
        const { nickname, interests, name, gender, birthday, phone, photo, point } = req.body;

        // 更新物件
        const updateFields = {};

        if (nickname) { updateFields.nickname = nickname; }
        if (interests) { updateFields.interests = interests; }
        if (name) { updateFields.name = name; }
        if (phone) { updateFields.phone = phone; }
        if (photo) { updateFields.photo = photo; }
        if (Number.isInteger(point) && point >= 0) {
            updateFields.point = point;
        }
        else{
            return next(appError(400, 'point 須為正整數'));
        }

        // 驗證 gender 值
        if (gender) {
            if (!["male", "female", "other"].includes(gender)) {
                return next(appError(400, 'gender 須為 male, female 或 other'));
            }
            updateFields.gender = gender;
        }

        // 驗證 birthday 和轉換 Date 物件
        if (birthday) {
            const isValidDateStr = Date.parse(birthday);
            if (!isValidDateStr) {
                return next(appError(400, 'birthday 格式錯誤'));
            }
            const birthdayDateObj = new Date(birthday);
            updateFields.birthday = birthdayDateObj;
        }

        // 更新會員資料
        const updateMember = await Member.findByIdAndUpdate(
            memberId,
            updateFields,
            { new: true, runValidators: true }
        ).select("nickname name gender birthday phone interests point photo");

        if (!updateMember) {
            return next(appError(404, "找不到會員資料，更新失敗"));
        }

        handleSuccess(res, updateMember, "更新會員資料成功");
    },

    // 修改會員密碼
    updatePassword: async (req, res, next) => {
        const memberId = req.user.id;
        let { newPassword, confirmNewPassword } = req.body;

        // 驗證必填欄位
        if (!newPassword || !confirmNewPassword) {
            return next(appError(400, "newPassword, confirmNewPassword 為必填"));
        }

        // 檢查密碼是否一致
        if (newPassword !== confirmNewPassword) {
            return next(appError(400, "新密碼不一致"));
        }

        // 驗證密碼格式
        const isValidPassword = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/.test(password);
        if (!isValidPassword) {
            return next(appError(400, '密碼需包含英文及數字，且至少 8 碼'));
        }

        // 更新密碼
        newPassword = await bcrypt.hash(newPassword, 12);
        const updatePassword = await Member.findByIdAndUpdate(memberId, { password: newPassword }, { new: true })

        if (!updateMember) {
            return next(appError(404, "找不到會員資料，更新失敗"));
        }

        handleSuccess(res, null, "更新會員密碼成功");
    }
};

module.exports = memberController;