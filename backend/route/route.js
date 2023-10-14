import express from 'express';
const router = express.Router()
import Scrappingconroller from "../controller/scrapping.js"
import Bikecontroler from "../controller/ScrappingController.js"
import MysqltoMongodb from '../controller/MysqltoMongodb.js';
import ScrappingCarConroller from '../controller/CarScrappingController.js';
import mongoose from 'mongoose';
import { filterByBrand, filterByCategory, getBrands, getCategory, getVehicleInformationData, postDataIntoMysql } from '../controller/GetVehicleInformation.controller.js';
import { MysqlToMongodbConvertDatabaseBodyType, MysqlToMongodbConvertDatabaseBrand, MysqlToMongodbConvertDatabaseCategory, MysqlToMongodbConvertDatabaseKeyspecification, MysqlToMongodbConvertDatabaseModelColor, MysqlToMongodbConvertDatabasePriceVariant, MysqlToMongodbConvertDatabaseVariantKeySpecification, MysqlToMongodbConvertDatabaseVariantSpecification, MysqlToMongodbConvertDatabaseVehicleInformation, MysqltoMongodbConver } from '../controller/MongooseToMysql.js';

router.post('/scrap_bike', Bikecontroler.scrap_data)


//*********************mysql to Mongo start**************************** */

router.post("/catagroies", MysqltoMongodb.categories)
router.post("/brands", MysqltoMongodb.brands)
router.post("/bodytype", MysqltoMongodb.bodytype)
router.post("/vehicalcolor", MysqltoMongodb.vehicalcolor)
router.post("/variant_specifications", MysqltoMongodb.variant_specifications)
router.post("/vehicle_information", MysqltoMongodb.vehicle_informations)
router.post("/variant_key_specs", MysqltoMongodb.variant_key_specs)
router.post("/price_variants", MysqltoMongodb.price_variants)
router.post("/keyspecification", MysqltoMongodb.keyspecification)

// GET ROUTE
router.get("/get-vehicles", getVehicleInformationData)
router.get("/get-category", getCategory)
router.get("/get-brand/:categoryId", getBrands)
router.post("/get-filterCategory", filterByCategory)
router.post("/get-filterBrand", filterByBrand)
router.post("/mongo-to-mysql/:vehicleId", postDataIntoMysql)
router.post("/mongo-tomysql", MysqltoMongodbConver)

router.post("/mysqlToMongodbCategory", MysqlToMongodbConvertDatabaseCategory)
router.post("/mysqlToMongodbBrand", MysqlToMongodbConvertDatabaseBrand)
router.post("/mysqlToMongodbBodytype", MysqlToMongodbConvertDatabaseBodyType)
router.post("/mysqlToMongodbKeyspec", MysqlToMongodbConvertDatabaseKeyspecification)
router.post("/mysqlToMongodbVehiclesInfo", MysqlToMongodbConvertDatabaseVehicleInformation)
router.post("/mysqlToMongodbModelColor", MysqlToMongodbConvertDatabaseModelColor)
router.post("/mysqlToMongodbPriceVariant", MysqlToMongodbConvertDatabasePriceVariant)
router.post("/mysqlToMongodbVariantSpec", MysqlToMongodbConvertDatabaseVariantSpecification)
router.post("/mysqlToMongodbVariantKeySpecification", MysqlToMongodbConvertDatabaseVariantKeySpecification)

// router.post("/addBodyType", addBodyType)


router.post("/deleteMany", async (req, res) => {
    const collectionsToDelete = ['variant_key_specs', 'variant_specifications', 'vehicle_informations', 'vehicle_model_colors', 'vehicle_price_variants'];
    for (const collectionName of collectionsToDelete) {
        try {
            await mongoose.connection.db.dropCollection(collectionName);
            console.log(`Collection '${collectionName}' deleted.`);
            res.send("Ok, Table is deleted !!!")
        } catch (error) {
            console.error(`Error deleting collection '${collectionName}': ${error.message}`);
        }
    }
})

//*********************mysql to Mongo end**************************** */
export default router