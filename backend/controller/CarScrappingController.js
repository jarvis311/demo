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
        let brand_id = brand._id
        let brand_php_id = brand.php_id
        const findCategoryId = await CategoryModel.findOne({ php_id: Number(input.category) })
        let category_id = findCategoryId._id
        let category_php_id = findCategoryId.php_id

        if (input.scrap_type == "brand") {
            var new_bike_url = "https://www.cardekho.com/cars/" + brand.name
        } else {
            var res_specific_bikes = await get_specific_car(link, input, brand)
            return res_specific_bikes;
        }
        var data_res_arr = await scrap_coman_code(new_bike_url)
        if ('items' in data_res_arr) {

            for (const val of data_res_arr.items) {
                const cheakidOfVehicalInfo = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                const tokenIdOfVehicalInfo = cheakidOfVehicalInfo ? cheakidOfVehicalInfo.php_id + 1 : 1
                const php_id = tokenIdOfVehicalInfo

                brand_id = brand_id
                const avg_rating = val.avgRating ? val.avgRating : 0
                const review_count = val.reviewCount ? val.reviewCount : 0
                const variant_name = val.variantName ? val.variantName : "NA"
                let min_price = val.minPrice ? val.minPrice : 0
                let max_price = val.maxPrice ? val.maxPrice : min_price
                const price_range = val.priceRange ? val.priceRange : "NA"
                const status = val.status ? val.status : "NA"
                const launched_at = val.launchedAt ? val.launchedAt : "NA"
                const model_name = val.modelName
                const mileage = val.mileage ? parseFloat(val.mileage) : 0
                const engine = val.engine ? val.engine : 0
                const fuel_type = val.fuelType ? val.fuelType : "NA"
                const showroom_price = val.exShowRoomPrice ? val.exShowRoomPrice : 0
                const model_popularity = val.modelPopularity ? val.modelPopularity : "NA"
                const style_type = val.dcbdto.bodyType ? val.dcbdto.bodyType || val.style_type : "NA"
                const on_road_price = val.minOnRoadPrice ? val.minOnRoadPrice : val.exShowRoomPrice ? val.exShowRoomPrice : "NA"
                const body_type = val.dcbdto.bodyType || "NA"
                var new_car_url = val.modelUrl
                let modelPriceURL = val.modelPictureURL
                var specification_url = val.modelSpecsURL
                if (modelPriceURL) {
                    let priceModels = await scrap_coman_code(`https://www.cardekho.com/${modelPriceURL}`)
                    const carArray = Object.values(priceModels.priceDetailSection[0].variantDetailByFuel)
                    on_road_price = (carArray[0][0].onRoadPriceInIndianFormat && carArray[0][0].onRoadPriceInIndianFormat.replace(/,/g, '')) || val.minOnRoadPrice || val.exShowRoomPric || "NA"
                    insurance_price = carArray[0][0]?.insurance.replace(/,/g, '') || 0
                    rto_price = (carArray[0][0]?.rto && carArray[0][0]?.rto.replace(/,/g, '')) || 0
                    other_price = carArray[0][0]?.others?.totalOtherCharges || 0
                    variant_name = carArray[0][0]?.variantDisplayId || 'NA'
                }

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
                if (showroom_price.includes('Lakh')) {
                    const number = parseInt(showroom_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    showroom_price = result;
                }
                if (on_road_price.includes('Lakh')) {
                    const number = parseInt(on_road_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    on_road_price = result;
                }

                if (min_price.includes('Cr')) {
                    const number = parseFloat(min_price.replace(" Cr", ""));
                    const result = number * 10000000;
                    min_price = parseFloat(result.toFixed(0));
                }
                if (max_price != 0) {
                    if (max_price.includes('Cr')) {
                        const number = parseInt(max_price.replace(" Cr", ""));
                        const result = number * 10000000;
                        max_price = parseFloat(result.toFixed(0));
                    }
                } else {
                    max_price = 0
                }

                if (min_price.includes('Lakh')) {
                    const number = parseInt(min_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    min_price = result;
                }
                if (max_price != 0) {
                    if (max_price.includes('Lakh')) {
                        const number = parseInt(max_price.replace(" Lakh", ""));
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
                    console.log("vehicle_information Update!!! 1")
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

            let url = data_res_arr.upcomingCars.url ? data_res_arr.upcomingCars.url : null
            if (url) {
                await upcoming_car_by_brand(url, input)
            } else {
                return (await helper.macthError('Upcoming Car Not Scrapped'))
            }
        }

        // if ('upcomingCars' in data_res_arr) {
        //     let url = data_res_arr.upcomingCars.url ? data_res_arr.upcomingCars.url : null
        //     if (url) {
        //         await upcoming_car_by_brand(url, input)
        //     } else {
        //         return (await helper.macthError('Upcoming Car Not Scrapped'))
        //     }
        // }

        return (await helper.successResponse('Cars scrapped successfully!!'))
    } catch (err) {
        console.log(err);
    }
}

const get_vehicle_other_details = async (url, vehicle_information_id, variant_id = 0, input, php_vehicle_information_id) => {

    var new_car_url = "https://www.cardekho.com" + url
    var variant_data_arr = await scrap_coman_code(new_car_url)

    if ('quickOverview' in variant_data_arr) {
        var feature = variant_data_arr.quickOverview.list ? variant_data_arr.quickOverview.list : "NA"

        let engine
        let key_fear
        if (feature) {
            if (typeof feature !== "string") {
                // console.log('feature', feature)
                // var specs = feature.map((valde) => {
                //     console.log('valde.>>', valde)
                //     if (valde.iconname == "Engine") {
                //         engine = valde.iconvalue.split(" ")[0]
                //     }
                //     var specs_arr = valde.iconname ? valde.iconname : "NA"

                //     if (valde.iconname == "Transmission") {
                //         specs_arr = valde.iconname
                //     } else {
                //         specs_arr = valde.iconvalue ? valde.iconvalue : ""
                //     }
                //     return specs_arr
                // })
                //  key_fear = specs.map((valuedata) => {
                //     // console.log('valuedata>>>>>', valuedata)
                //     return valuedata
                // })
                const uniqueFeatures = {};

                feature.forEach((feature) => {
                  const iconname = feature.iconname;
                  if (!uniqueFeatures[iconname]) {
                    uniqueFeatures[iconname] = [];
                  }
                  uniqueFeatures[iconname].push(feature.iconvalue);
                });

                key_fear = Object.entries(uniqueFeatures).map(([feature, values]) => `${feature}: ${values.join(', ')}`).join(', ');
            } else {
                key_fear = "NA"
            }
        } else {
            key_fear = "NA"
        }
        /*Multidimention Array to string conversion*/
        let key_specs = 'Features:' + key_fear

//         const uniqueFeatures = {};

// features.forEach((feature) => {
//   const iconname = feature.iconname;
//   uniqueFeatures[iconname] = feature;
// });
        let update = await vehicle_information.findOneAndUpdate({ _id: vehicle_information_id }, { key_specs: key_specs, engine: engine }, { new: true })
    }

    if ('galleryColorSection' in variant_data_arr) {
        if ('items' in variant_data_arr.galleryColorSection) {
            const images = variant_data_arr.galleryColorSection.items
            for (const color_img of images) {
                const color_name = color_img.title ? color_img.title : "NA"
                const color_code = color_img.code ? color_img.code : "NA"
                const image = color_img.image ? color_img.image : "NA"
                const official_image = color_img.image ? color_img.image : "NA"

                const color_exist = await vehicle_model_color.findOne({ vehicle_information_id: vehicle_information_id, color_name: color_img.title })
                if (!color_exist) {
                    let cheakidModelColor = await vehicle_model_color.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                    let tokenidModelColor = cheakidModelColor ? cheakidModelColor.php_id + 1 : 1
                    const php_id = tokenidModelColor

                    const carcolor = {
                        vehicle_information_id: vehicle_information_id,
                        color_name: color_name,
                        color_code: color_code,
                        image: image
                    }
                    await vehicle_model_color.create({ ...carcolor, php_vehicle_information_id: php_vehicle_information_id, php_id: php_id })
                    console.log('Vehicle Model Color Add 1')
                }
                // await vehicle_model_color.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { color_name: color_name }] }, carcolor, { new: true, upsert: true })
                // let color_exist = await vehicle_model_color.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { color_name: color_name }, { image: official_image }] }).count()
                // if (color_exist) {
                // } else {
                //     await vehicle_model_color.create({ ...carcolor, php_vehicle_information_id: php_vehicle_information_id })
                // }
            }
        }
    }
    if ('variantTable' in variant_data_arr) {
        let variantTable = variant_data_arr.variantTable
        if ('childs' in variantTable) {
            let child_variant_ = variantTable.childs
            for (const child_variant of child_variant_) {
                if ('items' in child_variant) {
                    for (const child of child_variant.items) {
                        let url = child.url
                        let exShowRoomPrice = child.exShowRoomPrice ? child.exShowRoomPrice : 0
                        let onRoadPrice = child.onRoadPrice ? child.onRoadPrice : 0
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
    await vehicle_information.findOneAndUpdate({ _id: vehicle_information_id }, data, { new: true })

}


async function get_variant_details(picture_url, vehicle_information, exShowRoomPrice, onRoadPrice, input, php_vehicle_information_id) {
    var url = "https://www.cardekho.com" + picture_url
    var child_data = await scrap_coman_code(url)

    let variantObjectId
    let mileageDataLayer
    let engineDataLayer
    let used_var
    if ('dataLayer' in child_data) {
        mileageDataLayer = child_data.dataLayer[0].max_mileage_new ? child_data.dataLayer[0].max_mileage_new : 0
        engineDataLayer = child_data.dataLayer[0].engine_cc ? child_data.dataLayer[0].engine_cc : 0
    }

    if ('overView' in child_data) {

        let child = child_data.overView
        const vehicle_information_id = vehicle_information
        const name = child.name ? child.name : "NA"
        const price_range = child.priceRange ? child.priceRange : 0;
        const review_count = child.reviewCount ? child.reviewCount : 0;
        const status = child.modelStatus ? child.modelStatus : "NA";
        const fuel_type = child.fuelType ? child.fuelType : "NA";
        const mileage = child_data.mileage ? child_data.mileage : mileageDataLayer;
        const engine = child_data.engine ? child_data.engine : engineDataLayer;
        const link = "https://www.cardekho.com" + child.modelUrl
        const price = child.priceRange || 0
        const rating = child?.rating || 0
        
        let on_road_price = 0
        let ex_show_room_rice = 0;
        let insurance_price = 0
        let other_price = 0
        let rto_price = 0


        let ModelPriceURI = child?.variantORPURL
      
        if (ModelPriceURI) {
            let priceModels = await scrap_coman_code(`https://www.cardekho.com/${ModelPriceURI}`)
            priceModels.variantPriceDetailTab.list.map(item => {
                if(item.text == "Ex-Showroom Price"){
                    ex_show_room_rice = item.value.replace(/,/g, '') || 0
                }
                if(item.text == "Insurance"){
                    insurance_price = item.value.replace(/,/g, '') || 0
                }
                if (item.text == "RTO") {
                    rto_price = item.value.replace(/,/g, '') || 0
                }
                if(item.text == "Others"){
                    other_price = item.value.replace(/,/g, '') || 0
                }
                if(item.text == "On-Road Price in New Delhi"){
                    on_road_price = item.value.replace(/,/g, '') || 0
                }
            })
            // const carArray = Object.values(priceModels.priceDetailSection[0].variantDetailByFuel)
            // console.log('priceModels >>>>', carArray, "name >>>>>>>" + name)
            // console.log('ddd >>>>>', carArray, name)
            // const findArray = carArray.find(item => item[0]?.variantId !== name)

            // // return
            // if (findArray) {
            //     on_road_price = findArray[0]?.ORPWithoutOptionAccessories?.replace(/,/g, '') || 0
            //     insurance_price = findArray[0]?.insurance?.replace(/,/g, '') || 0
            //     rto_price = findArray[0]?.rto?.replace(/,/g, '') || 0
            //     other_price = findArray[0]?.others?.totalOtherCharges || 0
            // } else {
            //     on_road_price = 0
            //     insurance_price = 0
            //     rto_price = 0
            //     other_price = 0
            // }
            // on_road_price = (carArray[0][0].ORPWithoutOptionAccessories && carArray[0][0].ORPWithoutOptionAccessories.replace(/,/g, '')) || val.minOnRoadPrice || val.exShowRoomPric || "NA"
            // insurance_price = carArray[0][0]?.insurance.replace(/,/g, '') || 0
            // rto_price = (carArray[0][0]?.rto && carArray[0][0]?.rto.replace(/,/g, '')) || 0
            // other_price = carArray[0][0]?.others?.totalOtherCharges || 0
        }

        // console.log('child >>>>>>>>', child)
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
            price: price,
            insurance_price: insurance_price,
            other_price: other_price,
            rating: rating,
            rto_price: rto_price
        }

        const variant_exist = await PriceVariant.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { name: name }] })
        // dd("stop!!")
        var php_variant_id
        // await createCarPriceVariant(variant_exist, vehicle_information_id, name, variantobje, php_id, variantObjectId)
        if (variant_exist) {
            try {
                variantObjectId = variant_exist._id
                php_variant_id = variant_exist.php_id
                await PriceVariant.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { name: name }] }, variantobje, { new: true })
            } catch (error) {
                console.log('Error :- ', error.message)
            }
        }
        if (!variant_exist) {
            try {
                const variant = await PriceVariant.create({ ...variantobje, php_id: php_id, php_vehicle_information_id: php_vehicle_information_id })
                variantObjectId = variant._id
                php_variant_id = variant.php_id
            } catch (error) {
                console.log('Error :- ', error.message)

            }
        }
    }
    if ('specsTechnicalJson' in child_data) {
        if ('specification' in child_data.specsTechnicalJson) {
            for (const specification of child_data.specsTechnicalJson.specification) {

                const spec_name = specification.title ? specification.title : "NA"
                let spec_id
                let php_specification_id
                const spec_exist = await VariantSpecification.findOne({ name: spec_name })
                if (spec_exist) {
                    spec_id = spec_exist._id
                    php_specification_id = spec_exist.php_id
                } else {
                    let cheakVariantSpecificationId = await VariantSpecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                    let tokenIdOfVariantSpec = cheakVariantSpecificationId ? cheakVariantSpecificationId.php_id + 1 : 1;

                    const createVariant = await VariantSpecification.create({ name: spec_name, php_id: tokenIdOfVariantSpec })
                    spec_id = createVariant._id
                    php_specification_id = createVariant.php_id
                }

                used_var = {
                    variant_id: variantObjectId,
                    php_variant_id: php_variant_id,
                    vehicle_information_id: vehicle_information,
                    php_vehicle_information_id: php_vehicle_information_id,
                    specification_id: spec_id,
                    php_specification_id: php_specification_id
                }

                // async function processItems1() {
                for (const s of specification.items) {

                    let spec_name = s.text ? s.text : "NA"
                    let spec_value = s.value ? s.value : "NA"
                    // console.log('s>>>>>>>>>', s)
                    used_var.name = spec_name
                    used_var.value = spec_value
                    used_var.php_specification_id = php_specification_id


                    const v_spe_exist = await VariantKey.findOne({
                        $and: [
                            { vehicle_information_id: vehicle_information },
                            { variant_id: variantObjectId },
                            { specification_id: spec_id },
                            { name: spec_name },
                        ],
                    });

                    // console.log('space_name', spec_name)
                    if (v_spe_exist != null) {
                        console.log("Update variant key")
                        try {
                            await VariantKey.findOneAndUpdate({ $and: [{ vehicle_information_id: used_var.vehicle_information_id }, { variant_id: used_var.variant_id }, { specification_id: used_var.specification_id }, { name: used_var.name }] }, used_var, { new: true })
                        } catch (error) {
                            console.log('Error : ', error.message)
                        }
                    } else {
                        // console.log("ELSE -----")
                        try {
                            const checkIdOfVariantKey = await VariantKey.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                            const tokenIdOfVariantKey = checkIdOfVariantKey ? checkIdOfVariantKey.php_id + 1 : 1;
                            used_var.php_id = tokenIdOfVariantKey;

                            const cheakidOfKeySpec = await keyspecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                            const tokenIdOfKeySpec = cheakidOfKeySpec ? cheakidOfKeySpec.php_id + 1 : 1;

                            const findOrUpdateKeySpesificationn = await keyspecification.findOne({ name: spec_name })

                            if (findOrUpdateKeySpesificationn) {
                                used_var.variant_key_id = findOrUpdateKeySpesificationn._id;
                                used_var.php_variant_key_id = findOrUpdateKeySpesificationn.php_id;
                            } else {
                                const createKeySpece = await keyspecification.create({ name: spec_name, php_id: tokenIdOfKeySpec })
                                used_var.variant_key_id = createKeySpece._id;
                                used_var.php_variant_key_id = createKeySpece.php_id;
                            }
                            if (
                                spec_name == "Displacement" ||
                                spec_name == "Peak Power" ||
                                spec_name == "Max Torque" ||
                                spec_name == "Mileage" ||
                                spec_name == "Brakes Rear" ||
                                spec_name == "Wheels Type" ||
                                spec_name == "Motor Power" ||
                                spec_name == "Cylinders" ||
                                spec_name == "Kerb Weight"
                            ) {
                                used_var.show_overview = 1;
                            } else {
                                used_var.show_overview = 0;
                            }

                            used_var.name = spec_name;
                            used_var.value = spec_value;

                            const create = await VariantKey.create(used_var);
                            console.log("Create Variant Key")
                        } catch (error) {
                            console.log('Error : ', error.message)
                        }

                    }
                }
                // }
                // await processItems1()
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

                let spec_id
                let php_specification_id
                if (spec_exist) {
                    spec_id = spec_exist._id
                    php_specification_id = spec_exist.php_id
                } else {
                    let CreateVariantSpec = await VariantSpecification.create(carvar)

                    spec_id = CreateVariantSpec._id
                    php_specification_id = CreateVariantSpec.php_id
                }

                used_var.specification_id = spec_id
                used_var.php_specification_id = php_specification_id
                async function processItems2() {
                    for (const s of featured.items) {
                        let spec_name = s.text ? s.text : "NA";
                        let spec_value = s.value ? s.value : "NA";

                        const v_spe_exist = await VariantKey.findOne({
                            vehicle_information_id: used_var.vehicle_information_id,
                            variant_id: used_var.variant_id,
                            specification_id: used_var.specification_id,
                            name: spec_name,
                        });

                        used_var.name = spec_name;
                        used_var.value = spec_value;

                        if (v_spe_exist) {
                            // VariantKey already exists, update it
                            try {
                                await VariantKey.findOneAndUpdate(
                                    {
                                        vehicle_information_id: used_var.vehicle_information_id,
                                        variant_id: used_var.variant_id,
                                        specification_id: used_var.specification_id,
                                        name: spec_name,
                                    },
                                    used_var
                                );
                            } catch (error) {
                                console.log(error.message)
                            }

                        } else {
                            try {
                                const findOrUpdateKeySpesificationn = await keyspecification.findOne({ name: spec_name });

                                if (findOrUpdateKeySpesificationn) {
                                    used_var.variant_key_id = findOrUpdateKeySpesificationn._id;
                                    used_var.php_variant_key_id = findOrUpdateKeySpesificationn.php_id;
                                } else {
                                    const cheakidOfKeySpec = await keyspecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                                    const tokenIdOfKeySpec = cheakidOfKeySpec ? cheakidOfKeySpec.php_id + 1 : 1;

                                    const createKeySpece = await keyspecification.create({ name: spec_name, php_id: tokenIdOfKeySpec });

                                    used_var.variant_key_id = createKeySpece._id;
                                    used_var.php_variant_key_id = createKeySpece.php_id;
                                }
                                const cheakidOfVariantKey = await VariantKey.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                                const tokenIdOfVariantKey = cheakidOfVariantKey ? cheakidOfVariantKey.php_id + 1 : 1;
                                used_var.php_id = tokenIdOfVariantKey;

                                // Create VariantKey only if it doesn't exist
                                await VariantKey.create(used_var);
                            } catch (error) {
                                console.log('Error : ', error.message)
                            }

                        }
                    }
                }
                await processItems2();
            }
        }

        if ('keySpecs' in child_data.specsTechnicalJson) {
            for (const key of child_data.specsTechnicalJson.keySpecs) {
                if (key.title.toLowerCase().includes("specification")) {
                    let is_specification = 1
                    for (const item of key.items) {
                        let u = await VariantKey.findOne({ $and: [{ vehicle_information_id: used_var.vehicle_information_id }, { variant_id: used_var.variant_id }, { name: item.text }] })
                        if (u) {
                            await VariantKey.findOneAndUpdate({ _id: u._id }, { is_specification: is_specification })

                        }
                    }
                }
                if (key.title.toLowerCase().includes("featured")) {
                    let is_feature = 1

                    for (const item of key.items) {
                        let u = await VariantKey.findOne({ $and: [{ vehicle_information_id: vehicle_information }, { variant_id: variantObjectId }, { name: item.text }] })
                        if (u) {
                            await VariantKey.findOneAndUpdate({ _id: u._id }, { is_specification: is_specification, is_feature: is_feature })

                        }
                    }
                }
            }
        }

    }


}


const get_specific_car = async (link, input1, brand) => {

    let data_res_arr_ = await scrap_coman_code(link);

    if ('overView' in data_res_arr_) {
        var car_data = data_res_arr_.overView;
        var res_specific_bike = car_data.name;
        // console.log('data_res_arr_.overView', data_res_arr_)
    } else {
        return (await helper.macthError('Model not Found'))
    }
    let brand_id = brand._id
    let brand_php_id = brand.php_id
    const findCategory = await CategoryModel.findOne({ php_id: input1.category })
    let category_id_ = findCategory._id
    let category_php_id = findCategory.php_id
    let new_bike_url = "https://www.cardekho.com/cars/" + brand.name;
    let data_res_arr = await scrap_coman_code(new_bike_url)

    if ('items' in data_res_arr) {
        for (const val of data_res_arr?.items) {
            if (res_specific_bike == val.modelName) {
                let cheakid = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                let tokenid = cheakid ? cheakid.php_id + 1 : 1
                const php_id = tokenid
                brand_id = brand_id
                // console.log('val >>>>', val)
                const avg_rating = val.avgRating ? val.avgRating : 0
                const review_count = val.reviewCount ? val.reviewCount : 0
                let variant_name
                let min_price = val.minPrice ? val.minPrice : 0
                let max_price = val.maxPrice ? val.maxPrice : min_price
                const price_range = val.priceRange ? val.priceRange : "NA"
                const status = val.status ? val.status : "NA"
                const launched_at = val.launchedAt ? val.launchedAt : "NA"
                const model_name = val.modelName
                const mileage = val.mileage ? parseFloat(val.mileage) : 0
                const engine = val.engine ? val.engine : 0
                const fuel_type = val.fuelType ? val.fuelType : "NA";
                const model_popularity = val.modelPopularity ? val.modelPopularity : "NA";
                const price = val.exShowroomPrice ? val.exShowroomPrice : "O"

                const style_type = val.dcbdto.bodyType ? val.dcbdto.bodyType || val.style_type : "NA";
                const category_id = category_id_;
                let on_road_price
                let new_car_url = val.modelUrl
                let images_url = val.modelPictureURL
                let specification_url = val.modelSpecsURL
                let rto_price = 0
                let insurance_price
                let other_price
                let is_content_writer
                let is_designer
                let showroom_price
                is_content_writer = val.upcoming === true ? 1 : 0;
                is_designer = val.upcoming === true ? 1 : 0;
                is_content_writer = style_type === "NA" ? 1 : 0
                is_designer = style_type === "NA" ? 1 : 0
                let modelPriceURL = val.dcbdto.modelPriceURL

                if (modelPriceURL) {
                    let priceModels = await scrap_coman_code(`https://www.cardekho.com/${modelPriceURL}`)
                    const carArray = Object.values(priceModels.priceDetailSection[0].variantDetailByFuel)
                    variant_name = carArray[0][0]?.variantDisplayName || 'NA'
                    showroom_price = carArray[0][0]?.exShowRoom.replace(/,/g, '') || 0
                    on_road_price = (carArray[0][0].ORPWithoutOptionAccessories && carArray[0][0].ORPWithoutOptionAccessories.replace(/,/g, '')) || val.minOnRoadPrice || val.exShowRoomPric || "NA"
                    insurance_price = carArray[0][0]?.insurance.replace(/,/g, '') || 0
                    rto_price = (carArray[0][0]?.rto && carArray[0][0]?.rto.replace(/,/g, '')) || 0
                    other_price = carArray[0][0]?.others?.totalOtherCharges || 0
                }

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
                if (max_price.includes('Lakh')) {
                    const number = parseInt(max_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    max_price = result;
                } else if (max_price.includes('Cr')) {
                    const number = parseFloat(max_price.replace(" Cr", ""));
                    const result = number * 10000000;
                    max_price = parseFloat(result.toFixed(0));
                } else {
                    max_price = 0
                }

                if (min_price.includes('Lakh')) {
                    const number = parseInt(min_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    min_price = result;
                } else if (min_price.includes('Cr')) {
                    const number = parseFloat(min_price.replace(" Cr", ""));
                    const result = number * 10000000;
                    min_price = parseFloat(result.toFixed(0));
                } else {
                    min_price = 0
                }

                // console.log('max_price 2', max_price)
                // console.log("first")
                // let client = await axios.get("https://www.cardekho.com/" + val.dcbdto.modelPriceURL)

                // let html = cheerio.load(client.data).html()
                // let response = html.split('</script>');
                // let data_respone = get_string_between(response[11], '<script>window.__INITIAL_STATE__ = ', " window.__isWebp =  false;")
                // let data1 = data_respone.split("; window.__CD_DATA__ =")
                // let data2 = data1[0]?.split('" ",{}; window.__isMobile') || ""
                // console.log('data2', data2)
                // let res_arr = data2 ? JSON?.parse([]) : []


                // if (res_arr?.items[0].exShowroomPrice) {
                //     if (res_arr.items[0].exShowroomPrice == "") {
                //         showroom_price = 0
                //     } else {
                //         showroom_price = res_arr.items[0].exShowroomPrice
                //     }
                // }
                // let rto_price
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
                    price: price,
                    // status: status,
                    launched_at: launched_at,
                    model_popularity: model_popularity,
                    mileage: mileage,
                    engine: engine,
                    rto_price: rto_price,
                    style_type: style_type,
                    showroom_price: showroom_price,
                    on_road_price: on_road_price,
                    is_content_writer: is_content_writer,
                    is_designer: is_designer,
                    insurance_price: insurance_price,
                    other_price: other_price,
                }

                let car_exist = await vehicle_information.findOne({ $and: [{ model_name: model_name }, { brand_id: brand_id }] })

                if (car_exist) {
                    var vehicle_information_id = car_exist._id
                    let php_vehicle_information_id = car_exist.php_id
                    await vehicle_information.findOneAndUpdate({ $and: [{ model_name: model_name }, { brand_id: brand_id }] }, cardata, { new: true })
                    await get_vehicle_other_details(new_car_url, vehicle_information_id, 0, cardata, php_vehicle_information_id)
                    console.log("vehicle_information Update!!! 2")

                } else {
                    let response = await vehicle_information.create({ ...cardata, php_id: php_id })
                    console.log("vehicle_information created!!! 2")

                    vehicle_information_id = response._id
                    let php_vehicle_information_id = response.php_id
                    const createData = await get_vehicle_other_details(new_car_url, vehicle_information_id, 0, cardata, php_vehicle_information_id)
                }
                return (await helper.successResponse("Car scrapping succesfully!"))
            } else {
                await helper.macthError('Car Model Not Found')
            }
        }
        if ('upcomingCars' in data_res_arr) {
            var url = data_res_arr.upcomingCars.url ? data_res_arr.upcomingCars.url : null
            if (url) {
                await upcoming_car_by_brand(url, input1, res_specific_bike)
            }

        } else {
            return (await helper.macthError('Upcoming Car Not Scrapped'))
        }
        return (await helper.dataResponse('Vehicle Successfully Scrapped.'))
    } else {
        const findExistVehicle = await vehicle_information.findOne({
            category_id: category_id_,
            brand_id: brand_id,
            model_name: data_res_arr_?.overView.name
        })
        if (!findExistVehicle) {
            let cheakid = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
            let tokenid = cheakid ? cheakid.php_id + 1 : 1
            const php_id_ = tokenid

            const d = await vehicle_information.create({
                php_id: php_id_,
                category_id: category_id_,
                brand_id: brand_id,
                brand_php_id: brand_php_id,
                category_php_id: category_php_id,
                model_name: data_res_arr_?.overView.name,
                min_price: data_res_arr_?.overView.minOnRoadPrice,
                price_range: data_res_arr_?.overView.priceRangeExshowRoom,
                variant_name: data_res_arr_?.overView.variantName,
                launched_at: data_res_arr_?.overView.launchedAt
            })
        }
    }
}


const scrap_coman_code = async (url) => {
    const res = await axios.get(url)
    let crawler = cheerio.load(res.data).html()
    let html = crawler.split('</script>');
    let data_respone = get_string_between(html[9], '; window.__INITIAL_STATE__ = ', "; window.__isWebp =  false;")

    let data1 = data_respone.split("; window.__CD_DATA__ =")
    let data2 = data1[0].split('" ",{}; window.__isMobile')
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

const upcoming_car_by_brand = async (url, input, modelNameOfCar) => {
    var new_car_url = 'https://www.cardekho.com' + url
    var data_res_arr = await scrap_coman_code(new_car_url)
    if ('items' in data_res_arr) {

        const upcome = await insert_cars_without_items(data_res_arr.items, 'is_upcoming', input, modelNameOfCar)
        if (upcome) {
            if ('popularCars' in data_res_arr.pages) {
                if ('popular' in data_res_arr.popularCars) {
                    const create = await insert_cars_without_items(data_res_arr.popularCars, 'is_popular_search', input, modelNameOfCar)
                }
            }
        }
    }
}

const insert_cars_without_items = async (data_res_arr, type, input, modelNameOfCar) => {
    for (const val of data_res_arr) {

        if (val.modelName === modelNameOfCar) {
            let category_id
            const category_id_ = await CategoryModel.findOne({ php_id: Number(input.category) })
            category_id = category_id_._id
            let category_php_id = category_id_.php_id

            let brand = await Brands.findOne({ $and: [{ php_category_id: Number(input.category) }, { name: input.brand }] })

            let brand_id = brand._id
            let brand_php_id = brand.php_id
            const model_name = val.modelName ? val.modelName : val.name
            const fuel_type = val.fuelType ? val.fuelType : "NA"
            const avg_rating = val.avgRating ? val.avgRating : 0
            const review_count = val.reviewCount ? val.reviewCount : 0
            const variant_name = val.variantName ? val.variantName : "NA"
            let min_price = val.minPrice ? val.minPrice.replace(',', '') : 0
            let max_price = val.maxPrice ? val.maxPrice.replace('.', '') : min_price
            const price_range = val.priceRange ? val.priceRange : "NA"
            const status = val.status ? val.status : "NA"
            const launched_at = val.launchedAt ? val.launchedAt : "NA"
            const Launch_date = val.variantLaunchDate ? val.variantLaunchDate : "NA";
            const engine = val.engine ? val.engine : 0;
            const mileage = val.mileage ? parseFloat(val.mileage) : 0;
            const style_type = val?.dcbdto?.bodyType ? val?.dcbdto?.bodyType || val.style_type : "NA"
            const max_power = val.maxPower ? val.maxPower : "NA";
            const model_popularity = val.modelPopularity ? parseFloat(val.modelPopularity) : 0;
            const showroom_price = val.exShowroomPrice ? parseFloat(val.exShowroomPrice) : 0;
            const on_road_price = val.minOnRoadPrice ? parseFloat(val.minOnRoadPrice) : 0;
            let is_content_writer
            let is_designer
            is_content_writer = val.upcoming === true ? 1 : 0;
            is_designer = val.upcoming === true ? 1 : 0;
            is_content_writer = style_type === "NA" ? 1 : 0
            is_designer = style_type === "NA" ? 1 : 0

            const type = 1;
            // if (showroom_price.includes('Lakh')) {
            //     const number = parseFloat(showroom_price.replace(" Lakh", ""));
            //     const result = number * 100000;
            //     showroom_price = result;
            // }
            // if (on_road_price.includes('Lakh')) {
            //     const number = parseFloat(on_road_price.replace(" Lakh", ""));
            //     const result = number * 100000;
            //     on_road_price = result;
            // }

            if (min_price.includes('Lakh')) {
                const number = parseInt(min_price.replace(" Lakh", ""));
                const result = number * 100000;
                min_price = result;
            }
            if (min_price.includes('Cr')) {
                const number = parseFloat(min_price.replace(" Cr", ""));
                const result = number * 1000000; // Corrected multiplier to convert Crores to millions
                min_price = parseFloat(result.toFixed(0));
            }
            if (max_price != 0) {
                if (max_price.includes('Lakh')) {
                    const number = parseInt(max_price.replace(" Lakh", ""));
                    const result = number * 100000;
                    max_price = result;
                }
            } else {
                max_price = 0
            }
            if (max_price != 0) {
                if (max_price.includes('Cr')) {
                    const number = parseFloat(max_price.replace(" Cr", ""));
                    const result = number * 10000000;
                    max_price = parseFloat(result.toFixed(0));
                }
            } else {
                max_price = 0
            }



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

            let model_url = val.modelUrl
            link = model_url
            const image = ""

            let php_vehicle_information_id
            let vehicle_information_id

            let car_exist = await vehicle_information.findOne({ $and: [{ model_name: model_name }, { brand_id: brand_id }] })

            if (car_exist) {
                vehicle_information_id = car_exist._id
                php_vehicle_information_id = car_exist.php_id

                if (model_url == "NA") {
                    if (val.image) {
                        //********************Image Running**********************/
                    } else {
                        image = "NA"
                    }
                } else {
                    const update = await vehicle_information.findOneAndUpdate({ $and: [{ brand_id: brand_id }, { model_name: model_name }] }, insert_car, { new: true })
                    console.log("vehicle_information Update!!! 3")
                    await get_vehicle_other_details_latest(model_url, vehicle_information_id, 0, input, php_vehicle_information_id)

                }

            }
            if (!car_exist) {
                let cheakid = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                let tokenid = cheakid ? cheakid.php_id + 1 : 1
                const php_id = tokenid

                let response = await vehicle_information.create({ ...insert_car, php_id: php_id })
                console.log("vehicle_information created!! 3")
                vehicle_information_id = response._id
                php_vehicle_information_id = response.php_id
            }

            var car_images = await get_vehicle_other_details_latest(model_url, vehicle_information_id, 0, input, php_vehicle_information_id)
        }
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
                    console.log('key_feature >>>>', key_feature)
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
// Features:1997 cc - 2998 cc,296.36 - 355.37 Bhp,7,Diesel/Petrol
        // const qr = ("UPDATE " + `vehicle_information ` + "SET " + ` key_specs = '${key_specs}' WHERE id = ${vehicle_information_id}`)
        // const update = await con.query(qr)

        let update = await vehicle_information.findOneAndUpdate({ _id: vehicle_information_id }, { key_specs: key_specs }, { new: true })


        // if ('url' in variant_data_arr) {
        //     if (variant_data_arr.url) {
        //         // console.log("in variant_data_arr >> 3")
        //         await get_vehicle_specification(variant_data_arr.url, vehicle_information_id, 0, input, php_vehicle_information_id)
        //     }
        // }
    }
    //----------------------------Vehicle Images+ colors ------------------------ Main Vehicle Images

    if ('galleryColorSection' in variant_data_arr) {
        if ('items' in variant_data_arr.galleryColorSection) {
            await insert_color_img_with_item(variant_data_arr.galleryColorSection.items, vehicle_information_id, variant_id, input, php_vehicle_information_id)

        }
    }
    //insert vehicle color images

    // if ('galleryColorSection' in variant_data_arr) {
    //     if ('items' in variant_data_arr.galleryColorSection) {
    //         await insert_color_img_with_item(variant_data_arr.galleryColorSection.items, vehicle_information_id, variant_id, input, php_vehicle_information_id)
    //     }
    // }
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
            let child_variant_ = variantTable.childs
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

    for (const color_img of images) {
        // if (!color_img) {
        const color_name = color_img.title ? color_img.title : "NA"
        const color_code = color_img.code ? color_img.code : "NA"
        const image = color_img.image ? color_img.image : "NA"
        const official_image = color_img.image ? color_img.image : "NA"
        let cheakidModelColor = await vehicle_model_color.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
        let tokenidModelColor = cheakidModelColor ? cheakidModelColor.php_id + 1 : 1
        const php_id = tokenidModelColor
        const color_exist = await vehicle_model_color.findOne({ vehicle_information_id: vehicle_information_id, color_name: color_img.title })
        const carcolor = {
            php_vehicle_information_id: php_vehicle_information_id,
            vehicle_information_id: vehicle_information_id,
            color_name: color_name,
            color_code: color_code,
            image: image
        }
        if (!color_exist) {
            let color_img = await vehicle_model_color.create({ ...carcolor, php_vehicle_information_id: php_vehicle_information_id, php_id: php_id, })
            console.log("cearte Model model Color 2")
        } else {
            await vehicle_model_color.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { color_name: color_name }] }, carcolor, { upsert: true, new: true })

        }
    }
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
                    vehicle_information_id: vehicle_information_id,
                    // php_vehicle_information_id: php_vehicle_information_id,
                    color_name: color_name,
                    color_code: color_code,
                    image: image
                }
                let color_exist = await vehicle_model_color.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { color_name: input.color_name }, { image: official_image }] }).count()

                if (!color_exist) {

                    let color_img = await vehicle_model_color.create({ ...colordata, php_id: php_id, php_vehicle_information_id: php_vehicle_information_id })
                    console.log("cearte Model model Color 3")
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