import mongoose from "mongoose";


var PriceVariant_schema = new mongoose.Schema({
    php_id: Number,
    vehicle_information_id: mongoose.Schema.Types.ObjectId,
    php_vehicle_information_id: {
        type: Number,
    },
    name: String,
    link: {
        type: String,
        default: "NULL"
    },
    engine: {
        type: String,
        default: "NA"
    },
    price: {
        type: String,
        default: "NA"
    },
    price_range: {
        type: String,
        default: "NA"
    },
    status: {
        type: String,
        default: "NULL"
    },
    image: {
        type: String,
        default: "NULL"
    },
    fuel_type: {
        type: String,
        default: "NULL"
    },
    ex_show_room_rice: {
        type: Number,
        default: 0
    },
    mileage: {
        type: Number,
        default: 0
    },
    on_road_price: {
        type: String,
        default: "0"
    },
    latest_update: {
        type: String,
        default: "NULL"
    },
    price_range: {
        type: String,
        default: "NULL"
    },
    insurance_price: {
        type: Number,
        default: 0
    },
    rto_price: {
        type: String,
        default: 0
    },
    other_price: {
        type: Number,
        default: 0
    },
    review_count: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    launched_at: {
        type: String,
        default: "NULL"
    },
    is_scrapping: {
        type: Number,
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
        type: Number,
        default: 0
    },
}, { timestamps: true })


const PriceVariant = mongoose.model('vehicle_price_variant', PriceVariant_schema)


export default PriceVariant