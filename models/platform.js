const mongoose =  require('mongoose');

const platformSchema = new mongoose.Schema({
    platformNameCn:{
        type: String,
        required: [true, 'platformNameCn 為必填']
    },
    platformNameEn:{
        type: String,
        required: [true, 'platformNameEn 為必填']
    },
    platformCompanyName:{
        type: String,
        required: [true, 'platformCompanyName 為必填']
    },
    platformLogo:{
        type: String,
        required: [true, 'platformLogo 為必填']
    },
    platformEmail:{
        type: String,
        required: [true, 'platformEmail 為必填']
    },
    platformInfo:{
        type: String,
        required: [true, 'platformInfo 為必填']
    },
    copyright:{
        type: String,
        required: [true, 'copyright 為必填']
    },
})

const Platform = mongoose.model('Platform', platformSchema);
module.exports = Platform;