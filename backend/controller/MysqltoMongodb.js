
// import con from "../connecttion/mysqlconn.js"
import '../connecttion/conn.js'
import bodytypes from "../Model/BodyType.js"
import vehicle_model_color from "../Model/VehicleModelColor.js"
import Cataroies from "../Model/categories.js"
import Brands from "../Model/Brands.js"
import VariantSpecification from "../Model/VariantSpecification.js"
import vehicle_information from "../Model/VehicleInformation.js"
import VariantKey from "../Model/VariantKeySpec.js"
import PriceVariant from "../Model/priceVariant.js"
import keyspecificationModel from "../Model/keyspecification.js"
import { VehicleInformationTable } from '../Model/MySqlModel/vehicleInformation.js'

const categories = async (req, res) => {
    try {
        const result = await con.query("SELECT * FROM `categories`")
        const data = result[0]
        for (const val of data) {
            const ifExistDoc = await Cataroies.findOne({ category_name: val.category_name })
            if (!ifExistDoc) {
                const data = Cataroies({
                    php_id: val.id,
                    category_name: val.category_name,
                    status: val.status,
                    thumb_image: val.thumb_image,
                })
                var dd = await data.save()
            }
        }
        res.send("Categories Added!!!")
    } catch (err) {
        console.log(err);
    }
}

const brands = async (req, res) => {
    try {
        const result = await con.query("SELECT * FROM `brands` WHERE `deleted_at` IS NULL")
        const data = result[0]

        for (const val of data) {
            const ifExistDoc = await Brands.findOne({ name: val.name })
            if (!ifExistDoc) {
                const data = Brands({
                    php_id: val.id,
                    category_id: val.category_id,
                    name: val.name,
                    headtag: val.headtag,
                    test_drive_link: val.test_drive_link,
                    is_popular: val.is_popular,
                    title: val.title,
                    logo: val.logo,
                    // createdAt: val.created_at,
                    updatedAt: val.updated_at,
                })
                var dd = await data.save()
            }

        }
        res.send("Brand Insreted!!!!")
    } catch (err) {
        console.log(err);
    }

}

const bodytype = async (req, res) => {
    try {
        const result = await con.query("SELECT * FROM `bodytypes` WHERE `deleted_at` IS NULL")
        const data = result[0]

        for (const val of data) {
            const ifExistDoc = await bodytypes.findOne({ name: val.name })
            if (!ifExistDoc) {
                const data = bodytypes({
                    php_id: val.id,
                    category_id: val.category_id,
                    name: val.name,
                    image: val.image,
                    status: val.status,
                    position: val.position,
                    // createdAt: val.created_at,
                    updatedAt: val.updated_at,
                })
                var dd = await data.save()
            }
        }
        res.send("Body type inserted!!!")
    } catch (err) {
        console.log(err);
    }

}
const keyspecification = async (req, res) => {
    try {
        const result = await con.query("SELECT * FROM `keyspecification` WHERE `deleted_at` IS NULL")
        const data = result[0]

        for (const val of data) {
            const ifExistDoc = await keyspecificationModel.findOne({ name: val.name })
            if (!ifExistDoc) {
                const data = keyspecificationModel({
                    php_id: val.id,
                    name: val.name,
                    icon: val.icon,
                    deleted_by: val.deleted_by,
                    deleted_at: val.deleted_at,
                    // createdAt: val.created_at,
                    updatedAt: val.updated_at,
                })
                var dd = await data.save()
            }
        }
        res.send("Keyspecification inserted!!!")
    } catch (err) {
        console.log(err);
    }

}

const vehicalcolor = async (req, res) => {
    try {
        con.query("SELECT * FROM `vehicle_model_color` WHERE `deleted_at` IS NULL", (err, result, fileds) => {
            if (err) throw err
            result.map(async (val) => {
                const data = vehicle_model_color({
                    id: val.id,
                    category_id: val.category_id,
                    vehicle_information_id: val.vehicle_information_id,
                    color_name: val.color_name,
                    color_code: val.color_code,
                    image: val.image,
                    // createdAt: val.created_at,
                    updatedAt: val.updated_at,
                })
                var dd = await data.save()
            })
            res.send(result)
        })
    } catch (err) {
        console.log(err);
    }

}

const variant_specifications = async (req, res) => {
    try {
        con.query("SELECT * FROM `variant_key_specs`", (err, result, fileds) => {
            if (err) throw err
            result.map(async (val) => {
                const data = VariantSpecification({
                    id: val.id,
                    name: val.name,
                    // createdAt: val.created_at,
                    updatedAt: val.updated_at,
                })
                var dd = await data.save()
            })
            res.send(result)
        })
    } catch (err) {
        console.log(err);
    }

}

