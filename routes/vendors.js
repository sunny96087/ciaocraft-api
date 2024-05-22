const express = require("express"); // 引入 Express 框架
const router = express.Router(); // 創建一個路由器實例
const handleErrorAsync = require("../utils/handleErrorAsync");

const vendorsController = require("../controllers/vendorsController");
const { isAuth } = require("../utils/vendorAuth");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const passport = require("passport");

// * 審核後給予賣家密碼 (Manage)
router.get(
  "/manage/:vendorId",
  handleErrorAsync(vendorsController.updateVendorManage)
  /* 	
    #swagger.tags = ['Vendors']
    #swagger.description = '審核後給予賣家密碼 (Manage)' 

    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            adminPassword: {
                type: 'string',
                description: '管理員密碼',
                required: true
            },
            password: {
                type: 'string',
                description: '新密碼',
                required: true
            },
        }
    }
  */
);

// * 寄開通信給賣家 (Manage)
router.post(
  "/sendEmail/:vendorId",
  isAuth,
  handleErrorAsync(vendorsController.sendEmailToVendor)
  /*
    #swagger.tags = ['Vendors']
    #swagger.description = '寄開通信給賣家 (Manage)' 

    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            adminPassword: {
                type: 'string',
                description: '管理員密碼',
                required: true
            },
            subject: {
                type: 'string',
                description: '主旨',
                required: true
            },
            text: {
                type: 'string',
                description: '內文',
                required: true
            },
        }
    }
  */
);

// * 取得全部賣家資料 (Manage)
router.get(
  "/manage",
  handleErrorAsync(vendorsController.getAllVendors)
  /*
    #swagger.tags = ['Vendors']
    #swagger.description = '取得全部賣家資料 (Manage)' 
  */
);

// * 登入 (Back)
router.post(
  "/login",
  handleErrorAsync(vendorsController.signIn)
  /*
    #swagger.tags = ['Vendors']
    #swagger.description = '登入 (Back)' 

    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            email: {
                type: 'string',
                description: '帳號 (電子郵件)',
                required: true
            },
            password: {
                type: 'string',
                description: '密碼',
                required: true
            },
        }
    }
  */
);

// * 取得登入賣家資料 (Back)
router.get(
  "/login",
  isAuth,
  handleErrorAsync(vendorsController.getVendor)
  /*
    #swagger.tags = ['Vendors']
    #swagger.description = '取得登入賣家資料 (Back)' 
  */
);

// * 編輯賣家資料 (Back)
router.patch(
  "/",
  isAuth,
  handleErrorAsync(vendorsController.updateVendor)
  /*
        #swagger.tags = ['Vendors']
        #swagger.description = '編輯賣家資料 (Back)' 
    
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {
                mobile: {
                    type: 'string',
                    description: '手機號碼',
                    required: true
                },
                brandName: {
                    type: 'string',
                    description: '品牌名稱',
                    required: true
                },
                avatar: {
                    type: 'string',
                    description: '品牌頭像',
                    required: true
                },
                bannerImage: {
                    type: 'string',
                    description: '品牌封面',
                    required: true
                },
                intro: {
                    type: 'string',
                    description: '品牌介紹',
                    required: true
                },
                socialMedias: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: '社群名稱',
                                required: true
                            },
                            link: {
                                type: 'string',
                                description: '連結',
                                required: true
                            }
                        }
                    }
                },
                bankName: {
                    type: 'string',
                    description: '銀行名稱',
                    required: true
                },
                bankCode: {
                    type: 'string',
                    description: '銀行代碼',
                    required: true
                },
                bankBranch: {
                    type: 'string',
                    description: '分行名稱',
                    required: true
                },
                bankAccountName: {
                    type: 'string',
                    description: '銀行戶名',
                    required: true
                },
                bankAccount: {
                    type: 'string',
                    description: '銀行帳號',
                    required: true
                },
                address: {
                    type: 'string',
                    description: '地址',
                    required: true
                },
                notice: {
                    type: 'string',
                    description: '公告',
                    required: true
                }
            }
        }
    */
);

// * 修改密碼 (Back)
router.patch(
  "/password",
  isAuth,
  handleErrorAsync(vendorsController.updatePassword)
  /*
    #swagger.tags = ['Vendors']
    #swagger.description = '修改密碼 (Back)' 

    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            oldPassword: {
                type: 'string',
                description: '舊密碼',
                required: true
            },
            newPassword: {
                type: 'string',
                description: '新密碼',
                required: true
            }
        }
    }
  */
);

// * 新增賣家申請 (Front)
router.post(
  "/",
  handleErrorAsync(vendorsController.newVendorReview)
  /*
    #swagger.tags = ['Vendors']
    #swagger.description = '新增賣家申請 (Front)' 

    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            representative: {
                type: 'string',
                description: '申請人名稱',
                required: true
            },
            account: {
                type: 'string',
                description: '帳號(電子郵件)',
                required: true
            },
            mobile: {
                type: 'string',
                description: '手機號碼',
                required: true
            },
            brandName: {
                type: 'string',
                description: '品牌名稱',
                required: true
            },
            reviewLinks: {
                type: 'array',
                items: {
                    type: 'string'
                }
            },
            reviewBrief: {
                type: 'string',
                description: '審核用簡介',
            },
            reviewImages: {
                type: 'array',
                items: {
                    type: 'string'
                }
            },
        }
    }
    */
);

// * 確認賣家帳號是否重複 (Front)
router.get(
  "/checkAccount/:account",
  handleErrorAsync(vendorsController.checkVendorAccount)
  /*
    #swagger.tags = ['Vendors']
    #swagger.description = '確認賣家帳號是否重複 (Front)' 
  */
);

// * 取得單筆賣家綜合資料 (需計算學員數、全部課程、師資) (Front)
router.get(
  "/:vendorId",
  handleErrorAsync(vendorsController.getVendor)
  /*
    #swagger.tags = ['Vendors']
    #swagger.description = '取得單筆賣家綜合資料 (需計算學員數、全部課程、師資) (Front)' 
  */
);