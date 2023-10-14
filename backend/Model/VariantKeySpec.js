import mongoose from "mongoose";

var VariantKeySpec = new mongoose.Schema({
    php_id: {
        type: Number,
        default: 0,
    },
    vehicle_information_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    variant_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    specification_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    php_vehicle_information_id: {
        type: Number,
    },
    php_variant_id: {
        type: Number,
    },
    php_specification_id: {
        type: Number,
    },
    name: {
        type: String,
        default: "NA"
    },
    value: {
        type: String,
        default: "NULL"
    },
    is_specification: {
        type: Number,
        default: 0
    },
    is_feature: {
        type: Number,
        default: 0
    },
    variant_key_id: {
        // type: Number,
        type: mongoose.Schema.Types.ObjectId,
    },
    php_variant_key_id: {
        type: Number,
        default: 0
    },

    is_update: {
        type: Number,
        default: 0
    },
    show_key_feature: {
        type: Number,
        default: 0
    },
    show_overview: {
        type: Number,
        default: 0
    },
    is_scraping: {
        type: Number,
        default: 0
    },
    created_at:{
        type:Date,
        default:null
    },
    updated_at:{
        type:Date,
        default:null
    },
    created_at:{
        type:Date,
        default:null
    },
    updated_at:{
        type:Date,
        default:null
    },
    createdAt: {
        type: Date,
        default:null
    },
    updatedAt: {
        type: Date,
        default:null
    },
}, { timestamps: true })

// var inc = 1
// VariantKeySpec.pre('save', async function (next) {
//     try {
//         const maxPhpId = await this.constructor.findOne({}, { php_id: 1 }, { sort: { php_id: -1 } });
//         console.log("saceedfjlsdjfsklh", inc++)

//         // Increment php_id by 1
//         this.php_id = maxPhpId ? maxPhpId.php_id + 1 : 1;
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

var VariantKey = mongoose.model('Variant_key_specs', VariantKeySpec)
export default VariantKey 