import cheerio from "cheerio";
import axios from "axios";
import Bodytypes from '../Model/BodyType.js'
import scrap_data from '../controller/ScrappingController.js'
import helper from "../helper/helper.js";
import strip_tags from 'strip-tags'
import PriceVariant from "../Model/priceVariant.js";
import VariantSpecification from "../Model/VariantSpecification.js";
import VariantKey from "../Model/VariantKeySpec.js";
import vehicle_model_color from "../Model/VehicleModelColor.js";
import CategoryModel from "../Model/categories.js"
import keyspecification from "../Model/keyspecification.js"
import vehicle_information from "../Model/VehicleInformation.js";
import mongoose from "mongoose";
import Cataroies from "../Model/categories.js";
// import con from "../connecttion/mysqlconn.js"
import Brands from "../Model/Brands.js";
import { VehicleInformationTable } from "../Model/MySqlModel/vehicleInformation.js";




export const getVehicleInformationData = async (req, res) => {
    try {
        const getData = await vehicle_information.aggregate([
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand_id',
                    pipeline: [{
                        $project: { id: 1, name: 1 },
                    }],
                },
            },
            {
                $unwind: '$brand_id' // Unwind the 'brand_id' array
            },
            {
                $lookup: {
                    from: 'cataroies',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category_id',
                    pipeline: [{
                        $project: { id: 1, category_name: 1 }
                    }]
                }
            },
            {
                $unwind: '$category_id' // Unwind the 'category_id' array
            }
        ])
        res.json(getData)
    } catch (error) {
        res.json(error.message)
    }
};


export const getCategory = async (req, res) => {
    try {
        const filterData = await Cataroies.find()
        res.json(filterData)
    } catch (error) {
        res.json(error.message)
    }

}
export const getBrands = async (req, res) => {
    console.log(req.params.categoryId)
    try {
        const filterData = await Brands.aggregate([
            { $match: { php_category_id: Number(req.params.categoryId) } }
        ])
        res.json(filterData)
    } catch (error) {
        res.json(error.message)
    }

}
export const filterByCategory = async (req, res) => {
    try {
        // console.log('req.body.category_id<<<', req.body.category_id)
        const filterData = await vehicle_information.aggregate([
            { $match: { category_id: new mongoose.Types.ObjectId(req.body.category_id) } },
        ])
        res.json(filterData)
    } catch (error) {
        res.json(error.message)
    }

}
export const filterByBrand = async (req, res) => {
    try {
        // console.log('req.body.category_id<<<', req.body.category_id)
        const filterData = await vehicle_information.aggregate([
            { $match: { category_id: new mongoose.Types.ObjectId(req.body.brandId) } },
        ])
        res.json(filterData)
    } catch (error) {
        res.json(error.message)
    }

}

export const postDataIntoMysql = async (req, res) => {

    try {
        const postData = await vehicle_information.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.params.vehicleId) } },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand_id',
                    pipeline: [{
                        $project: { id: 1, name: 1 },
                    }],
                },
            },
            {
                $unwind: '$brand_id' // Unwind the 'brand_id' array
            },
            {
                $lookup: {
                    from: 'cataroies',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category_id',
                    pipeline: [{
                        $project: { id: 1, category_name: 1 }
                    }]
                }
            },
            {
                $unwind: '$category_id' // Unwind the 'category_id' array
            },
            // vehicle_model_colors 
            {
                $lookup: {
                    from: 'vehicle_model_colors',
                    localField: '_id',
                    foreignField: 'vehicle_information_id',
                    as: 'modelColor',
                }
            },
            // vehicle_price_variant 
            {
                $lookup: {
                    from: 'vehicle_price_variants',
                    localField: '_id',
                    foreignField: 'vehicle_information_id',
                    as: 'priceVariant',
                }
            },
            // vehicle_price_variant 
            {
                $lookup: {
                    from: 'variant_key_specs',
                    localField: '_id',
                    foreignField: 'vehicle_information_id',
                    as: 'keySpec',
                }
            }
        ])


        //         const data = postData[0]

        //         const values = [
        //             data.php_id,
        //             data.brand_php_id,
        //             data.category_php_id,
        //             data.bodytype_id,
        //             0,
        //             data.model_name,
        //             data.fuel_type,
        //             data.avg_rating,
        //             data.review_count,
        //             data.variant_name,
        //             data.min_price,
        //             data.max_price,
        //             data.price_range,
        //             data.search_count || 0,
        //             data.popular_count || 0,
        //             data.status,
        //             data.is_content_writer,
        //             data.is_designer || 0,
        //             data.on_road_price,
        //             data.is_popular_search,
        //             data.is_upcoming,
        //             data.is_latest,
        //             data.is_recommended || 0
        //         ];

        //         // const qr = ` INSERT INTO vehicle_information id  = ?,brand_id = ?,category_id = ?,bodytype_id = ?,bind_id = ?,model_name = ?,fuel_type = ?,avg_rating = ?,review_count = ?,variant_name = ?,min_price = ?,max_price = ?,price_range = ?,search_count = ?,popular_count = ?,status = ?,is_content_writer = ?,is_designer = ?,on_road_price = ?,is_popular_search = ?,is_upcoming = ?,is_latest = ?,is_recommended `

        //         const qr = `
        //   INSERT INTO vehicle_information (
        //     id,
        //     brand_id,
        //     category_id,
        //     bodytype_id,
        //     bind_id,
        //     model_name,
        //     fuel_type,
        //     avg_rating,
        //     review_count,
        //     variant_name,
        //     min_price,
        //     max_price,
        //     price_range,
        //     search_count,
        //     popular_count,
        //     status,
        //     is_content_writer,
        //     is_designer,
        //     on_road_price,
        //     is_popular_search,
        //     is_upcoming,
        //     is_latest,
        //     is_recommended
        //   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        // `;
        //         // const update = await con.query(qr, values)

        //         const qrp = `
        //                     INSERT INTO vehicle_model_color(
        //                     id,
        //                     vehicle_information_id,
        //                     color_name,
        //                     color_code,
        //                     image,
        //                     updated_at,
        //                     deleted_at,
        //                     deleted_by 
        //                     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        //         p.updated_at,
        //             p.deleted_at,
        //             p.deleted_by
        //         for (const p of data.modelColor) {
        //             await con.query(qrp, [p.php_id, p.vehicle_information_id, p.color_name, p.color_code, p.image, p.updated_at, p.deleted_at, p.deleted_by])
        //         }
        // INSERT INTO `vehicle_model_color`(`id`, `vehicle_information_id`, `color_name`, `color_code`, `image`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]','[value-7]','[value-8]','[value-9]')


        res.json(dd)
    } catch (error) {
        console.log(error)
    }
}