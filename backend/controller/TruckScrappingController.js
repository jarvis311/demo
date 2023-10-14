import cheerio from "cheerio";
import axios from "axios";
import helper from "../helper/helper.js";
import bodytypes from '../Model/BodyType.js'
import vehicle_information from "../Model/VehicleInformation.js";
import PriceVariant from "../Model/priceVariant.js";
import VariantSpecification from "../Model/VariantSpecification.js";
import VariantKey from "../Model/VariantKeySpec.js";
import CategoryModel from "../Model/categories.js"




var category_id;
var link;


const scrap_truck = async (input, brand) => {
    try {
        link = input.link
        var brand = brand
        var brand_id = brand._id
        let brand_php_id = brand.php_id
        const findCategoryId = await CategoryModel.findOne({ php_id: input.category })
        let category_id = findCategoryId._id
        let category_php_id = findCategoryId.php_id

        if (input.scrap_type == "brand") {
            var new_bike_url = "https://www.bikedekho.com/" + brand.name + "-bikes"
            // console.log("first 1")
        } else {
            var res_specific_truck = await get_specific_truck(link, input, brand)
            // console.log("first 2")
            return res_specific_truck;
        }

        var url = 'https://trucks.cardekho.com/en/brands/' + brand.name.toLowerCase() + '.html'
        var data_res_arr = await scrap_common_model(url)
        if ('trucks' in data_res_arr) {
            if ('trucks' in data_res_arr.trucks) {
                var truck_arr = data_res_arr.trucks.trucks.map(async (val) => {

                    if (res_specific_truck == val.name) {
                        const model_name = val.name ? val.name : "NA"
                        const avg_rating = val.rating ? val.rating : "NA"
                        const review_count = val.reviewCount ? val.reviewCount : "NA"
                        const image = val.image ? val.image : "NA"
                        let engine = 0
                        let max_power = 0
                        let priceRange = 0
                        let key_specs = 0
                        let bodytype_id = 0
                        if (val.keyFeatures) {
                            val.keyFeatures.map((val2) => {
                                if (val2.name == 'Engine') {
                                    engine = val2.value
                                }
                                if (val2.name == "Power") {
                                    max_power = val2.value
                                }
                            })
                        }
                        if (val.minPrice && val.maxPrice) {
                            priceRange = val.minPrice + '-' + val.maxPrice
                        } else {
                            priceRange = "NA"
                        }
                        // var cheakid = await vehicle_information.find().select({ id: 1 }).sort({ _id: -1 }).limit(1)
                        // var tokenid = cheakid.length !== 0 ? cheakid[0].id + 1 : 1
                        // const id = tokenid
                        const showroom_price = val.minPrice ? val.minPrice : "NA"
                        const on_road_price = val.maxPrice ? val.maxPrice : "NA";
                        const min_price = val.minPrice ? val.minPrice : "NA";
                        const max_price = val.maxPrice ? val.maxPrice : "NA";
                        const variant_name = val.modelShortName ? val.modelShortName : "NA";
                        const fuel_type = val.variants[0].fuelName ? val.variants[0].fuelName.toString() : "NA";
                        const launched_at = val.variants[0].launchedAt ? val.variants[0].launchedAt : "NA";
                        const status = val.modelStatus ? val.modelStatus : "NA";
                        const price_range = priceRange;
                        brand_id = brand_id ? brand_id : 0;

                        if (val.keyFeatures) {
                            key_specs = val.keyFeatures.map((key_feature) => {
                                const key_f = [];
                                key_f.push(key_feature.name || "NA");
                                key_f.push(key_feature.value || "NA");
                                return key_f.join(":");
                            })
                                .join(".");
                        } else {
                            key_specs = "NA";
                        }
                        category_id = 3
                        var url = "https://trucks.cardekho.com" + val.dcbDto.modelPriceURL
                        var data_res_arr = await scrap_common_model(url)
                        const price_desc = data_res_arr.priceDeatilText.description ? data_res_arr.priceDeatilText.description : "NA"
                        var model_url = "https://trucks.cardekho.com/" + val.modelURL

                        const truckdata = {
                            // id: id,
                            category_id: category_id,
                            brand_id: brand_id,
                            link: link,
                            model_name: model_name,
                            fuel_type: fuel_type,
                            avg_rating: avg_rating,
                            image: image,
                            review_count: review_count,
                            variant_name: variant_name,
                            min_price: min_price,
                            max_price: max_price,
                            price_range: price_range,
                            status: status,
                            launched_at: launched_at,
                            engine: engine,
                            max_power: max_power,
                            showroom_price: showroom_price,
                            on_road_price: parseInt(on_road_price),
                            key_specs: key_specs
                        }
                        var truck_exist = await vehicle_information.findOne({ $and: [{ brand_id: brand_id }, { model_name: model_name }] })
                        // const [rows, filed] = await con.query("SELECT * FROM `vehicle_information` WHERE `brand_id`= " + `'${brand_id}'` + " AND `model_name` LIKE " + `'${model_name}'`)
                        // const truck_exist = rows[0]
                        if (truck_exist) {
                            let update = await vehicle_information.findOneAndUpdate({ $and: [{ brand_id: brand_id }, { model_name: model_name }] }, truckdata, { new: true })
                            // const qr = ("UPDATE " + `vehicle_information ` + "SET " + `brand_id = ${brand_id}, category_id = ${category_id}, model_name = '${model_name}',fuel_type = '${fuel_type}',avg_rating = ${avg_rating}, review_count = ${review_count} ,variant_name = '${variant_name}',min_price=${min_price},max_price=${max_price},image='${image}', key_specs ='${key_specs}',status='${status}', launched_at='${launched_at}',engine=${engine},max_power='${max_power}',showroom_price=${showroom_price},on_road_price=${on_road_price},link='${link}' WHERE brand_id = ${brand_id} AND model_name LIKE '${model_name}'`)
                            // const update = await con.query(qr)
                            const vehicle_id = truck_exist.id
                            const desc = await scrap_latest_update_higlight(model_url, vehicle_id)
                            const variant = await scrap_truck_veriants(val.variants, vehicle_id, val.model_name, truckdata)
                        } else {
                            // const qr = ("INSERT INTO vehicle_information( brand_id, category_id, model_name, fuel_type, avg_rating, review_count, variant_name, min_price, max_price, image, status, launched_at, engine, max_power, showroom_price, on_road_price, key_specs,link )") + ' VALUES ' + (`(${brand_id}, ${category_id},'${model_name}','${fuel_type}',${avg_rating},${review_count},'${variant_name}',${min_price},${max_price},'${image}','${status}','${launched_at}',${engine},'${max_power}',${showroom_price},${on_road_price},'${key_specs}','${link}')`)
                            // let craete = await con.query(qr)
                            const craete = await vehicle_information.create(truckdata)
                            const desc = await scrap_latest_update_higlight(model_url, craete._id)
                            const variant = await scrap_truck_veriants(val.variants, craete._id, model_name)
                        }
                    } else {
                        await helper.macthError('Truck Model Not Found')
                    }
                })
            }
        }

    } catch (err) {
        console.log(err);
    }
}


