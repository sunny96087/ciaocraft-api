const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");

const authController = require("../controllers/authController");

const { isAuth } = require("../utils/auth");

router.post(
    '/signup',
    handleErrorAsync(authController.signUp)
    /** 
      #swagger.tags = ['Auth']
      #swagger.description = '註冊會員'
    
      #swagger.parameters['member'] = {
          in: 'body',
          required: true,
          schema: {
              account: {
                  type: 'string',
                  description: '用戶帳號',
                  required: true
              },
              password: {
                  type: 'string',
                  description: '用戶密碼',
                  required: true
              },
              confirmPassword: {
                  type: 'string',
                  description: '確認密碼',
                  required: true
              }
          }
      }
    */
);
router.post(
    '/signin',
    handleErrorAsync(authController.login)
    /** 
      #swagger.tags = ['Auth']
      #swagger.description = '登入'
    
      #swagger.parameters['user'] = {
          in: 'body',
          required: true,
          schema: {
              account: {
                  type: 'string',
                  description: '用戶帳號',
                  required: true
              },
              password: {
                  type: 'string',
                  description: '用戶密碼',
                  required: true
              }
          }
      }
    */
);
router.post(
    '/checkAccountExist',
    handleErrorAsync(authController.checkAccountExist)
    /** 
      #swagger.tags = ['Auth']
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

module.exports = router;