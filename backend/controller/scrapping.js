
import cheerio from "cheerio";
import axios from "axios";
import Bodytypes from '../Model/BodyType.js'
import scrap_data from '../controller/ScrappingController.js'
import helper from "../helper/helper.js";
import strip_tags from 'strip-tags'
import vehicle_information from "../Model/VehicleInformation.js";
import PriceVariant from "../Model/priceVariant.js";
import VariantSpecification from "../Model/VariantSpecification.js";
import VariantKey from "../Model/VariantKeySpec.js";
import vehicle_model_color from "../Model/VehicleModelColor.js";
import CategoryModel from "../Model/categories.js"
import keyspecification from "../Model/keyspecification.js"


var link;

const scrap_bike = async (input, brand) => {
    // console.log("first", input, brand)
    try {
        // category_id = input.category
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
            var res_specific_bikes = await get_specific_bike(link, input, brand)
            // console.log("first 2")
            return res_specific_bikes;
        }
        let data_res_arr = await scrap_common_model(new_bike_url)


        if ('items' in data_res_arr) {
            await processItems(data_res_arr)
            async function processItems(data_res_arr) {
                if ('upcomingCars' in data_res_arr) {
                    data_res_arr.upcomingCars.items.map(item => {
                        data_res_arr.items.push(item)
                    })
                }
                const insertPromises = [];
                for (const val of data_res_arr.items) {
                    brand_id = brand._id
                    const model_name = val.modelName ? val.modelName : "NA"
                    const fuel_type = val.fuelType ? val.fuelType : "NA"
                    let avg_rating = 0
                    let image = "NA"
                    if (val.avgRating) {
                        if (val.avgRating == "") {
                            avg_rating = 0
                        } else {
                            avg_rating = val.avgRating
                        }
                    } if (val.image) {
                        // change by jignesh
                        image = val.image
                    } else {
                        image = "NA"
                    }

                    const cheakidOfVehicalInfo = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                    const tokenIdOfVehicalInfo = cheakidOfVehicalInfo ? cheakidOfVehicalInfo.php_id + 1 : 1
                    const php_id = tokenIdOfVehicalInfo

                    const review_count = val.reviewCount ? val.reviewCount : 0;
                    const variant_name = val.variantName ? val.variantName : "NA";
                    const min_price = val.minPriceNonFormat ? val.minPriceNonFormat : 0;
                    const max_price = val.maxPriceNonFormat ? val.maxPriceNonFormat : 0;
                    const price_range = val.priceRange ? val.priceRange : "NA";
                    const status = val.status ? val.status : "NA";
                    const launched_at = val.launchedAt ? val.launchedAt : "NA";
                    const Launch_date = val.variantLaunchDate ? val.variantLaunchDate : "NA";
                    const model_popularity = val.modelPopularity ? val.modelPopularity : 0;
                    const mileage = val.modelMilegae ? val.modelMilegae : "NA";
                    const engine = val.ccValue ? val.ccValue : "NA";
                    const style_type = val.style_type ? val.style_type : "NA";
                    let showroom_price = 0
                    let on_road_price = 0
                    let bodytype_id
                    let max_power = 0
                    let php_bodytype_id
                    // let [rowsd, files] = await con.query("SELECT * FROM `bodytypes` WHERE `category_id`=" + `'${category_id}'` + " AND `name` LIKE " + `'${style_type}'`)
                    const findBodyTypeName = await Bodytypes.findOne(
                        {
                            category_id: category_id, // replace category_id with the actual value
                            name: new RegExp(style_type) // replace style_type with the actual value
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
                    max_power = val.maxPower ? val.maxPower : "NA"
                    if (val.exShowroomPrice) {
                        if (val.exShowroomPrice == "") {
                            showroom_price = 0
                        } else {
                            showroom_price = val.exShowroomPrice
                        }
                    }
                    if (val.minOnRoadPrice) {
                        if (val.minOnRoadPrice == "") {
                            on_road_price = 0
                        } else {
                            on_road_price = val.minOnRoadPrice
                        }
                    }
                    let rto_price = 0
                    let insurance_price = 0
                    let other_price = 0
                    let rtoPrice = 0
                    let insurancePrice = 0

                    if (val.upcoming === true) {
                        var client = await axios.get("https://www.bikedekho.com" + val.otherLinks.url)
                        var html = cheerio.load(client.data).html()
                        var response = html.split('</script>');
                        var data_respone = get_string_between(response[11], '<script>window.__INITIAL_STATE__ = ', " window.__isWebp =  false;")
                        var data1 = data_respone.split("; window.__CD_DATA__ =")
                        var data2 = data1[0].split('" ",{}; window.__isMobile')
                        let res_arr = JSON.parse(data2)

                        if (res_arr.priceDetailSection) {
                            var price_details = res_arr.priceDetailSection[0].variantDetailByFuel[""]

                            price_details.map((val2) => {
                                if (variant_name == val2.name) {
                                    rto_price = val2.rto ? val2.rto : 0
                                    insurance_price = val2.insurance ? val2.insurance : 0
                                    other_price = val2.others.total ? val2.others.total : 0
                                }
                            })
                        } else {
                            if (showroom_price < 25000) {
                                rtoPrice = ((showroom_price * 2) / 100)
                            } else {
                                if (showroom_price > 25000 && showroom_price < 45000) {
                                    rtoPrice = ((showroom_price * 4) / 100)
                                } else {
                                    if (showroom_price > 45000 && showroom_price < 60000) {
                                        rtoPrice = ((showroom_price * 6) / 100)
                                    } else {
                                        if (showroom_price > 60000) {
                                            rtoPrice = ((showroom_price * 8) / 100)
                                        }
                                    }
                                }
                            }
                            if (engine < 75) {
                                insurancePrice = 482
                            } else {
                                if (engine > 75 && engine < 150) {
                                    insurancePrice = 752
                                } else {
                                    if (engine > 150 && engine < 350) {
                                        insurancePrice = 1193
                                    } else {
                                        insurancePrice = 2323
                                    }
                                }
                            }
                            insurancePrice = insurancePrice * 5
                            var totalPriceWithRto = showroom_price + rtoPrice
                            var finalInsuranceData = insurancePrice + ((insurancePrice * 18) / 100)
                            if (totalPriceWithRto < on_road_price) {
                                rtoPrice = Math.round(rtoPrice)
                                rto_price = rtoPrice
                            } else {
                                rto_price = 0
                            }
                            var totalPriceWithRtoInsurance = (showroom_price + rtoPrice + finalInsuranceData)
                            if (totalPriceWithRtoInsurance < on_road_price) {
                                var otherPrice = on_road_price - totalPriceWithRtoInsurance
                                if (otherPrice > 500) {
                                    otherPrice = Math.round(otherPrice)
                                    other_price = otherPrice
                                    var insPrice = 0
                                } else {
                                    insPrice = Math.round(otherPrice)
                                }
                                insurance_price = Math.round(finalInsuranceData + insPrice);
                                insurance_price = insurance_price;
                            } else {
                                other_price = 0
                                insurance_price = 0
                            }
                        }
                    }
                    const is_popular_search = 1;
                    const is_upcoming = val.upcoming === true ? 0 : 1;
                    const is_latest = 0;
                    const is_content_writer = val.upcoming === true ? 1 : 0;

                    const brandobj = {
                        // php_id: php_id,
                        avg_rating: avg_rating,
                        bodytype_id: bodytype_id,
                        brand_id: brand_id,
                        brand_php_id: brand_php_id,
                        category_id: category_id,
                        category_php_id: category_php_id,
                        engine: engine,
                        fuel_type: fuel_type,
                        image: image,
                        insurance_price: insurance_price ? parseInt(insurance_price.replaceAll(',', '')) : 0,
                        is_content_writer: is_content_writer,
                        is_latest: is_latest,
                        is_popular_search: is_popular_search,
                        is_upcoming: is_upcoming,
                        Launch_date: Launch_date,
                        launched_at: launched_at,
                        link: link,
                        max_power: max_power,
                        max_price: max_price,
                        mileage: mileage,
                        min_price: min_price,
                        model_name: model_name,
                        model_popularity: model_popularity,
                        on_road_price: parseInt(on_road_price),
                        other_price: parseInt(other_price),
                        php_bodytype_id: php_bodytype_id,
                        price_range: price_range,
                        review_count: review_count,
                        rto_price: rto_price ? parseInt(rto_price.replaceAll(',', '')) : 0,
                        scrap_type: input.scrap_type,
                        showroom_price: showroom_price,
                        status: status,
                        style_type: style_type,
                        variant_name: variant_name
                    }

                    let bike_exist = await vehicle_information.findOne({ $and: [{ brand_id: brand_id }, { model_name: model_name }] })
                    // console.log("bike_exist")
                    let model_url = "https://www.bikedekho.com" + val.modelUrl
                    let images_url = "https://www.bikedekho.com" + val.modelPictureURL


                    if (bike_exist) {
                        var bike_data = await vehicle_information.findOneAndUpdate({ $and: [{ brand_id: brand_id }, { model_name: model_name }] }, brandobj, { new: true })
                        console.log('bike-Updated bike-Updatedbike-Updatedbike-Updated!!!!');

                        let d = await get_other_details(model_url, images_url, brandobj, bike_exist._id)

                    } else {
                        const insertPromise = insertObjectWithSync(brandobj, model_url, images_url, php_id);
                        insertPromises.push(insertPromise);
                        await Promise.all(insertPromises);
                    }
                }
            }

            return (await helper.dataResponse('Vehicle Successfully Scrapped.'))
        } else {
            console.log("Vehicle Not Scrap, Please try again")
            return (await helper.macthError('Vehicle Not Scrap, Please try again'))
        }

        return data_res_arr
    } catch (error) {
        console.log(error);
    }
}

async function insertObjectWithSync(brandobj, model_url, images_url, php_id) {
    try {
        const createdData = await vehicle_information.create({ ...brandobj, php_id: php_id });
        if (createdData) {
            console.log('bike-Created bike-Createdbike-Createdbike-Created!!!!');
        }
        await get_other_details(model_url, images_url, brandobj, createdData._id, createdData.php_id);
        return createdData;
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
}

const get_specific_bike = async (link, input1, brand) => {
    let data_res_arr_ = await scrap_common_model(link);
    // dd(data_res_arr_)
    if ('overView' in data_res_arr_) {
        var bike_data = data_res_arr_.overView;
        var res_specific_bike = bike_data.name;
    } else {
        await helper.macthError('Model not Found')
    }
    var new_bike_url = "https://www.bikedekho.com/" + brand.name + "-bikes";
    let brand_id = brand._id;
    let brand_php_id = brand.php_id
    const findCategory = await CategoryModel.findOne({ php_id: input1.category })
    let category_id = findCategory._id
    let category_php_id = findCategory.php_id
    let data_res_arr = await scrap_common_model(new_bike_url);

    if ('items' in data_res_arr) {
        data_res_arr?.upcomingCars?.items?.map(item => {
            data_res_arr.items.push(item)
        })
        for (const val of data_res_arr.items) {
            if (res_specific_bike == val.modelName) {
                const model_name = val.modelName ? val.modelName : "NA"
                const fuel_type = val.fuelType ? val.fuelType : "NA"
                let avg_rating = 0
                let image = "NA"
                if (val.avgRating) {
                    if (val.avgRating == "") {
                        avg_rating = 0
                    } else {
                        avg_rating = val.avgRating
                    }
                }
                if (val.image) {

                } else {
                    image = "NA"
                }
                let cheakid = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                let tokenid = cheakid ? cheakid.php_id + 1 : 1
                const php_id = tokenid

                const review_count = val.reviewCount ? val.reviewCount : 0
                const variant_name = val.variantName ? val.variantName : "NA"
                const min_price = val.minPriceNonFormat ? val.minPriceNonFormat : 0;
                const max_price = val.maxPriceNonFormat ? val.maxPriceNonFormat : 0;
                const price_range = val.priceRange ? val.priceRange : "NA";
                const status = val.status ? val.status : "NA";
                const launched_at = val.launchedAt ? val.launchedAt : "NA";
                const Launch_date = val.variantLaunchDate ? val.variantLaunchDate : "NA";
                const mileage = val.modelMilegae ? val.modelMilegae : "NA";
                const engine = val.ccValue ? val.ccValue : "NA";
                const style_type = val.style_type ? val.style_type : "NA";
                const max_power = val.maxPower ? val.maxPower : "NA";
                let showroom_price = 0
                let on_road_price = 0
                let bodytype_id

                let bodyTypedata = await Bodytypes.findOne({ $and: [{ category_id: category_id }, { name: style_type }] })

                // let [rows, files] = await con.query("SELECT * FROM `bodytypes` WHERE `category_id`= " + `'${category_id}'` + " AND `name` LIKE " + `'${style_type}'`)
                // let bodyTypedata = rows[0]
                let php_bodytype_id
                if (bodyTypedata) {
                    bodytype_id = bodyTypedata._id
                    php_bodytype_id = bodyTypedata.php_id
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
                if (val.exShowroomPrice) {
                    if (val.exShowroomPrice == "") {
                        showroom_price = 0
                    } else {
                        showroom_price = val.exShowroomPrice
                    }
                } if (val.minOnRoadPrice) {
                    if (val.minOnRoadPrice == "") {
                        on_road_price = 0
                    } else {
                        on_road_price = val.minOnRoadPrice
                    }
                }
                let rto_price = 0
                let insurance_price = 0
                let other_price = 0
                let rtoPrice = 0
                let insurancePrice = 0
                if (val.upcoming) {
                    await axios.get("https://www.bikedekho.com" + val.otherLinks.url).then(async (client) => {
                        var html = cheerio.load(client.data).html()
                        if (html) {
                            var response = html.split('</script>');
                            var data_respone = get_string_between(response[11], '<script>window.__INITIAL_STATE__ = ', " window.__isWebp =  false;")
                            var data1 = data_respone.split("; window.__CD_DATA__ =")
                            var data2 = data1[0].split('" ",{}; window.__isMobile')
                            let res_arr = JSON.parse(data2)

                            if (res_arr.priceDetailSection) {
                                var price_details = res_arr.priceDetailSection[0].variantDetailByFuel['']
                                price_details.map((val2) => {
                                    if (variant_name == val2.name) {
                                        rto_price = val2.rto ? val2.rto.replace(',', '') : 0
                                        insurance_price = val2.insurance ? val2.insurance.replace(',', '') : 0
                                        other_price = val2.others.total ? val2.others.total.replace(',', '') : 0
                                    }
                                })
                            } else {
                                if (showroom_price < 25000) {
                                    rtoPrice = ((showroom_price * 2) / 100)
                                } else {
                                    if (showroom_price > 25000 && showroom_price < 40000) {
                                        rtoPrice = ((showroom_price * 4) / 100)
                                    } else {
                                        if (showroom_price > 40000 && showroom_price < 60000) {
                                            rtoPrice = ((showroom_price * 6) / 100)
                                        } else {
                                            if (showroom_price > 40000) {
                                                rtoPrice = ((showroom_price * 8) / 100)
                                            }
                                        }
                                    }
                                }
                                if (engine < 75) {
                                    insurancePrice = 482
                                } else {
                                    if (engine > 75 && engine < 150) {
                                        insurancePrice = 752
                                    } else {
                                        if (engine > 150 && engine < 350) {
                                            insurancePrice = 1193
                                        } else {
                                            insurancePrice = 2323
                                        }
                                    }
                                }
                                insurancePrice = insurancePrice * 5
                                var totalPriceWithRto = showroom_price + rtoPrice
                                var finalInsuranceData = insurancePrice + ((insurancePrice * 18) / 100)
                                if (totalPriceWithRto < on_road_price) {
                                    rtoPrice = Math.round(rtoPrice)
                                    rto_price = rtoPrice
                                } else {
                                    rto_price = 0
                                }
                                var totalPriceWithRtoInsurance = (showroom_price + rtoPrice + finalInsuranceData)
                                if (totalPriceWithRtoInsurance < on_road_price) {
                                    var otherPrice = on_road_price - totalPriceWithRtoInsurance
                                    if (otherPrice > 500) {
                                        otherPrice = Math.round(otherPrice)
                                        other_price = otherPrice
                                        var insPrice = 0
                                    } else {
                                        insPrice = Math.round(otherPrice)
                                    }
                                    insurance_price = Math.round(finalInsuranceData + insPrice)
                                } else {
                                    other_price = 0;
                                    insurance_price = 0;
                                }
                            }
                            if (other_price == '') {
                                other_price = 0
                            }
                        }
                    })
                }
                const is_popular_search = 1;
                const is_upcoming = val.upcoming === true ? 0 : 1;
                const is_latest = 0;
                const is_content_writer = val.upcoming === true ? 1 : 0;

                const dataObj = {
                    category_id: category_id,
                    brand_id: brand_id,
                    brand_php_id: brand_php_id,
                    bodytype_id: bodytype_id,
                    category_php_id: category_php_id,
                    php_bodytype_id: php_bodytype_id,
                    link: link,
                    scrap_type: input1.scrap_type,
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
                    Launch_date: Launch_date,
                    model_popularity: model_popularity,
                    mileage: mileage,
                    engine: engine,
                    style_type: style_type,
                    max_power: max_power,
                    showroom_price: showroom_price,
                    on_road_price: on_road_price,
                    rto_price: rto_price,
                    insurance_price: insurance_price,
                    other_price: other_price,
                    is_popular_search: is_popular_search,
                    is_upcoming: is_upcoming,
                    is_latest: is_latest,

                }

                // let updateDataObject = {
                //     model_name: model_name,
                //     fuel_type: fuel_type,
                //     avg_rating: avg_rating,
                //     variant_name: variant_name,
                //     price_range: price_range,
                //     min_price: min_price,
                //     max_price: max_price,
                // }

                let bike_exist = await vehicle_information.findOne({ $and: [{ brand_id: brand_id }, { model_name: model_name }] })

                var model_url = "https://www.bikedekho.com" + val.modelUrl
                var images_url = "https://www.bikedekho.com" + val.modelPictureURL
                if (bike_exist) {
                    const s = await vehicle_information.findOneAndUpdate({ $and: [{ brand_id: brand_id }, { model_name: model_name }] }, dataObj, { new: true })
                    console.log("vehicle_information updateed")
                    await get_other_details(model_url, images_url, dataObj, bike_exist._id, bike_exist.php_id)
                    return bike_exist._id;
                } else {
                    console.log("vehicle_information cretaed")
                    var responseOfCreate = await vehicle_information.create({ ...dataObj, php_id: php_id, is_content_writer: 0 })
                    await get_other_details(model_url, images_url, dataObj, responseOfCreate._id, responseOfCreate.php_id)
                    return responseOfCreate._id;
                }
            }
        }
        await helper.dataResponse('Vehicle Successfully Scrapped.')
    } else {
        // console.log("data_res_arr_.overView >>>>", data_res_arr_.overView)
        const findExistVehicle = await vehicle_information.findOne({
            category_id: category_id,
            brand_id: brand_id,
            model_name: data_res_arr_?.overView.name
        })
        if (!findExistVehicle) {

            let cheakid = await vehicle_information.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
            let tokenid = cheakid ? cheakid.php_id + 1 : 1
            const php_id_ = tokenid

            const d = await vehicle_information.create({
                php_id: php_id_,
                category_id: category_id,
                brand_id: brand_id,
                brand_php_id: brand_php_id,
                category_php_id: category_php_id,
                model_name: data_res_arr_?.overView.name,
                price_range: data_res_arr_?.overView.priceRangeExshowRoom,
                variant_name: data_res_arr_?.overView.variantName,
                launched_at: data_res_arr_?.overView.launchedAt,
                min_price: data_res_arr_?.overView.minOnRoadPrice
            })
            // console.log("created", d)
        } else {
            console.log("Vehicle Exist!!!!")
        }

        // await helper.macthError('Vehicle Not Scrap, Please try again')
    }

}


const scrap_common_model = async (url) => {
    const res = await axios.get(url)
    var crawler = cheerio.load(res.data).html()
    var html = crawler.split('</script>');
    var data_respone = get_string_between(html[11], '<script>window.__INITIAL_STATE__ = ', " window.__isWebp =  false;")
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
    let len = string.indexOf(string, end, ini) - ini;
    // console.log("string, end, ini>>", string, end, ini)
    // dd("stop!!")
    return string.slice(ini, len);

}

async function get_other_details(url, images_url, dataObj, model_id, php_vehicle_information_id) {
    var row
    var key
    var temp
    // console.log('url, images_url, dataObj, model_id, php_vehicle_information_id', url, images_url, dataObj, model_id, php_vehicle_information_id)
    // dd(php_vehicle_information_id)
    await axios.get(url).then(async (res) => {
        let $ = cheerio?.load(res.data)
        // console.log("$",$)
        /*Bike highlight*/
        $('div[id="model-highlight"]')?.each((index, node) => {
            var dd = $(strip_tags(node))?.html()
            row = dd?.replace('\r\n', '')
        })

        /*Key specs*/
        $('table[class="gsc_row quickOverview"] tbody tr td')?.each((index, nod) => {
            key = $(strip_tags(nod)).html()
        })

        var price_description = $('p[id="model-highlight"]')?.each((ind, nodee) => {
            temp = $(nodee)?.text();
        })
        const price_desc = temp ? temp : "NA"
        const highlights_desc = row ? row : "NA"
        const key_specs = key ? key : "NA"

        const dataupdate = {
            price_desc: price_desc,
            highlights_desc: highlights_desc,
            key_specs: key_specs
        }
        // console.log("input_color>>>>>", dataupdate)
        var update = await vehicle_information.findOneAndUpdate({ _id: model_id }, dataupdate, { new: true })

        // const qr = ("UPDATE " + `vehicle_information` + " SET " + `price_desc = '${price_desc}', highlights_desc = '${highlights_desc.replaceAll("'s", "")}', key_specs = '${key_specs}' WHERE id = ${model_id}`)
        // const qr = `UPDATE vehicle_information SET price_desc = ?, highlights_desc = ?, key_specs = ? WHERE id = ?`
        // const update = await con.query(qr, [price_desc, highlights_desc.replaceAll("'s", ""), key_specs, model_id]).then(res => { }).catch(err => console.log('err>>>>>>>>>', err))

        var colors_data = await scrap_common_model(images_url)
        var colors_data_arr = colors_data?.SideBarColors



        if ('colors' in colors_data_arr) {
            for (const val of colors_data_arr.colors) {
                let cheakidModelColor = await vehicle_model_color.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
                let tokenidModelColor = cheakidModelColor ? cheakidModelColor.php_id + 1 : 1
                const php_id = tokenidModelColor

                if (val.url) {
                    if (val.url == 'HTTP/1.0 200 OK') {
                    } else {
                        var image = val.url
                    }
                } else {
                    image = "NA"
                }
                let input_color = {
                    php_id: php_id,
                    vehicle_information_id: model_id,
                    php_vehicle_information_id: php_vehicle_information_id,
                    color_name: val.name,
                    color_code: val.hexCode,
                    image: image
                }
                let exist = await vehicle_model_color.findOne({ $and: [{ vehicle_information_id: model_id }, { color_code: val.hexCode }] }).count()
                if (exist) {
                    let res = await vehicle_model_color.findOneAndUpdate({ $and: [{ vehicle_information_id: model_id }, { color_code: val.hexCode }] }, input_color, { new: true })
                } else {
                    let res = await vehicle_model_color.create(input_color)
                }
            }
        }

    })

    //All price variant
    const responsed = await axios.get(url)
    var $ = cheerio?.load(responsed.data)
    const tableRows = $(responsed.data)?.find('table[class="allvariant contentHold"] tbody tr')
    if (tableRows) {
        for (const node of tableRows) {
            let model_link
            let model_name
            if ($(node).find('td').text()) {
                model_link = $(node).find('td a').attr('href')
                model_name = $(node).find('td a').text()
            }
            var variant_url = "https://www.bikedekho.com" + model_link
            var colors_data = await scrap_common_model(variant_url)
            var priceVarint = colors_data.overView
            const link = "https://www.bikedekho.com" + model_link
            // console.log('priceVarint>>>>>', priceVarint)
            const vehicle_information_id = model_id
            const name = model_name
            const engine = priceVarint.engine ? priceVarint.engine : "NA"
            const fuel_type = priceVarint.fuelType ? priceVarint.fuelType : "NA"
            const price_range = priceVarint.priceRangeExshowRoom ? priceVarint.priceRangeExshowRoom : "NA"
            const review_count = priceVarint.reviewCount ? priceVarint.reviewCount : 0
            const status = priceVarint.variantStatus ? priceVarint.variantStatus : 0
            // const price = priceVarint.priceRangeExshowRoom ? priceVarint.priceRangeExshowRoom : 0
            const price = priceVarint.exShowroomPrice ? priceVarint.exShowroomPrice : "O"
            const rating = 0
            let ex_show_room_rice = 0
            let mileage = priceVarint.variantMileage ? priceVarint.variantMileage.replace(/[^\d.]/g, '') : "0"
            let launched_at = 0
            let rto_price = 0
            let on_road_price = 0
            let other_price = 0
            let insurance_price = 0

            if (priceVarint.rating) {
                if (priceVarint.rating == "") {
                    rating = 0
                } else {
                    ex_show_room_rice = priceVarint.exShowroomPrice
                }
            }
            launched_at = priceVarint.launchedAt ? priceVarint.launchedAt : "NA"

            colors_data.variantPriceDetailTab.list.map((value) => {
                if (value.text == "RTO") {
                    rto_price = value.value ? value.value.replace(',', '') : 0
                }
                if (value.text == "Insurance") {
                    insurance_price = value.value ? value.value.replace(',', '') : 0
                }
                if (value.text == "Others") {
                    other_price = value.value ? value.value.replace(',', '') : 0
                }
                if (value.text == "On-Road Price in delhi") {
                    on_road_price = value.value ? value.value.replace(',', '') : 0
                }
            })
            let cheakidPriceVariant = await PriceVariant.findOne().select({ php_id: 1 }).sort({ php_id: -1 })
            let tokenidPriceVariant = cheakidPriceVariant ? cheakidPriceVariant.php_id + 1 : 1
            const php_id = tokenidPriceVariant

            let dataobje = {
                vehicle_information_id: vehicle_information_id,
                php_vehicle_information_id: php_vehicle_information_id,
                name: name,
                link: link,
                engine: engine,
                price_range: price_range,
                price: price,
                status: status,
                fuel_type: fuel_type,
                ex_show_room_rice: ex_show_room_rice,
                mileage: mileage,
                on_road_price: on_road_price,
                insurance_price: insurance_price,
                rto_price: rto_price,
                other_price: other_price,
                review_count: review_count,
                rating: rating,
                launched_at: launched_at,
            }
            let exist = await PriceVariant.findOne({ $and: [{ vehicle_information_id: model_id }, { name: model_name }] });
            if (exist) {
                await PriceVariant.findOneAndUpdate({ $and: [{ vehicle_information_id: model_id }, { name: model_name }] }, dataobje, { new: true });
            } else {
                await insertPriceVariantAndFetchSpecification(dataobje, link, model_id, php_vehicle_information_id, php_id);
            }

        }
    }

}

//Sumit Patel :- 11-09-2023 Start
async function insertPriceVariantAndFetchSpecification(dataobje, link, model_id, php_vehicle_information_id, php_id,) {
    try {
        const createId = await PriceVariant.create({ ...dataobje, php_id: php_id });
        // console.log("Price variant created Price variant created  Price variant created !!");
        await get_bike_specification(link, model_id, createId._id, dataobje, php_vehicle_information_id, createId.php_id);
        // dd(get_bike_specification)
    } catch (error) {
        console.error("Error:", error);
    }
}
//Sumit Patel :- 11-09-2023 End
export const get_bike_specification = async (url, vehicle_information, priceVariant = 0, dataobje, php_vehicle_information_id, php_variant_id) => {
    try {
        // console.log("After", url)

        let colors_data = await scrap_common_model(url)

        const vehicle_information_id = vehicle_information
        const variant_id = priceVariant
        await processTechnicalSpecs(colors_data, vehicle_information_id, variant_id, php_vehicle_information_id, php_variant_id)
    } catch (error) {
        console.log(error)
    }

}
async function processTechnicalSpecs(colors_data, vehicle_information_id, variant_id, php_vehicle_information_id, php_variant_id) {
    try {
        let used_var
        var usedInc = 0;
        if ('specsTechnicalJson' in colors_data) {
            if ('specification' in colors_data.specsTechnicalJson) {
                for (const value of colors_data.specsTechnicalJson.specification) {
                    const spec_name = value.title ? value.title : "NA";
                    
                    let php_specification_id
                    let spec_exist = await VariantSpecification.findOne({ name: spec_name });
                    let spec_id;
                    if (spec_exist) {
                        spec_id = spec_exist._id;
                        php_specification_id = spec_exist.php_id
                    } else {
                        let cheakVariantSpecificationId = await VariantSpecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                        let tokenIdOfVariantSpec = cheakVariantSpecificationId ? cheakVariantSpecificationId.php_id + 1 : 1;
                        let idOfVarSpec = tokenIdOfVariantSpec;

                        const varobj = {
                            php_id: idOfVarSpec,
                            name: spec_name,
                        };
                        const create = await VariantSpecification.create(varobj);
                        // console.log("VariantSpecification Createed!!");
                        spec_id = create._id;
                        php_specification_id = create.php_id;
                    }
                    used_var = {
                        vehicle_information_id: vehicle_information_id,
                        variant_id: variant_id,
                        specification_id: spec_id,
                        php_vehicle_information_id: php_vehicle_information_id,
                        php_variant_id: php_variant_id,
                        php_specification_id: php_specification_id

                    };

                    async function processItems() {
                        for (const item of value.items) {
                            let spec_name = item.text ? item.text : "NA";
                            let spec_value = item.value ? item.value : "NA";
                            let v_spe_exist = await VariantKey.findOne({
                                $and: [
                                    { vehicle_information_id: vehicle_information_id },
                                    { variant_id: variant_id },
                                    { specification_id: spec_id },
                                    { name: spec_name },
                                ],
                            });
                            if (v_spe_exist) {
                                used_var.name = spec_name;
                                used_var.value = spec_value;
                                var update = await VariantKey.findOneAndUpdate(
                                    {
                                        $and: [
                                            { vehicle_information_id: vehicle_information_id },
                                            { variant_id: variant_id },
                                            { specification_id: spec_id },
                                            { name: spec_name },
                                        ],
                                    },
                                    used_var,
                                    { new: true }
                                );
                            }
                            else {
                                const cheakidOfVariantKey = await VariantKey.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                                const tokenIdOfVariantKey = await (cheakidOfVariantKey ? cheakidOfVariantKey.php_id + 1 : 1);
                                used_var.php_id = tokenIdOfVariantKey;

                                // const specMappings = {
                                //     'Displacement': { show_overview: 1, variant_key_id: 1, newName: 'Engine' },
                                //     'Peak Power': { show_overview: 1, variant_key_id: 2, newName: 'Power' },
                                //     'Max Torque': { show_overview: 1, variant_key_id: 3, newName: 'Torque' },
                                //     'Mileage': { show_overview: 1, variant_key_id: 4 },
                                //     'Brakes Rear': { show_overview: 1, variant_key_id: 5, newName: 'Brakes' },
                                //     'Wheels Type': { show_overview: 1, variant_key_id: 6, newName: 'Tyre Type' },
                                //     'Fuel Type': { show_overview: 0, variant_key_id: 7 },
                                //     'BHP': { show_overview: 0, variant_key_id: 8 },
                                //     'City Mileage': { show_overview: 0, variant_key_id: 9 },
                                //     'Transmission Type': { show_overview: 0, variant_key_id: 10 },
                                //     'Max Power': { show_overview: 0, variant_key_id: 11 },
                                //     'Displacement': { show_overview: 0, variant_key_id: 12 },
                                //     'Max Torque': { show_overview: 0, variant_key_id: 13 },
                                //     'GVW': { show_overview: 0, variant_key_id: 14 },
                                //     'Max Speed': { show_overview: 0, variant_key_id: 15 },
                                //     'Number of Tyre': { show_overview: 0, variant_key_id: 16 },
                                //     'Fuel Tank': { show_overview: 0, variant_key_id: 17 },
                                //     'Number of Cylinder': { show_overview: 0, variant_key_id: 18 },
                                //     'Gear Box': { show_overview: 0, variant_key_id: 19 },
                                //     'Capacity CC': { show_overview: 0, variant_key_id: 20 },
                                //     'Top Speed': { show_overview: 0, variant_key_id: 21 },
                                //     'Range': { show_overview: 0, variant_key_id: 22 },
                                //     'Cruise speed': { show_overview: 0, variant_key_id: 23 },
                                //     'Guests': { show_overview: 0, variant_key_id: 24 },
                                //     'Guest Cabin': { show_overview: 0, variant_key_id: 25 },
                                //     'Crew': { show_overview: 0, variant_key_id: 26 },
                                //     'Travel range': { show_overview: 0, variant_key_id: 27 },
                                //     'Max Take Off Weight': { show_overview: 0, variant_key_id: 28 },
                                //     'Fuel Tank capacity': { show_overview: 0, variant_key_id: 29 },
                                //     'Body Type': { show_overview: 0, variant_key_id: 30 },
                                //     'Driving Range': { show_overview: 0, variant_key_id: 31 },
                                //     'Motor Power': { show_overview: 1, variant_key_id: 32 },
                                //     'Battery Charging Time': { show_overview: 0, variant_key_id: 33 },
                                //     'Motor Type': { show_overview: 0, variant_key_id: 34 },
                                //     'Battery Capacity': { show_overview: 0, variant_key_id: 35 },
                                //     'Cylinders': { show_overview: 1, variant_key_id: 38 },
                                //     'Seats': { show_overview: 0, variant_key_id: 39 },
                                //     'Service Cost': { show_overview: 0, variant_key_id: 40 },
                                //     'Boot Space': { show_overview: 0, variant_key_id: 41 },
                                //     'Airbags': { show_overview: 0, variant_key_id: 42 },
                                //     'Drive Type': { show_overview: 0, variant_key_id: 43 },
                                //     'Payload': { show_overview: 0, variant_key_id: 44 },
                                //     'ABS': { show_overview: 0, variant_key_id: 45 },
                                //     'Battery Warranty': { show_overview: 0, variant_key_id: 46 },
                                //     'Cooling System': { show_overview: 0, variant_key_id: 47 },
                                //     'Kerb Weight': { show_overview: 1, variant_key_id: 48 }
                                // };
                                // // Assuming spec_name is one of the keys in specMappings
                                // if (specMappings.hasOwnProperty(spec_name)) {
                                //     const mapping = specMappings[spec_name];
                                //     used_var.show_overview = mapping.show_overview;
                                //     used_var.variant_key_id = mapping.variant_key_id;
                                //     spec_name = mapping.newName || spec_name;
                                // } else {
                                //     used_var.show_overview = 0;
                                //     used_var.variant_key_id = 0; // Set the default value here if needed
                                // }

                                const cheakidOfKeySpec = await keyspecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                                const tokenIdOfKeySpec = await (cheakidOfKeySpec ? cheakidOfKeySpec.php_id + 1 : 1);
                                // console.log("tokenIdOfKeySpec>>>", tokenIdOfKeySpec)

                                // const findOrUpdateKeySpesificationn = await keyspecification.findOneAndUpdate({name:spec_name},{name:spec_name,id:tokenIdOfKeySpec},{upsert:true,new:true})
                                const findOrUpdateKeySpesificationn = await keyspecification.findOne({ name: spec_name })
                                if (findOrUpdateKeySpesificationn) {
                                    used_var.variant_key_id = findOrUpdateKeySpesificationn._id;
                                    used_var.php_variant_key_id = findOrUpdateKeySpesificationn.php_id;
                                } else {
                                    const createKeySpece = await keyspecification.create({ name: spec_name, php_id: tokenIdOfKeySpec })
                                    used_var.variant_key_id = createKeySpece._id;
                                    used_var.php_variant_key_id = createKeySpece.php_id;
                                }
                                // console.log("findOrUpdateKeySpesificationn>>", findOrUpdateKeySpesificationn)
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

                                // console.log(tokenIdOfVariantKey);
                                used_var.name = spec_name;
                                used_var.value = spec_value;
                                await VariantKey.create(used_var)
                                // console.log('else')
                                // console.log("VariantKey Created!!!")

                            }
                            // console.log(`Spec Name: ${spec_name}, Spec Value: ${spec_value}`);
                        }
                    }
                    await processItems();
                    // dd('Stop!!!')
                }
            }
            if ('keySpecs' in colors_data.specsTechnicalJson) {
                colors_data.specsTechnicalJson.keySpecs.map((valudata) => {
                    if (valudata.title.toLowerCase().includes("specifications")) {
                        var is_specification = 1;
                        let i = valudata.items.map(async (valdatas) => {
                            let u = await VariantKey.findOne({ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { name: valdatas.text });
                            if (u) {
                                var u2 = await VariantKey.findOneAndUpdate({ php_id: u.php_id }, { is_specification: is_specification }, { new: true });
                            }
                        });
                    }
                    if (valudata.title.toLowerCase().includes("Features")) {
                        let is_feature = 1;
                        let i = valudata.items.map(async (valdatas) => {
                            const u = await VariantKey.findOne({ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { name: valdatas.text });
                            if (u) {
                                // const updateVar = await con.query(updateQr)
                                let u2 = await VariantKey.findOneAndUpdate({ php_id: u.php_id }, { is_feature: is_feature }, { new: true });
                            }
                        });
                    }
                });
            }
        }
    } catch (error) {
        console.log(error)
    }

}

// Example usage:
// processTechnicalSpecs(colors_data, vehicle_information_id, variant_id);


const add_other_images = async (images_data_arr2, model_id) => {
    var imges = images_data_arr2.list.map((val) => {
        if (val !== undefined && val !== null && val !== '') {
            var image = "NA"
            var video = "NA"
            var video = "NA"
            if (val.url) {
                image = val.url
                if (val.url) {
                    //Running ***************************************
                } else {

                }

            } else {
                image = "NA"
            }
        }
    })
}

export default { scrap_bike }






// const arr = ["A", "B", "C", "D", "E", "F"]
// for (const iterator of arr) {
//     console.log("iterator", iterator)
//     await getNum()
// }


// async function getNum() {
//     for (let i = 0; i < 1000; i++) {
//         console.log(i)
//     }
// }


// echo "# demo" >> README.md
// git init
// git add README.md
// git commit - m "first commit"
// git branch - M main
// git remote add origin https://github.com/jarvis311/demo.git
// git push - u origin main