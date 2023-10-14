import { VehicleInformationTable } from "../Model/MySqlModel/vehicleInformation.js";
import mongoose from "mongoose";
import Cataroies from "../Model/categories.js";
import Brands from "../Model/Brands.js";
import vehicle_information from "../Model/VehicleInformation.js";
import { ModelColorTable } from "../Model/MySqlModel/modelColor.js";
import { PriceVariantTable } from "../Model/MySqlModel/priceVariant.js";
import { VariantkeySpec } from "../Model/MySqlModel/variantKeySpec.js";
import { VariantSpecificationsTable } from "../Model/MySqlModel/variantSpecifications.js";
import { CategoriesTable } from "../Model/MySqlModel/categories.js";
import { BrandTable } from "../Model/MySqlModel/brands.js";
import { ModelBodyTypeTable } from "../Model/MySqlModel/bodytypes.js";
import { KeyspecificationTable } from "../Model/MySqlModel/keyspecification.js";

import VariantSpecification from "../Model/VariantSpecification.js";
import bodytypes from "../Model/BodyType.js";
import keyspecification from "../Model/keyspecification.js";
import Categories from "../Model/categories.js";
import PriceVariant from "../Model/priceVariant.js";
import VariantKey from "../Model/VariantKeySpec.js";
import vehicle_model_color from "../Model/VehicleModelColor.js";
import { Op } from "sequelize";

