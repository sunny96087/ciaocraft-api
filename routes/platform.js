const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platformController');
const handleErrorAsync = require('../utils/handleErrorAsync');

// 取得平台資訊
router.get(
    "/",
    handleErrorAsync(platformController.getPlatform)
);

// 新增平台資訊
router.post(
    "/",
    handleErrorAsync(platformController.newPlatform)
);

// 修改平台資訊
router.patch(
    "/",
    handleErrorAsync(platformController.updatePlatform)
);

module.exports = router;