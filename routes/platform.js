const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platformController');
const handleErrorAsync = require('../utils/handleErrorAsync');

// 取得平台資訊
router.get(
    "/",
    handleErrorAsync(platformController.getPlatform)
    /*  #swagger.tags = ['Platforms-front']
        #swagger.summary = '取得平台資訊'
        #swagger.description = '取得平台資訊'
     */
);

// 新增平台資訊
router.post(
    "/",
    handleErrorAsync(platformController.newPlatform)
    /*  #swagger.tags = ['Platforms-manage']
        #swagger.summary = '新增平台資訊'
        #swagger.description = '新增平台資訊'
     */
);

// 修改平台資訊
router.patch(
    "/",
    handleErrorAsync(platformController.updatePlatform)
    /*  #swagger.tags = ['Platforms-manage']
        #swagger.summary = '修改平台資訊'
        #swagger.description = '修改平台資訊，欄位只需填寫要修改的部分'
    */
);

module.exports = router;