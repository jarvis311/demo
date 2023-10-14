import mongoose from "mongoose";

var vehicle_model_colorSchema = new mongoose.Schema({
    php_id: Number,
    vehicle_information_id: mongoose.Schema.Types.ObjectId,
    php_vehicle_information_id: Number,
    color_name: {
        type: String,
        default: "NA"
    },
    color_code: {
        type: String,
        default: "NA"
    },
    image: {
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
        default: 0
    },
}, { timestamps: true })

const vehicle_model_color = mongoose.model('vehicle_model_color', vehicle_model_colorSchema)

export default vehicle_model_color