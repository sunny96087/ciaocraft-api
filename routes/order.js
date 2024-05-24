const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");
const orderController = require("../controllers/orderController");
const { isAuth } = require("../utils/auth");
const { isVendorAuth } = require("../utils/vendorAuth");

// 取得單一訂單資料
router.get(
    "/:orderId",
    isAuth,
    handleErrorAsync(orderController.getOrder)
);

// 新增訂單
router.post(
    "/",
    isAuth,
    handleErrorAsync(orderController.newOrder)
);

// 更新訂單資料 (前台會員僅可更新後5碼)
router.patch(
    "/:orderId",
    isAuth,
    handleErrorAsync(orderController.updateOrder)
);

module.exports = router;