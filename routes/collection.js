const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");
const collectionController = require("../controllers/collectionsController");

// 新增收藏
router.post(
    "/",
    handleErrorAsync(collectionController.newCollection)
);

// 刪除收藏
router.delete(
    "/:collectionId",
    handleErrorAsync(collectionController.deleteCollection)
);

module.exports = router;