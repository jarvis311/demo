import mongoose from "mongoose";

const bodytypsSchema = new mongoose.Schema({
    php_id: Number,
    category_id: mongoose.Schema.Types.ObjectId,
    php_category_id: Number,
    name: String,
    image: String,
    status: {
        type: Number,
        default: 0
    },
    position: {
        type: String,
        default: 0
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
        type: Date,
        default: null
    },

}, { timestamps: true })

const bodytypes = mongoose.model('bodytypes', bodytypsSchema)

export default bodytypes