const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");
const authController = require("../controllers/authController");
const { isAuth } = require("../utils/auth");

router.post(
  '/signup',
  handleErrorAsync(authController.signUp)
  /*
    #swagger.tags = ['Auth-front']
    #swagger.summary = '註冊'
    #swagger.description = '註冊會員'
    #swagger.parameters['body'] = {
        in: 'body',
        description: '登入資訊',
        required: true,
        schema: {
            $account: "tht@gmail.com",
            $password: "Aa123456@",
            $confirmPassword: "Aa123456@"
          }
      }
  */
);
router.post(
  '/signin',
  handleErrorAsync(authController.login)
  /*
    #swagger.tags = ['Auth-front']
    #swagger.summary = '登入'
    #swagger.description = '登入會員，填入帳號密碼'
    #swagger.parameters['body'] = {
      in: 'body',
      description: '登入資訊',
      schema: {
        $account: "tht@gmail.com",
        $password: "Aa123456@",
      }
    }
  */
);
router.post(
  '/checkAccountExist',
  handleErrorAsync(authController.checkAccountExist)
  /*
    #swagger.tags = ['Auth-front']
    #swagger.summary = '檢查帳號是否已註冊'
    #swagger.description = '檢查帳號是否已註冊'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema : {
        $account: 'tht@gmail.com'
      }
    }
  */
);

router.post(
  '/forgotPassword',
  handleErrorAsync(authController.sendResetPwdEmail)
  /*
    #swagger.tags = ['Auth-front']
    #swagger.summary = '忘記密碼'
    #swagger.description = '忘記密碼，發送重設密碼信至會員信箱，測試要收到信要帶真實信箱'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $account: 'think242729@gmail.com'
      }
    }
  */
)

router.post(
  "/resetPassword",
  handleErrorAsync(authController.resetPassword)
  /*
    #swagger.tags = ['Auth-front']
    #swagger.summary = '重設密碼'
    #swagger.description = '重設密碼'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        $token: "重設密碼 token",
        $password: "Aa123456@",
        $confirmPassword: "Aa123456@"
      }
    }
  */
)

router.post(
  "/googleLogin",
  handleErrorAsync(authController.googleLogin)
  /** 
    #swagger.tags = ['Auth-front']
    #swagger.summary = 'Google 登入'
    #swagger.description = 'Google 登入'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
          googleToken: ""
      }
    }
  */
);

router.post(
  '/linkGoogleAccount',
  handleErrorAsync(authController.linkGoogleAccount)
  /*
    #swagger.tags = ['Auth-front']
    #swagger.summary = 'Google 帳號綁定'
    #swagger.description = 'Google 帳號綁定'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        googleToken: 'Google 登入 token'
      }
    }
  */
);

router.post(
  "/unlinkGoogleAccount",
  isAuth,
  handleErrorAsync(authController.unlinkGoogleAccount)
  /*
    #swagger.tags = ['Auth-front']
    #swagger.summary = 'Google 帳號解除綁定'
    #swagger.description = 'Google 帳號解除綁定'
  */
);

module.exports = router;