import { DataTypes } from "sequelize";
import { sequelize } from '../../connecttion/mysqlconn.js'

export const VariantSpecificationsTable = sequelize.define("variant_specifications", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    created_at: {
        type: DataTypes.DATE,
    },
    updated_at: {
        type: DataTypes.DATE,
    },

}, {
    tableName: "variant_specifications",
    timestamps: false
})

// sequelize.sync().then(() => {
//     console.log('Book table created successfully!');
// }).catch((error) => {
//     console.error('Unable to create table : ', error);
// });
