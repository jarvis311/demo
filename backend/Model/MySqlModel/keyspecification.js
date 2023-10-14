import { DataTypes } from "sequelize";
import { sequelize } from '../../connecttion/mysqlconn.js'

export const KeyspecificationTable = sequelize.define("keyspecification", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    icon: {
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
        tableName: "keyspecification",
        timestamps: false
    })

// sequelize.sync().then(() => {
//     console.log('Book table created successfully!');
// }).catch((error) => {
//     console.error('Unable to create table : ', error);
// });
