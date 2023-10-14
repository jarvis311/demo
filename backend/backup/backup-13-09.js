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
import Counter from '../Model/Counter.js'
// import getNextVariantKeyId from "../helper/helper.js"
import dd from "dump-die";
import { createTestAccount } from "nodemailer";

var link;

const scrap_bike = async (input, brand) => {
    try {
        // category_id = input.category
        link = input.link
        var brand = brand
        var brand_id = brand._id
        let brand_php_id = brand.id
        const findCategoryId = await CategoryModel.findOne({ id: input.category })
        let category_id = findCategoryId._id
        let category_php_id = findCategoryId.id

        if (input.scrap_type == "brand") {
            var new_bike_url = "https://www.bikedekho.com/" + brand.name + "-bikes"
        } else {
            var res_specific_bikes = await get_specific_bike(link, input, brand)

            return res_specific_bikes;
        }
        let data_res_arr = await scrap_common_model(new_bike_url)

        if ('upcomingCars' in data_res_arr) {
            data_res_arr.upcomingCars.items.map(item => {
                data_res_arr.items.push(item)
            })
        }
        // dd("sdhasfjkl>>>", data_res_arr.items)
        if ('items' in data_res_arr) {
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
                let bodytype_id = 0
                let max_power = 0
                // let [rowsd, files] = await con.query("SELECT * FROM `bodytypes` WHERE `category_id`=" + `'${category_id}'` + " AND `name` LIKE " + `'${style_type}'`)
                const findBodyTypeName = await Bodytypes.findOne(
                    {
                        category_id: category_id, // replace category_id with the actual value
                        name: new RegExp(style_type) // replace style_type with the actual value
                    })
                if (findBodyTypeName) {
                    bodytype_id = findBodyTypeName.id
                } else {
                    const newBodyTypeId = await Bodytypes.create({
                        // php_id: id,
                        category_id: category_id,
                        name: style_type,
                        image: '',
                        status: 1,
                        position: 0
                    });
                    bodytype_id = newBodyTypeId.id;
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
                    php_id: php_id,
                    category_id: category_id,
                    brand_id: brand_id,
                    brand_php_id: brand_php_id,
                    category_php_id: category_php_id,
                    link: link,
                    scrap_type: input.scrap_type,
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
                    on_road_price: parseInt(on_road_price),
                    rto_price: rto_price ? parseInt(rto_price.replaceAll(',', '')) : 0,
                    body_type: bodytype_id,
                    bodytype_id: bodytype_id,
                    insurance_price: insurance_price ? parseInt(insurance_price.replaceAll(',', '')) : 0,
                    other_price: parseInt(other_price),
                    is_popular_search: is_popular_search,
                    is_upcoming: is_upcoming,
                    is_latest: is_latest,
                    is_content_writer: is_content_writer
                }

                let bike_exist = await vehicle_information.findOne({ $and: [{ brand_id: brand_id }, { model_name: model_name }] })

                let model_url = "https://www.bikedekho.com" + val.modelUrl
                let images_url = "https://www.bikedekho.com" + val.modelPictureURL


                if (bike_exist) {
                    const updatedBike = await vehicle_information.findOneAndUpdate(
                        { $and: [{ brand_id: brand_id }, { model_name: model_name }] },
                        brandobj,
                        { new: true }
                    );
                    await get_other_details(model_url, images_url, brandobj, bike_exist._id)
                    // console.log("bike_exist")
                } else {
                    try {
                        const createdBike = await vehicle_information.create(brandobj);
                        get_other_details(model_url, images_url, brandobj, createdBike._id);
                        // The code will continue here after get_other_details is completed.
                    } catch (error) {
                        console.error("Error:", error);
                    }
                }
            }
            return (await helper.dataResponse('Vehicle Successfully Scrapped.'))
        } else {
            return (await helper.macthError('Vehicle Not Scrap, Please try again'))
        }
        return data_res_arr
    } catch (error) {
        console.log(error);
    }
}