const scrap_common_model = async (url) => {
    const res = await axios.get(url)
    var crawler = cheerio.load(res.data).html()
    var html = crawler.split('</script>');
    var data_respone = get_string_between(html[8], '<script>window.__INITIAL_STATE__ = ', " window.__isWebp =  false;")
    var data1 = data_respone.split("; window.__CD_DATA__ =")
    var data2 = data1[0].split('" ",{}; window.__isMobile')
    let res_arr = JSON.parse(data2)
    return res_arr
}

const scrap_latest_update_higlight = async (model_url, vehicle_id) => {
    var data_res_arr = await scrap_common_model(model_url)
    if ('pageTitle' in data_res_arr) {
        if ('description' in data_res_arr.pageTitle) {
            var highlights_desc = data_res_arr.pageTitle.description ? data_res_arr.pageTitle.description : "NA"
            // var update = await vehicle_information.findOneAndUpdate({ id: vehicle_id }, { highlights_desc: highlights_desc }, { new: true })
            const qr = ("UPDATE " + `vehicle_information ` + "SET " + `highlights_desc = '${highlights_desc.replaceAll("'s", "")}' WHERE id = ${vehicle_id}`)
            const update = await con.query(qr)

        }
    }
}


const get_string_between = (string, start, end) => {
    string = ' ' + string;
    var ini = string.indexOf(start);
    if (ini === 0) return '';
    ini += start.length;
    let len = string.indexOf(string, end, ini) - ini;
    return string.slice(ini, len);

}

