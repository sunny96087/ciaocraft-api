const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");
const authController = require("../controllers/authController");
const { isAuth } = require("../utils/auth");

router.post(
    '/signup',
    handleErrorAsync(authController.signUp)
    /** 
      #swagger.tags = ['Auth-front']
      #swagger.description = '註冊會員'
    
      #swagger.parameters['member'] = {
          in: 'body',
          description: '登入資訊',
          required: true,
          schema: {
              $account: "tht@gmail.com",
              $password: "Aa123456",
              $confirmPassword: "Aa123456"
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
      #swagger.parameters['user'] = {
          in: 'body',
          description: '登入資訊',
          required: ["account", "password"],
          schema : {
            type: 'object',
            properties: {
              account: {
                type: 'string',
                description: '帳號',
                example: 'tht@gmail.com'
              },
              password: {
                    type: 'string',
                    description: '密碼',
                    example: 'Aa123456'
               } 
            }
          }
        }
    */
);
router.post(
    '/checkAccountExist',
    handleErrorAsync(authController.checkAccountExist)
    /** 
      #swagger.tags = ['Auth-front']
      #swagger.description = '檢查帳號是否已註冊'
    
      #swagger.parameters['account'] = {
          in: 'body',
          required: true,
          schema: {
              account: {
                  type: 'string',
                  description: '用戶帳號',
                  required: true
              }
          }
      }
    */
);

router.post(
    "/googleLogin",
    handleErrorAsync(authController.googleLogin)
    /** 
      #swagger.tags = ['Auth-front']
      #swagger.description = 'Google 登入'
    
      #swagger.parameters['googleToken'] = {
          in: 'body',
          required: true,
          schema: {
              googleToken: {
                  type: 'string',
                  description: 'Google 登入 token',
                  required: true
              }
          }
      }
    */
);
router.post(
    '/linkGoogleAccount',
    handleErrorAsync(authController.linkGoogleAccount)
    /** 
      #swagger.tags = ['Auth-front']
      #swagger.description = 'Google 帳號綁定'
    
      #swagger.parameters['googleToken'] = {
          in: 'body',
          required: true,
          schema: {
              googleToken: {
                  type: 'string',
                  description: 'Google 登入 token',
                  required: true
              }
          }
      }
    */
);
router.post(
    "/unlinkGoogleAccount",
    isAuth,
    handleErrorAsync(authController.unlinkGoogleAccount)
    /** 
      #swagger.tags = ['Auth-front']
      #swagger.description = 'Google 帳號解除綁定'
    */
);

module.exports = router;