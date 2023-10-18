import cheerio from "cheerio";
import axios from "axios";
import helper from "../helper/helper.js";
import bodytypes from '../Model/BodyType.js'
import vehicle_information from "../Model/VehicleInformation.js";
import PriceVariant from "../Model/priceVariant.js";
import VariantSpecification from "../Model/VariantSpecification.js";
import VariantKey from "../Model/VariantKeySpec.js";
import CategoryModel from "../Model/categories.js"
import keyspecification from "../Model/keyspecification.js";




var link;


const scrap_truck = async (input, brand) => {
    try {
        link = input.link
        let brand_id = brand._id
        let brand_php_id = brand.php_id
        const findCategoryId = await CategoryModel.findOne({ php_id: input.category })
        console.log({findCategoryId})
        let category_id = findCategoryId._id
        let category_php_id = findCategoryId.php_id
        let url
        let brandName
        
        if (brand?.name.includes(' ')) {
            brandName = brand?.name.toLowerCase().replace(/\s+/g, '-');
        } else {
            brandName = brand.name
        }
        if (input.scrap_type == "brand") {
             url = 'https://trucks.cardekho.com/en/brands/' + brandName.toLowerCase() + '.html'
        } else {
            console.log("create _specific  _truck")
            var res_specific_truck = await get_specific_truck(link, input, brand)
            return res_specific_truck;
        }

        let data_res_arr = await scrap_common_model(url)
        if ('items' in data_res_arr) {
                    for (const val of data_res_arr.items) {
                        const model_name = val.name ? val.name : "NA"
                        const avg_rating = val.rating ? val.rating : "NA"
                        const review_count = val.reviewCount ? val.reviewCount : "NA"
                        const image = val.image ? val.image : "NA"
                        let engine = 0
                        let max_power = 0
                        let priceRange = 0
                        let key_specs = 0
                        if (val.keyFeatures) {
                                for (const val2 of val.keyFeatures) {
                                if (val2.name == 'Engine') {
                                    engine = val2.value
                                }
                                if (val2.name == "Power") {
                                    max_power = val2.value
                                }
                            }
                        }
                        if (val.minPrice && val.maxPrice) {
                            priceRange = val.minPrice + '-' + val.maxPrice
                        } else {
                            priceRange = "NA"
                        }
                        const showroom_price = val.minPrice ? val.minPrice : "NA"
                        const on_road_price = val.maxPrice ? val.maxPrice : "NA";
                        const min_price = val.minPrice ? val.minPrice : "NA";
                        const max_price = val.maxPrice ? val.maxPrice : "NA";
                        const variant_name = val.modelShortName ? val.modelShortName : "NA";
                        const fuel_type = val.variants[0].fuelName ? val.variants[0].fuelName.toString() : "NA";
                        const launched_at = val.variants[0].launchedAt ? val.variants[0].launchedAt : "NA";
                        const status = val.modelStatus ? val.modelStatus : "NA";
                        const price_range = priceRange;

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
                        let url = "https://trucks.cardekho.com" + val.dcbDto.modelPriceURL
                        let data_res_arr = await scrap_common_model(url)

                        const price_desc = data_res_arr.priceDeatilText.description ? data_res_arr.priceDeatilText.description : "NA"
                        var model_url = "https://trucks.cardekho.com/" + val.modelURL

                        const truckdata = {
                            // id: id,
                            category_id: category_id,
                            category_php_id:category_php_id,
                            brand_id: brand_id,
                            brand_php_id:brand_php_id,
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
                        let truck_exist = await vehicle_information.findOne({ $and: [{ brand_id: brand_id }, { model_name: model_name }] })
                        if (truck_exist) {
                            let update = await vehicle_information.findOneAndUpdate({ $and: [{ brand_id: brand_id }, { model_name: model_name }] }, truckdata, { new: true })
                            const vehicle_id = truck_exist.id
                             await scrap_latest_update_higlight(model_url, vehicle_id,truck_exist.php_id)
                             await scrap_truck_veriants(val.variants, vehicle_id, val.model_name, input, truck_exist.php_id)
                        } else {
                            let cheakidOfVehicalInfo = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                            const tokenIdOfVehicalInfo = cheakidOfVehicalInfo ? cheakidOfVehicalInfo.php_id + 1 : 1
                   
                            const craete = await vehicle_information.create({...truckdata, php_id: tokenIdOfVehicalInfo})
                            console.log("Cteate")
                             await scrap_latest_update_higlight(model_url, craete._id,craete.php_id)
                             await scrap_truck_veriants(val.variants, craete._id, model_name,input, craete.php_id)
                        }
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
    let data_res_arr = await scrap_common_model(model_url)
    if ('pageTitle' in data_res_arr) {
        if ('description' in data_res_arr.pageTitle) {
            let highlights_desc = data_res_arr.pageTitle.description ? data_res_arr.pageTitle.description : "NA"
            let update = await vehicle_information.findOneAndUpdate({ id: vehicle_id }, { highlights_desc: highlights_desc }, { new: true })
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

const scrap_truck_veriants = async (variants, vehicle_id, name, input,phpVehicleId) => {
 
        for (const valdata of variants) {
        let url = "https://trucks.cardekho.com" + valdata.variantUrl
        let data_res_arr = await scrap_common_model(url)
        let data = data_res_arr.overView
        const rating = data.rating ? data.rating : "NA"
        const review_count = data.reviewCount ? data.reviewCount : "NA"
        const name = data.name ? data.name : "NA"
        const price_range = data.priceRange ? data.priceRange.replace('&#8377;&nbsp;', '') : "NA"
        const fuel_type = data.fuelType ? data.fuelType : "NA"
        const price = data.variantPrice ? data.variantPrice.replace('&#8377;&nbsp;', '') : data?.maxPrice || "NA" 
        const status = data.status ? data.status : "NA"
        const ex_show_room_rice = data.minimumPrice ? data.minimumPrice : "NA" // // issue with witch to <choose></choose>
        const on_road_price = data.maximumPrice ? data.maximumPrice : "NA" // issue with witch to choose
        const vehicle_information_id = vehicle_id
        let engine 
    if (data.keyFeatures) {
            data.keyFeatures.forEach(variant => {
                if (variant.name == 'Engine') {
                    engine = variant.value || 0
                }
            });
        }
        const priceverint = {
            // id: id,
            vehicle_information_id: vehicle_information_id,
            php_vehicle_information_id:phpVehicleId,
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
            price:price
        }

        let variantExist = await PriceVariant.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { name: name }] })
        let variant_ids
        let phpVariantId
        if (variantExist) {
            await PriceVariant.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { name: name }] }, priceverint, { new: true });
            variant_ids = variantExist._id
            phpVariantId = variantExist.php_id
            await getTruckVarintSpecification(vehicle_id, variant_ids, data_res_arr, priceverint, phpVehicleId,phpVariantId)
        } else {
            let cheakidPriceVariant = await PriceVariant.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
            let tokenidPriceVariant = cheakidPriceVariant ? cheakidPriceVariant.php_id + 1 : 1
            let vehiclePriceVairnt = await PriceVariant.create({...priceverint,php_id:tokenidPriceVariant })
            
            variant_ids = vehiclePriceVairnt._id
            phpVariantId = vehiclePriceVairnt.php_id
            await getTruckVarintSpecification(vehicle_id, variant_ids, data_res_arr, priceverint, phpVehicleId,phpVariantId)
        }

    }
}

const getTruckVarintSpecification = async (vehicle_id, variant_ids, data_res_arr, input, phpVehicleId,phpVariantId) => {
    const vehicle_information_id = vehicle_id
    const variant_id = variant_ids
    if ('specsTechnicalJson' in data_res_arr) {
        if ('specification' in data_res_arr.specsTechnicalJson) {
                for (const specification of data_res_arr.specsTechnicalJson.specification) {
                   
                    let spec_name = specification.title ? specification.title : "NA"
                    let php_specification_id
                    let spec_id;

                    const data = {
                        // id: id,
                        name: spec_name
                    }
                    
                const spec_exist = await VariantSpecification.findOne({ name: spec_name })  
                if (spec_exist) {
                     spec_id = spec_exist._id
                     php_specification_id= spec_exist.php_id
                } else {
                    let cheakVariantSpecificationId = await VariantSpecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                    let tokenIdOfVariantSpec = cheakVariantSpecificationId ? cheakVariantSpecificationId.php_id + 1 : 1;
                    let cretaeSpecification = await VariantSpecification.create({...data, php_id:tokenIdOfVariantSpec})

                    spec_id = cretaeSpecification._id
                    php_specification_id = cretaeSpecification.php_id
                }

                let used_var = {
                    vehicle_information_id: vehicle_id,
                    php_vehicle_information_id:phpVehicleId,
                    variant_id: variant_ids,
                    php_variant_id: phpVariantId,
                    specification_id: spec_id,
                    php_specification_id:php_specification_id,
                }
                
                async function processItems() {
                    for (const s of specification.items) {
                    let spec_name = s.text ? s.text : "NA"
                    let spec_value = s.value ? s.value : "NA"
                    
                    used_var.name = spec_name,
                    used_var.value = spec_value


                    let v_spe_exist = await VariantKey.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { specification_id: used_var.specification_id }, { name: spec_name }] })
                    
                    if (v_spe_exist) {
                          await VariantKey.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { specification_id: used_var.specification_id }, { name: spec_name }] }, used_var, { new: true })
                    } else {
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

                        const cheakidOfVariantKey = await VariantKey.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                        const tokenIdOfVariantKey = await (cheakidOfVariantKey ? cheakidOfVariantKey.php_id + 1 : 1);
                        used_var.php_id = tokenIdOfVariantKey;

                        await VariantKey.create(used_var)
                    }
                }
            }
            await processItems();

            }
        }
        if ('keySpecs' in data_res_arr.specsTechnicalJson) {
                for (const key of data_res_arr.specsTechnicalJson.keySpecs) {
                    
                if (key.title.includes('Specifications')) {
                    const is_specification = 1
                    let i = key.items.map(async (item) => {
                        const u = await VariantKey.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { name: item.text }] })
                        if (u) {
                            await VariantKey.findOneAndUpdate({ id: u.id }, { is_specification: is_specification }, { new: true })
                        }
                    })
                }
                if (key.title.includes('Features')) {
                    const is_feature = 1
                    let i = key.items.map(async (item) => {
                        const u = await VariantKey.findOne({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { name: item.text }] })
                        if (u) {
                            await VariantKey.findOneAndUpdate({ id: u.id }, { is_feature: is_feature }, { new: true })
                        }
                    })
                }
            }
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
             
                const truckDataObject = {
                    category_id: categoryId,
                    category_php_id: categoryPhpId,
                    brand_id: brandId,
                    brand_php_id: brandPhpId,
                    model_name: modelName,
                    avg_rating: avgRating,
                    review_count: reviewCount,
                    price_range: priceRange,
                    status: status,
                    Launch_date: launchDate,
                    model_popularity: modelPopularity,
                    min_price: minPrice,
                    max_price: maxPrice,
                    fuel_type : fuelType,
                    launched_at: launchedAt,
                    key_specs: keySpcae,
                    max_power: maxPower,
                    engine: engine,
                    image: image,
                    style_type: bodytypeName,
                    body_type: bodytypeName,
                    model_url: modelUrl,
                    variant_name: variantName,
                    mileage: mileage,
                    showroom_price: showroomPrice,
                    on_road_price: onRoadPrice,
                    rto_price: rtoPrice,
                }
                let truck_exist = await vehicle_information.findOne({ $and: [{ brand_id: brandId },{category_id: categoryId},{ model_name: modelName }] })

                if(truck_exist){
                    console.log("Already exist!!!!!")
                }else{
                    const cheakidOfVehicalInfo = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                    const tokenIdOfVehicalInfo = cheakidOfVehicalInfo ? cheakidOfVehicalInfo.php_id + 1 : 1
                    const php_id = tokenIdOfVehicalInfo

                    const craeteTruckInfo = await vehicle_information.create({...truckDataObject, php_id:php_id})
                    console.log("Already Not exist!!!!!")
                    await scrap_latest_update_higlight(modelUrl, craeteTruckInfo._id)
                    if(items.variants){
                        await scrap_truck_veriants(items.variants,craeteTruckInfo._id,modelName,craeteTruckInfo.php_id)
                    }
                    console.log("Already End !!!!!")
                }   
                // // const fuel_type = items.

            }
        }
    }

}

export default { scrap_truck }