const scrap_truck_veriants = async (variants, vehicle_id, name, input) => {
    variants.map(async (valdata) => {
        var url = "https://trucks.cardekho.com" + valdata.variantUrl
        var data_res_arr = await scrap_common_model(url)
        var data = data_res_arr.overView
        const rating = data.rating ? data.rating : "NA"
        const review_count = data.reviewCount ? data.reviewCount : "NA"
        const name = data.name ? data.name : "NA"
        const price_range = data.priceRange ? data.priceRange.replace('&#8377;&nbsp;', '') : "NA"
        const fuel_type = data.fuelType ? data.fuelType : "NA"
        const price = data.variantPrice ? data.variantPrice.replace('&#8377;&nbsp;', '') : ""
        const status = data.status ? data.status : "NA"
        const ex_show_room_rice = data.minimumPrice ? data.minimumPrice : "NA"
        const on_road_price = data.maximumPrice ? data.maximumPrice : "NA"
        const vehicle_information_id = vehicle_id
        let engine = 0
        if (data.keyFeatures) {
            data.keyFeatures.forEach(variant => {
                if (variant.name == 'Engine') {
                    engine = variant.value
                }
            });
        }
        // var cheakid = await PriceVariant.find().select({ id: 1 }).sort({ _id: -1 }).limit(1)
        // var tokenid = cheakid.length !== 0 ? cheakid[0].id + 1 : 1
        // const id = tokenid
        const priceverint = {
            // id: id,
            vehicle_information_id: vehicle_information_id,
            name: name,
            link: link,
            engine: engine,
            price_range: price_range,
            status: status,
            fuel_type: fuel_type,
            ex_show_room_rice: ex_show_room_rice,
            on_road_price: on_road_price,
            price_range: price_range,
            review_count: review_count,
            rating: rating,
        }
        // var variant_exist = await PriceVariant.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { name: name }] })
        const [rows, filed] = await con.query("SELECT * FROM `vehicle_price_variant` WHERE `vehicle_information_id`= " + `${vehicle_information_id}` + " AND `name` = " + `'${name}'`)
        const variant_exist = rows[0]
        if (variant_exist) {
            var variant_ids = variant_exist.id
            await getTruckVarintSpecification(vehicle_id, variant_ids, data_res_arr, priceverint)
        } else {

            const qr = ("INSERT INTO vehicle_price_variant( vehicle_information_id, name, link, engine, status, fuel_type, ex_show_room_rice, on_road_price, price_range, review_count, rating )") + ' VALUES ' + (`(${vehicle_information_id}, '${name}','${link}','${engine}','${status}','${fuel_type}',${ex_show_room_rice},${on_road_price},'${price_range}',${review_count},${rating})`)

            let craete = await con.query(qr)
            // var vehiclePriceVairnt = await PriceVariant.create(priceverint)
            variant_ids = craete[0].insertId
            await getTruckVarintSpecification(vehicle_id, variant_ids, data_res_arr, priceverint)
        }

    })
}

