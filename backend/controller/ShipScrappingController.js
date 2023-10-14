import cheerio from "cheerio";
import axios from "axios";
import bodytypes from '../Model/BodyType.js'
import helper from "../helper/helper.js";


var category_id;
var link;
var input2
const scrap_ship = async (input) => {
    try {
        category_id = input.category
        link = input.link
        var brand = brand

        const url = "https://www.jamesedition.com/yachts/sea_ray/slx-350/sea-ray-slx-350-12504841";
        // axios.get(url).then(response => {
        //     const html = response.data;
        //     const $ = cheerio.load(html);
        //     const shipData = [];

        //     const filteredItems = $('div.JE-search-results__grid-item');

        //     filteredItems.each((index, element) => {
        //         const shipUrl = "https://www.jamesedition.com" + $(element).find('a').attr('href');
        //         const names = $(element).find('div.JE-search-result').map((i, el) => {
        //             return $(el).find('p').eq(1).text();
        //         }).get();

        //         shipData.push({ shipUrl, names });
        //     });
        // })
        axios.get(url).then((response) => {
            const html = response.data;
            const $ = cheerio.load(html);
            console.log($);
            const shipData = [];
            var shipUrl
            var names
            const filteredItems = $('div.JE-search-results__grid-item');

            filteredItems.each((index, element) => {
                shipUrl = "https://www.jamesedition.com" + $(element).find('a').attr('href');
                names = $(element).find('div.JE-search-result').map((i, el) => {
                    return $(el).find('p').eq(1).text();
                }).get();

                shipData.push({ shipUrl, names });
            });
            var vehicle_name = names[0] ? names[0] : "NA"
            var crawler2 = axios.get(shipUrl)
            var $2 = cheerio.load(crawler2)
            $2(crawler2).find('.JE-listing-seller__title').text()
            var menufacture_details = $2(crawler2).find('.JE-listing-seller__title').text()
            console.log(menufacture_details);
        })
    } catch (err) {
        console.log(err);
    }  
}

export default { scrap_ship }