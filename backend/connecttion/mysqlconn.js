import { Sequelize } from 'sequelize';
import env from "dotenv"
env.config()

export const sequelize = new Sequelize({
    dialect: 'mysql', // or 'postgres', 'sqlite', 'mssql', etc.
    host: process.env.MYSQL_HOST,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.DATABASE_MYSQL,
});
