const express = require("express"); // 引入 Express 框架
const router = express.Router(); // 創建一個路由器實例
const handleErrorAsync = require("../utils/handleErrorAsync");

const teacherController = require("../controllers/teacherController");
const { isAuth } = require("../utils/vendorAuth");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const passport = require("passport");

// * 取得單筆老師資料 (Front)
router.get("/:teacherId", handleErrorAsync(teacherController.getTeacher));

// * 取得所有老師 (Back)
router.get(
  "/admin/all",
  isAuth,
  handleErrorAsync(teacherController.getAdminTeachers)
);

// * 取得單筆老師資料 (Back)
router.get(
  "/admin/:teacherId",
  isAuth,
  handleErrorAsync(teacherController.getAdminTeacher)
);

// * 新增老師 (Back)
router.post("/", isAuth, handleErrorAsync(teacherController.newTeacher));

// * 刪除老師 (偽刪除) (Back)
// * 編輯老師 (Back)


module.exports = router;
