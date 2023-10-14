import mongoose from "mongoose";

var vehicle_model_imageSchema = new mongoose.Schema({
    vehicle_information_id,
    image,
    title,
    video,
    variant_id,
    official_image
})

const vehicle_model_image = mongoose.model('vehicle_model_image', vehicle_model_imageSchema)

export default vehicle_model_image