export const MysqlToMongodbConvertDatabaseCategory = async (req, res) => {
    const getData = await CategoriesTable.findAll({ where: { deleted_at: null } })
    for (const item of getData) {
        const findCatagory = await Categories.findOne({ category_name: item.category_name })
        if (!findCatagory) {
            await Categories.create({
                php_id: item.id,
                category_name: item.category_name,
                status: item.status,
                thumb_image: item.thumb_image,
                created_at: item.created_at,
                updated_at: item.updated_at,
                deleted_at: item.deleted_at,
                deleted_by: item.deleted_by
            })
        }
    }
    res.json("Catagory Addedd!!")
}
export const MysqlToMongodbConvertDatabaseBrand = async (req, res) => {
    const GetData = await BrandTable.findAll({ where: { deleted_at: null } })

    for (const item of GetData) {
        let category_id = await Cataroies.findOne({ php_id: item.category_id })
        category_id = category_id._id
        await Brands.create({
            php_id: item.id,
            category_id: category_id,
            php_category_id: item.category_id,
            name: item.name,
            title: item.title,
            headtag: item.headtag,
            test_drive_link: item.test_drive_link,
            is_popular: item.is_popular,
            logo: item.logo,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted_at: item.deleted_at,
            deleted_by: item.deleted_by,
        })
        // }
    }
    res.json("BrandTable Addedd!!")
}
export const MysqlToMongodbConvertDatabaseBodyType = async (req, res) => {
    const GetData = await ModelBodyTypeTable.findAll({ where: { deleted_at: null } })
    for (const item of GetData) {
        const category_id = await Cataroies.findOne({ php_id: item.category_id })

        await bodytypes.create({
            php_id: item.id,
            category_id: category_id._id,
            php_category_id: item.category_id,
            name: item.name,
            image: item.image,
            status: item.status,
            position: item.position,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted_at: item.deleted_at,
            deleted_by: item.deleted_by,
        })

    }
    res.json("BodyType Addedd!!")
}
export const MysqlToMongodbConvertDatabaseKeyspecification = async (req, res) => {

    const GetData = await KeyspecificationTable.findAll({ where: { deleted_at: null } })
    for (const item of GetData) {
        await keyspecification.create({
            php_id: item.id,
            name: item.name,
            icon: item.icon,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted_at: item.deleted_at,
            deleted_by: item.deleted_by,
        })
    }
    res.json("Keyspecification Addedd!!")
}
export const MysqlToMongodbConvertDatabaseVehicleInformation = async (req, res) => {
    const GetData = await VehicleInformationTable.findAll({ where: { deleted_at: null } })

    for (const item of GetData) {
        const brand_id = await Brands.findOne({ php_id: item.brand_id }).select({ _id: 1 })
        const category_id = await Categories.findOne({ php_id: item.category_id }).select({ _id: 1 })
        const bodytype_id = await bodytypes.findOne({ php_id: item.bodytype_id }).select({ _id: 1 })

        await vehicle_information.create({
            php_id: item.id,
            brand_id: brand_id?._id || null,
            category_id: category_id?._id || null,
            bodytype_id: bodytype_id?._id || null,
            category_php_id: item.category_id,
            brand_php_id: item.brand_id,
            php_bodytype_id: item.bodytype_id,
            bind_id: item.bind_id,
            model_name: item.model_name,
            fuel_type: item.fuel_type,
            avg_rating: item.avg_rating,
            review_count: item.review_count,
            variant_name: item.variant_name,
            min_price: item.min_price,
            max_price: item.max_price,
            price_range: item.price_range,
            image: item.image,
            status: item.status,
            is_designer: item.is_designer,
            launched_at: item.launched_at,
            Launch_date: item.Launch_date,
            model_popularity: item.model_popularity,
            mileage: item.mileage,
            engine: item.engine,
            style_type: item.style_type,
            max_power: item.max_power,
            showroom_price: item.showroom_price,
            on_road_price: item.on_road_price,
            is_popular_search: item.is_popular_search,
            is_upcoming: item.is_upcoming,
            is_latest: item.is_latest,
            price_desc: item.price_desc,
            highlights_desc: item.highlights_desc,
            key_specs: item.key_specs,
            manufacturer_desc: item.manufacturer_desc,
            link: item.link,
            rto_price: item.rto_price,
            insurance_price: item.insurance_price,
            other_price: item.other_price,
            is_content_writer: item.is_content_writer,
            search_count: item.search_count,
            popular_count: item.popular_count,
            is_recommended: item.is_recommended,
            headtag: item.headtag,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted_at: item.deleted_at,
            deleted_by: item.deleted_by,
        })
    }
    res.json("VehiclesInfo Addedd!!")
}
export const MysqlToMongodbConvertDatabasePriceVariant = async (req, res) => {
    const GetData = await PriceVariantTable.findAll({ where: { deleted_at: null } })
    for (const item of GetData) {
        // const findPriceVariant = await PriceVariant.findOne({ name: item.name, php_vehicle_information_id: item.vehicle_information_id })

        // if (!findPriceVariant) {

        const findvehicleId = await vehicle_information.findOne({ php_id: item.vehicle_information_id })

        const createPriceVariant = await PriceVariant.create({
            php_id: item.id,
            vehicle_information_id: findvehicleId?._id || null,
            php_vehicle_information_id: item.vehicle_information_id,
            name: item.name,
            link: item.link,
            engine: item.engine,
            price_range: item.price_range,
            price: item.price,
            review_count: item.review_count,
            rating: item.rating,
            status: item.status,
            fuel_type: item.fuel_type,
            ex_show_room_rice: item.ex_show_room_rice,
            mileage: item.mileage,
            rto_price: item.rto_price,
            insurance_price: item.insurance_price,
            other_price: item.other_price,
            on_road_price: item.on_road_price,
            latest_update: item.latest_update,
            is_scrapping: item.is_scrapping,
            launched_at: item.launched_at,
            image: item.image,
            created_at: item.created_at,
            updated_at: item.updated_at,
            deleted_at: item.deleted_at,
            deleted_by: item.deleted_by,
        })
        console.log("++++++++++++++++++++++++++++++++++++++++++ PriceVariant Created ++++++++++++++++++++++++++++++++++++++++++")
        if (createPriceVariant) {
            const findKeySpec = await VariantkeySpec.findAll({ where: { variant_id: createPriceVariant.php_id } })

            for (const item of findKeySpec) {
                const findvehicleId = await vehicle_information.findOne({ php_id: item.vehicle_information_id });
                const findVariantSpecId = await VariantSpecification.findOne({ php_id: item.specification_id });
                const findKeySpecification = await keyspecification.findOne({ php_id: item.variant_key_id });

                await VariantKey.create({
                    php_id: item.id,
                    vehicle_information_id: findvehicleId?._id || null,
                    variant_id: createPriceVariant?._id || null,
                    specification_id: findVariantSpecId?._id || null,
                    variant_key_id: findKeySpecification?._id || null,
                    php_vehicle_information_id: item.vehicle_information_id,
                    php_variant_id: createPriceVariant.php_id,
                    php_specification_id: item.specification_id,
                    php_variant_key_id: item.variant_key_id,
                    name: item.name,
                    value: item.value,
                    is_feature: item.is_feature,
                    is_specification: item.is_specification,
                    is_update: item.is_update,
                    show_key_feature: item.show_key_feature,
                    show_overview: item.show_overview,
                    is_scraping: item.is_scraping,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                });
            }
            console.log("-------------------------------- VariantKey Created  -----------------------------------")
        }
        // }
    }
    res.json("PriceVariant Addedd!!")
}
export const MysqlToMongodbConvertDatabaseModelColor = async (req, res) => {
    try {
        const GetData = await ModelColorTable.findAll({ where: { deleted_at: null } })
        for (const item of GetData) {
            const findvehicleId = await vehicle_information.findOne({ php_id: item.vehicle_information_id })
            await vehicle_model_color.create({
                php_id: item.id,
                vehicle_information_id: findvehicleId?._id || null,
                php_vehicle_information_id: item.vehicle_information_id,
                color_name: item.color_name,
                color_code: item.color_code,
                image: item.image,
                created_at: item.created_at,
                updated_at: item.updated_at,
                deleted_at: item.deleted_at,
                deleted_by: item.deleted_by,
            })
        }
        res.json("ModelColor Addedd!!")
    } catch (error) {
        res.json({ error: error.message })
    }

}


export const MysqlToMongodbConvertDatabaseVariantSpecification = async (req, res) => {
    try {
        const GetData = await VariantSpecificationsTable.findAll({})
        for (const item of GetData) {
            await VariantSpecification.create({
                php_id: item.id,
                name: item.name,
                created_at: item.created_at,
                updated_at: item.updated_at,
            })
        }
        res.json("Specification Addedd!!")
    } catch (error) {
        res.json({ error: error.message })
    }
}
// export const MysqlToMongodbConvertDatabaseVariantKeySpecification = async (req, res) => {
//     try {
//         const GetData = await VariantkeySpec.findAll({})