const getTruckVarintSpecification = async (vehicle_id, variant_ids, data_res_arr, input) => {
    const vehicle_information_id = vehicle_id
    const variant_id = variant_ids
    if ('specsTechnicalJson' in data_res_arr) {
        if ('specification' in data_res_arr.specsTechnicalJson) {
            data_res_arr.specsTechnicalJson.specification.map(async (specification) => {
                var spec_name = specification.title ? specification.title : "NA"
                // var cheakid = await VariantSpecification.find().select({ id: 1 }).sort({ _id: -1 }).limit(1)
                // var tokenid = cheakid.length !== 0 ? cheakid[0].id + 1 : 1
                // const id = tokenid
                const data = {
                    // id: id,
                    name: spec_name
                }
                let [rows, filed] = await con.query("SELECT * FROM `variant_key_specs` WHERE `name`= " + `'${spec_name}'`)
                // var spec_exist = await VariantSpecification.findOne({ name: spec_name })
                const spec_exist = rows[0]
                if (spec_exist) {
                    var spec_id = spec_exist.id
                } else {
                    const qr = ("INSERT INTO variant_key_specs ( name)") + ' VALUES ' + `('${spec_name}')`
                    const create = await con.query(qr)
                    // var spec_id_ = await VariantSpecification.create(data)
                    spec_id = create[0].insertId
                }
                var used_var = {
                    vehicle_information_id: vehicle_id,
                    variant_id: variant_ids,
                    specification_id: spec_id
                }
                data_res_arr.specsTechnicalJson.specification.map(async (s) => {

                    var spec_name = s.text ? s.text : "NA"
                    var spec_value = s.value ? s.value : "NA"
                    // var v_spe_exist = await VariantKey.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { specification_id: used_var.specification_id }, { name: spec_name }] })
                    let [rows, filed] = await con.query("SELECT * FROM `variant_key_specs` WHERE `vehicle_information_id`= " + `${vehicle_information_id} AND variant_id = ` + `${variant_id} AND specification_id = ${spec_id} AND name = '${spec_name}'`)
                    const v_spe_exist = rows[0]

                    used_var.name = spec_name,
                        used_var.value = spec_value



                    if (v_spe_exist) {
                        const updateQr = ("UPDATE " + `variant_key_specs ` + "SET " + `vehicle_information_id = ${vehicle_information_id}, variant_id = ${variant_id}, specification_id = ${spec_id}, name = '${spec_name}',value = '${spec_value}'  WHERE vehicle_information_id = ${vehicle_information_id} AND variant_id = ${variant_id} AND specification_id = ${spec_id} AND name = '${spec_name}'`)
                        const updateVar = await con.query(updateQr)
                        // var update = await VariantKey.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { specification_id: used_var.specification_id }, { name: spec_name }] }, used_var, { new: true })
                    } else {

                        const qr = ("INSERT INTO variant_key_specs( vehicle_information_id, variant_id, specification_id, name, value )") + ' VALUES ' + (`(${vehicle_information_id}, ${variant_id},${spec_id},'${spec_name}','${spec_value}')`)
                        let craete = await con.query(qr)
                        // update = await VariantKey.create(used_var)
                    }
                })
            })
        }
        if ('keySpecs' in data_res_arr.specsTechnicalJson) {
            data_res_arr.specsTechnicalJson.keySpecs.map((key) => {
                if (key.title.includes('Specifications')) {
                    const is_specification = 1
                    let i = key.items.map(async (item) => {
                        let [rows, filed] = await con.query("SELECT * FROM `variant_key_specs` WHERE `vehicle_information_id`= " + `${vehicle_information_id} AND variant_id = ` + `${variant_id}  AND name = '${item.text}'`)
                        const u = rows[0]
                        // const u = await VariantKey.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { name: item.text }] })
                        if (u) {
                            const updateQr = ("UPDATE " + `variant_key_specs ` + "SET " + `is_specification = ${is_specification} WHERE id = ${u.id} `)
                            const updateVar = await con.query(updateQr)
                            // await VariantKey.findOneAndUpdate({ id: u.id }, { is_specification: is_specification }, { new: true })
                        }
                    })
                }
                if (key.title.includes('Features')) {
                    const is_feature = 1
                    let i = key.items.map(async (item) => {
                        let [rows, filed] = await con.query("SELECT * FROM `variant_key_specs` WHERE `vehicle_information_id`= " + `${vehicle_information_id} AND variant_id = ` + `${variant_id}  AND name = '${item.text}'`)
                        const u = rows[0]
                        // const u = await VariantKey.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { name: item.text }] })
                        if (u) {
                            const updateQr = ("UPDATE " + `variant_key_specs ` + "SET " + `is_feature = ${is_feature} WHERE id = ${u.id} `)
                            const updateVar = await con.query(updateQr)
                            // await VariantKey.findOneAndUpdate({ id: u.id }, { is_feature: is_feature }, { new: true })
                        }
                    })
                }
            })
        }
    }
}

