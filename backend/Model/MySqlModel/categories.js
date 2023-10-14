import { DataTypes } from "sequelize";
import { sequelize } from '../../connecttion/mysqlconn.js'

export const CategoriesTable = sequelize.define("categories", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true
    },
    category_name: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    thumb_image: {
        type: DataTypes.STRING,

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
        tableName: "categories",
        timestamps: false
    })

// sequelize.sync().then(() => {
//     console.log('Book table created successfully!');
// }).catch((error) => {
//     console.error('Unable to create table : ', error);
// });

