const Member = require("../models/member");
const Collection = require("../models/collection");
const Order = require("../models/order");
const Course = require("../models/course");
const validator = require("validator");
const tools = require("../utils/tools");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess");

const memberController = {
    // 取得所有會員資料 (開發方便查詢用)
    getAllMembers: async (req, res, next) => {
        // 驗證管理員密碼
        const adminPassword = req.body.adminPassword;
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return next(appError(401, "管理員密碼錯誤"));
        }

        const members = await Member.find();
        handleSuccess(res, members, "取得所有會員資料成功");
    },

    // 取得單筆會員資料
    getMember: async (req, res, next) => {
        const memberId = req.user.id;

        // 取得會員資料
        const member = await Member.findById(memberId)
            .select("nickname name gender birthday phone interests point");

        // 取得 收藏 總數 (只含上架課程)
        const collections = await Collection
            .find({ memberId: memberId, status: 1 });

        member.totalCollections = collections.length;
        
        // 取得 上過的課程 總數 (只包含 3:已完課 不重複)
        const courses = await Order
            .find({ memberId: memberId, status: 3 })
            .distinct("courseId");

        member.totalCourses = courses.length;

        handleSuccess(res, member, "取得會員資料成功");
    },

    // 取得會員收藏
    getMemberCollections: async (req, res, next) => {
        const memberId = req.user.id;
        const courseTerm = req.query.courseTerm;

        // 查詢條件
        let queryField = { memberId: memberId };

        // 加入課程時長條件
        if (courseTerm) {
            queryField.courseTerm = courseTerm;
        }

        // 取得會員收藏
        const collections = await Collection
            .find(queryField)
            .populate("courseId")
            .sort({ createdAt: -1 }
            );

        handleSuccess(res, collections, "取得會員收藏成功");
    },

    // 新增會員收藏
    newMemberCollections: async (req, res, next) => {
        const memberId = req.user.id;
        const { courseId } = req.body;

        // 驗證必填欄位
        if (!courseId) {
            return next(appError(400, "courseId 為必填"));
        }

        // 驗證 courseId 格式和是否存在
        const isValidCourseId = await tools.findModelByIdNext(Course, courseId, next);
        if (!isValidCourseId) {
            return;
        }

        // 驗證是否已收藏
        const isCollectionExist = await Collection.findOne({ memberId: memberId, courseId: courseId });
        if (isCollectionExist) {
            return next(appError(400, "已收藏過該課程"));
        }

        // 新增收藏
        const newCollection = await Collection.create({ memberId: memberId, courseId: courseId });
        if (!newCollection) {
            return next(appError(400, "新增收藏失敗"));
        }

        handleSuccess(res, newCollection, "新增收藏成功");
    },

    // 刪除會員收藏
    deleteMemberCollections: async (req, res, next) => {
        const memberId = req.user.id;
        const collectionId = req.params.collectionId;

        // 驗證 collectionId 格式和是否存在
        const isValidCollectionId = await tools.findModelByIdNext(Collection, collectionId, next);
        if (!isValidCollectionId) {
            return;
        }

        // 檢查收藏是否為會員所有
        const isCollectionExist = await Collection.findOne({ _id: collectionId, memberId: memberId });
        if (!isCollectionExist) {
            return next(appError(400, "會員無此收藏"));
        }

        // 刪除收藏
        const deleteCollection = await Collection.findByIdAndDelete(collectionId);
        if (!deleteCollection) {
            return next(appError(400, "刪除收藏失敗"));
        }

        handleSuccess(res, deleteCollection, "刪除收藏成功");
    },

    // 取得會員訂單
    getMemberOrders: async (req, res, next) => {
        const memberId = req.user.id;
        const { paidStatus, courseTerm, createAt } = req.query;

        // 查詢條件
        const queryField = { memberId: memberId };
        
        // 加入訂單狀態條件
        if (paidStatus) {
            // 驗證paidStatus值
            if (!["0","1","2","3","4","5","6"].includes(paidStatus)) {
                return next(appError(400, 'paidStatus 須為 0, 1, 2, 3, 4, 5, 6'));
            }
            queryField.paidStatus = paidStatus;
        }

        // 加入課程時長條件
        if (courseTerm) {
            if(!["0","1".includes(courseTerm)]) {
                return next(appError(400, 'courseTerm 須為 0:體驗課程 或 1:培訓課程'));
            }
            queryField.courseTerm = courseTerm;
        }

        // 加入排序條件。預設為創建日期新到舊
        const sortByCreateAt = createAt === "asc" ? 1 : -1;

        const orders = await Order
            .find(queryField)
            .populate("courseId")
            .sort({ createdAt: sortByCreateAt });

        handleSuccess(res, orders, "取得會員訂單成功");
    },

    // 修改會員資料
    updateMember: async (req, res, next) => {
        const memberId = req.user.id;
        const { nickname, interests, name, gender, birthday, phone, photo, point } = req.body;

        // 更新物件
        const updateFields = {};

        if (nickname) { updateFields.nickname = nickname; }
        if (interests) { updateFields.interests = interests; } // 由 shcema 驗證格式 
        if (name) { updateFields.name = name; }
        if (phone) { updateFields.phone = phone; }
        if (photo) { updateFields.photo = photo; }
        
        // 驗證 point 值需為正整數
        if (Number.isInteger(point) && point >= 0) {
            updateFields.point = point;
        }
        else {
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