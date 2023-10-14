import mongoose from "mongoose";

var vehicle_informationSchema = new mongoose.Schema(
  {
    php_id: {
      type: Number,
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    bodytype_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    category_php_id: {
      type: Number,
    },
    brand_php_id: {
      type: Number,
    },
    php_bodytype_id: {
      type: Number,
      default: 0,
    },
    model_name: {
      type: String,
      default: "NA",
    },
    fuel_type: {
      type: String,
      default: "NA",
    },
    avg_rating: {
      type: Number,
      default: "0.00",
    },
    review_count: {
      type: Number,
      default: 0,
    },
    variant_name: {
      type: String,
      default: "NA",
    },
    min_price: {
      type: String,
      default: 0,
    },
    max_price: {
      type: String,
      default: 0,
    },
    price_range: {
      type: String,
      default: "NA",
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      default: "NA",
    },
    is_designer: {
      type: Number,
      default: 0,
    },
    launched_at: {
      type: String,
      default: null,
    },
    Launch_date: {
      type: String,
      default: null,
    },
    model_popularity: {
      type: String,
      default: 0,
    },
    mileage: {
      type: String,
      default: "NA",
    },
    engine: {
      type: String,
      default: "NA",
    },
    style_type: {
      type: String,
      default: "NA",
    },
    max_power: {
      type: String,
      default: "NA",
    },
    showroom_price: {
      type: String,
      default: 0,
    },
    on_road_price: {
      type: String,
      default: 0,
    },
    is_popular_search: {
      type: Number,
      default: 0,
    },
    is_upcoming: {
      type: Number,
      default: 0,
    },
    is_latest: {
      type: Number,
      default: 0,
    },
    price_desc: {
      type: String,
      default: null,
    },
    highlights_desc: {
      type: String,
      default: null,
    },
    key_specs: {
      type: String,
      default: null,
    },
    manufacturer_desc: {
      type: String,
      default: null,
    },
    body_type: {
      type: String,
      default: "NA",
    },
    is_most_search: {
      type: String,
      default: "NA",
    },
    expired_date: {
      type: String,
    },
    start_date: {
      type: String,
    },
    rating: {
      type: String,
      default: 0,
    },
    link: {
      type: String,
      default: null,
    },
    rto_price: {
      type: Number,
      default: 0,
    },
    insurance_price: {
      type: Number,
      default: 0,
    },
    other_price: {
      type: Number,
      default: 0,
    },
    is_new: {
      type: Number,
      default: 0,
    },
    is_content_writer: {
      type: Number,
      default: 0,
    },
    search_count: {
      type: Number,
      default: 0,
    },
    popular_count: {
      type: Number,
      default: 0,
    },
    is_recommended: {
      type: Number,
      default: 0,
    },
    headtag: {
      type: String,
      default: null,
    },
    created_at: {
      type: Date,
      default: null,
    },
    updated_at: {
      type: Date,
      default: null,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
    deleted_by: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const vehicle_information = mongoose.model(
  "vehicle_information",
  vehicle_informationSchema
);

export default vehicle_information;