const get_specific_bike = async (link, input1, brand) => {
    var data_res_arr = await scrap_common_model(link);
    // dd(data_res_arr)
    // console.log('data_res_arr>>>', data_res_arr)
    if ('overView' in data_res_arr) {
        var bike_data = data_res_arr.overView;
        var res_specific_bike = bike_data.name;
    } else {
        return (await helper.macthError('Model not Found'))
    }
    var new_bike_url = "https://www.bikedekho.com/" + brand.name + "-bikes";
    var brand_id = brand._id;
    let brand_php_id = brand.id
    const findCategory = await CategoryModel.findOne({ id: input1.category })
    // console.log("findCategory>>>>", findCategory)
    let category_id = findCategory._id
    let category_php_id = findCategory.id
    var data_res_arr = await scrap_common_model(new_bike_url);

    if ('items' in data_res_arr || "upcomingCars" in data_res_arr) {
        data_res_arr.upcomingCars.items.map(item => {
            data_res_arr.items.push(item)
        })
        for (const val of data_res_arr.items) {
            if (res_specific_bike == val.modelName) {
                // console.log("val>>>", val)
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
                const model_popularity = val.modelPopularity ? val.modelPopularity : 0;
                const mileage = val.modelMilegae ? val.modelMilegae : "NA";
                const engine = val.ccValue ? val.ccValue : "NA";
                const style_type = val.style_type ? val.style_type : "NA";
                const max_power = val.maxPower ? val.maxPower : "NA";
                let showroom_price = 0
                let on_road_price = 0
                let bodytype_id = 0

                var bodyTypedata = await Bodytypes.findOne({ $and: [{ category_id: category_id }, { name: style_type }] })

                // let [rows, files] = await con.query("SELECT * FROM `bodytypes` WHERE `category_id`= " + `'${category_id}'` + " AND `name` LIKE " + `'${style_type}'`)
                // let bodyTypedata = rows[0]
                if (bodyTypedata) {
                    bodytype_id = bodyTypedata.id
                } else {
                    bodytype_id = 0
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
                    axios.get("https://www.bikedekho.com" + val.otherLinks.url).then(async (client) => {
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
                    php_id: php_id,
                    category_id: category_id,
                    brand_id: brand_id,
                    brand_php_id: brand_php_id,
                    category_php_id: category_php_id,
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
                    bodytype_id: bodytype_id,
                    is_latest: is_latest,
                    is_content_writer: is_content_writer
                }
                var bike_exist = await vehicle_information.findOne({ $and: [{ brand_id: brand_id }, { model_name: model_name }] })
                // const [rows, filed] = await con.query("SELECT * FROM `vehicle_information` WHERE `brand_id`= " + `'${brand_id}'` + " AND `model_name` LIKE " + `'${model_name}'`)
                // const bike_exist = rows[0]
                var model_url = "https://www.bikedekho.com" + val.modelUrl
                var images_url = "https://www.bikedekho.com" + val.modelPictureURL
                if (bike_exist) {
                    await vehicle_information.findOneAndUpdate({ $and: [{ brand_id: brand_id }, { model_name: model_name }] }, dataObj, { new: true })
                    // const qr = ("UPDATE " + `vehicle_information ` + "SET " + `brand_id = ${brand_id}, category_id = ${category_id}, bodytype_id = ${bodytype_id}, model_name = '${model_name}',fuel_type = '${fuel_type}',avg_rating = ${avg_rating}, review_count = ${review_count} ,variant_name = '${variant_name}',min_price=${min_price},max_price=${max_price},image='${image}',status='${status}', launched_at='${launched_at}',Launch_date='${Launch_date}',model_popularity=${model_popularity},mileage=${mileage},engine=${engine},style_type='${style_type}',max_power='${max_power}',showroom_price=${showroom_price},rto_price=${rto_price},insurance_price=${insurance_price},other_price=${other_price} ,is_content_writer=${is_content_writer},on_road_price=${on_road_price},is_popular_search=${is_popular_search},is_upcoming=${is_upcoming},is_latest=${is_latest},link='${link}' WHERE brand_id = ${brand_id} AND model_name LIKE '${model_name}'`)
                    // const update = await con.query(qr)
                    await get_other_details(model_url, images_url, dataObj, bike_exist._id)
                    return bike_exist._id;

                } else {

                    var responseOfCreate = await vehicle_information.create(dataObj)
                    await get_other_details(model_url, images_url, dataObj, responseOfCreate._id)
                    return responseOfCreate._id;

                }
            }
        }
        return (await helper.dataResponse('Vehicle Successfully Scrapped.'))
    } else {
        return (await helper.macthError('Vehicle Not Scrap, Please try again'))
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
    return string.slice(ini, len);

}

const get_other_details = async (url, images_url, dataObj, model_id) => {
    var row
    var key
    var temp
    await axios.get(url).then(async (res) => {
        var $ = cheerio.load(res.data)
        /*Bike highlight*/
        $('div[id="model-highlight"]').each((index, node) => {
            var dd = $(strip_tags(node)).html()
            row = dd.replace('\r\n', '')
        })

        /*Key specs*/
        $('table[class="gsc_row quickOverview"] tbody tr td').each((index, nod) => {
            key = $(strip_tags(nod)).html()
        })

        var price_description = $('p[id="model-highlight"]').each((ind, nodee) => {
            temp = $(nodee).text();
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
        var colors_data_arr = colors_data.SideBarColors



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
                    color_name: val.name,
                    color_code: val.hexCode,
                    image: image
                }
                let exist = await vehicle_model_color.find({ $and: [{ vehicle_information_id: model_id }, { color_code: val.hexCode }] }).count()
                if (exist) {
                    var res = await vehicle_model_color.find({ $and: [{ vehicle_information_id: model_id }, { color_code: val.hexCode }] }, input_color, { new: true })
                } else {
                    res = await vehicle_model_color.create(input_color)
                }
            }
        }

    })

    //All price variant
    axios.get(url).then(async (responsed) => {
        var $ = cheerio.load(responsed.data)
        const tableRows = $(responsed.data).find('table[class="allvariant contentHold"] tbody tr')

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
            // console.log('priceVarint>>>', priceVarint)
            const vehicle_information_id = model_id
            const name = model_name
            const engine = priceVarint.engine ? priceVarint.engine : "NA"
            const fuel_type = priceVarint.fuelType ? priceVarint.fuelType : "NA"
            const price_range = priceVarint.priceRange ? priceVarint.priceRange : "NA"
            const review_count = priceVarint.reviewCount ? priceVarint.reviewCount : 0
            const status = priceVarint.variantStatus ? priceVarint.variantStatus : 0
            const price = priceVarint.priceRangeExshowRoom ? priceVarint.priceRangeExshowRoom : 0
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
                php_id: php_id,
                vehicle_information_id: vehicle_information_id,
                name: name,
                link: link,
                engine: engine,
                price_range: price_range,
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
                await insertPriceVariantAndFetchSpecification(dataobje, link, model_id);
            }

            // let exist = await PriceVariant.findOne({ $and: [{ vehicle_information_id: model_id }, { name: model_name }] })
            // if (exist) {
            //     await PriceVariant.findOneAndUpdate({ $and: [{ vehicle_information_id: model_id }, { name: model_name }] }, dataobje, { new: true })
            // } else {
            //     // PriceVariant.create(dataobje).then((craeteId) => {
            //     //     console.log("Price variant createed")
            //     //      get_bike_specification(link, model_id, craeteId._id, dataobje)
            //     // })
            //     createPriceVariantAndGetSpecification(dataobje, link, model_id);
            // }

        }
    })
}

