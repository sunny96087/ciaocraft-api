const express= require('express');
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");
const { isAuth } = require("../utils/auth");
const courseController = require('../controllers/courseController');

router.get('/', handleErrorAsync(courseController.getCourses));

module.exports = router;