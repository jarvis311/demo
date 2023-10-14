import cheerio from "cheerio";
import axios from "axios";
import helper from "../helper/helper.js";
import strip_tags from 'strip-tags'
import vehicle_information from "../Model/VehicleInformation.js";
import PriceVariant from "../Model/priceVariant.js";
import VariantSpecification from "../Model/VariantSpecification.js";
import VariantKey from "../Model/VariantKeySpec.js";
import vehicle_model_color from "../Model/VehicleModelColor.js";
import Brands from "../Model/Brands.js";
import CategoryModel from "../Model/categories.js"
import Bodytypes from '../Model/BodyType.js'
import keyspecification from "../Model/keyspecification.js";

var link;

const scrap_cars = async (input, brand) => {
    try {
        link = input.link
        var brand = brand
        var brand_id = brand._id
        let brand_php_id = brand.php_id
        const findCategoryId = await CategoryModel.findOne({ php_id: Number(input.category) })
        let category_id = findCategoryId._id
        let category_php_id = findCategoryId.php_id

        if (input.scrap_type == "brand") {
            var new_bike_url = "https://www.cardekho.com/cars/" + brand.name
        } else {
            let res_specific_bikes = await get_specific_car(link, input, brand)
            // return res_specific_bikes;

        }
        var data_res_arr = await scrap_coman_code(new_bike_url)
        if ('items' in data_res_arr) {
            // console.log("data_res_arr>>", data_res_arr)
            for (const val of data_res_arr.items) {

                // console.log("val>>>>", val)
                const cheakidOfVehicalInfo = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                const tokenIdOfVehicalInfo = cheakidOfVehicalInfo ? cheakidOfVehicalInfo.php_id + 1 : 1
                const php_id = tokenIdOfVehicalInfo

                brand_id = brand_id
                const avg_rating = val.avgRating ? val.avgRating : 0
                const review_count = val.reviewCount ? val.reviewCount : 0
                const variant_name = val.variantName ? val.variantName : "NA"
                let min_price = val.minPrice ? val.minPrice : 0
                let max_price = val.maxPrice ? val.maxPrice : 0
                const price_range = val.priceRange ? val.priceRange : "NA"
                const status = val.status ? val.status : "NA"
                const launched_at = val.launchedAt ? val.launchedAt : "NA"
                const model_name = val.modelName
                const mileage = val.mileage ? parseFloat(val.mileage) : 0
                const engine = val.engine ? parseFloat(val.engine) : 0
                const fuel_type = val.fuelType ? val.fuelType : "NA"
                const showroom_price = val.exShowRoomPrice ? val.exShowRoomPrice : "NA"
                const model_popularity = val.modelPopularity ? val.modelPopularity : "NA"
                const style_type = val.dcbdto.bodyType ? val.dcbdto.bodyType || val.style_type : "NA"
                const on_road_price = val.minOnRoadPrice ? val.minOnRoadPrice : val.exShowRoomPrice ? val.exShowRoomPrice : "NA"
                const body_type = val.dcbdto.bodyType || "NA"
                var new_car_url = val.modelUrl
                var images_url = val.modelPictureURL
                var specification_url = val.modelSpecsURL

                let is_content_writer
                let is_designer
                is_content_writer = val.upcoming === true ? 1 : 0;
                is_designer = val.upcoming === true ? 1 : 0;
                is_content_writer = style_type === "NA" ? 1 : 0
                is_designer = style_type === "NA" ? 1 : 0

                let bodytype_id
                let php_bodytype_id
                const findBodyTypeName = await Bodytypes.findOne({
                    category_id: category_id, name: new RegExp(style_type)
                })
                if (findBodyTypeName) {
                    bodytype_id = findBodyTypeName._id
                    php_bodytype_id = findBodyTypeName.php_id
                } else {
                    const cheakBodyTypeId = await Bodytypes.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                    let tokenIdOfBodytype = cheakBodyTypeId ? cheakBodyTypeId.php_id + 1 : 1;

                    const newBodyTypeId = await Bodytypes.create({
                        php_id: tokenIdOfBodytype,
                        category_id: category_id,
                        name: style_type,
                        image: '',
                        status: 1,
                        position: 0
                    });
                    bodytype_id = newBodyTypeId._id;
                    php_bodytype_id = newBodyTypeId.php_id
                }


                // Remove " Lakh" and convert to a number

                // Multiply by 100,000 to convert to the desired format
                if (showroom_price.includes('Lakh')) {
                    const number = parseFloat(showroom_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    showroom_price = result;
                }
                if (on_road_price.includes('Lakh')) {
                    const number = parseFloat(on_road_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    on_road_price = result;
                }

                if (min_price.includes('Lakh')) {
                    const number = parseFloat(min_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    min_price = result;
                }
                if (max_price != 0) {
                    if (max_price.includes('Lakh')) {
                        const number = parseFloat(max_price.replace(" Lakh", ""));
                        const result = number * 100000;
                        max_price = result;
                    }
                } else {
                    max_price = 0
                }

                const cardata = {
                    category_id: category_id,
                    brand_id: brand_id,
                    category_php_id: category_php_id,
                    brand_php_id: brand_php_id,
                    link: link,
                    scrap_type: input.scrap_type,
                    model_name: model_name,
                    fuel_type: fuel_type,
                    avg_rating: avg_rating,
                    review_count: review_count,
                    // body_type: body_type,
                    bodytype_id: bodytype_id,
                    php_bodytype_id: php_bodytype_id,
                    variant_name: variant_name,
                    min_price: min_price,
                    max_price: max_price,
                    price_range: price_range,
                    status: status,
                    model_popularity: model_popularity,
                    mileage: mileage,
                    engine: engine,
                    style_type: style_type,
                    showroom_price: showroom_price,
                    on_road_price: on_road_price,
                    is_content_writer: is_content_writer,
                    is_designer: is_designer,
                }

                let car_exist = await vehicle_information.findOne({ $and: [{ brand_id: brand_id }, { model_name: model_name }] })

                if (car_exist) {
                    let vehicle_information_id = car_exist._id
                    let php_vehicle_information_id = car_exist.php_id
                    await vehicle_information.findOneAndUpdate({ $and: [{ brand_id: brand_id }, { model_name: model_name }] }, cardata, { new: true })
                    await get_vehicle_other_details(new_car_url, vehicle_information_id, 0, cardata, php_vehicle_information_id)
                } else {
                    let create = await vehicle_information.create({ ...cardata, php_id: php_id })
                    console.log("vehicle_information created!! 1")

                    let vehicle_information_id = create._id
                    let php_vehicle_information_id = create.php_id
                    await get_vehicle_other_details(new_car_url, vehicle_information_id, 0, cardata, php_vehicle_information_id)
                }

            }
        }

        if ('upcomingCars' in data_res_arr) {
            console.log('data_res_arr upcomingCars>>>', data_res_arr)
            let url = data_res_arr.upcomingCars.url ? data_res_arr.upcomingCars.url : null
            if (url) {
                await upcoming_car_by_brand(url, input)
            } else {
                await helper.macthError('Upcoming Car Not Scrapped')
            }
        }
        return (await helper.successResponse('Cars scrapped successfully!!'))
    } catch (err) {
        console.log(err);
    }
}

const get_vehicle_other_details = async (url, vehicle_information_id, variant_id = 0, input, php_vehicle_information_id) => {
    console.log('function Caslalll')
    var new_car_url = "https://www.cardekho.com" + url
    var variant_data_arr = await scrap_coman_code(new_car_url)

    if ('quickOverview' in variant_data_arr) {
        var feature = variant_data_arr.quickOverview.list ? variant_data_arr.quickOverview.list : "NA"

        if (feature) {
            if (typeof feature !== "string") {
                var specs = feature.map((valde) => {
                    var specs_arr = valde.iconname ? valde.iconname : "NA"

                    if (valde.iconname == "Transmission") {
                        specs_arr = valde.iconname
                    } else {
                        specs_arr = valde.iconvalue ? valde.iconvalue : ""
                    }
                    return specs_arr
                })
                var key_fear = specs.map((valuedata) => {
                    return valuedata
                })
            } else {
                key_fear = "NA"
            }
        } else {
            key_fear = "NA"
        }
        /*Multidimention Array to string conversion*/
        let key_specs = 'Features:' + key_fear

        // const qr = ("UPDATE " + `vehicle_information ` + "SET " + `key_specs = '${key_specs}' WHERE id = ${vehicle_information_id}`)
        // const update = await con.query(qr)
        let update = await vehicle_information.findOneAndUpdate({ _id: vehicle_information_id }, { key_specs: key_specs }, { new: true })
        //specification
        if (url in variant_data_arr) {
            if (variant_data_arr.url) {
                await get_vehicle_specification(variant_data_arr.url, vehicle_information_id, 0, input, php_vehicle_information_id)
            }
        }
    }
    //----------------------------Vehicle Images+ colors ------------------------ Main Vehicle Images
    //insert vehicle color images
    if ('galleryColorSection' in variant_data_arr) {
        if ('items' in variant_data_arr.galleryColorSection) {
            const images = variant_data_arr.galleryColorSection.items
            for (const color_img of images) {
                const color_name = color_img.title ? color_img.title : "NA"
                const color_code = color_img.code ? color_img.code : "NA"
                const image = color_img.image ? color_img.image : "NA"
                const official_image = color_img.image ? color_img.image : "NA"
                let cheakidModelColor = await vehicle_model_color.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                let tokenidModelColor = cheakidModelColor ? cheakidModelColor.php_id + 1 : 1
                const php_id = tokenidModelColor

                const carcolor = {
                    php_id: php_id,
                    vehicle_information_id: vehicle_information_id,
                    color_name: color_name,
                    color_code: color_code,
                    image: image
                }
                let color_exist = await vehicle_model_color.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { color_name: color_name }, { image: official_image }] }).count()
                if (color_exist) {
                    await vehicle_model_color.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { color_name: color_name }] }, carcolor, { new: true })
                } else {
                    await vehicle_model_color.create({ ...carcolor, php_vehicle_information_id: php_vehicle_information_id })
                }
            }
        }
    }
    //images*****************

    //----------------------------Variant table------------------
    // if ('variantTable' in variant_data_arr) {
    //     var variantTable = variant_data_arr.variantTable
    //     if ('childs' in variantTable) {
    //         var child_variant_ = variantTable.childs
    //         child_variant_.map((valdatas) => {
    //             if ('items' in valdatas) {
    //                 var childs_arr = valdatas.items.map(async (child) => {
    //                     var child = child.url
    //                     var exShowRoomPrice = child.exShowRoomPrice ? child.exShowRoomPrice : 0
    //                     var onRoadPrice = child.onRoadPrice ? child.onRoadPrice : 0
    //                     await get_variant_details(child, vehicle_information_id, exShowRoomPrice, onRoadPrice, input)
    //                 })
    //             }
    //         })
    //     }
    // }

    if ('variantTable' in variant_data_arr) {
        var variantTable = variant_data_arr.variantTable
        if ('childs' in variantTable) {
            var child_variant_ = variantTable.childs
            for (const child_variant of child_variant_) {
                if ('items' in child_variant) {
                    for (const child of child_variant.items) {
                        var url = child.url
                        var exShowRoomPrice = child.exShowRoomPrice ? child.exShowRoomPrice : 0
                        var onRoadPrice = child.onRoadPrice ? child.onRoadPrice : 0
                        await get_variant_details(url, vehicle_information_id, exShowRoomPrice, onRoadPrice, input, php_vehicle_information_id)
                    }
                }
            }
        }
    }

    let highlights_desc
    let price_desc
    if ('pagetitle' in variant_data_arr) {
        if ('description' in variant_data_arr.pagetitle) {
            var highlights = variant_data_arr.pagetitle.description ? strip_tags(variant_data_arr.pagetitle.description) : "NA"
            highlights_desc = highlights
        }
    }
    if ('variantTableHighlight' in variant_data_arr) {
        var price = variant_data_arr.variantTableHighlight.description ? strip_tags(variant_data_arr.variantTableHighlight.description) : "NA"
        price_desc = price
    }
    const data = {
        highlights_desc: highlights_desc,
        price_desc: price_desc
    }

    const createVehInfo = await vehicle_information.findOneAndUpdate({ _id: vehicle_information_id }, data, { new: true })
}


