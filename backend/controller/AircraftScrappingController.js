import cheerio from "cheerio";
import axios from "axios";
import bodytypes from '../Model/BodyType.js'
import helper from "../helper/helper.js";
import vehicle_information from "../Model/VehicleInformation.js";

var category_id;
var link;
var brand_id



const scrap_aircraft_types = async (input, brand) => {
    try {
        category_id = input.category
        link = input.link
        var brand = brand
        brand_id = brand.id

        var crawler = 'https://www.aircraftcompare.com/aircraft-by-category/'
        axios.get(crawler).then(async (res) => {
            var $ = cheerio.load(res.data)
            var brands_arr = $('section div .aircraft-categories__column a').each(async (index, node) => {
                var links = $(node).attr('href')
                category_id = category_id
                // const dd = await get_string_between(links[1], 'https://www.aircraftcompare.com/aircraft-categories/', '/')
                // console.log(dd);
                await scrap_plane_data(links, input)
            })
        })
    } catch (err) {
        console.log(err);
    }
}

const get_string_between = async (string, start, end) => {
    string = ' ' + string;
    var ini = string.indexOf(start);
    if (ini === 0) return '';
    ini += start.length;
    let len = string.indexOf(string, end, ini) - ini;
    return string.slice(ini, len);
}


const scrap_plane_data = async (url, input) => {
    if (url.includes('helicopter')) {
        category_id = 4
    } else {
        category_id = 5
    }
    var crawler = url
    let style_type
    let model_name
    let image
    let filter
    let price_range
    let manufacturer_desc
    let key_features
    let key_specs
    let highlights_desc
    var panel_url = await axios.get(crawler).then(async (res) => {
        let $ = cheerio.load(res.data)
        let panel_url = $('div .media-body a').each(async (ind, nod) => {
            var panel_urls = $(nod).attr('href')
            style_type = panel_urls
            if (link == panel_urls.path) {
                var crawler2 = await axios.get(panel_urls).then(async (res) => {
                    var $ = cheerio.load(res.data)

                    if ($(res.data).find('h1').length == 1) {
                        model_name = $(res.data).find('h1').text()
                    } else {
                        model_name = "NA"
                    }
                    category_id = category_id
                    if ($(res.data).find('div[class="position-relative"] picture img').length == 1) {
                        image = $(res.data).find('div[class="position-relative"] picture img').attr('herf')
                        console.log(image);
                    } else {
                        image = $(res.data).find('div .shadow img').attr('src')
                    }
                    if ($(res.data).find('.mb-sm-5').length == 1) {
                        filter = '.mb-sm-5 dl'
                    } else {
                        filter = 'section[class="row mb-1"] dl'
                    }
                    var menu_description2 = $(res.data).find(filter + 'dt').each((ind, node) => {
                        console.log($(node).text());
                        return $(node).text()
                    })
                    var menu_description3 = $(res.data).find(filter + 'dd').each((index, nodee) => {
                        return $(nodee).text()
                    })
                    const menufacturer_arr = {};
                    for (let i = 0; i < menu_description2.length; i++) {
                        menufacturer_arr[menu_description2[i]] = menu_description3[i];
                    }
                    if ('Manufacturer:' in menufacturer_arr) {
                        const brand_name = menufacturer_arr["Manufacturer:"]
                        const brand_link = "https://www.aircraftcompare.com/manufacturers/" + JSON.parse(brand_name)

                    }
                    if ($(res.data).filter('p').length == 1) {
                        price_range = $(res.data).filter('p').text()
                    } else {
                        if ('Price:' in menufacturer_arr) {
                            price_range = menufacturer_arr["Price:"]
                        } else {
                            price_range = "NA"
                        }
                    }
                    manufacturer_desc = Object.values(menufacturer_arr).join(',');
                    key_features = $(res.data).find('section[class="entry-content-tabbed"] div').each((indexc, node) => {
                        var key_count = $(res.data).find('div #myTabContent').length
                        if (key_count == 1) {
                            var aircraft_specs = $(node).find('div #myTabContent').text()
                            return aircraft_specs
                        }
                    })
                    key_specs = Object.values(key_features).join(',')
                    if ($(res.data).find('div .entry-content').length == 1) {
                        var highlight = $(res.data).filter('div .entry-content').text();
                    } else {
                        highlight = "NA"
                    }
                    highlights_desc = highlight
                    link = panel_urls

                    const planData = {
                        category_id: category_id,
                        brand_id: brand_id,
                        style_type: style_type,
                        model_name: model_name,
                        price_range: price_range,
                        key_specs: key_specs,
                        highlights_desc: highlights_desc,
                        link: link,
                        image: image

                    }
                    console.log(planData);
                    var plan_exist = await vehicle_information.findOne({ model_name: model_name })
                    if (plan_exist) {
                        if (plan_exist.id > 888) {
                            const insert = await vehicle_information.findOneAndUpdate({ model_name: model_name }, planData, { new: true })

                        } else {
                            await vehicle_information.create(planData)
                        }
                    }
                })
            } else {
                return (await helper.macthError('Aircraft Not Found'))
            }
        })

    })
}
export default { scrap_aircraft_types }