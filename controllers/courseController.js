const {Course} = require("../models/course");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess");

const courseController = {
    // 取得課程列表
    getCourses: async (req, res, next) => {
        const courses = await Course.find();
        handleSuccess(res, courses, "取得課程列表成功");
    },
};

module.exports = courseController;