const get_variant_details = async (picture_url, vehicle_information, exShowRoomPrice, onRoadPrice, input, php_vehicle_information_id) => {
    var url = "https://www.cardekho.com" + picture_url
    var child_data = await scrap_coman_code(url)
    // console.log(child_data)
    var variantObjectId
    if ('dataLayer' in child_data) {
        let mileage = child_data.dataLayer[0].max_mileage_new ? child_data.dataLayer[0].max_mileage_new : 0
        let engine = child_data.dataLayer[0].engine_cc ? child_data.dataLayer[0].engine_cc : 0
    }
    if ('overView' in child_data) {
        var child = child_data.overView
        const vehicle_information_id = vehicle_information
        const name = child.name ? child.name : "NA"
        const price = child.priceRange ? child.priceRange : 0;
        const price_range = child.modelPriceRange ? child.modelPriceRange : 0;
        const review_count = child.reviewCount ? child.reviewCount : 0;
        const status = child.modelStatus ? child.modelStatus : "NA";
        const fuel_type = child.fuelType ? child.fuelType : "NA";
        const ex_show_room_rice = exShowRoomPrice;
        const on_road_price = onRoadPrice;
        const mileage = child_data.mileage ? child_data.mileage : 0;
        const engine = child_data.engine ? child_data.engine : 0;
        const link = "https://www.cardekho.com" + child.modelUrl

        let cheakidPriceVariant = await PriceVariant.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
        let tokenidPriceVariant = cheakidPriceVariant ? cheakidPriceVariant.php_id + 1 : 1
        const php_id = tokenidPriceVariant

        const variantobje = {
            // id: id,
            vehicle_information_id: vehicle_information_id,
            php_vehicle_information_id: php_vehicle_information_id,
            name: name,
            link: link,
            engine: engine,
            status: status,
            fuel_type: fuel_type,
            ex_show_room_rice: ex_show_room_rice,
            mileage: mileage,
            on_road_price: on_road_price,
            price_range: price_range,
            review_count: review_count,
        }

        const variant_exist = await PriceVariant.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { name: name }] })
        // dd("stop!!")
        var php_variant_id
        // await createCarPriceVariant(variant_exist, vehicle_information_id, name, variantobje, php_id, variantObjectId)
        if (variant_exist) {
            // const qr = ("UPDATE " + `vehicle_price_variant ` + "SET " + `vehicle_information_id = ${vehicle_information_id},name='${name}',link='${link}',engine=${engine},price_range='${price_range}',status='${status}',fuel_type='${fuel_type}',on_road_price=${on_road_price}, review_count = ${review_count}, mileage=${mileage},ex_show_room_rice=${ex_show_room_rice} WHERE vehicle_information_id = ${vehicle_information_id} AND name = '${name}'`)
            // const update = await con.query(qr)
            variantObjectId = variant_exist._id
            php_variant_id = variantObjectId.php_id
            // console.log('If')
            const findPriceVarianr = await PriceVariant.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { name: name }] }, variantobje, { new: true })
        }
        if (!variant_exist) {
            // console.log("else")
            const variant = await PriceVariant.create({ ...variantobje, php_id: php_id, php_vehicle_information_id: php_vehicle_information_id })
            variantObjectId = variant._id
            php_variant_id = variant.php_id
            // console.log("PriceVariant created!!!")
        }

    }
    let used_var
    if ('specsTechnicalJson' in child_data) {
        if ('specification' in child_data.specsTechnicalJson) {
            for (const specification of child_data.specsTechnicalJson.specification) {
                const spec_name = specification.title ? specification.title : "NA"
                let cheakVariantSpecificationId = await VariantSpecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                let tokenIdOfVariantSpec = cheakVariantSpecificationId ? cheakVariantSpecificationId.php_id + 1 : 1;
                let idOfVarSpec = tokenIdOfVariantSpec;

                let spec_id
                let php_specification_id
                const carvar = {
                    php_id: idOfVarSpec,
                    name: spec_name
                }

                const spec_exist = await VariantSpecification.findOne({ name: spec_name })
                if (spec_exist) {
                    spec_id = spec_exist._id
                    php_specification_id = spec_exist.php_id
                } else {
                    const createVariant = await VariantSpecification.create(carvar)
                    spec_id = createVariant._id
                    php_specification_id = createVariant.php_id

                }

                used_var = {
                    variant_id: variantObjectId,
                    vehicle_information_id: vehicle_information,
                    specification_id: spec_id
                }
                async function processItems1() {
                    for (const s of specification.items) {
                        let spec_name = s.text ? s.text : "NA"
                        let spec_value = s.value ? s.value : "NA"
                        let v_spe_exist = await VariantKey.findOne({ $and: [{ vehicle_information_id: vehicle_information }, { variant_id: variantObjectId }, { specification_id: spec_id }, { name: spec_name }] })
                        // let [rows, filed] = await con.query("SELECT * FROM `varient_key` WHERE `vehicle_information_id`= " + `${vehicle_information} AND variant_id = ` + `${variant_id} AND specification_id = ${spec_id} AND name = '${spec_name}'`)
                        // const v_spe_exist = rows[0]
                        used_var.name = spec_name
                        used_var.value = spec_value
                        used_var.php_variant_id = php_variant_id
                        used_var.php_specification_id = php_specification_id
                        used_var.php_vehicle_information_id = php_vehicle_information_id
                        const cheakidOfKeySpec = await keyspecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                        const tokenIdOfKeySpec = await (cheakidOfKeySpec ? cheakidOfKeySpec.php_id + 1 : 1);
                        const findOrUpdateKeySpesificationn = await keyspecification.findOne({ name: spec_name })
                        if (findOrUpdateKeySpesificationn) {
                            used_var.variant_key_id = findOrUpdateKeySpesificationn._id;
                            used_var.php_variant_key_id = findOrUpdateKeySpesificationn.php_id;
                        } else {
                            const createKeySpece = await keyspecification.create({ name: spec_name, php_id: tokenIdOfKeySpec })
                            used_var.variant_key_id = createKeySpece._id;
                            used_var.php_variant_key_id = createKeySpece.php_id;
                        }

                        if (v_spe_exist) {
                            // const updateQr = ("UPDATE " + `varient_key ` + "SET " + `vehicle_information_id = ${vehicle_information}, variant_id = ${variant_id}, specification_id = ${spec_id}, name = '${spec_name}',value = '${spec_value}'  WHERE vehicle_information_id = ${vehicle_information} AND variant_id = ${variant_id} AND specification_id = ${spec_id} AND name = '${spec_name}'`)
                            // const updateVar = await con.query(updateQr)
                            let update = await VariantKey.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information }, { variant_id: variantObjectId }, { specification_id: used_var.specification_id }, { name: spec_name }] }, used_var, { new: true })

                        } else {
                            const cheakidOfVariantKey = await VariantKey.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                            const tokenIdOfVariantKey = await (cheakidOfVariantKey ? cheakidOfVariantKey.php_id + 1 : 1);
                            used_var.php_id = tokenIdOfVariantKey;
                            let createVariantKey = await VariantKey.create(used_var)
                        }
                    }
                }
                await processItems1()
            }
        }

        if ('featured' in child_data.specsTechnicalJson) {
            for (const featured of child_data.specsTechnicalJson.featured) {
                const spec_name = featured.title ? featured.title : "NA"
                let cheakVariantSpecificationId = await VariantSpecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                let tokenIdOfVariantSpec = cheakVariantSpecificationId ? cheakVariantSpecificationId.php_id + 1 : 1;
                let idOfVarSpec = tokenIdOfVariantSpec;
                const carvar = {
                    php_id: idOfVarSpec,
                    name: spec_name
                }
                let spec_exist = await VariantSpecification.findOne({ name: spec_name })
                // let [rows, filed] = await con.query("SELECT * FROM `variant_specifications` WHERE `name`= " + `'${spec_name}'`)
                // const spec_exist = rows[0]
                let spec_id
                let php_specification_id
                if (spec_exist) {
                    spec_id = spec_exist._id
                    php_specification_id = spec_exist.php_id
                } else {
                    // const qr = ("INSERT INTO variant_specifications (name)") + ' VALUES ' + `('${spec_name}')`
                    // const spec_id_ = await con.query(qr)
                    let CreateVariantSpec = await VariantSpecification.create(carvar)
                    // console.log("VariantSpecification created!!!")
                    spec_id = CreateVariantSpec._id
                    php_specification_id = CreateVariantSpec.php_id
                }
                let used_var = {
                    vehicle_information_id: vehicle_information,
                    variant_id: variantObjectId,
                    specification_id: spec_id
                }
                async function processItems2() {
                    for (const s of featured.items) {
                        let spec_name = s.text ? s.text : "NA"
                        let spec_value = s.value ? s.value : "NA"
                        let v_spe_exist = await VariantKey.findOne({ $and: [{ vehicle_information_id: vehicle_information }, { variant_id: variantObjectId }, { specification_id: used_var.specification_id }, { name: spec_name }] })
                        // let [rows, filed] = await con.query("SELECT * FROM `varient_key` WHERE `vehicle_information_id`= " + `${vehicle_information} AND variant_id = ` + `${variant_id} AND specification_id = ${spec_id} AND name = '${spec_name}'`)
                        // const v_spe_exist = rows[0]
                        used_var.name = spec_name
                        used_var.value = spec_value
                        used_var.php_vehicle_information_id = php_vehicle_information_id
                        used_var.php_variant_id = php_variant_id
                        used_var.php_specification_id = php_specification_id
                        const cheakidOfKeySpec = await keyspecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                        const tokenIdOfKeySpec = await (cheakidOfKeySpec ? cheakidOfKeySpec.php_id + 1 : 1);
                        const findOrUpdateKeySpesificationn = await keyspecification.findOne({ name: spec_name })
                        if (findOrUpdateKeySpesificationn) {
                            used_var.variant_key_id = findOrUpdateKeySpesificationn._id;
                            used_var.php_variant_key_id = findOrUpdateKeySpesificationn.php_id;
                        } else {
                            const createKeySpece = await keyspecification.create({ name: spec_name, php_id: tokenIdOfKeySpec })
                            used_var.variant_key_id = createKeySpece._id;
                            used_var.php_variant_key_id = createKeySpece.php_id;
                        }
                        if (v_spe_exist) {
                            // const updateQr = ("UPDATE " + `varient_key ` + "SET " + `vehicle_information_id = ${vehicle_information}, variant_id = ${variant_id}, specification_id = ${spec_id}, name = '${spec_name}',value = '${spec_value.replaceAll("'s", " ")}'  WHERE vehicle_information_id = ${vehicle_information} AND variant_id = ${variant_id} AND specification_id = ${spec_id} AND name = '${spec_name}'`)
                            // const updateVar = await con.query(updateQr)
                            let update = await VariantKey.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information }, { variant_id: variantObjectId }, { specification_id: used_var.specification_id }, { name: spec_name }] }, used_var, { new: true })

                        } else {
                            const cheakidOfVariantKey = await VariantKey.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                            const tokenIdOfVariantKey = await (cheakidOfVariantKey ? cheakidOfVariantKey.php_id + 1 : 1);
                            used_var.php_id = tokenIdOfVariantKey;
                            let createVarkey = await VariantKey.create(used_var)

                        }
                    }
                }
                await processItems2()
            }
        }

        if ('keySpecs' in child_data.specsTechnicalJson) {
            child_data.specsTechnicalJson.keySpecs.map((key) => {
                if (key.title.toLowerCase().includes("specification")) {
                    var is_specification = 1
                    var i = key.items.map(async (item) => {
                        // let [rows, filed] = await con.query("SELECT * FROM `varient_key` WHERE `vehicle_information_id`= " + `${vehicle_information} AND variant_id = ` + `${variant_id}  AND name = '${item.text}'`)
                        // const u = rows[0]
                        var u = await VariantKey.findOne({ $and: [{ vehicle_information_id: vehicle_information }, { variant_id: variantObjectId }, { name: item.text }] })
                        if (u) {
                            // const updateVar = await con.query(updateQr)
                            var u2 = await VariantKey.findOneAndUpdate({ php_id: u.php_id }, { is_specification: is_specification }, { new: true })
                        }
                    })
                }
                if (key.title.toLowerCase().includes("featured")) {
                    let is_feature = 1
                    let i = key.items.map(async (item) => {
                        // let [rows, filed] = await con.query("SELECT * FROM `varient_key` WHERE `vehicle_information_id`= " + `${vehicle_information} AND variant_id = ` + `${variant_id}  AND name = '${valdatas.text}'`)
                        // const u = rows[0]
                        let u = await VariantKey.findOne({ $and: [{ vehicle_information_id: vehicle_information }, { variant_id: variantObjectId }, { name: item.text }] })
                        if (u) {
                            // const updateVar = await con.query(updateQr)
                            let u2 = await VariantKey.findOneAndUpdate({ php_id: u.php_id }, { is_specification: is_specification, is_feature: is_feature }, { new: true })
                        }
                    })
                }
            })
        }

    }
}

