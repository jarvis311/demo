import { DataTypes } from "sequelize";
import { sequelize } from '../../connecttion/mysqlconn.js'

export const BrandTable = sequelize.define("brands", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true
    },
    category_id: {
        type: DataTypes.NUMBER,
        defaultValue: null
    },
    name: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    title: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    headtag: {
        type: DataTypes.TEXT,
        defaultValue: null
    },
    test_drive_link: {
        type: DataTypes.STRING,
        defaultValue: "NA"
    },
    is_popular: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    logo: {
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
        tableName: "brands",
        timestamps: false
    })

// sequelize.sync().then(() => {
//     console.log('Book table created successfully!');
// }).catch((error) => {
//     console.error('Unable to create table : ', error);
// });


