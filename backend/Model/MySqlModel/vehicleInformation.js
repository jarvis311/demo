import { DataTypes } from "sequelize";
import { sequelize } from '../../connecttion/mysqlconn.js'

export const VehicleInformationTable = sequelize.define("vehicle_information", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    brand_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    category_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bind_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    model_name: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    fuel_type: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    avg_rating: {
        type: DataTypes.DOUBLE,
        defaultValue: "NA"
    },
    review_count: {
        type: DataTypes.DOUBLE,
        defaultValue: "NA"
    },
    variant_name: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    min_price: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    max_price: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    price_range: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    image: {
        type: DataTypes.STRING,
        defaultValue: "NA"

    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    launched_at: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    Launch_date: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    model_popularity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    mileage: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    engine: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    style_type: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    max_power: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    showroom_price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    on_road_price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_popular_search: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    is_upcoming: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    is_latest: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    price_desc: {
        type: DataTypes.TEXT,
        defaultValue: null
    },
    highlights_desc: {
        type: DataTypes.TEXT,
        defaultValue: null
    },
    key_specs: {
        type: DataTypes.TEXT,
        defaultValue: null
    },
    manufacturer_desc: {
        type: DataTypes.TEXT,
        defaultValue: null
    },
    is_recommended: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    link: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    rto_price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    insurance_price: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    other_price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bodytype_id: {
        type: DataTypes.NUMBER,
        defaultValue: 0
    },
    is_content_writer: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_designer: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    headtag: {
        type: DataTypes.TEXT,
        defaultValue: 0
    },
    popular_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    search_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE
    },
    deleted_by: {
        type: DataTypes.DATE
    },
    updated_at: {
        type: DataTypes.DATE
    },
    deleted_by: {
        type: DataTypes.INTEGER
    },
    // is_new: {
    //     type: DataTypes.NUMBER,
    //     defaultValue: 0
    // },
    // body_type: {
    //     type: DataTypes.STRING,
    //     defaultValue: "NA"
    // },
    // is_most_search: {
    //     type: DataTypes.STRING,
    //     defaultValue: "NA"
    // },
    // expired_date: {
    //     type: DataTypes.STRING
    // },
    // start_date: {
    //     type: DataTypes.STRING
    // },
    // rating: { type: DataTypes.STRING, defaultValue: 0 },
},
    {
        tableName: "vehicle_information",
        timestamps: false,
        // freezeTableName: true
    })

// sequelize.sync().then(() => {
//     console.log('Book table created successfully!');
// }).catch((error) => {
//     console.error('Unable to create table : ', error);
// });