import { DataTypes } from "sequelize";
import { sequelize } from '../../connecttion/mysqlconn.js'

export const ModelBodyTypeTable = sequelize.define("bodytypes", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true
    },
    category_id: {
        type: DataTypes.NUMBER,
        defaultValue: 0,
    },
    name: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    position: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    deleted_at: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    deleted_by: {
        type: DataTypes.NUMBER,
        defaultValue: null,
    },
},
    {
        tableName: "bodytypes",
        timestamps: false
    })

// sequelize.sync().then(() => {
//     console.log('Book table created successfully!');
// }).catch((error) => {
//     console.error('Unable to create table : ', error);
// });