//Sumit Patel :- 11-09-2023 Start
async function insertPriceVariantAndFetchSpecification(dataobje, link, model_id) {
    try {
        const createId = await PriceVariant.create(dataobje);
        if (createId) {
            console.log("Price variant created")
            await get_bike_specification(link, model_id, createId._id, dataobje);

        }
    } catch (error) {
        dd(error);
        console.error("Error:", error);
    }
}
//Sumit Patel :- 11-09-2023 End
const get_bike_specification = async (url, vehicle_information, priceVariant = 0, dataobje,) => {
    console.log("After", url)

    let colors_data = await scrap_common_model(url)

    const vehicle_information_id = vehicle_information
    const variant_id = priceVariant
    await processTechnicalSpecs(colors_data, vehicle_information_id, variant_id)
}
// const counterDoc = await Counter.findOneAndUpdate(
//     { _id: "variant_key_php_id" },
//     { $inc: { php_id: 1 } },
//     { upsert: true, new: true }
// );

// return counterDoc.php_id;
async function getNextVariantKeyPhpId() {

    // const aggregationResult = await VariantKey.findOne(
    //     { $inc: { php_id: 1 } },
    //     { upsert: true, new: true }
    // );

    return 1;
}
async function processTechnicalSpecs(colors_data, vehicle_information_id, variant_id) {
    let used_var
    if ('specsTechnicalJson' in colors_data) {
        if ('specification' in colors_data.specsTechnicalJson) {
            const specificationPromises = [];
            for (const value of colors_data.specsTechnicalJson.specification) {
                const spec_name = value.title ? value.title : "NA";

                const cheakVariantSpecificationId = await VariantSpecification.findOne().select({ php_id: 1 }).sort({ php_id: -1 });
                const tokenIdOfVariantSpec = cheakVariantSpecificationId ? cheakVariantSpecificationId.php_id + 1 : 1;
                const idOfVarSpec = tokenIdOfVariantSpec;

                const varobj = {
                    php_id: idOfVarSpec,
                    name: spec_name,
                };

                let spec_exist = await VariantSpecification.findOne({ name: spec_name });
                let spec_id;

                if (spec_exist) {
                    spec_id = spec_exist._id;
                } else {
                    const create = await VariantSpecification.create(varobj);
                    spec_id = create._id;
                }

                used_var = {
                    vehicle_information_id: vehicle_information_id,
                    variant_id: variant_id,
                    specification_id: spec_id,
                };


                specificationPromises.push(
                    Promise.all(
                        value.items.map(async (values, index) => {
                            let php_id = await getNextVariantKeyPhpId()
                            let spec_name = values.text ? values.text : "NA";
                            let spec_value = values.value ? values.value : "NA";
                            let v_spe_exist = await VariantKey.findOne({
                                $and: [
                                    { vehicle_information_id: vehicle_information_id },
                                    { variant_id: variant_id },
                                    { specification_id: spec_id },
                                    { name: spec_name },
                                ],
                            });



                            used_var.php_id = php_id;
                            used_var.name = spec_name;
                            used_var.value = spec_value;
                            used_var.show_overview = 0;
                            used_var.variant_key_id = 0;

                            if (v_spe_exist) {
                                if (spec_name == 'Motor Power') {
                                    used_var.show_overview = 1;
                                    used_var.variant_key_id = 32;
                                }
                                // ... (other conditions)

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
                            } else {
                                // ... (other conditions)
                                // 
                                let update = await VariantKey.create(used_var);
                                if (update) {
                                    console.log("Variant Created!!")
                                }
                            }
                        })
                    )
                );
            }

            await Promise.all(specificationPromises);
        }

        if ('keySpecs' in colors_data.specsTechnicalJson) {
            colors_data.specsTechnicalJson.keySpecs.map((valudata) => {
                if (valudata.title.toLowerCase().includes("specifications")) {
                    var is_specification = 1
                    let i = valudata.items.map(async (valdatas) => {
                        let u = await VariantKey.findOne({ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { name: valdatas.text })
                        if (u) {
                            var u2 = await VariantKey.findOneAndUpdate({ id: u.id }, { is_specification: is_specification }, { new: true })
                        }
                    })
                }
                if (valudata.title.toLowerCase().includes("Features")) {
                    let is_feature = 1
                    let i = valudata.items.map(async (valdatas) => {
                        const u = await VariantKey.findOne({ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { name: valdatas.text })
                        if (u) {
                            // const updateQr = ("UPDATE " + `variant_key_specs ` + "SET " + `is_feature = ${is_feature} WHERE id = ${u.id} `)
                            // const updateVar = await con.query(updateQr)
                            let u2 = await VariantKey.findOneAndUpdate({ id: u.id }, { is_feature: is_feature }, { new: true })
                        }
                    })
                }
            })
        }
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


// if (v_spe_exist) {

//     if (spec_name == 'Motor Power') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 32
//     }
//     if (spec_name == 'Motor Type') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 34
//     }
//     if (spec_name == 'Battery Capacity') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 33
//     }
//     if (spec_name == 'Engine') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 1
//     }
//     if (spec_name == 'Peak Power') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 2
//     }
//     if (spec_name == 'Max Torque') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 3
//     }
//     if (spec_name == 'Brakes') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 5
//     }
//     if (spec_name == 'Cylinders') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 38
//     }
//     if (spec_name == 'Kerb Weight') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 48
//     }
//     // const updateQr = ("UPDATE " + `variant_key_specs ` + "SET " + `vehicle_information_id = ${vehicle_information_id}, variant_id = ${variant_id}, specification_id = ${spec_id}, name = '${spec_name}',value = '${spec_value}',show_overview = ${used_var.show_overview}, variant_key_id = ${used_var.variant_key_id}  WHERE vehicle_information_id = ${vehicle_information_id} AND variant_id = ${variant_id} AND specification_id = ${spec_id} AND name = '${spec_name}'`)
//     // const updateVar = await con.query(updateQr)
//     var update = await VariantKey.findOneAndUpdate({ $and: [{ vehicle_information_id: vehicle_information_id }, { variant_id: variant_id }, { specification_id: spec_id }, { name: spec_name }] }, used_var, { new: true })
// } else {
//     if (spec_name == 'Displacement') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 1
//         spec_name = "Engine"
//     }
//     if (spec_name == 'Peak Power') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 2
//         spec_name = "Power"
//     }
//     if (spec_name == 'Max Torque') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 3
//         spec_name = "Torque"
//     }
//     if (spec_name == 'Mileage') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 4
//     }
//     if (spec_name == 'Brakes Rear') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 5
//         spec_name = "Brakes"
//     }
//     if (spec_name == 'Wheels Type') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 6
//         spec_name = "Type Type"
//     }
//     if (spec_name == 'Fuel Type') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 7
//     }
//     if (spec_name == 'BHP') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 8
//     }
//     if (spec_name == 'City Mileage') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 9
//     }
//     if (spec_name == 'Transmission Type') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 10
//     }
//     if (spec_name == 'Max Power') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 11
//     }
//     if (spec_name == 'Displacement') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 12
//     }
//     if (spec_name == 'Max Torque') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 13
//     }
//     if (spec_name == 'GVW') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 14
//     }
//     if (spec_name == 'Max Speed') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 15
//     }
//     if (spec_name == 'Number of Tyre') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 16
//     }
//     if (spec_name == 'Fule Tank') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 17
//     }
//     if (spec_name == 'Number of Cylinder') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 18
//     }
//     if (spec_name == 'Gear Box') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 19
//     }
//     if (spec_name == 'Capacity CC') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 20
//     }
//     if (spec_name == 'Top Speed') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 21
//     }
//     if (spec_name == 'Range') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 22
//     }
//     if (spec_name == 'Cruise speed') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 23
//     }
//     if (spec_name == 'Guests') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 24
//     }
//     if (spec_name == 'Guest Cabin') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 25
//     }
//     if (spec_name == 'Crew') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 26
//     }
//     if (spec_name == 'Travel range') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 27
//     }
//     if (spec_name == 'Max Take Off Weight') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 28
//     }
//     if (spec_name == 'Fuel Tank capacity') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 29
//     }
//     if (spec_name == 'Body Type') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 30
//     }
//     if (spec_name == 'Driving Range') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 31
//     }

//     if (spec_name == 'Motor Power') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 32
//     }
//     if (spec_name == 'Battery Charging Time') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 33
//     }
//     if (spec_name == 'Motor Type') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 34
//     }
//     if (spec_name == 'Battery Capacity') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 35
//     }
//     if (spec_name == 'Cylinders') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 38
//     }
//     if (spec_name == 'Seats') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 39
//     }
//     if (spec_name == 'Service Cost') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 40
//     }
//     if (spec_name == 'Boot Space') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 41
//     }
//     if (spec_name == 'Airbags') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 42
//     }
//     if (spec_name == 'Drive Type') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 43
//     }
//     if (spec_name == 'Payload') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 44
//     }
//     if (spec_name == 'ABS') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 45
//     }
//     if (spec_name == 'Battery Warranty') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 46
//     }
//     if (spec_name == 'Cooling System') {
//         used_var.show_overview = 0
//         used_var.variant_key_id = 47
//     }
//     if (spec_name == 'Kerb Weight') {
//         used_var.show_overview = 1
//         used_var.variant_key_id = 48
//     }
//     // const qr = ("INSERT INTO variant_key_specs( vehicle_information_id, variant_id, specification_id, name, value, show_overview, variant_key_id )") + ' VALUES ' + (`(${vehicle_information_id}, ${variant_id},${spec_id},'${spec_name}','${spec_value.replaceAll("'s", " ")}',${used_var.show_overview == "undefined" || undefined ? 0 : used_var.show_overview},${used_var.variant_key_id == "undefined" || undefined ? 0 : used_var.variant_key_id})`)
//     // let craete = await con.query(qr)
//     var update = await VariantKey.create(used_var)
// }




// if (spec_name == 'Displacement') {
//     spec_name = "Engine"
// }
// if (spec_name == 'Peak Power') {
//     spec_name = "Power"
// }

// if (spec_name == 'Max Torque') {
//     spec_name = "Torque"
// }

// if (spec_name == 'Brakes Rear') {
//     spec_name = "Brakes"
// }
// if (spec_name == 'Wheels Type') {
//     spec_name = "Tyre Type"
// }
// if (spec_name == 'ARAI Mileage') {
//     spec_name = "Mileage"
// }
// if (
//     spec_name == "Displacement" ||
//     "Peak Power" ||
//     "Max Torque" ||
//     "Mileage" ||
//     "Brakes Rear" ||
//     "Wheels Type" ||
//     "Motor Power" ||
//     "Cylinders" ||
//     "Kerb Weight"
// ) {
//     used_var.show_overview = 1
// } else {
//     used_var.show_overview = 0
// }

// const verintId = await keyspecification.findOne({ name: spec_name })
// used_var.variant_key_id = verintId?._id
// used_var.php_variant_key_id = verintId?.id 