import mongoose from "mongoose";


const BrandsSchema = new mongoose.Schema({
    php_id: Number,
    category_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    php_category_id: {
        type: Number
    },
    name: {
        type: String
    },
    headtag: {
        type: String,
        default: null
    },
    test_drive_link: {
        type: String,
        default: "NA"
    },
    is_popular: {
        type: Number,
        default: 0
    },
    title: {
        type: String,
    },
    logo: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: null
    },
    updated_at: {
        type: Date,
        default: null
    },
    deleted_at: {
        type: Date,
        default: null
    },
    deleted_by: {
        type: Number,
        default: null
    },
}, { timestamps: true })

const Brands = mongoose.model('Brands', BrandsSchema)

export default Brands