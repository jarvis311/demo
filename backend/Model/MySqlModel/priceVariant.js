import { DataTypes } from "sequelize";
import { sequelize } from '../../connecttion/mysqlconn.js'

export const PriceVariantTable = sequelize.define("vehicle_price_variants", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    vehicle_information_id: {
        type: DataTypes.INTEGER,
    },
    name: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    link: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    engine: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    price_range: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    price: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    review_count: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    fuel_type: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    ex_show_room_rice: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    mileage: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    rto_price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    insurance_price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    other_price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    on_road_price: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    latest_update: {
        type: DataTypes.TEXT,
        defaultValue: null
    },
    is_scrapping: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    launched_at: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    image: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    deleted_at: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    deleted_by: {
        type: DataTypes.INTEGER,
        defaultValue: null
    },
},
    {
        tableName: 'vehicle_price_variant',
        timestamps: false
    }
)

// sequelize.sync().then(() => {
//     console.log('Book table created successfully!');
// }).catch((error) => {
//     console.error('Unable to create table : ', error);
// });


