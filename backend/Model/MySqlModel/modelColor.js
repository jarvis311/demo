import { DataTypes } from "sequelize";
import { sequelize } from '../../connecttion/mysqlconn.js'

export const ModelColorTable = sequelize.define("vehicle_model_colors", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    vehicle_information_id: {
        type: DataTypes.INTEGER,
    },
    color_name: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    color_code: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    image: {
        type: DataTypes.STRING,
        defaultValue: "NA"
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
        tableName: "vehicle_model_color",
        timestamps: false

    })

// sequelize.sync().then(() => {
//     console.log('Book table created successfully!');
// }).catch((error) => {
//     console.error('Unable to create table : ', error);
// });

