import mongoose from "mongoose";

const VariantSpecificationSchema = new mongoose.Schema({
    php_id: {
        type: Number,
        default: 0
    },
    name: {
        type:String,
    },
    created_at: {
        type:Date,
        default:null
    },
    updated_at: {
        type:Date,
        default:null
    },
})
var VariantSpecification = mongoose.model('Variant_specifications', VariantSpecificationSchema)

export default VariantSpecification