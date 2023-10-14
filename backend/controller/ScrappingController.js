import Brands from "../Model/Brands.js";
import helper from "../helper/helper.js";
import BikeScrappingController from "../controller/scrapping.js"
import CarScrppingContrller from '../controller/CarScrappingController.js'
import TruckContrller from "../controller/TruckScrappingController.js"
import ShipController from "../controller/ShipScrappingController.js"
import AircraftContrller from "../controller/AircraftScrappingController.js"
// import con from "../connecttion/mysqlconn.js";
// import Brand from "../Model/Brands.js"


const get_brand = async (req, res) => {

    if (req.body.category_id != "" && req.body.category_id != 0) {
        var category = await Brands.find({ category_id: req.body.category_id })
        if (category.length != 0) {
            var html = '<option value="">Select Brand</option>'
            category.forEach((val) => {
                html += `<option value="${val.id}">${val.name}</option>`
                return html
            })
        } else {
            return 0
        }
    } else {
        return 0
    }
}

const scrap_data = async (req, res) => {
    var input = req.body
    let brand = await Brands.findOne({ name: input.brand, php_category_id: input.category })

    if (input.category == "" || !input.category) {
        return res.send(await helper.requiredError('Select Category'))
    }
    else if (input.brand == "" || !input.brand) {
        return res.send(await helper.requiredError('Select Brand'))
    }
    else if (input.scrap_type == "" || !input.scrap_type) {
        return res.send(await helper.requiredError('Select Scrapping Type'))
    }
    else if (input.scrap_type == 'vehicle' && input.link == "") {
        return res.send(await helper.requiredError('Enter Scrap Link'))
    } else {
        if (input.category == 1) {
            var bike_scrapping = BikeScrappingController;
            // return bike_scrapping.scrap_bike( input)
            const datas = await bike_scrapping.scrap_bike(input, brand)
            res.send(datas)
        }
        else if (input.category == 2) {
            const datas = await CarScrppingContrller.scrap_cars(input, brand)
            res.send(datas)
        }
        else if (input.category == 3) {
            const datas = await TruckContrller.scrap_truck(input, brand)
            res.send(datas)
        }
        else if (input.category == 4 || input.category == 5) {
            const datas = await AircraftContrller.scrap_aircraft_types(input, brand)
            res.send(datas)
        }
        else if (input.category == 6) {
            const datas = await ShipController.scrap_ship(input)
            res.send(datas)
        }
        else {
            return res.send(helper.catchError('Something went wrong.'))
        }
    }


}

export default { scrap_data }