const vehicle_informations = async (req, res) => {
    try {
        con.query("SELECT * FROM `vehicle_information` WHERE `id` = 79", (err, result, fileds) => {
            if (err) throw err
            result.map(async (val) => {
                const data = vehicle_information({
                    id: val.id,
                    brand_id: val.brand_id,
                    category_id: val.category_id,
                    model_name: val.model_name,
                    fuel_type: val.fuel_type,
                    avg_rating: val.avg_rating,
                    review_count: val.review_count,
                    variant_name: val.variant_name,
                    min_price: val.min_price,
                    max_price: val.max_price,
                    price_range: val.price_range,
                    image: val.image,
                    status: val.status,
                    launched_at: val.launched_at,
                    Launch_date: val.Launch_date,
                    model_popularity: val.model_popularity,
                    mileage: val.mileage,
                    engine: val.engine,
                    style_type: val.style_type,
                    max_power: val.max_power,
                    showroom_price: val.showroom_price,
                    on_road_price: val.on_road_price,
                    is_popular_search: val.is_popular_search,
                    is_upcoming: val.is_upcoming,
                    is_latest: val.is_latest,
                    price_desc: val.price_desc,
                    highlights_desc: val.highlights_desc,
                    key_specs: val.key_specs,
                    manufacturer_desc: val.manufacturer_desc,
                    body_type: val.body_type,
                    is_most_search: val.is_most_search,
                    expired_date: val.expired_date,
                    start_date: val.start_date,
                    rating: val.rating,
                    link: val.link,
                    rto_price: val.rto_price,
                    insurance_price: val.insurance_price,
                    other_price: val.other_price,
                    is_new: val.is_new,
                    bodytype_id: val.bodytype_id,
                    is_content_writer: val.is_content_writer,
                    // createdAt: val.created_at,
                    updatedAt: val.updated_at,
                })
                var dd = await data.save()
            })
            res.send(result)
        })
    } catch (err) {
        console.log(err);
    }
}

const variant_key_specs = async (req, res) => {
    try {
        con.query("SELECT * FROM `variant_key_specs` WHERE `vehicle_information_id` = 2", (err, result, fileds) => {
            if (err) throw err
            result.map(async (val) => {
                const data = VariantKey({
                    id: val.id,
                    vehicle_information_id: val.vehicle_information_id,
                    variant_id: val.variant_id,
                    specification_id: val.specification_id,
                    name: val.name,
                    value: val.value,
                    is_specification: val.is_specification,
                    is_feature: val.is_feature,
                    variant_key_id: val.variant_key_id,
                    is_update: val.is_update,
                    show_key_feature: val.show_key_feature,
                    show_overview: val.show_overview,
                    is_scraping: val.is_scraping,
                    // createdAt: val.created_at,
                    updatedAt: val.updated_at,
                })
                var dd = await data.save()
            })
            res.send(result)
        })
    } catch (err) {
        console.log(err);
    }
}

const price_variants = async (req, res) => {
    try {
        con.query("SELECT * FROM `vehicle_price_variant` WHERE `vehicle_information_id` = 79", (err, result, fileds) => {
            if (err) throw err
            result.map(async (val) => {
                const data = PriceVariant({
                    id: val.id,
                    vehicle_information_id: val.vehicle_information_id,
                    name: val.name,
                    link: val.link,
                    engine: val.engine,
                    price: val.price,
                    price_range: val.price_range,
                    status: val.status,
                    image: val.image,
                    fuel_type: val.fuel_type,
                    ex_show_room_rice: val.ex_show_room_rice,
                    mileage: val.mileage,
                    on_road_price: val.on_road_price,
                    latest_update: val.latest_update,
                    price_range: val.price_range,
                    insurance_price: val.insurance_price,
                    rto_price: val.rto_price,
                    other_price: val.other_price,
                    review_count: val.review_count,
                    rating: val.rating,
                    launched_at: val.launched_at,
                    is_scrapping: val.is_scrapping,
                    createdAt: val.created_at,
                    updatedAt: val.updated_at,
                })
                var dd = await data.save()
            })
            res.send(result)
        })
    } catch (error) {
        console.log(error);
    }
}

export default { categories, brands, bodytype, vehicalcolor, variant_specifications, vehicle_informations, variant_key_specs, price_variants, keyspecification }
