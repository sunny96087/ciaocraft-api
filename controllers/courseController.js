const Vendor = require("../models/vendor");
const { Course, CourseItem, CourseComment } = require("../models/course");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess");
const { isAuth, generateSendJWT } = require("../utils/auth");
const tools = require("../utils/tools");

const courseController = {
    // 取得課程列表 (Front)
    getCourses: async (req, res, next) => {
        const courses = await Course.find();
        handleSuccess(res, courses, "取得課程列表成功");
    },
};

module.exports = courseController;