//         for (const item of GetData) {

//             const findvehicleId = vehicle_information.findOne({ where: { id: item.vehicle_information_id } })
//             const findPriceVarintId = PriceVariant.findOne({ where: { id: item.variant_id } })
//             const findVariantSpecId = VariantSpecification.findOne({ where: { id: item.specification_id } })
//             const findKeySpecification = keyspecification.findOne({ where: { id: item.variant_key_id } })

//             await VariantKey.create({
//                 php_id: item.id,
//                 vehicle_information_id: findvehicleId._id,
//                 variant_id: findPriceVarintId._id,
//                 specification_id: findVariantSpecId._id,
//                 variant_key_id: findKeySpecification._id,
//                 php_vehicle_information_id: item.vehicle_information_id,
//                 php_variant_id: item.variant_id,
//                 php_specification_id: item.specification_id,
//                 php_variant_key_id: item.variant_key_id,
//                 name: item.name,
//                 value: item.value,
//                 is_feature: item.is_feature,
//                 is_specification: item.is_specification,
//                 is_update: item.is_update,
//                 show_key_feature: item.show_key_feature,
//                 show_overview: item.show_overview,
//                 is_scraping: item.is_scraping,
//                 created_at: item.created_at,
//                 updated_at: item.updated_at,
//             });
//         }
//         res.json("VariantKeySpecification added!");
//     } catch (error) {
//         res.json({ error: error.message })
//     }