const get_specific_truck = async (link, input, brand) => {
    let data_res_arr = await scrap_common_model(link)
    let brandId = brand._id
    let brandPhpId = brand.php_id
    const findCategoryId = await CategoryModel.findOne({ php_id: input.category })
    let categoryId = findCategoryId._id
    let categoryPhpId = findCategoryId.php_id

    let specificTruckName
    if ('overView' in data_res_arr) {
        let bike_data = data_res_arr.overView;
        specificTruckName = bike_data.name;
    } else {
        await helper.macthError('Model not Found')
    }
    // console.log('specificTruckName', specificTruckName)
    const brandArrayUrl = `https://trucks.cardekho.com/en/brands/${brand.name.toLowerCase()}.html`

    const newScrapedBrandArray = await scrap_common_model(brandArrayUrl)

    if ('items' in newScrapedBrandArray) {
        // console.log('brandArrayUrl', newScrapedBrandArray.trucks)
        for (const items of newScrapedBrandArray.items) {
            if (items.name == specificTruckName) {
                console.log('items >>', items)
                // console.log('first', newScrapedBrandArray.items)
                const modelName = items.name || "NA"
                const avgRating = items.rating || 0
                const reviewCount = items.reviewCount || 0
                const priceRange = items.priceRange || "NA"
                const status = items.modelStatus || "NA";
                const launchDate = items.variantLaunchDate ? items.variantLaunchDate : "NA";
                const modelPopularity = items.modelPopularity ? items.modelPopularity : 0;
                const minPrice = items.minPrice || "0"
                const maxPrice = items.maxPrice || "0"
                let fuelType = "NA"
                let launchedAt = "NA"
                let variantName = "NA"
                let image = items.image || "NA"
                let keySpcae = "NA"
                let maxPower = "0"
                let engine = "0"
                let bodytypeName = items.bodyTypeRewrite[0] || "NA"
                let mileage = "0"
                let showroomPrice = minPrice || "0"
                let onRoadPrice = minPrice || "0"
                let rtoPrice = 0

                if (items.variants) {
                    fuelType = items.variants[0].fuelName ? items.variants[0].fuelName.toString() : "NA";
                    launchedAt = items.variants[0].launchedAt ? items.variants[0].launchedAt : "NA";
                    variantName = items.variants[0].name ? modelName + " " + items.variants[0].name : "NA";
                }

                if (items.keyFeatures) {
                    items.keyFeatures?.map((item) => {
                        if (item.name == 'Engine') {
                            engine = item.value
                        }
                        if (item.name == "Power") {
                            maxPower = item.value.split(" ")[0]
                        }
                        if (item.name == "Mileage") {
                            mileage = item.value
                        }
                    })
                }
                if (items.keyFeatures) {
                    keySpcae = items.keyFeatures.map((key_feature) => {
                        const key_f = [];
                        key_f.push(key_feature.name || "NA");
                        key_f.push(key_feature.value || "NA");
                        return key_f.join(":");
                    })
                        .join(".");
                } else {
                    keySpcae = "NA";
                }

                let modelUrl = `https://trucks.cardekho.com/${items.modelURL}`

                const dataObject = {
                    category_id: categoryId,
                    category_php_id: categoryPhpId,
                    brand_id: brandId,
                    brand_php_id: brandPhpId,
                    modelName: modelName,
                    avg_rating: avgRating,
                    review_count: reviewCount,
                    price_range: priceRange,
                    status: status,
                    Launch_date: launchDate,
                    model_popularity: modelPopularity,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    fuelType: fuelType,
                    launchedAt: launchedAt,
                    keySpcae: keySpcae,
                    max_power: maxPower,
                    engine: engine,
                    image: image,
                    bodytypeName: bodytypeName,
                    model_url: modelUrl,
                    variant_name: variantName,
                    mileage: mileage,
                    showroom_price: showroomPrice,
                    on_road_price: onRoadPrice,
                    rto_price: rtoPrice,
                }

                console.log('dataObject >>>>', dataObject)
                // // const fuel_type = items.

            }
        }
    }

}

export default { scrap_truck }