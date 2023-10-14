import { DATE, DataTypes } from "sequelize";
import { sequelize } from '../../connecttion/mysqlconn.js'

export const VariantkeySpec = sequelize.define("variant_key_specs", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    }
    ,
    vehicle_information_id: {
        type: DataTypes.INTEGER,
    },
    variant_id: {
        type: DataTypes.INTEGER,
    },
    specification_id: {
        type: DataTypes.INTEGER,
    },
    name: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    value: {
        type: DataTypes.TEXT,
        defaultValue: null
    },
    is_feature: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    variant_key_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_specification: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    is_update: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    show_key_feature: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    show_overview: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    is_scraping: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: null
    }
}, {
    tableName: "variant_key_specs",
    timestamps: false
})

// sequelize.sync().then(() => {
//     console.log('Book table created successfully!');
// }).catch((error) => {
//     console.error('Unable to create table : ', error);
// });