// }
export const MysqlToMongodbConvertDatabaseVariantKeySpecification = async (req, res) => {
    try {
        const batchSize = 10000; // Number of records to insert in each batch
        let offset = 0;

        while (true) {
            const batchData = await VariantkeySpec.findAll({
                offset,
                limit: batchSize,
                order: [['id', 'ASC']]
            });

            for (const item of batchData) {

                const findvehicleId = await vehicle_information.findOne({ php_id: item.vehicle_information_id });
                const findPriceVarintId = await PriceVariant.findOne({ php_id: item.variant_id });
                const findVariantSpecId = await VariantSpecification.findOne({ php_id: item.specification_id });
                const findKeySpecification = await keyspecification.findOne({ php_id: item.variant_key_id });
                if (findvehicleId || findPriceVarintId || findVariantSpecId || findKeySpecification) {
                    console.log('findvehicleId findPriceVarintId findVariantSpecId findKeySpecification', findvehicleId?.php_id, findPriceVarintId?.php_id, findVariantSpecId?.php_id, findKeySpecification?.php_id)
                }

                await VariantKey.create({
                    php_id: item.id,
                    vehicle_information_id: findvehicleId?._id || null,
                    variant_id: findPriceVarintId?._id || null,
                    specification_id: findVariantSpecId?._id || null,
                    variant_key_id: findKeySpecification?._id || null,
                    php_vehicle_information_id: item.vehicle_information_id,
                    php_variant_id: item.variant_id,
                    php_specification_id: item.specification_id,
                    php_variant_key_id: item.variant_key_id,
                    name: item.name,
                    value: item.value,
                    is_feature: item.is_feature,
                    is_specification: item.is_specification,
                    is_update: item.is_update,
                    show_key_feature: item.show_key_feature,
                    show_overview: item.show_overview,
                    is_scraping: item.is_scraping,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                });
            }
            offset += batchSize;
            console.log(`Batch ${offset / batchSize} inserted.`);
        }
        res.json("VariantKeySpecification added!");
    } catch (error) {
        res.json({ error: error.message })
    }

}
export const MysqltoMongodbConver = async (req, res) => {
    try {
        const postData = await vehicle_information.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.body.vehicleId) } },
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

        const mongooseData = postData[0]

        if (mongooseData) {
            try {
                const findIsExistOrNot = await VehicleInformationTable.findOne({
                    where: {
                        [Op.and]: [
                            { brand_id: mongooseData.brand_php_id },
                            { category_id: mongooseData.category_php_id },
                            { model_name: mongooseData.model_name },
                            { deleted_at: null }
                        ]
                    }
                })
                if (findIsExistOrNot) {
                    // console.log('findIsExistOrNot update>>>>', findIsExistOrNot)
                    // Update Vehicle Information
                    await VehicleInformationTable.update({
                        bodytype_id: mongooseData.php_bodytype_id,
                        model_name: mongooseData.model_name,
                        fuel_type: mongooseData.fuel_type,
                        avg_rating: mongooseData.avg_rating,
                        review_count: mongooseData.review_count,
                        variant_name: mongooseData.variant_name,
                        min_price: Number(mongooseData.min_price),
                        max_price: Number(mongooseData.max_price),
                        price_range: mongooseData.price_range,
                        model_popularity: Number(mongooseData.model_popularity),
                        mileage: mongooseData.mileage,
                        engine: mongooseData.engine,
                        style_type: mongooseData.style_type,
                        max_power: mongooseData.max_power,
                        showroom_price: Number(mongooseData.showroom_price),
                        price_desc: mongooseData.price_desc,
                        highlights_desc: mongooseData.highlights_desc,
                        key_specs: mongooseData.key_specs,
                        rto_price: mongooseData.rto_price,
                        insurance_price: mongooseData.insurance_price,
                        other_price: mongooseData.other_price,
                        search_count: mongooseData.search_count,
                        manufacturer_desc: mongooseData.manufacturer_desc,
                    },
                        { where: { id: mongooseData.php_id } })
                    console.log("update : VehicleInformationTable ")
                    // Update priceVariant
                    for (const item of mongooseData.priceVariant) {
                        const findPriceVariant = await PriceVariantTable.findOne({ where: { [Op.and]: [{ name: item.name }, { vehicle_information_id: item.php_vehicle_information_id }, { deleted_at: null }] } })
                        if (!findPriceVariant) {
                            try {
                                const createPriceVariant = await PriceVariantTable.create({
                                    // id: item.php_id,
                                    vehicle_information_id: item.php_vehicle_information_id,
                                    name: item.name,
                                    link: item.like,
                                    engine: item.engine,
                                    price_range: item.price_range,
                                    price: item.price,
                                    review_count: item.review_count,
                                    rating: item.rating,
                                    status: item.status,
                                    fuel_type: item.fuel_type,
                                    ex_show_room_rice: item.ex_show_room_rice,
                                    mileage: item.mileage,
                                    rto_price: Number(item.rto_price),
                                    insurance_price: item.insurance_price,
                                    other_price: item.other_price,
                                    on_road_price: Number(item.on_road_price.replaceAll(',', '')),
                                    latest_update: item.latest_update,
                                    is_scrapping: item.is_scrapping,
                                    launched_at: item.launched_at,
                                    deleted_at: null
                                })
                                console.log("update : price variant create ")

                                if (createPriceVariant) {
                                    const findKeySpecForInsert = await VariantKey.find({ variant_id: item._id })
                                    if (findKeySpecForInsert) {
                                        for (const iterator of findKeySpecForInsert) {
                                            const createKeySpec = await VariantkeySpec.create({
                                                // vehicle_information_id: item?.php_vehicle_information_id != undefined ? item?.php_vehicle_information_id : 0,
                                                vehicle_information_id: createPriceVariant.dataValues.vehicle_information_id,
                                                variant_id: createPriceVariant.dataValues.id,
                                                specification_id: iterator.php_specification_id,
                                                name: iterator.name,
                                                value: iterator.value,
                                                is_feature: iterator.is_feature,
                                                variant_key_id: iterator.php_variant_key_id,
                                                is_specification: iterator.is_specification,
                                                is_update: iterator.is_update,
                                                show_key_feature: iterator.show_key_feature,
                                                show_overview: iterator.show_overview,
                                                is_scraping: iterator.is_scraping,
                                                created_at: iterator.createdAt,
                                                updated_at: iterator.updatedAt,
                                                // deleted_at: null
                                            })
                                            if (createKeySpec.dataValues.id !== iterator.php_id) {
                                                await VariantKey.findByIdAndUpdate(iterator._id, { php_id: createKeySpec.dataValues.id })
                                            }
                                            if (createKeySpec.dataValues.variant_id !== iterator.php_variant_id) {
                                                await VariantKey.findByIdAndUpdate(iterator._id, { php_variant_id: createKeySpec.dataValues.variant_id })
                                            }
                                            // if (createKeySpec.dataValues.vehicle_information_id != iterator?.php_vehicle_information_id) {
                                            //     await VariantKey.findByIdAndUpdate(iterator._id, { php_vehicle_information_id: createKeySpec.dataValues.vehicle_information_id })
                                            // }
                                        }
                                        console.log("update : Key spec create ")

                                    }
                                }

                                if (createPriceVariant.dataValues.id !== item.php_id) {
                                    await PriceVariant.findByIdAndUpdate(item._id, { php_id: createPriceVariant.dataValues.id })
                                }
                                if (createPriceVariant.dataValues.vehicle_information_id != item.php_vehicle_information_id) {
                                    await PriceVariant.findByIdAndUpdate(item._id, { php_vehicle_information_id: createPriceVariant.dataValues.vehicle_information_id })
                                }
                            } catch (error) {
                                console.log(error.message)
                            }
                        } else {
                            try {
                                await PriceVariantTable.update({
                                    name: item.name,
                                    link: item.like,
                                    engine: item.engine,
                                    price_range: item.price_range,
                                    price: item.price,
                                    review_count: item.review_count,
                                    rating: item.rating,
                                    status: item.status,
                                    fuel_type: item.fuel_type,
                                    ex_show_room_rice: item.ex_show_room_rice,
                                    mileage: item.mileage,
                                    rto_price: Number(item.rto_price),
                                    insurance_price: item.insurance_price,
                                    other_price: item.other_price,
                                    on_road_price: Number(item.on_road_price.replaceAll(',', '')),
                                    latest_update: item.latest_update,
                                    is_scrapping: item.is_scrapping,
                                    launched_at: item.launched_at,

                                }, { where: { id: item.php_id } })
                                console.log("update : pricevariant update ")

                                const findVarKeySpecification = await VariantKey.find({ php_variant_id: findPriceVariant.dataValues.id })
                                // console.log('findVarKeySpecification  >>>>>', findVarKeySpecification)
                                for (const iterator of findVarKeySpecification) {
                                    const findVariantKey = await VariantkeySpec.findOne({ where: { [Op.and]: [{ id: iterator.php_id }, { name: iterator.name }] } })
                                    if (findVariantKey) {
                                        await VariantkeySpec.update({
                                            name: iterator.name,
                                            value: iterator.value,
                                            is_feature: iterator.is_feature,
                                            variant_key_id: iterator.php_variant_key_id,
                                            is_specification: iterator.is_specification,
                                            is_update: iterator.is_update,
                                            show_key_feature: iterator.show_key_feature,
                                            show_overview: iterator.show_overview,
                                            is_scraping: iterator.is_scraping,
                                            created_at: iterator.createdAt,
                                            updated_at: iterator.updatedAt,

                                        }, { where: { id: iterator.php_id } })
                                        console.log("update : VariantkeySpec update ")

                                    } else {
                                        const craeteVariantKey = await VariantkeySpec.create({
                                            vehicle_information_id: iterator?.php_vehicle_information_id,
                                            variant_id: iterator.php_variant_id,
                                            specification_id: iterator.php_specification_id,
                                            name: iterator.name,
                                            value: iterator.value,
                                            is_feature: iterator.is_feature,
                                            variant_key_id: iterator.php_variant_key_id,
                                            is_specification: iterator.is_specification,
                                            is_update: iterator.is_update,
                                            show_key_feature: iterator.show_key_feature,
                                            show_overview: iterator.show_overview,
                                            is_scraping: iterator.is_scraping,
                                            created_at: iterator.createdAt,
                                            updated_at: iterator.updatedAt
                                        })
                                        if (craeteVariantKey.dataValues.id !== iterator.php_id) {
                                            await VariantKey.findByIdAndUpdate(iterator._id, { php_id: craeteVariantKey.dataValues.id })
                                        }
                                        console.log("update : VariantkeySpec create ")

                                    }
                                }
                            } catch (error) {
                                console.log(error.message)
                            }
                        }
                    }
                    // Update modelColor
                    for (const item of mongooseData?.modelColor) {
                        const findPriceModelColor = await ModelColorTable.findOne({ where: { [Op.and]: [{ vehicle_information_id: item.php_vehicle_information_id }, { color_name: item.color_name }, { color_code: item.color_code }, { deleted_at: null }] } })

                        if (!findPriceModelColor) {
                            const createModelColor = await ModelColorTable.create({
                                // id: item.php_id,
                                vehicle_information_id: item.php_vehicle_information_id,
                                color_name: item.color_name,
                                color_code: item.color_code,
                                image: "NA",
                                deleted_at: null
                            })

                            if (createModelColor.dataValues.id !== item.php_id) {
                                await vehicle_model_color.findByIdAndUpdate(item._id, { php_id: createModelColor.dataValues.id })
                            }
                            if (createModelColor.dataValues.vehicle_information_id != item.php_vehicle_information_id) {
                                await vehicle_model_color.findByIdAndUpdate(item._id, { php_vehicle_information_id: createModelColor.dataValues.vehicle_information_id })
                            }
                            console.log("update : ModelColorTable create ")

                        } else {
                            await ModelColorTable.update({
                                color_name: item.color_name,
                                color_code: item.color_code,
                                image: "NA"
                            },
                                { where: { id: item.php_id } }
                            )
                            console.log("update : ModelColorTable update ")
                        }

                    }
                    // Update variant key
                    // for (const item of mongooseData.keySpec) {
                    //     const findVariantKeySpec = await VariantkeySpec.findOne({ where: { [Op.and]: [{ id: item.php_id }, { vehicle_information_id: item.php_vehicle_information_id }, { variant_id: item.php_variant_id }, { specification_id: item.php_specification_id }] } })
                    //     if (!findVariantKeySpec) {
                    //         try {
                    //             await VariantkeySpec.create({
                    //                 id: item.php_id,
                    //                 vehicle_information_id: item?.php_vehicle_information_id != undefined ? item?.php_vehicle_information_id : 0,
                    //                 variant_id: item.php_variant_id,
                    //                 specification_id: item.php_specification_id,
                    //                 name: item.name,
                    //                 value: item.value,
                    //                 is_feature: item.is_feature,
                    //                 variant_key_id: item.php_variant_key_id,
                    //                 is_specification: item.is_specification,
                    //                 is_update: item.is_update,
                    //                 show_key_feature: item.show_key_feature,
                    //                 show_overview: item.show_overview,
                    //                 is_scraping: item.is_scraping,
                    //                 created_at: item.createdAt,
                    //                 updated_at: item.updatedAt
                    //             })
                    //         } catch (error) {
                    //             console.log(error.message)
                    //         }

                    //     } else {
                    //         try {
                    //             await VariantkeySpec.update({
                    //                 name: item.name,
                    //                 value: item.value
                    //             },
                    //                 { where: { id: item.php_id } }
                    //             )
                    //         } catch (error) {
                    //             console.log(error.message)
                    //         }
                    //     }
                    // }
                    //create Bodytype
                    const checkBodyType = await ModelBodyTypeTable.findOne({
                        where: {
                            [Op.and]: [
                                { category_id: mongooseData.category_php_id },
                                { name: mongooseData.style_type },
                                { deleted_at: null }
                            ]
                        }
                    })
                    if (!checkBodyType) {
                        await ModelBodyTypeTable.create({
                            id: mongooseData.php_bodytype_id,
                            category_id: mongooseData.category_php_id,
                            name: mongooseData.style_type,
                            status: 1,
                            deleted_at: null
                        })
                    }
                    // If vehicle is not present then create new vehicle     
                } else {
                    console.log("New Create Vehicle!!!!!!!!!")
                    // New vehicle is create
                    try {

                        const createData = await VehicleInformationTable.create({
                            // id: mongooseData.php_id,
                            brand_id: mongooseData.brand_php_id,
                            category_id: mongooseData.category_php_id,
                            bodytype_id: mongooseData?.php_bodytype_id || 0,
                            bind_id: mongooseData?.bind_id || 0,
                            model_name: mongooseData.model_name,
                            fuel_type: mongooseData.fuel_type,
                            avg_rating: mongooseData.avg_rating,
                            review_count: mongooseData.review_count,
                            variant_name: mongooseData.variant_name,
                            min_price: Number(mongooseData.min_price),
                            max_price: Number(mongooseData.max_price),
                            price_range: mongooseData.price_range,
                            status: mongooseData.status,
                            launched_at: mongooseData?.launched_at,
                            Launch_date: mongooseData?.Launch_date,
                            model_popularity: Number(mongooseData.model_popularity),
                            mileage: mongooseData?.mileage,
                            engine: mongooseData?.engine,
                            style_type: mongooseData?.style_type,
                            max_power: mongooseData?.max_power,
                            showroom_price: Number(mongooseData.showroom_price),
                            on_road_price: Number(mongooseData.on_road_price.replaceAll(',', '')),
                            is_popular_search: mongooseData.is_popular_search,
                            is_upcoming: mongooseData.is_upcoming,
                            is_latest: mongooseData.is_latest,
                            price_desc: mongooseData.price_desc,
                            highlights_desc: mongooseData.highlights_desc,
                            key_specs: mongooseData.key_specs,
                            manufacturer_desc: mongooseData.manufacturer_desc,
                            is_recommended: mongooseData.php_id,
                            link: mongooseData.link,
                            rto_price: mongooseData.rto_price,
                            insurance_price: mongooseData.insurance_price,
                            other_price: mongooseData.other_price,
                            is_content_writer: mongooseData.is_content_writer,
                            is_designer: mongooseData.is_designer,
                            headtag: mongooseData.headtag,
                            popular_count: mongooseData?.popular_count || 0,
                            search_count: mongooseData?.search_count || 0,
                            deleted_at: null

                        })
                        if (createData.dataValues.id != mongooseData.php_id) {
                            await vehicle_information.findByIdAndUpdate(mongooseData._id, { php_id: createData.dataValues.id })
                        }
                        if (createData) {
                            // Update or Create Model Color
                            if ("modelColor" in mongooseData) {
                                for (const item of mongooseData?.modelColor) {
                                    const findModelColor = await ModelColorTable.findOne({ where: { [Op.and]: [{ vehicle_information_id: createData.dataValues.id }, { color_name: item.color_name }, { deleted_at: null }] } })
                                    // console.log('findModelColor>>>', findModelColor)
                                    if (findModelColor) {
                                        await ModelColorTable.update({
                                            color_name: item.color_name,
                                            color_code: item.color_code,
                                            image: "NA"
                                        },
                                            { where: { id: item.php_id } }
                                        )
                                        if (findModelColor.dataValues.id !== item.php_id) {
                                            await vehicle_model_color.findByIdAndUpdate(item._id, { php_id: findModelColor.dataValues.id })
                                        }
                                        if (findModelColor.dataValues.vehicle_information_id != item.php_vehicle_information_id) {
                                            await vehicle_model_color.findByIdAndUpdate(item._id, { php_vehicle_information_id: findModelColor.dataValues.vehicle_information_id })
                                        }
                                        console.log("modelColor update")
                                    } else {
                                        const createModelColor = await ModelColorTable.create({
                                            // id: item.php_id,
                                            // vehicle_information_id: item.php_vehicle_information_id,
                                            vehicle_information_id: createData.dataValues.id,
                                            color_name: item.color_name,
                                            color_code: item.color_code,
                                            image: "NA",
                                            deleted_at: null
                                        })
                                        // console.log("createModelColor else>>>", createModelColor)
                                        if (createModelColor.dataValues.id !== item.php_id) {
                                            await vehicle_model_color.findByIdAndUpdate(item._id, { php_id: createModelColor.dataValues.id })
                                        }
                                        if (createModelColor.dataValues.vehicle_information_id != item.php_vehicle_information_id) {
                                            await vehicle_model_color.findByIdAndUpdate(item._id, { php_vehicle_information_id: createModelColor.dataValues.vehicle_information_id })
                                        }
                                        console.log("modelColor created")

                                    }

                                }
                            }
                            // Update or Create PriceVariant and Update or Create Key specification (change by jp 12-10-2023)
                            if ("priceVariant" in mongooseData) {
                                for (const item of mongooseData?.priceVariant) {
                                    const findPriceVariant = await PriceVariantTable.findOne({ where: { [Op.and]: [{ vehicle_information_id: createData.dataValues.id }, { deleted_at: null }] } })
                                    // console.log('findPriceVariant', findPriceVariant)
                                    if (findPriceVariant) {
                                        // console.log("findPriceVariant if", findPriceVariant)
                                        try {
                                            await PriceVariantTable.update({
                                                name: item.name,
                                                link: item.like,
                                                engine: item.engine,
                                                price_range: item.price_range,
                                                price: item.price,
                                                review_count: item.review_count,
                                                rating: item.rating,
                                                status: item.status,
                                                fuel_type: item.fuel_type,
                                                ex_show_room_rice: item.ex_show_room_rice,
                                                mileage: item.mileage,
                                                rto_price: Number(item.rto_price),
                                                insurance_price: item.insurance_price,
                                                other_price: item.other_price,
                                                on_road_price: Number(item.on_road_price.replaceAll(',', '')),
                                                latest_update: item.latest_update,
                                                is_scrapping: item.is_scrapping,
                                                launched_at: item.launched_at,
                                            }, { where: { id: item.php_id } })

                                            if (findPriceVariant.dataValues.id !== item.php_id) {
                                                await PriceVariant.findByIdAndUpdate(item._id, { php_id: findPriceVariant.dataValues.id })
                                            }
                                            if (findPriceVariant.dataValues.vehicle_information_id != item.php_vehicle_information_id) {
                                                await PriceVariant.findByIdAndUpdate(item._id, { php_vehicle_information_id: findPriceVariant.dataValues.vehicle_information_id })
                                            }
                                            console.log("Pricevariant update")

                                        } catch (error) {
                                            console.log(error.message)
                                        }

                                    } else {
                                        // console.log("findPriceVariant else", findPriceVariant)
                                        try {
                                            const createPriceVariant = await PriceVariantTable.create({
                                                vehicle_information_id: createData.dataValues.id,
                                                name: item.name,
                                                link: item.link,
                                                engine: item.engine,
                                                price_range: item.price_range,
                                                price: item.price,
                                                review_count: item.review_count,
                                                rating: item.rating,
                                                status: item.status,
                                                fuel_type: item.fuel_type,
                                                ex_show_room_rice: item.ex_show_room_rice,
                                                mileage: item.mileage,
                                                rto_price: Number(item.rto_price),
                                                insurance_price: item.insurance_price,
                                                other_price: item.other_price,
                                                on_road_price: Number(item.on_road_price.replaceAll(',', '')),
                                                latest_update: item.latest_update,
                                                is_scrapping: item.is_scrapping,
                                                launched_at: item.launched_at,
                                                image: item.image,
                                                created_at: item.createdAt,
                                                updated_at: item.updatedAt,
                                                deleted_at: null
                                            })
                                            // console.log('createPriceVariant create >>>', createPriceVariant)
                                            console.log("Pricevariant create")

                                            if (createPriceVariant) {
                                                // console.log('findKeySpecForInsert>>>>', findKeySpecForInsert)
                                                const findKeySpecForInsert = await VariantKey.find({ vehicle_information_id: item.vehicle_information_id, variant_id: item._id });
                                                if (findKeySpecForInsert) {
                                                    for (const iterator of findKeySpecForInsert) {
                                                        // const findKeySpecForInsert = await VariantKey.findOne({ vehicle_information_id: item.vehicle_information_id, variant_id: item._id, specification_id: iterator.specification_id, name: iterator.name });
                                                        const findKeySpecForInsert = await VariantkeySpec.findOne({ where: { [Op.and]: [{ vehicle_information_id: iterator.php_vehicle_information_id }, { variant_id: iterator.php_variant_id }, { specification_id: iterator.php_specification_id }, { name: iterator.name }] } });
                                                        console.log('findKeySpecForInsert>>>', findKeySpecForInsert)
                                                        if (!findKeySpecForInsert) {
                                                            const createKeySpec = await VariantkeySpec.create({
                                                                // vehicle_information_id: item?.php_vehicle_information_id != undefined ? item?.php_vehicle_information_id : 0,
                                                                vehicle_information_id: createData?.dataValues?.id,
                                                                variant_id: createPriceVariant.dataValues.id,
                                                                specification_id: iterator.php_specification_id,
                                                                name: iterator.name,
                                                                value: iterator.value,
                                                                is_feature: iterator.is_feature,
                                                                variant_key_id: iterator.php_variant_key_id,
                                                                is_specification: iterator.is_specification,
                                                                is_update: iterator.is_update,
                                                                show_key_feature: iterator.show_key_feature,
                                                                show_overview: iterator.show_overview,
                                                                is_scraping: iterator.is_scraping,
                                                                created_at: iterator.createdAt,
                                                                updated_at: iterator.updatedAt,
                                                                // deleted_at: null
                                                            })
                                                            if (createKeySpec.dataValues.id !== iterator.php_id) {
                                                                await VariantKey.findByIdAndUpdate(iterator._id, { php_id: createKeySpec.dataValues.id })
                                                            }
                                                            if (createKeySpec.dataValues.variant_id !== iterator.php_variant_id) {
                                                                await VariantKey.findByIdAndUpdate(iterator._id, { php_variant_id: createKeySpec.dataValues.variant_id })
                                                            }
                                                            if (createKeySpec.dataValues.vehicle_information_id != iterator?.php_vehicle_information_id) {
                                                                await VariantKey.findByIdAndUpdate(iterator._id, { php_vehicle_information_id: createKeySpec.dataValues.vehicle_information_id })
                                                            }
                                                        }
                                                    }
                                                    console.log("findKeySpecForInsert create")
                                                }
                                            }
                                            if (createPriceVariant.dataValues.id !== item.php_id) {
                                                await PriceVariant.findByIdAndUpdate(item._id, { php_id: createPriceVariant.dataValues.id })
                                            }
                                            if (createPriceVariant.dataValues.vehicle_information_id != item.php_vehicle_information_id) {
                                                await PriceVariant.findByIdAndUpdate(item._id, { php_vehicle_information_id: createPriceVariant.dataValues.vehicle_information_id })
                                            }

                                        } catch (error) {
                                            console.log(error.message)
                                        }
                                    }
                                }
                            }

                            // change 12-10-2023 :- uncommant code for update php_id's!!! 
                            // Update or Create Key specification 
                            // if ("keySpec" in mongooseData) {
                            //     for (const item of mongooseData.keySpec) {
                            //         const findKeySpec = await VariantkeySpec.findOne({ where: { [Op.and]: [{ id: item.php_id }, { vehicle_information_id: item.php_vehicle_information_id }, { variant_id: item.php_variant_id }, { specification_id: item.php_specification_id }] } })

                            //         if (findKeySpec) {
                            //             try {
                            //                 await VariantkeySpec.update({
                            //                     name: item.name,
                            //                     value: item.value,
                            //                     is_feature: item.is_feature,
                            //                     show_key_feature: item.show_key_feature,
                            //                     show_overview: item.show_overview,
                            //                     is_scraping: item.is_scraping,
                            //                 }, { where: { id: item.php_id } })

                            //                 if (findKeySpec.dataValues.id !== item.php_id) {
                            //                     await VariantKey.findByIdAndUpdate(item._id, { php_id: findKeySpec.dataValues.id })
                            //                 }
                            //                 if (findKeySpec.dataValues.vehicle_information_id != item.php_vehicle_information_id) {
                            //                     await VariantKey.findByIdAndUpdate(item._id, { php_vehicle_information_id: findKeySpec.dataValues.vehicle_information_id })
                            //                 }
                            //                 console.log("Varianmt key update!!!")
                            //             } catch (error) {
                            //                 console.log(error.mes)
                            //             }

                            //         } else {

                            //             try {
                            //                 console.log("Varianmt key created!!!")

                            //                 const createKeySpec = await VariantkeySpec.create({
                            //                     // vehicle_information_id: item?.php_vehicle_information_id != undefined ? item?.php_vehicle_information_id : 0,
                            //                     vehicle_information_id: createData?.dataValues?.id,
                            //                     variant_id: item.php_variant_id,
                            //                     specification_id: item.php_specification_id,
                            //                     name: item.name,
                            //                     value: item.value,
                            //                     is_feature: item.is_feature,
                            //                     variant_key_id: item.php_variant_key_id,
                            //                     is_specification: item.is_specification,
                            //                     is_update: item.is_update,
                            //                     show_key_feature: item.show_key_feature,
                            //                     show_overview: item.show_overview,
                            //                     is_scraping: item.is_scraping,
                            //                     created_at: item.createdAt,
                            //                     updated_at: item.updatedAt,
                            //                     deleted_at: null
                            //                 })

                            //                 if (createKeySpec.dataValues.id !== item.php_id) {
                            //                     await VariantKey.findByIdAndUpdate(item._id, { php_id: createKeySpec.dataValues.id })
                            //                 }
                            //                 if (createKeySpec.dataValues.vehicle_information_id != item?.php_vehicle_information_id) {
                            //                     await VariantKey.findByIdAndUpdate(item._id, { php_vehicle_information_id: createKeySpec.dataValues.vehicle_information_id })
                            //                 }
                            //             } catch (error) {
                            //                 console.log(error.message)
                            //             }
                            //         }
                            //     }
                            // }

                            const VarSpec = await VariantSpecification.find({})
                            for (const item of VarSpec) {
                                const findVarSpec = await VariantSpecificationsTable.findOne({ where: { [Op.and]: [{ name: item.name }] } })
                                if (!findVarSpec) {
                                    await VariantSpecificationsTable.create({ name: item.name })
                                }
                            }
                        }
                    } catch (error) {
                        console.log("Error:", error)
                    }
                }
            } catch (error) {
                return res.json(error.message)
            }
        }
        // const response = await VehicleInformationTable.findAll({})
        res.send(postData)
    } catch (error) {
        console.log(error)
    }
}