// async function createCarPriceVariant(variant_exist, vehicle_information_id, name, variantobje, php_id, variantObjectId) {
//     if (variant_exist) {
//         // const qr = ("UPDATE " + `vehicle_price_variant ` + "SET " + `vehicle_information_id = ${vehicle_information_id},name='${name}',link='${link}',engine=${engine},price_range='${price_range}',status='${status}',fuel_type='${fuel_type}',on_road_price=${on_road_price}, review_count = ${review_count}, mileage=${mileage},ex_show_room_rice=${ex_show_room_rice} WHERE vehicle_information_id = ${vehicle_information_id} AND name = '${name}'`)
//         // const update = await con.query(qr)
//         variantObjectId = variant_exist._id
//       
//         const findPriceVarianr = await PriceVariant.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { name: name }] }, variantobje, { new: true })
//     }
//     if (!variant_exist) {
//    
//         const variant = await PriceVariant.create({ ...variantobje, php_id: php_id })
//         variantObjectId = variant._id
//     }
// }
const get_vehicle_specification = async (url, vehicle_information_id, variant_id, input, php_vehicle_information_id) => {
    var url = "https://www.cardekho.com" + url

    var colors_data = await scrap_coman_code(url)
    let used_var = {
        vehicle_information_id: vehicle_information_id,
        variant_id: variant_id
    }

    if ('specsTechnicalJson' in colors_data) {
        if ('specification' in colors_data.specsTechnicalJson) {

            for (const specification of colors_data.specsTechnicalJson.specification) {
                const spec_name = specification.title ? specification.title : "NA"

                let cheakVariantSpecificationId = await VariantSpecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                let tokenIdOfVariantSpec = cheakVariantSpecificationId ? cheakVariantSpecificationId.php_id + 1 : 1;
                let idOfVarSpec = tokenIdOfVariantSpec;

                const carvar = {
                    php_id: idOfVarSpec,
                    name: spec_name
                }
                // let [rows, filed] = await con.query("SELECT * FROM `variant_specifications` WHERE `name`= " + `'${spec_name}'`)
                // const spec_exist = rows[0]
                var spec_exist = await VariantSpecification.findOne({ name: spec_name })
                let spec_id
                let php_specification_id

                if (spec_exist) {
                    spec_id = spec_exist._id
                    php_specification_id = spec_exist.php_id
                } else {
                    const CreateVariantSpec = await VariantSpecification.create(carvar)
                    spec_id = CreateVariantSpec._id
                    php_specification_id = CreateVariantSpec.php_id

                }
                used_var = {
                    vehicle_information_id: vehicle_information_id,
                    variant_id: variant_id,
                    specification_id: spec_id
                }
                async function processItems3() {
                    for (const values of specification.items) {
                        let spec_name = values.text ? values.text : "NA"
                        let spec_value = values.value ? values.value : "NA"
                        let v_spe_exist = await VariantKey.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { specification_id: spec_id }, { name: spec_name }] })
                        const cheakidOfKeySpec = await keyspecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                        const tokenIdOfKeySpec = await (cheakidOfKeySpec ? cheakidOfKeySpec.php_id + 1 : 1);
                        const findOrUpdateKeySpesificationn = await keyspecification.findOne({ name: spec_name })

                        if (findOrUpdateKeySpesificationn) {
                            used_var.variant_key_id = findOrUpdateKeySpesificationn._id;
                            used_var.php_variant_key_id = findOrUpdateKeySpesificationn.php_id;
                        } else {
                            const createKeySpece = await keyspecification.create({ name: spec_name, php_id: tokenIdOfKeySpec })
                            used_var.variant_key_id = createKeySpece._id;
                            used_var.php_variant_key_id = createKeySpece.php_id;
                        }
                        used_var.name = spec_name
                        used_var.value = spec_value
                        used_var.php_vehicle_information_id = php_vehicle_information_id
                        used_var.php_variant_id = php_variant_id
                        used_var.php_specification_id = php_specification_id
                        if (v_spe_exist) {
                            let update = await VariantKey.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { specification_id: spec_id }, { name: spec_name }] }, used_var, { new: true })
                        } else {
                            const cheakidOfVariantKey = await VariantKey.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                            const tokenIdOfVariantKey = await (cheakidOfVariantKey ? cheakidOfVariantKey.php_id + 1 : 1);
                            used_var.php_id = tokenIdOfVariantKey;
                            let CreateVariantKey = await VariantKey.create(used_var)
                        }
                    }
                }
                await processItems3()
            }
        }
        if ('keySpecs' in colors_data.specsTechnicalJson) {
            for (const valudata of colors_data.specsTechnicalJson.keySpecs) {
                if (valudata.title.toLowerCase().includes("specifications")) {
                    var is_specification = 1
                    var i = valudata.items.map(async (valdatas) => {
                        // let [rows, filed] = await con.query("SELECT * FROM `varient_key` WHERE `vehicle_information_id`= " + `${vehicle_information_id} AND variant_id = ` + `${variant_id}  AND name = '${valdatas.text}'`)
                        // const u = rows[0]
                        let u = await VariantKey.findOne({ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { name: valdatas.text })
                        if (u) {
                            // const updateVar = await con.query(updateQr)

                            let u2 = await VariantKey.findOneAndUpdate({ php_id: u.php_id }, { is_specification: is_specification }, { new: true })
                        }
                    })
                }
                if (valudata.title.toLowerCase().includes("Features")) {
                    var is_feature = 1
                    var i = valudata.items.map(async (valdatas) => {
                        // let [rows, filed] = await con.query("SELECT * FROM `varient_key` WHERE `vehicle_information_id`= " + `${vehicle_information_id} AND variant_id = ` + `${variant_id}  AND name = '${valdatas.text}'`)
                        // const u = rows[0]

                        let u = await VariantKey.findOne({ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { name: valdatas.text })
                        if (u) {
                            // const updateVar = await con.query(updateQr)

                            let u2 = await VariantKey.findOneAndUpdate({ php_id: u.php_id }, { is_feature: is_feature }, { new: true })
                        }
                    })
                }
            }
        }
    }
}
const get_specific_car = async (link, input1, brand) => {
    // console.log('link, input1, brand', link, input1, brand)

    let data_res_arr_ = await scrap_coman_code(link);
    if ('overView' in data_res_arr_) {
        let car_data = data_res_arr_.overView;
        var res_specific_bike = car_data.name;
    } else {
        return (await helper.macthError('Model not Found'))
    }
    var brand = brand
    var brand_id = brand._id
    let brand_php_id = brand.php_id
    const findCategory = await CategoryModel.findOne({ php_id: input1.category })
    let category_id_ = findCategory._id
    let category_php_id = findCategory.php_id
    var new_bike_url = "https://www.cardekho.com/cars/" + brand.name;
    let data_res_arr = await scrap_coman_code(new_bike_url)
    // console.log('data_res_arr>>>>>', data_res_arr)


    // if (res_specific_bike.toLowerCase() === data_res_arr_.dataLayer[0].model_name.toLowerCase()) {
    //     let cheakid = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
    //     let tokenid = cheakid ? cheakid.php_id + 1 : 1
    //     const php_id = tokenid
    //     let bodytype_id_;
    //     let php_bodytype_id_
    //     await getInsertCarWithoutDataFromDataLayer(res_specific_bike, php_id, category_id_, category_php_id, brand_php_id, brand_id, data_res_arr, data_res_arr_)
    //     await helper.successResponse('Vehicle Scrapped!!!')
    // }

    if ('items' in data_res_arr) {
        for (const val of data_res_arr?.items) {
            if (res_specific_bike == val.modelName) {

                let cheakid = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                let tokenid = cheakid ? cheakid.php_id + 1 : 1
                const php_id = tokenid
                brand_id = brand_id
                const avg_rating = val.avgRating ? val.avgRating : 0
                const review_count = val.reviewCount ? val.reviewCount : 0
                const variant_name = val.variantName ? val.variantName : 0
                let min_price = val.minPrice ? val.minPrice : 0
                let max_price = val.maxPrice ? val.maxPrice : 0
                const price_range = val.priceRange ? val.priceRange : "NA"
                const status = val.status ? val.status : "NA"
                const launched_at = val.launchedAt ? val.launchedAt : "NA"
                const model_name = val.modelName
                const mileage = val.mileage ? parseFloat(val.mileage) : 0
                const engine = val.engine ? val.engine : 0
                const fuel_type = val.fuelType ? val.fuelType : "NA";
                let showroom_price = 0
                showroom_price = val.exShowRoomPrice ? val.exShowRoomPrice : "NA";
                const model_popularity = val.modelPopularity ? val.modelPopularity : "NA";
                const style_type = val.dcbdto.bodyType ? val.dcbdto.bodyType || val.style_type : "NA";
                const category_id = category_id_;
                const on_road_price = val.minOnRoadPrice ? val.minOnRoadPrice : val.exShowRoomPric ? val.exShowRoomPric : "NA";
                var new_car_url = val.modelUrl
                var images_url = val.modelPictureURL
                var specification_url = val.modelSpecsURL

                let is_content_writer
                let is_designer
                is_content_writer = val.upcoming === true ? 1 : 0;
                is_designer = val.upcoming === true ? 1 : 0;
                is_content_writer = style_type === "NA" ? 1 : 0
                is_designer = style_type === "NA" ? 1 : 0

                let bodytype_id;
                let php_bodytype_id
                let bodyTypedata = await Bodytypes.findOne({ $and: [{ category_id: category_id }, { name: style_type }] })
                if (bodyTypedata) {
                    bodytype_id = bodyTypedata._id
                    php_bodytype_id = bodyTypedata.php_id
                } else {
                    const cheakBodyTypeId = await Bodytypes.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                    let tokenIdOfBodytype = cheakBodyTypeId ? cheakBodyTypeId.php_id + 1 : 1;

                    let bodyTypedata_ = await Bodytypes.create({ php_id: tokenIdOfBodytype, name: style_type, category_id: category_id, image: '', status: 1, position: 0 })
                    bodytype_id = bodyTypedata_._id
                    php_bodytype_id = bodyTypedata_.php_id
                }
                let rto_price = 0

                if (showroom_price?.includes('Cr')) {
                    let number = parseFloat(showroom_price.replace(" Cr", ""));
                    const result = number * 10000000;
                    showroom_price = result;
                }

                if (showroom_price?.includes('Lakh')) {
                    let number = parseFloat(showroom_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    showroom_price = result;
                }

                if (on_road_price?.includes('Lakh')) {
                    let number = parseFloat(on_road_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    on_road_price = result;
                }
                if (on_road_price?.includes('Cr')) {
                    let number = parseFloat(on_road_price.replace(" Cr", ""));
                    const result = number * 10000000;
                    on_road_price = result;
                }

                if (min_price?.includes('Lakh')) {
                    let number = parseFloat(min_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    min_price = result;
                }
                if (typeof min_price === 'string' && min_price.includes('Cr')) {
                    let number = parseFloat(min_price.replace(" Cr", ""));
                    const result = number * 10000000;
                    min_price = result;
                }
                if (max_price != 0) {
                    if (max_price?.includes('Lakh')) {
                        let number = parseFloat(max_price.replace(" Lakh", ""));
                        const result = number * 100000;
                        max_price = result;
                    }
                    if (max_price?.includes('Cr')) {
                        let number = parseFloat(max_price.replace(" Cr", ""));
                        const result = number * 10000000;
                        max_price = result;
                    }
                } else {
                    max_price = 0
                }
                // var client = await axios.get("https://www.bikedekho.com" + val.dcbdto.modelPriceURL)
                // var html = cheerio.load(client.data).html()
                // var response = html.split('</script>');
                // var data_respone = get_string_between(response[11], '<script>window.__INITIAL_STATE__ = ', " window.__isWebp =  false;")
                // var data1 = data_respone.split("; window.__CD_DATA__ =")
                // var data2 = data1[0].split('" ",{}; window.__isMobile')
                // let res_arr = JSON.parse(data2)


                // if (res_arr.items[0].exShowroomPrice) {
                //     if (res_arr.items[0].exShowroomPrice == "") {
                //         showroom_price = 0
                //     } else {
                //         showroom_price = res_arr.items[0].exShowroomPrice
                //     }
                // }
                // if (showroom_price < 25000) {
                //     rto_price = ((showroom_price * 2) / 100)
                // } else {
                //     if (showroom_price > 25000 && showroom_price < 45000) {
                //         rto_price = ((showroom_price * 4) / 100)
                //     } else {
                //         if (showroom_price > 45000 && showroom_price < 60000) {
                //             rto_price = ((showroom_price * 6) / 100)
                //         } else {
                //             if (showroom_price > 60000) {
                //                 rto_price = ((showroom_price * 8) / 100)
                //             }
                //         }
                //     }
                // }
                // if (val.minOnRoadPrice) {
                //     if (val.minOnRoadPrice == "") {
                //         on_road_price = 0
                //     } else {
                //         on_road_price = val.minOnRoadPrice
                //     }
                // }
                const cardata = {
                    category_id: category_id,
                    category_php_id: category_php_id,
                    brand_php_id: brand_php_id,
                    brand_id: brand_id,
                    link: link,
                    bodytype_id: bodytype_id,
                    php_bodytype_id: php_bodytype_id,
                    scrap_type: input1.scrap_type,
                    model_name: model_name,
                    fuel_type: fuel_type,
                    avg_rating: avg_rating,
                    review_count: review_count,
                    variant_name: variant_name,
                    min_price: min_price,
                    max_price: max_price,
                    price_range: price_range,
                    status: status,
                    launched_at: launched_at,
                    model_popularity: model_popularity,
                    mileage: mileage,
                    engine: engine,
                    rto_price: rto_price,
                    style_type: style_type,
                    showroom_price: showroom_price,
                    on_road_price: on_road_price,
                    is_content_writer: is_content_writer,
                    is_designer: is_designer
                }

                var car_exist = await vehicle_information.findOne({ $and: [{ model_name: model_name }, { brand_id: brand_id }] })
                if (car_exist) {
                    var vehicle_information_id = car_exist._id
                    let php_vehicle_information_id = car_exist.php_id
                    console.log('cra Updated!!!')
                    await vehicle_information.findOneAndUpdate({ $and: [{ model_name: model_name }, { brand_id: brand_id }] }, cardata, { new: true })
                    await get_vehicle_other_details(new_car_url, vehicle_information_id, 0, cardata, php_vehicle_information_id)
                    return await helper.successResponse("Car scrapping succesfully!")
                } else {
                    console.log('cra created!!!')
                    let response = await vehicle_information.create({ ...cardata, php_id: php_id })
                    vehicle_information_id = response._id
                    let php_vehicle_information_id = response.php_id
                    const createData = await get_vehicle_other_details(new_car_url, vehicle_information_id, 0, cardata, php_vehicle_information_id)
                    return await helper.successResponse("Car scrapping succesfully!")
                }
                await helper.successResponse("Car scrapping succesfully!")
            } else {
                await helper.macthError('Car Model Not Found')
            }

        }
    }
}

async function getInsertCarWithoutDataFromDataLayer(model_name, php_id, category_id_, category_php_id, brand_php_id, brand_id, data_res_arr, data_res_arr_) {
    // console.log('data_res_arr.dataLayer>>>>', data_res_arr_.dataLayer[0])
    if ("dataLayer" in data_res_arr) {
        const carData = {
            category_id: category_id_,
            category_php_id: category_php_id,
            brand_php_id: brand_php_id,
            brand_id: brand_id,
            bodytype_id: null,
            php_bodytype_id: 0,
            model_name: model_name,
            min_price: data_res_arr_.dataLayer[0].min_price_segment_new,
            max_price: data_res_arr_.dataLayer[0].max_price_segment_new,
            price_range: data_res_arr_.dataLayer[0].price,
            mileage: data_res_arr_.dataLayer[0].mileage_new || "NA",
            is_content_writer: 0,
            is_designer: 0,
            is_upcoming: 1
        }
        let car_exist = await vehicle_information.findOne({ $and: [{ model_name: model_name }, { brand_id: brand_id }] })

        if (!car_exist) {
            console.log('car_exist if >>>>>', car_exist)
            let response = await vehicle_information.create({ ...carData, php_id: php_id, })
            await helper.successResponse("Car scrapping succesfully Without data!")
        } else {
            console.log('car_exist else >>>>>', car_exist)
            await vehicle_information.findOneAndUpdate({ $and: [{ model_name: model_name }, { brand_id: brand_id }] }, carData, { new: true })
            await helper.successResponse("Car scrapping succesfully Update Without data!")

        }
    }
}
const scrap_coman_code = async (url) => {
    const res = await axios.get(url)
    var crawler = cheerio.load(res.data).html()
    var html = crawler.split('</script>');
    let data_respone = get_string_between(html[10], '; window.__INITIAL_STATE__ = ', "; window.__isWebp =  false;")
    var data1 = data_respone.split("; window.__CD_DATA__ =")
    var data2 = data1[0].split('" ",{}; window.__isMobile')
    let res_arr = JSON.parse(data2)
    return res_arr
}

const get_string_between = (string, start, end) => {
    string = ' ' + string;
    var ini = string.indexOf(start);
    if (ini === 0) return '';
    ini += start.length;
    let len = string.indexOf(end);

    return string.slice(ini, len);

}

const upcoming_car_by_brand = async (url, input) => {
    var new_car_url = 'https://www.cardekho.com' + url
    var data_res_arr = await scrap_coman_code(new_car_url)
    if ('items' in data_res_arr) {
        const upcome = await insert_cars_without_items(data_res_arr.items, 'is_upcoming', input)
        if (upcome) {
            if ('popularCars' in data_res_arr.pages) {
                console.log('data_res_arr popularCars >>>>', data_res_arr)
                if ('popular' in data_res_arr.popularCars) {
                    const create = await insert_cars_without_items(data_res_arr.popularCars, 'is_popular_search', input)
                }
            }
        }
    }
}

const insert_cars_without_items = async (data_res_arr, type, input) => {
    for (const val of data_res_arr) {

        let category_id
        const category_id_ = await CategoryModel.findOne({ php_id: Number(input.category) })
        category_id = category_id_._id || null
        let category_php_id = category_id_.php_id || 0

        let brand = await Brands.findOne({ $and: [{ category_id: Number(input.category) }, { name: input.brand }] })
        let brand_id = brand._id || null
        let brand_php_id = brand.php_id || 0
        const model_name = val.modelName ? val.modelName : val.name
        const fuel_type = val.fuelType ? val.fuelType : "NA"
        const avg_rating = val.avgRating ? val.avgRating : 0
        const review_count = val.reviewCount ? val.reviewCount : 0
        const variant_name = val.variantName ? val.variantName : "NA"
        const min_price = val.minPrice ? val.minPrice.replace(',', '') : 0
        const max_price = val.maxPrice ? val.maxPrice.replace('.', '') : "NA"
        const price_range = val.priceRange ? val.priceRange : "NA"
        const status = val.status ? val.status : "NA"
        const launched_at = val.launchedAt ? val.launchedAt : "NA"
        const Launch_date = val.variantLaunchDate ? val.variantLaunchDate : "NA";
        const engine = val.engine ? val.engine : 0;
        const mileage = val.mileage ? parseFloat(val.mileage) : 0;
        const style_type = val?.dcbdto?.bodyType ? val?.dcbdto?.bodyType || val.style_type : "NA"
        const max_power = val.maxPower ? val.maxPower : "NA";
        const model_popularity = val.modelPopularity ? parseFloat(val.modelPopularity) : 0;
        const showroom_price = val.exShowroomPrice ? val.exShowroomPrice : 0;
        const on_road_price = val.minOnRoadPrice ? val.minOnRoadPrice : 0;
        let is_content_writer
        let is_designer
        is_content_writer = val.upcoming === true ? 1 : 0;
        is_designer = val.upcoming === true ? 1 : 0;
        is_content_writer = style_type === "NA" ? 1 : 0
        is_designer = style_type === "NA" ? 1 : 0

        const type = 1;
        if (showroom_price.includes('Lakh')) {
            const number = parseFloat(showroom_price.replace(" Lakh", ""));
            const result = number * 100000;
            showroom_price = result;
        }
        if (on_road_price.includes('Lakh')) {
            const number = parseFloat(on_road_price.replace(" Lakh", ""));
            const result = number * 100000;
            on_road_price = result;
        }

        if (min_price.includes('Lakh')) {
            const number = parseFloat(min_price.replace(" Lakh", ""));
            const result = number * 100000;
            min_price = result;
        }
        if (max_price != 0) {
            if (max_price.includes('Lakh')) {
                const number = parseFloat(max_price.replace(" Lakh", ""));
                const result = number * 100000;
                max_price = result;
            }
        } else {
            max_price = 0
        }
        let car_exist = await vehicle_information.findOne({ model_name: model_name })


        const insert_car = {
            // id: id,
            category_id: category_id,
            brand_id: brand_id,
            category_php_id: category_php_id,
            brand_php_id: brand_php_id,
            link: link,
            scrap_type: 'car',
            model_name: model_name,
            fuel_type: fuel_type,
            avg_rating: avg_rating,
            review_count: review_count,
            variant_name: variant_name,
            min_price: min_price,
            max_price: max_price,
            price_range: price_range,
            status: status,
            launched_at: launched_at,
            Launch_date: Launch_date,
            model_popularity: model_popularity,
            mileage: mileage,
            engine: engine,
            style_type: style_type,
            max_power: max_power,
            showroom_price: showroom_price,
            on_road_price: on_road_price,
            is_content_writer: is_content_writer,
            is_designer: is_designer
        }

        var model_url = val.modelUrl
        link = model_url
        const image = ""
        let cheakid = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
        let tokenid = cheakid ? cheakid.php_id + 1 : 1
        const php_id = tokenid
        if (car_exist) {
            vehicle_information_id = car_exist._id
            if (model_url == "NA") {
                if (val.image) {
                    //********************Image Running**********************/
                } else {
                    image = "NA"
                }
                await vehicle_information.findOneAndUpdate({ $and: [{ brand_id: brand_id }, { model_name: model_name }] }, insert_car, { new: true })

            }
        }
        let php_vehicle_information_id
        if (!car_exist) {
            // const qr = ("INSERT INTO vehicle_information( category_id, model_name, fuel_type, avg_rating, review_count, variant_name, min_price, max_price, status, launched_at, Launch_date, model_popularity, mileage, engine, style_type, showroom_price, on_road_price, link )") + ' VALUES ' + (`( ${category_id},'${model_name}','${fuel_type}',${avg_rating},${review_count},'${variant_name}','${min_price}','${max_price}','${status}','${launched_at}','${Launch_date}',${model_popularity},${mileage},'${engine}','${style_type}',${showroom_price},${on_road_price},'${link}')`)

            // let craete = await con.query(qr)

            let response = await vehicle_information.create({ ...insert_car, php_id: php_id })
            console.log("vehicle_information created!! 3")
            var vehicle_information_id = response._id
            php_vehicle_information_id = response.php_id
        }
        var model_url = val.modelUrl
        php_vehicle_information_id = car_exist?.php_id || 0
        var car_images = await get_vehicle_other_details_latest(model_url, vehicle_information_id, 0, input, php_vehicle_information_id)

    }
}

const get_vehicle_other_details_latest = async (url, vehicle_information_id, variant_id = 0, input, php_vehicle_information_id) => {
    var new_car_url = "https://www.cardekho.com" + url
    var variant_data_arr = await scrap_coman_code(new_car_url)
    if ('overView' in variant_data_arr) {
        if ('images' in variant_data_arr.overView) {

        }   //********************************IMage Runnning*(*(*(*(*(*(*(*(*(*(*(*(*(*()))))))))))))) */
    }
    if ('quickOverview' in variant_data_arr) {               //Scrap Vehicle details
        var feature = variant_data_arr.quickOverview.list ? variant_data_arr.quickOverview.list : "NA"

        if (feature) {
            if (typeof feature != 'string') {
                var specs = feature.map((sp) => {
                    var specs_arr = sp.iconname ? sp.iconname : "NA"
                    if (sp.iconname == "Transmission") {
                        specs_arr = sp.iconname
                    } else {
                        specs_arr = sp.iconvalue ? sp.iconvalue : ""
                    }
                    return specs_arr
                })
                var key_fear = specs.map((key_feature) => {
                    return key_feature
                })
            } else {
                key_fear = "NA"
            }
        } else {
            key_fear = "NA"
        }
        /*Multidimention Array to string conversion*/
        var key_specs = "Features" + key_fear

        // const qr = ("UPDATE " + `vehicle_information ` + "SET " + ` key_specs = '${key_specs}' WHERE id = ${vehicle_information_id}`)
        // const update = await con.query(qr)

        let update = await vehicle_information.findOneAndUpdate({ php_id: vehicle_information_id }, { key_specs: key_specs }, { new: true })


        if ('url' in variant_data_arr) {
            if (variant_data_arr.url) {
                await get_vehicle_specification(variant_data_arr.url, vehicle_information_id, 0, input, php_vehicle_information_id)
            }
        }
    }
    //----------------------------Vehicle Images+ colors ------------------------ Main Vehicle Images

    if ('galleryColorSection' in variant_data_arr) {
        if ('items' in variant_data_arr.galleryColorSection) {
            await insert_color_img_with_item(variant_data_arr.galleryColorSection.items, vehicle_information_id, variant_id, input, php_vehicle_information_id)

        }
    }
    //insert vehicle color images

    if ('galleryColorSection' in variant_data_arr) {
        if ('items' in variant_data_arr.galleryColorSection) {

            await insert_color_img_with_item(variant_data_arr.galleryColorSection.items, vehicle_information_id, variant_id, input, php_vehicle_information_id)
        }
    }
    if ('gallerySection' in variant_data_arr) {
        var picture_url = variant_data_arr.gallerySection.items[0].url ? variant_data_arr.gallerySection.items[0].url : ""
        if (picture_url != "") {
            var images = await scrap_vehicle_images(picture_url, vehicle_information_id, input, php_vehicle_information_id)
        } else {
            var picture_url = url + '/pictures'
            images = await scrap_vehicle_images(picture_url, vehicle_information_id, input, php_vehicle_information_id)
        }
    }
    //----------------------------Variant table------------------

    if ('variantTable' in variant_data_arr) {
        var variantTable = variant_data_arr.variantTable
        if ('childs' in variantTable) {
            var child_variant_ = variantTable.childs
            child_variant_.map((child_variant) => {
                if ('items' in child_variant) {
                    var childs_arr = child_variant.items.map(async (child) => {
                        var url = child.url
                        var exShowRoomPrice = child.exShowRoomPrice ? child.exShowRoomPrice : 0
                        var onRoadPrice = child.onRoadPrice ? child.onRoadPrice : 0
                        await get_variant_details(url, vehicle_information_id, exShowRoomPrice, onRoadPrice, input)
                    })
                }
            })
        }
    }
    let highlights_desc
    let price_desc
    if ('pagetitle' in variant_data_arr) {
        if ('description' in variant_data_arr.pagetitle) {
            let highlights = variant_data_arr.pagetitle.description ? strip_tags(variant_data_arr.pagetitle.description) : "NA"
            highlights_desc = highlights
        }
    }
    if ('variantTableHighlight' in variant_data_arr) {
        let price = variant_data_arr.variantTableHighlight.description ? strip_tags(variant_data_arr.variantTableHighlight.description) : "NA"
        price_desc = price
    }
    const data = {
        highlights_desc: highlights_desc,
        price_desc: price_desc
    }

    await vehicle_information.findOneAndUpdate({ _id: vehicle_information_id }, data, { new: true })
}
const insert_color_img_with_item = async (images, vehicle_information_id, variant_id, input, php_vehicle_information_id) => {
    images.map(async (color_img) => {
        if (!color_exist) {
            const color_name = color_img.title ? color_img.title : "NA"
            const color_code = color_img.code ? color_img.code : "NA"
            const image = color_img.image ? color_img.image : "NA"
            const official_image = color_img.image ? color_img.image : "NA"
            let cheakidModelColor = await vehicle_model_color.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
            let tokenidModelColor = cheakidModelColor ? cheakidModelColor.php_id + 1 : 1
            const php_id = tokenidModelColor

            const carcolor = {
                php_id: php_id,
                vehicle_information_id: vehicle_information_id,
                color_name: color_name,
                color_code: color_code,
                image: image
            }
            var color_exist = await vehicle_model_color.find({ $and: [{ vehicle_information_id: vehicle_information_id }, { color_name: input.color_name }, { image: official_image }] }).count()
            if (!color_exist) {
                var color_img = await vehicle_model_color.create({ ...carcolor, php_vehicle_information_id: php_vehicle_information_id })
            }
        }
    })
}

const scrap_vehicle_images = async (url, vehicle_information_id, variant_id = 0, input, php_vehicle_information_id) => {
    var url = "https://www.cardekho.com" + url
    var colors_data = await scrap_coman_code(url)

    if ('colorSection' in colors_data) {
        if ('items' in colors_data.colorSection) {
            var images = colors_data.colorSection.items

            for (const color_img of images) {
                const color_name = color_img.title ? color_img.title : "NA"
                const color_code = color_img.hexCode ? color_img.hexCode : "NA"
                const image = color_img.image ? color_img.image : "NA"
                const official_image = color_img.image ? color_img.image : "NA"
                let cheakidModelColor = await vehicle_model_color.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                let tokenidModelColor = cheakidModelColor ? cheakidModelColor.php_id + 1 : 1
                const php_id = tokenidModelColor
                const colordata = {
                    php_id: php_id,
                    vehicle_information_id: vehicle_information_id,
                    color_name: color_name,
                    color_code: color_code,
                    image: image
                }
                let color_exist = await vehicle_model_color.find({ $and: [{ vehicle_information_id: vehicle_information_id }, { color_name: input.color_name }, { image: official_image }] }).count()
                // const [rows, filed] = await con.query("SELECT * FROM `vehicle_model_color` WHERE `vehicle_information_id`= " + `${vehicle_information_id}` + " AND `color_name` = " + `'${color_name}'` + " AND `image` = " + `'${official_image}'`)
                // const color_exist = rows[0]
                if (!color_exist) {
                    // const qr = ("INSERT INTO vehicle_model_color ( vehicle_information_id, color_name, color_code, image)") + ' VALUES ' + (`(${vehicle_information_id}, '${color_name}','${color_code}','${image}')`)
                    // let craete = await con.query(qr)
                    let color_img = await vehicle_model_color.create({ ...colordata, php_vehicle_information_id: php_vehicle_information_id })

                }
            }
        }
    }
}

async function get_brand_id(name) {
    const exist = await Brands.findOne({ $and: [{ name: name }, { category_id: category_id }] })
    // const [rows, filed] = await con.query("SELECT * FROM `brands` WHERE `name`= " + `'${name}'` + " AND `category_id` = " + `${category_id}`)
    // const exist = rows[0]
    if (exist) {
        return exist._id
    }
}


export default { scrap_cars }




// protected function scrap_coman_code($model_url){
//     //$model_url = "https://www.cardekho.com/carmodels/Hyundai/Hyundai_i20";
//     ini_set("max_execution_time",-1);
//     $client2 = new Client();
//     $crawler3 = $client2->request('GET', $model_url)->html();
//     $html = explode('</script>',explode('<script type="application/ld+json">',$crawler3)[1]);
//     $response = explode('</script>',$html[1]);
//     $variant_respone = get_string_between($response[0],"<script>window.__INITIAL_STATE__ = "," window.__isWebp =  false;");
//     $variant_res = substr($variant_respone,0,-1);
//     $variant_data = substr($variant_res, 0, strpos($variant_res, '; window.__CD_DATA__'));
//     $variant_data_arr = json_decode($variant_data,true);
//     return $variant_data_arr;
// }
