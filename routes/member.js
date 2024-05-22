const express = require('express');
const router = express.Router();
const { isAuth } = require("../utils/auth");
const memberController = require('../controllers/memberController');
const handleErrorAsync = require('../utils/handleErrorAsync');

// 取得單筆會員資料
router.get(
    "/memberOne",
    isAuth,
    handleErrorAsync(memberController.getMember)
);

// 取得會員收藏
router.get(
    "/collections",
    isAuth,
    handleErrorAsync(memberController.getMemberCollections)
);

// 取得會員訂單
router.get(
    "/orders",
    isAuth,
    handleErrorAsync(memberController.getMemberOrders)
);

// 修改會員資料
router.patch(
    "/memberOne",
    isAuth,
    handleErrorAsync(memberController.updateMember)
);

// 修改會員密碼
router.put(
    "/password",
    isAuth,
    handleErrorAsync(memberController.updatePassword)
);

module.exports = router;