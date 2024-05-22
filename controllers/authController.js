const days = require('dayjs');
const tools = require('../utils/tools');
const bcrypt = require('bcryptjs');
const appError = require('../utils/appError');
const handleSuccess = require('../utils/handleSuccess');
const Member = require('../models/member');
const { generateSendJWT } = require('../utils/auth');

const authController = {
    // 註冊會員
    signUp: async (req, res, next) => {
        let { account, password, confirmPassword } = req.body;

        if (!account || !password || !confirmPassword) {
            return next(appError(400, 'account, password, confirmPassword 為必填'));
        }

        // 檢查帳號是否已存在
        const isAccountExist = await Member.findOne({ account });

        if (isAccountExist) {
            return next(appError(400, '此 email 已註冊'));
        }

        // 檢查密碼是否一致
        if (password !== confirmPassword) {
            return next(appError(400, '密碼不一致'));
        }

        password = await bcrypt.hash(password, 12);

        // 創建新會員
        const newMember = await Member.create({
            account,
            password,
        });

        if (newMember) {
            generateSendJWT(newMember, 201, res, '註冊成功');
        }
    },

    // 檢查帳號是否存在
    checkAccountExist: async (req, res, next) => {
        let { account } = req.body;

        if (!account) {
            return next(appError(400, 'account 為必填'));
        }

        const isAccountExist = await Member.findOne({ account });

        if (isAccountExist) {
            return next(appError(400, '此 email 已註冊過會員'));
        }

        handleSuccess(res, isAccountExist, '此 email 可以使用');
    },

    login: async (req, res, next) => {
        let { account, password } = req.body;

        if (!account || !password) {
            return next(appError(400, '請輸入帳號密碼'));
        }

        // 檢查帳號是否存在
        const member = await Member.findOne({ account });

        if (!member) {
            return next(appError(400, '帳號錯誤'));
        }

        console.log(member.password)
        console.log(password)

        // 檢查密碼是否正確
        const isPasswordCorrect = await bcrypt.compare(password, member.password);

        if (!isPasswordCorrect) {
            return next(appError(400, '密碼錯誤'));
        }

        // 產生 token
        generateSendJWT(member, 200, res, '登入成功');
    }
};

module.exports = authController;