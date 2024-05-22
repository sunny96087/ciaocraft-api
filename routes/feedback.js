const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");
const feedbackController = require("../controllers/feedbackController");

// 新增回饋
router.post(
    "/",
    handleErrorAsync(feedbackController.newFeedback)
);

module.exports = router;