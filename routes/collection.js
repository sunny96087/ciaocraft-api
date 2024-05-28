const express = require("express");
const router = express.Router();
const handleErrorAsync = require("../utils/handleErrorAsync");
const collectionController = require("../controllers/collectionsController");

// 新增收藏
router.post(
    "/",
    handleErrorAsync(collectionController.newCollection)
    /* #swagger.tags = ['Collections-front']
       #swagger.description = '新增收藏'
       #swagger.parameters['collection'] = {
           in: 'body',
           required: true,
           schema: {
               courseId: { 
                   type: 'string',
                   description: '課程 ID',
                   required: true
               }
           }
       }
    
    */
);

// 刪除收藏
router.delete(
    "/:collectionId",
    handleErrorAsync(collectionController.deleteCollection)
    /* #swagger.tags = ['Collections-front']
       #swagger.description = '刪除收藏'
       #swagger.parameters['collectionId'] = {
           in: 'path',
           required: true,
           type: 'string'
       }
    */
);

module.exports = router;