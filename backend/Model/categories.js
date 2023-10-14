import mongoose from "mongoose";
const cataroiesSchema = new mongoose.Schema({
    // php_id: Number,
    php_id: Number,
    category_name: String,
    status: { type: Number, default: 1 },
    thumb_image: String,
    updated_at: {
        type: Date,
        default: null
    },
    created_at: {
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
    }
}, { timestamps: true })

const Cataroies = mongoose.model('Cataroies', cataroiesSchema)

export default Cataroies