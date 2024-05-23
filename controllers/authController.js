const Member = require('../models/member');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const appError = require('../utils/appError');
const handleSuccess = require('../utils/handleSuccess');
const { generateSendJWT } = require('../utils/auth');

const authController = {
    // 註冊會員
    signUp: async (req, res, next) => {
        let { account, password, confirmPassword } = req.body;

        // 驗證必填欄位
        if (!account || !password || !confirmPassword) {
            return next(appError(400, 'account, password, confirmPassword 為必填'));
        }

        // 驗證 email 格式
        if(!validator.isEmail(account)) {
            return next(appError(400, '請輸入有效 email 格式'));
        }

        // 檢查帳號是否已存在
        const isAccountExist = await Member.findOne({ account: account });
        if (isAccountExist) {
            return next(appError(400, '此 email 已註冊'));
        }

        // 檢查密碼是否一致
        if (password !== confirmPassword) {
            return next(appError(400, '密碼不一致'));
        }

        const isValidPassword = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/.test(password);
        if(!isValidPassword) {
            return next(appError(400, '密碼需包含英文及數字，且至少 8 碼'));
        }

        password = await bcrypt.hash(password, 12);

        // 創建新會員
        const newMember = await Member.create({
            account,
            password,
        });

        if (!newMember) {
            return next(appError(500, '註冊失敗'));
        }

        generateSendJWT(newMember, 201, res, '註冊成功');
    },

    // 檢查帳號是否存在
    checkAccountExist: async (req, res, next) => {
        let { account } = req.body;
        console.log(account);

        // 驗證必填欄位
        if (!account) {
            return next(appError(400, 'account 為必填'));
        }

        // 驗證 email 格式
        if (!validator.isEmail(account)) {
            return next(appError(400, '請輸入有效 email 格式'));
        }

        // 檢查帳號是否已存在
        const isAccountExist = await Member.findOne({ account: account });
        if (isAccountExist) {
            return next(appError(400, '此 email 已註冊過會員'));
        }

        handleSuccess(res, isAccountExist, '此 email 可以使用');
    },

    login: async (req, res, next) => {
        let { account, password } = req.body;

        // 驗證必填欄位
        if (!account || !password) {
            return next(appError(400, 'account, password 為必填'));
        }

        // 檢查帳號是否存在
        const member = await Member.findOne({ account });

        if (!member) {
            return next(appError(400, '帳號錯誤'));
        }

        // 檢查密碼是否正確
        const isPasswordCorrect = await bcrypt.compare(password, member.password);
        if (!isPasswordCorrect) {
            return next(appError(400, '密碼錯誤'));
        }

        // 產生 token
        generateSendJWT(member, 200, res, '登入成功');
    },

    // google 登入
    googleLogin: async (req, res, next) => {
        // 處理 google 相關邏輯
        // 創建會員資料
        // 產生 token
    },

    // google 帳號綁定
    linkGoogleAccount: async (req, res, next) => {
        // 處理 google 相關邏輯
        // 更新會員資料
    },

    // 取消連結 Google 帳號
    unlinkGoogleAccount: async (req, res, next) => {
        const memeberId = req.user.id;

        // 清除 googleId
        const member = await Member.findByIdAndUpdate(memeberId, { googleId: null, });

        if (!member) {
            return next(appError(500, '取消連結 Google 帳號失敗'));
        }

        handleSuccess(res, member, '取消連結 Google 帳號成功');
    },

};

module.exports = authController;